/**
 * @jest-environment node
 */
import { createClient } from "@supabase/supabase-js";
import { assertPublicHost } from "@/utils/network-guard";
import { checkSupabaseCredentials } from "../actions";

jest.mock("@supabase/supabase-js", () => ({ createClient: jest.fn() }));
jest.mock("@/utils/network-guard", () => ({ assertPublicHost: jest.fn() }));

const mockCreateClient = createClient as unknown as jest.Mock;
const guard = assertPublicHost as jest.Mock;
const KEY = "service-role-secret-key";
const URL = "https://abcd.supabase.co";

const listUsersReturns = (result: object) =>
  mockCreateClient.mockReturnValue({ auth: { admin: { listUsers: jest.fn().mockResolvedValue(result) } } });

beforeEach(() => {
  jest.resetAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => undefined);
});

describe("checkSupabaseCredentials", () => {
  it("is valid for a service_role key", async () => {
    listUsersReturns({ data: { users: [{ id: "u1", email: "a@example.com" }] }, error: null });

    const result = await checkSupabaseCredentials({ projectUrl: `${URL}/`, serviceRoleKey: KEY });

    expect(guard).toHaveBeenCalledWith("abcd.supabase.co");
    expect(mockCreateClient).toHaveBeenCalledWith(URL, KEY, expect.anything());
    expect(result.data?.payload).toEqual({
      outcome: "valid",
      summary: [
        { key: "project", value: "abcd.supabase.co" },
        { key: "adminAccess", value: true }
      ]
    });
    expect(JSON.stringify(result)).not.toContain("a@example.com");
  });

  it("is restricted for an anon key (403 User not allowed)", async () => {
    listUsersReturns({ data: { users: [] }, error: { message: "User not allowed", status: 403 } });

    const result = await checkSupabaseCredentials({ projectUrl: URL, serviceRoleKey: KEY });

    expect(result.data?.payload).toEqual({
      outcome: "restricted",
      reason: "User not allowed",
      summary: [
        { key: "project", value: "abcd.supabase.co" },
        { key: "adminAccess", value: false }
      ]
    });
  });

  it("is invalid for a bad key", async () => {
    listUsersReturns({ data: { users: [] }, error: { message: "Invalid API key", status: 401 } });

    const result = await checkSupabaseCredentials({ projectUrl: URL, serviceRoleKey: KEY });

    expect(result.error?.message).toBe("Invalid API key");
  });

  it("refuses private project URLs before creating a client", async () => {
    guard.mockRejectedValue(new Error("Connections to private or internal network addresses are blocked."));

    const result = await checkSupabaseCredentials({ projectUrl: "http://169.254.169.254", serviceRoleKey: KEY });

    expect(mockCreateClient).not.toHaveBeenCalled();
    expect(result.error?.message).toContain("private or internal network");
  });

  it("refuses non-http URLs", async () => {
    const result = await checkSupabaseCredentials({ projectUrl: "file:///etc/passwd", serviceRoleKey: KEY });

    expect(guard).not.toHaveBeenCalled();
    expect(result.error?.message).toBe("Project URL must be an http(s) URL");
  });
});
