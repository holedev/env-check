import { checkGoogleAnalyticsCredentials } from "../actions";

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
const creds = { measurementId: "G-ABCDE12345", apiSecret: "secret" };

describe("Google Analytics Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = mockFetch as unknown as typeof fetch;
  });

  describe("checkGoogleAnalyticsCredentials", () => {
    it("should be valid when the debug endpoint returns no validation messages", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        statusText: "OK",
        json: jest.fn().mockResolvedValue({ validationMessages: [] })
      });

      const { handleErrorServerNoAuth } = require("@/utils/handle-error-server");
      handleErrorServerNoAuth.mockImplementation(passThrough);

      const res = await checkGoogleAnalyticsCredentials(creds);

      expect(res.error).toBeNull();
      expect(res.data?.payload).toEqual({ valid: true });
    });

    it("should be invalid when the debug endpoint returns validation messages", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        statusText: "OK",
        json: jest.fn().mockResolvedValue({
          validationMessages: [{ description: "Measurement id not found for the api_secret provided" }]
        })
      });

      const { handleErrorServerNoAuth } = require("@/utils/handle-error-server");
      handleErrorServerNoAuth.mockImplementation(catchError);

      const res = await checkGoogleAnalyticsCredentials(creds);

      expect(res.data).toBeNull();
      expect(res.error?.message).toBe("Measurement id not found for the api_secret provided");
    });

    it("should return a fallback message on network failure", async () => {
      mockFetch.mockRejectedValue("boom");

      const { handleErrorServerNoAuth } = require("@/utils/handle-error-server");
      handleErrorServerNoAuth.mockImplementation(catchError);

      const res = await checkGoogleAnalyticsCredentials(creds);

      expect(res.data).toBeNull();
      expect(res.error?.message).toBe("Failed to connect to Google Analytics");
    });

    it("should post to the debug collect endpoint with the measurement id and api secret", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        statusText: "OK",
        json: jest.fn().mockResolvedValue({ validationMessages: [] })
      });

      const { handleErrorServerNoAuth } = require("@/utils/handle-error-server");
      handleErrorServerNoAuth.mockImplementation(passThrough);

      await checkGoogleAnalyticsCredentials(creds);

      const [calledUrl, calledInit] = mockFetch.mock.calls[0];
      expect(calledUrl).toBe(
        "https://www.google-analytics.com/debug/mp/collect?measurement_id=G-ABCDE12345&api_secret=secret"
      );
      expect(calledInit).toEqual(expect.objectContaining({ method: "POST" }));
    });
  });
});
