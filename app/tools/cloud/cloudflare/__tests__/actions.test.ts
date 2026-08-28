import { checkCloudflareToken } from "../actions";

jest.mock("@/utils/handle-error-server", () => ({
  handleErrorServerNoAuth: jest.fn()
}));

type Cb = { cb: () => Promise<object> };

const passThrough = async ({ cb }: Cb) => {
  const result = await cb();
  return { error: null, data: { payload: result } };
};

const catchError = async ({ cb }: Cb) => {
  try {
    await cb();
    return { error: null, data: { payload: {} } };
  } catch (error) {
    return { error: { message: error instanceof Error ? error.message : "Unknown error" }, data: null };
  }
};

const mockFetch = jest.fn();

describe("Cloudflare Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = mockFetch as unknown as typeof fetch;
  });

  describe("checkCloudflareToken", () => {
    it("should return the token result when the token is valid", async () => {
      const result = { id: "abc123", status: "active" };
      mockFetch.mockResolvedValue({
        ok: true,
        statusText: "OK",
        json: jest.fn().mockResolvedValue({ success: true, result, errors: [] })
      });

      const { handleErrorServerNoAuth } = require("@/utils/handle-error-server");
      handleErrorServerNoAuth.mockImplementation(passThrough);

      const res = await checkCloudflareToken({ apiToken: "valid" });

      expect(res.error).toBeNull();
      expect(res.data?.payload).toEqual(result);
    });

    it("should surface the Cloudflare error message when success is false", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: "Unauthorized",
        json: jest.fn().mockResolvedValue({ success: false, errors: [{ message: "Invalid API Token" }] })
      });

      const { handleErrorServerNoAuth } = require("@/utils/handle-error-server");
      handleErrorServerNoAuth.mockImplementation(catchError);

      const res = await checkCloudflareToken({ apiToken: "bad" });

      expect(res.data).toBeNull();
      expect(res.error?.message).toBe("Invalid API Token");
    });

    it("should return a fallback message on network failure", async () => {
      mockFetch.mockRejectedValue("boom");

      const { handleErrorServerNoAuth } = require("@/utils/handle-error-server");
      handleErrorServerNoAuth.mockImplementation(catchError);

      const res = await checkCloudflareToken({ apiToken: "any" });

      expect(res.data).toBeNull();
      expect(res.error?.message).toBe("Failed to connect to Cloudflare");
    });

    it("should call the verify endpoint with a Bearer authorization header", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        statusText: "OK",
        json: jest.fn().mockResolvedValue({ success: true, result: {} })
      });

      const { handleErrorServerNoAuth } = require("@/utils/handle-error-server");
      handleErrorServerNoAuth.mockImplementation(passThrough);

      await checkCloudflareToken({ apiToken: "secret" });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.cloudflare.com/client/v4/user/tokens/verify",
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({ Authorization: "Bearer secret" })
        })
      );
    });
  });
});
