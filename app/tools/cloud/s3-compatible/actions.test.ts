import { checkS3Connection } from "./actions";

// Mock the AWS SDK
jest.mock("@aws-sdk/client-s3", () => {
  return {
    S3Client: jest.fn().mockImplementation(() => ({
      send: jest.fn()
    })),
    ListBucketsCommand: jest.fn()
  };
});

// Mock the error handler
jest.mock("@/utils/handleErrorServer", () => ({
  handleErrorServerNoAuth: jest.fn()
}));

describe("S3 Compatible Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("checkS3Connection", () => {
    it("should return success when S3 connection is valid", async () => {
      const mockSend = jest.fn().mockResolvedValue({
        Buckets: [
          { Name: "test-bucket-1", CreationDate: new Date("2023-01-01") },
          { Name: "test-bucket-2", CreationDate: new Date("2023-02-01") }
        ]
      });

      const { S3Client } = require("@aws-sdk/client-s3");
      S3Client.mockImplementation(() => ({
        send: mockSend
      }));

      const { handleErrorServerNoAuth } = require("@/utils/handleErrorServer");
      handleErrorServerNoAuth.mockImplementation(async ({ cb }: { cb: () => Promise<object> }) => {
        const result = await cb();
        return { error: null, data: { payload: result } };
      });

      const config = {
        endpoint: "https://s3.example.com",
        region: "us-east-1",
        accessKeyId: "test-access-key",
        secretAccessKey: "test-secret-key"
      };

      const result = await checkS3Connection(config);

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data?.payload).toBeDefined();

      const payload = result.data?.payload as {
        success: boolean;
        connectionDetails: { endpoint: string; region: string };
        buckets: Array<{ name: string; creationDate: string | null }>;
        bucketsCount: number;
      };
      expect(payload.success).toBe(true);
      expect(payload.connectionDetails.endpoint).toBe("https://s3.example.com");
      expect(payload.connectionDetails.region).toBe("us-east-1");
      expect(payload.buckets).toHaveLength(2);
      expect(payload.bucketsCount).toBe(2);
    });

    it("should handle AWS S3 without endpoint", async () => {
      const mockSend = jest.fn().mockResolvedValue({
        Buckets: []
      });

      const { S3Client } = require("@aws-sdk/client-s3");
      let capturedConfig: { endpoint?: string; forcePathStyle?: boolean; region?: string } = {};
      S3Client.mockImplementation((config: { endpoint?: string; forcePathStyle?: boolean; region?: string }) => {
        capturedConfig = config;
        return {
          send: mockSend
        };
      });

      const { handleErrorServerNoAuth } = require("@/utils/handleErrorServer");
      handleErrorServerNoAuth.mockImplementation(async ({ cb }: { cb: () => Promise<object> }) => {
        const result = await cb();
        return { error: null, data: { payload: result } };
      });

      const config = {
        region: "us-west-2",
        accessKeyId: "aws-access-key",
        secretAccessKey: "aws-secret-key"
      };

      const result = await checkS3Connection(config);

      expect(result.error).toBeNull();
      expect(capturedConfig.endpoint).toBeUndefined();
      expect(capturedConfig.forcePathStyle).toBeUndefined();
      expect(capturedConfig.region).toBe("us-west-2");

      const payload = result.data?.payload as { connectionDetails: { endpoint: string } };
      expect(payload.connectionDetails.endpoint).toBe("AWS S3");
    });

    it("should configure force path style for custom endpoints", async () => {
      const mockSend = jest.fn().mockResolvedValue({ Buckets: [] });

      const { S3Client } = require("@aws-sdk/client-s3");
      let capturedConfig: { endpoint?: string; forcePathStyle?: boolean } = {};
      S3Client.mockImplementation((config: { endpoint?: string; forcePathStyle?: boolean }) => {
        capturedConfig = config;
        return {
          send: mockSend
        };
      });

      const { handleErrorServerNoAuth } = require("@/utils/handleErrorServer");
      handleErrorServerNoAuth.mockImplementation(async ({ cb }: { cb: () => Promise<object> }) => {
        const result = await cb();
        return { error: null, data: { payload: result } };
      });

      const config = {
        endpoint: "https://minio.example.com",
        region: "us-east-1",
        accessKeyId: "minio-access-key",
        secretAccessKey: "minio-secret-key"
      };

      await checkS3Connection(config);

      expect(capturedConfig.endpoint).toBe("https://minio.example.com");
      expect(capturedConfig.forcePathStyle).toBe(true);
    });

    it("should return error when credentials are invalid", async () => {
      const mockSend = jest.fn().mockRejectedValue(new Error("Access Denied"));

      const { S3Client } = require("@aws-sdk/client-s3");
      S3Client.mockImplementation(() => ({
        send: mockSend
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
        region: "us-east-1",
        accessKeyId: "invalid-key",
        secretAccessKey: "invalid-secret"
      };

      const result = await checkS3Connection(config);

      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe("Access Denied");
      expect(result.data).toBeNull();
    });

    it("should handle network connection errors", async () => {
      const mockSend = jest.fn().mockRejectedValue(new Error("Failed to connect to S3-compatible service"));

      const { S3Client } = require("@aws-sdk/client-s3");
      S3Client.mockImplementation(() => ({
        send: mockSend
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
        endpoint: "https://unreachable.example.com",
        region: "us-east-1",
        accessKeyId: "test-key",
        secretAccessKey: "test-secret"
      };

      const result = await checkS3Connection(config);

      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe("Failed to connect to S3-compatible service");
      expect(result.data).toBeNull();
    });
  });
});
