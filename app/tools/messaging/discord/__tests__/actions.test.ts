import { checkDiscordConnection } from "../actions";

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

describe("Discord Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = mockFetch as unknown as typeof fetch;
  });

  describe("checkDiscordConnection", () => {
    it("should return the bot user payload when the token is valid", async () => {
      const userData = { id: "123", username: "test-bot", discriminator: "0", bot: true };
      mockFetch.mockResolvedValue({ ok: true, statusText: "OK", json: jest.fn().mockResolvedValue(userData) });

      const { handleErrorServerNoAuth } = require("@/utils/handle-error-server");
      handleErrorServerNoAuth.mockImplementation(passThrough);

      const result = await checkDiscordConnection({ token: "valid-token" });

      expect(result.error).toBeNull();
      expect(result.data?.payload).toEqual(userData);
    });

    it("should error with the Discord status text when the response is not ok", async () => {
      mockFetch.mockResolvedValue({ ok: false, statusText: "Unauthorized", json: jest.fn() });

      const { handleErrorServerNoAuth } = require("@/utils/handle-error-server");
      handleErrorServerNoAuth.mockImplementation(catchError);

      const result = await checkDiscordConnection({ token: "bad-token" });

      expect(result.data).toBeNull();
      expect(result.error?.message).toBe("Discord API error: Unauthorized");
    });

    it("should error with a fallback message on network failure", async () => {
      mockFetch.mockRejectedValue("boom");

      const { handleErrorServerNoAuth } = require("@/utils/handle-error-server");
      handleErrorServerNoAuth.mockImplementation(catchError);

      const result = await checkDiscordConnection({ token: "any-token" });

      expect(result.data).toBeNull();
      expect(result.error?.message).toBe("Failed to connect to Discord");
    });

    it("should call the Discord users/@me endpoint with a Bot authorization header", async () => {
      mockFetch.mockResolvedValue({ ok: true, statusText: "OK", json: jest.fn().mockResolvedValue({}) });

      const { handleErrorServerNoAuth } = require("@/utils/handle-error-server");
      handleErrorServerNoAuth.mockImplementation(passThrough);

      await checkDiscordConnection({ token: "secret-token" });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://discord.com/api/v10/users/@me",
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({ Authorization: "Bot secret-token" })
        })
      );
    });
  });
});
