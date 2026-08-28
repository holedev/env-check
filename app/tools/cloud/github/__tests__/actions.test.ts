import { checkGithubToken } from "../actions";

jest.mock("@octokit/rest", () => ({
  Octokit: jest.fn()
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

const mockOctokit = (getAuthenticated: jest.Mock) => {
  const { Octokit } = require("@octokit/rest");
  Octokit.mockImplementation(() => ({
    rest: { users: { getAuthenticated } }
  }));
  return Octokit;
};

describe("GitHub Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("checkGithubToken", () => {
    it("should return the authenticated user payload when the token is valid", async () => {
      const user = { login: "octocat", type: "User" };
      mockOctokit(jest.fn().mockResolvedValue({ data: user }));

      const { handleErrorServerNoAuth } = require("@/utils/handle-error-server");
      handleErrorServerNoAuth.mockImplementation(passThrough);

      const result = await checkGithubToken({ token: "ghp_valid" });

      expect(result.error).toBeNull();
      expect(result.data?.payload).toEqual(user);
    });

    it("should return an error when the token is unauthorized", async () => {
      mockOctokit(jest.fn().mockRejectedValue(new Error("Bad credentials")));

      const { handleErrorServerNoAuth } = require("@/utils/handle-error-server");
      handleErrorServerNoAuth.mockImplementation(catchError);

      const result = await checkGithubToken({ token: "ghp_bad" });

      expect(result.data).toBeNull();
      expect(result.error?.message).toBe("Bad credentials");
    });

    it("should return an error on network failure", async () => {
      mockOctokit(jest.fn().mockRejectedValue(new Error("getaddrinfo ENOTFOUND api.github.com")));

      const { handleErrorServerNoAuth } = require("@/utils/handle-error-server");
      handleErrorServerNoAuth.mockImplementation(catchError);

      const result = await checkGithubToken({ token: "ghp_any" });

      expect(result.data).toBeNull();
      expect(result.error?.message).toBe("getaddrinfo ENOTFOUND api.github.com");
    });

    it("should construct Octokit with the provided token", async () => {
      const Octokit = mockOctokit(jest.fn().mockResolvedValue({ data: {} }));

      const { handleErrorServerNoAuth } = require("@/utils/handle-error-server");
      handleErrorServerNoAuth.mockImplementation(passThrough);

      await checkGithubToken({ token: "ghp_secret" });

      expect(Octokit).toHaveBeenCalledWith({ auth: "ghp_secret" });
    });
  });
});
