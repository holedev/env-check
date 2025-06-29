import { checkAPIKey } from "./actions";

// Mock the OpenAI SDK
jest.mock("openai", () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      models: {
        list: jest.fn()
      }
    }))
  };
});

// Mock the error handler
jest.mock("@/utils/handleErrorServer", () => ({
  handleErrorServerNoAuth: jest.fn()
}));

describe("Google Gemini Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("checkAPIKey", () => {
    it("should return success when API key is valid", async () => {
      const mockModelsList = jest.fn().mockResolvedValue({
        data: [
          { id: "gemini-pro", object: "model" },
          { id: "gemini-pro-vision", object: "model" }
        ]
      });

      const OpenAI = require("openai").default;
      OpenAI.mockImplementation(() => ({
        models: {
          list: mockModelsList
        }
      }));

      const { handleErrorServerNoAuth } = require("@/utils/handleErrorServer");
      handleErrorServerNoAuth.mockImplementation(async ({ cb }: { cb: () => Promise<object> }) => {
        const result = await cb();
        return { error: null, data: { payload: result } };
      });

      const result = await checkAPIKey("valid-api-key");

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data?.payload).toBeDefined();
      expect(Array.isArray(result.data?.payload)).toBe(true);
      expect(mockModelsList).toHaveBeenCalled();
    });

    it("should return error when API key is invalid", async () => {
      const mockModelsList = jest.fn().mockRejectedValue(new Error("Invalid API key"));

      const OpenAI = require("openai").default;
      OpenAI.mockImplementation(() => ({
        models: {
          list: mockModelsList
        }
      }));

      const { handleErrorServerNoAuth } = require("@/utils/handleErrorServer");
      handleErrorServerNoAuth.mockImplementation(async ({ cb }: { cb: () => Promise<object> }) => {
        try {
          await cb();
        } catch (error) {
          return { error: { message: error instanceof Error ? error.message : "Unknown error" }, data: null };
        }
      });

      const result = await checkAPIKey("invalid-api-key");

      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe("Invalid API key");
      expect(result.data).toBeNull();
    });

    it("should handle network connection errors", async () => {
      const mockModelsList = jest.fn().mockRejectedValue(new Error("Failed to connect to Google Gemini API"));

      const OpenAI = require("openai").default;
      OpenAI.mockImplementation(() => ({
        models: {
          list: mockModelsList
        }
      }));

      const { handleErrorServerNoAuth } = require("@/utils/handleErrorServer");
      handleErrorServerNoAuth.mockImplementation(async ({ cb }: { cb: () => Promise<object> }) => {
        try {
          await cb();
        } catch (error) {
          return { error: { message: error instanceof Error ? error.message : "Unknown error" }, data: null };
        }
      });

      const result = await checkAPIKey("some-api-key");

      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe("Failed to connect to Google Gemini API");
      expect(result.data).toBeNull();
    });

    it("should use correct Gemini base URL", async () => {
      const mockModelsList = jest.fn().mockResolvedValue({ data: [] });
      let capturedConfig: { baseURL?: string; apiKey?: string } = {};

      const OpenAI = require("openai").default;
      OpenAI.mockImplementation((config: { baseURL?: string; apiKey?: string }) => {
        capturedConfig = config;
        return {
          models: {
            list: mockModelsList
          }
        };
      });

      const { handleErrorServerNoAuth } = require("@/utils/handleErrorServer");
      handleErrorServerNoAuth.mockImplementation(async ({ cb }: { cb: () => Promise<object> }) => {
        const result = await cb();
        return { error: null, data: { payload: result } };
      });

      await checkAPIKey("test-api-key");

      expect(capturedConfig.baseURL).toBe("https://generativelanguage.googleapis.com/v1beta/openai/");
      expect(capturedConfig.apiKey).toBe("test-api-key");
    });
  });
});
