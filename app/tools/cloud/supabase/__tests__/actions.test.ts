import { checkSupabaseCredentials } from "../actions";

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn()
}));

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

const mockClient = (listUsers: jest.Mock) => {
  const { createClient } = require("@supabase/supabase-js");
  createClient.mockReturnValue({ auth: { admin: { listUsers } } });
  return createClient;
};

const creds = { projectUrl: "https://abc.supabase.co", serviceRoleKey: "service-role-key" };

describe("Supabase Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("checkSupabaseCredentials", () => {
    it("should return the user count when the credentials are valid", async () => {
      mockClient(jest.fn().mockResolvedValue({ data: { users: [{ id: "u1" }] }, error: null }));

      const { handleErrorServerNoAuth } = require("@/utils/handle-error-server");
      handleErrorServerNoAuth.mockImplementation(passThrough);

      const res = await checkSupabaseCredentials(creds);

      expect(res.error).toBeNull();
      expect(res.data?.payload).toEqual({ success: true, userCount: 1 });
    });

    it("should error with the Supabase message when the key is rejected", async () => {
      mockClient(jest.fn().mockResolvedValue({ data: null, error: { message: "Invalid API key" } }));

      const { handleErrorServerNoAuth } = require("@/utils/handle-error-server");
      handleErrorServerNoAuth.mockImplementation(catchError);

      const res = await checkSupabaseCredentials(creds);

      expect(res.data).toBeNull();
      expect(res.error?.message).toBe("Invalid API key");
    });

    it("should return a fallback message when the client throws", async () => {
      mockClient(jest.fn().mockRejectedValue(new Error("fetch failed")));

      const { handleErrorServerNoAuth } = require("@/utils/handle-error-server");
      handleErrorServerNoAuth.mockImplementation(catchError);

      const res = await checkSupabaseCredentials(creds);

      expect(res.data).toBeNull();
      expect(res.error?.message).toBe("fetch failed");
    });

    it("should build the client with the project URL and service role key", async () => {
      const createClient = mockClient(jest.fn().mockResolvedValue({ data: { users: [] }, error: null }));

      const { handleErrorServerNoAuth } = require("@/utils/handle-error-server");
      handleErrorServerNoAuth.mockImplementation(passThrough);

      await checkSupabaseCredentials(creds);

      expect(createClient).toHaveBeenCalledWith(creds.projectUrl, creds.serviceRoleKey, expect.any(Object));
    });
  });
});
