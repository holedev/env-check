import { checkSMTPConnection } from "../actions";

// Mock nodemailer
jest.mock("nodemailer", () => {
  return {
    createTransport: jest.fn().mockImplementation(() => ({
      verify: jest.fn(),
      sendMail: jest.fn()
    }))
  };
});

// Mock the error handler
jest.mock("@/utils/handleErrorServer", () => ({
  handleErrorServerNoAuth: jest.fn()
}));

describe("Gmail SMTP Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("checkSMTPConnection", () => {
    it("should verify connection without sending email", async () => {
      const mockVerify = jest.fn().mockResolvedValue(true);
      const mockSendMail = jest.fn();

      const nodemailer = require("nodemailer");
      nodemailer.createTransport.mockImplementation(() => ({
        verify: mockVerify,
        sendMail: mockSendMail
      }));

      const { handleErrorServerNoAuth } = require("@/utils/handleErrorServer");
      handleErrorServerNoAuth.mockImplementation(async ({ cb }: { cb: () => Promise<object> }) => {
        const result = await cb();
        return { error: null, data: { payload: result } };
      });

      const config = {
        host: "smtp.gmail.com",
        port: 587,
        username: "test@gmail.com",
        password: "app-password",
        secure: false,
        testType: "verify" as const
      };

      const result = await checkSMTPConnection(config);

      expect(result.error).toBeNull();
      expect(result.data?.payload).toBeDefined();

      const payload = result.data?.payload as {
        success: boolean;
        testType: string;
        connectionDetails: { host: string; port: number; secure: boolean; username: string };
        messageId: string | null;
      };

      expect(payload.success).toBe(true);
      expect(payload.testType).toBe("verify");
      expect(payload.connectionDetails.host).toBe("smtp.gmail.com");
      expect(payload.connectionDetails.port).toBe(587);
      expect(payload.connectionDetails.secure).toBe(false);
      expect(payload.connectionDetails.username).toBe("test@gmail.com");
      expect(payload.messageId).toBeNull();

      expect(mockVerify).toHaveBeenCalled();
      expect(mockSendMail).not.toHaveBeenCalled();
    });

    it("should verify connection and send test email", async () => {
      const mockVerify = jest.fn().mockResolvedValue(true);
      const mockSendMail = jest.fn().mockResolvedValue({
        messageId: "test-message-id-123"
      });

      const nodemailer = require("nodemailer");
      nodemailer.createTransport.mockImplementation(() => ({
        verify: mockVerify,
        sendMail: mockSendMail
      }));

      const { handleErrorServerNoAuth } = require("@/utils/handleErrorServer");
      handleErrorServerNoAuth.mockImplementation(async ({ cb }: { cb: () => Promise<object> }) => {
        const result = await cb();
        return { error: null, data: { payload: result } };
      });

      const config = {
        host: "smtp.gmail.com",
        port: 465,
        username: "test@gmail.com",
        password: "app-password",
        secure: true,
        testType: "sendEmail" as const
      };

      const result = await checkSMTPConnection(config);

      expect(result.error).toBeNull();

      const payload = result.data?.payload as {
        success: boolean;
        testType: string;
        connectionDetails: { host: string; port: number; secure: boolean; username: string };
        messageId: string | null;
      };

      expect(payload.success).toBe(true);
      expect(payload.testType).toBe("sendEmail");
      expect(payload.messageId).toBe("test-message-id-123");

      expect(mockVerify).toHaveBeenCalled();
      expect(mockSendMail).toHaveBeenCalledWith({
        from: "test@gmail.com",
        to: "test@gmail.com",
        subject: "Gmail SMTP Test - Connection Successful",
        text: "This is a test email to verify your Gmail SMTP configuration is working correctly.",
        html: expect.stringContaining("Gmail SMTP Test Successful")
      });
    });

    it("should create transporter with correct configuration", async () => {
      const mockVerify = jest.fn().mockResolvedValue(true);
      let capturedConfig: {
        host?: string;
        port?: number;
        secure?: boolean;
        auth?: { user: string; pass: string };
      } = {};

      const nodemailer = require("nodemailer");
      nodemailer.createTransport.mockImplementation((config: typeof capturedConfig) => {
        capturedConfig = config;
        return {
          verify: mockVerify,
          sendMail: jest.fn()
        };
      });

      const { handleErrorServerNoAuth } = require("@/utils/handleErrorServer");
      handleErrorServerNoAuth.mockImplementation(async ({ cb }: { cb: () => Promise<object> }) => {
        const result = await cb();
        return { error: null, data: { payload: result } };
      });

      const config = {
        host: "smtp.gmail.com",
        port: 587,
        username: "user@example.com",
        password: "secure-password",
        secure: false,
        testType: "verify" as const
      };

      await checkSMTPConnection(config);

      expect(capturedConfig.host).toBe("smtp.gmail.com");
      expect(capturedConfig.port).toBe(587);
      expect(capturedConfig.secure).toBe(false);
      expect(capturedConfig.auth?.user).toBe("user@example.com");
      expect(capturedConfig.auth?.pass).toBe("secure-password");
    });

    it("should return error when SMTP credentials are invalid", async () => {
      const mockVerify = jest.fn().mockRejectedValue(new Error("Invalid login"));

      const nodemailer = require("nodemailer");
      nodemailer.createTransport.mockImplementation(() => ({
        verify: mockVerify,
        sendMail: jest.fn()
      }));

      const { handleErrorServerNoAuth } = require("@/utils/handleErrorServer");
      handleErrorServerNoAuth.mockImplementation(async ({ cb }: { cb: () => Promise<object> }) => {
        try {
          await cb();
        } catch (error) {
          return { error: { message: error instanceof Error ? error.message : "Unknown error" }, data: null };
        }
      });

      const config = {
        host: "smtp.gmail.com",
        port: 587,
        username: "invalid@gmail.com",
        password: "wrong-password",
        secure: false,
        testType: "verify" as const
      };

      const result = await checkSMTPConnection(config);

      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe("Invalid login");
      expect(result.data).toBeNull();
    });

    it("should return error when email sending fails", async () => {
      const mockVerify = jest.fn().mockResolvedValue(true);
      const mockSendMail = jest.fn().mockRejectedValue(new Error("Failed to send email"));

      const nodemailer = require("nodemailer");
      nodemailer.createTransport.mockImplementation(() => ({
        verify: mockVerify,
        sendMail: mockSendMail
      }));

      const { handleErrorServerNoAuth } = require("@/utils/handleErrorServer");
      handleErrorServerNoAuth.mockImplementation(async ({ cb }: { cb: () => Promise<object> }) => {
        try {
          await cb();
        } catch (error) {
          return { error: { message: error instanceof Error ? error.message : "Unknown error" }, data: null };
        }
      });

      const config = {
        host: "smtp.gmail.com",
        port: 587,
        username: "test@gmail.com",
        password: "app-password",
        secure: false,
        testType: "sendEmail" as const
      };

      const result = await checkSMTPConnection(config);

      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe("Failed to send email");
      expect(result.data).toBeNull();
    });
  });
});
