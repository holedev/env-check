/**
 * @jest-environment node
 */
import { createTransport } from "nodemailer";
import { assertPublicHost } from "@/utils/network-guard";
import { checkSMTPConnection } from "../actions";

jest.mock("nodemailer", () => ({ createTransport: jest.fn() }));
jest.mock("@/utils/network-guard", () => ({ assertPublicHost: jest.fn() }));

const mockCreateTransport = createTransport as unknown as jest.Mock;
const guard = assertPublicHost as jest.Mock;
const PASSWORD = "abcd efgh ijkl mnop";
const base = { host: "smtp.gmail.com", security: "ssl", username: "me@gmail.com", password: PASSWORD };

const fakeTransport = ({ verify }: { verify?: jest.Mock } = {}) => {
  const transport = {
    verify: verify ?? jest.fn().mockResolvedValue(true),
    sendMail: jest.fn().mockResolvedValue({ messageId: "<id@gmail>" }),
    close: jest.fn()
  };
  mockCreateTransport.mockReturnValue(transport);
  return transport;
};

beforeEach(() => {
  jest.resetAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => undefined);
});

describe("checkSMTPConnection", () => {
  it("verifies the login without sending anything by default", async () => {
    const transport = fakeTransport();

    const result = await checkSMTPConnection({ ...base, testType: "verify" });

    expect(guard).toHaveBeenCalledWith("smtp.gmail.com");
    expect(mockCreateTransport).toHaveBeenCalledWith(
      expect.objectContaining({ host: "smtp.gmail.com", port: 465, secure: true })
    );
    expect(transport.sendMail).not.toHaveBeenCalled();
    expect(result.data?.payload).toEqual({
      outcome: "valid",
      summary: [
        { key: "server", value: "smtp.gmail.com:465" },
        { key: "username", value: "me@gmail.com" },
        { key: "testEmail", value: false }
      ]
    });
    expect(transport.close).toHaveBeenCalled();
  });

  it("maps STARTTLS to port 587", async () => {
    fakeTransport();

    await checkSMTPConnection({ ...base, security: "starttls", testType: "verify" });

    expect(mockCreateTransport).toHaveBeenCalledWith(expect.objectContaining({ port: 587, secure: false }));
  });

  it("sends one test email to the user's own address only when asked", async () => {
    const transport = fakeTransport();

    const result = await checkSMTPConnection({ ...base, testType: "sendEmail" });

    expect(transport.sendMail).toHaveBeenCalledTimes(1);
    expect(transport.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({ from: "me@gmail.com", to: "me@gmail.com" })
    );
    expect(result.data?.payload).toMatchObject({
      summary: expect.arrayContaining([{ key: "testEmail", value: true }])
    });
  });

  it("is invalid on a rejected login, without leaking the password", async () => {
    fakeTransport({
      verify: jest.fn().mockRejectedValue(new Error(`535-5.7.8 Username and Password not accepted (${PASSWORD})`))
    });

    const result = await checkSMTPConnection({ ...base, testType: "verify" });

    expect(result.data).toBeNull();
    expect(result.error?.message).toBe("535-5.7.8 Username and Password not accepted (***)");
  });

  it("refuses unknown security modes and private hosts before connecting", async () => {
    const badMode = await checkSMTPConnection({ ...base, security: "25", testType: "verify" });
    guard.mockRejectedValueOnce(new Error("Connections to private or internal network addresses are blocked."));
    const privateHost = await checkSMTPConnection({ ...base, host: "127.0.0.1", testType: "verify" });

    expect(badMode.error?.message).toBe("Unknown SMTP security mode");
    expect(privateHost.error?.message).toContain("private or internal network");
    expect(mockCreateTransport).not.toHaveBeenCalled();
  });
});
