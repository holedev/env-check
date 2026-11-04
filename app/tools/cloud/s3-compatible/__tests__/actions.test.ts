/**
 * @jest-environment node
 */
import { S3Client } from "@aws-sdk/client-s3";
import { assertPublicHost } from "@/utils/network-guard";
import { checkS3Connection } from "../actions";

jest.mock("@aws-sdk/client-s3", () => ({
  S3Client: jest.fn(),
  ListBucketsCommand: jest.fn()
}));
jest.mock("@/utils/network-guard", () => ({ assertPublicHost: jest.fn() }));

const MockS3Client = S3Client as unknown as jest.Mock;
const guard = assertPublicHost as jest.Mock;
const SECRET = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYsecret";
const base = { accessKeyId: "AKIAEXAMPLE", secretAccessKey: SECRET, region: "auto" };

const sendResolves = (send: jest.Mock) => MockS3Client.mockImplementation(() => ({ send }));

beforeEach(() => {
  jest.resetAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => undefined);
});

describe("checkS3Connection", () => {
  it("is valid against AWS and lists bucket names", async () => {
    sendResolves(jest.fn().mockResolvedValue({ Buckets: [{ Name: "assets" }, { Name: "backups" }] }));

    const result = await checkS3Connection({ ...base, endpoint: "" });

    expect(guard).not.toHaveBeenCalled();
    expect(MockS3Client).toHaveBeenCalledWith({
      region: "auto",
      credentials: { accessKeyId: "AKIAEXAMPLE", secretAccessKey: SECRET }
    });
    expect(result.data?.payload).toEqual({
      outcome: "valid",
      summary: [
        { key: "endpoint", value: "aws", enumKey: "endpoints" },
        { key: "region", value: "auto" },
        { key: "bucketsCount", value: 2 },
        { key: "buckets", value: ["assets", "backups"] }
      ]
    });
  });

  it("guards a custom endpoint and uses path-style addressing", async () => {
    sendResolves(jest.fn().mockResolvedValue({ Buckets: [] }));

    const result = await checkS3Connection({ ...base, endpoint: "https://acct.r2.cloudflarestorage.com/" });

    expect(guard).toHaveBeenCalledWith("acct.r2.cloudflarestorage.com");
    expect(MockS3Client).toHaveBeenCalledWith(
      expect.objectContaining({ endpoint: "https://acct.r2.cloudflarestorage.com", forcePathStyle: true })
    );
    expect(result.data?.payload).toMatchObject({
      summary: [
        { key: "endpoint", value: "acct.r2.cloudflarestorage.com" },
        { key: "region" },
        { key: "bucketsCount", value: 0 }
      ]
    });
  });

  it("is restricted when the key may not list buckets", async () => {
    sendResolves(jest.fn().mockRejectedValue(Object.assign(new Error("Access Denied"), { name: "AccessDenied" })));

    const result = await checkS3Connection({ ...base, endpoint: "" });

    expect(result.data?.payload).toMatchObject({ outcome: "restricted", reason: "Access Denied" });
  });

  it("is invalid for a bad signature, without leaking the secret", async () => {
    sendResolves(
      jest
        .fn()
        .mockRejectedValue(
          Object.assign(new Error(`SignatureDoesNotMatch for ${SECRET}`), { name: "SignatureDoesNotMatch" })
        )
    );

    const result = await checkS3Connection({ ...base, endpoint: "" });

    expect(result.error?.message).toBe("SignatureDoesNotMatch for ***");
  });

  it("refuses non-http endpoints and private hosts before connecting", async () => {
    const fileUrl = await checkS3Connection({ ...base, endpoint: "file:///etc/passwd" });
    guard.mockRejectedValueOnce(new Error("Connections to private or internal network addresses are blocked."));
    const metadata = await checkS3Connection({ ...base, endpoint: "http://169.254.169.254" });

    expect(fileUrl.error?.message).toBe("Endpoint must be an http(s) URL");
    expect(metadata.error?.message).toContain("private or internal network");
    expect(MockS3Client).not.toHaveBeenCalled();
  });
});
