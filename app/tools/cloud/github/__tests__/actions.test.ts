/**
 * @jest-environment node
 */
import { Octokit } from "@octokit/rest";
import { checkGithubToken } from "../actions";

jest.mock("@octokit/rest", () => ({ Octokit: jest.fn() }));

const MockOctokit = Octokit as unknown as jest.Mock;
const TOKEN = "ghp_secretvalue123";

const respondWith = (getAuthenticated: jest.Mock) =>
  MockOctokit.mockImplementation(() => ({ rest: { users: { getAuthenticated } } }));

beforeEach(() => {
  jest.resetAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => undefined);
});

describe("checkGithubToken", () => {
  it("is valid and shows login, name, token type and scopes but not the email", async () => {
    respondWith(
      jest.fn().mockResolvedValue({
        data: { login: "holedev", name: "Hole Dev", email: "hole@example.com" },
        headers: { "x-oauth-scopes": "repo, read:org" }
      })
    );

    const result = await checkGithubToken({ token: TOKEN });

    expect(MockOctokit).toHaveBeenCalledWith({ auth: TOKEN });
    expect(result.data?.payload).toEqual({
      outcome: "valid",
      summary: [
        { key: "login", value: "holedev" },
        { key: "name", value: "Hole Dev" },
        { key: "tokenType", value: "classic", enumKey: "tokenTypes" },
        { key: "scopes", value: ["repo", "read:org"] }
      ]
    });
    expect(JSON.stringify(result)).not.toContain("hole@example.com");
  });

  it("recognises fine-grained tokens, which have no x-oauth-scopes", async () => {
    respondWith(jest.fn().mockResolvedValue({ data: { login: "bot", name: null }, headers: {} }));

    const result = await checkGithubToken({ token: "github_pat_abc" });

    expect(result.data?.payload).toEqual({
      outcome: "valid",
      summary: [
        { key: "login", value: "bot" },
        { key: "tokenType", value: "fineGrained", enumKey: "tokenTypes" }
      ]
    });
  });

  it("is invalid on 401, without echoing the token", async () => {
    respondWith(jest.fn().mockRejectedValue(Object.assign(new Error(`Bad credentials for ${TOKEN}`), { status: 401 })));

    const result = await checkGithubToken({ token: TOKEN });

    expect(result.data).toBeNull();
    expect(result.error?.message).toBe("Bad credentials for ***");
  });

  it("is restricted on 403", async () => {
    respondWith(
      jest.fn().mockRejectedValue(Object.assign(new Error("Resource not accessible by integration"), { status: 403 }))
    );

    const result = await checkGithubToken({ token: TOKEN });

    expect(result.data?.payload).toEqual({
      outcome: "restricted",
      reason: "Resource not accessible by integration",
      summary: [{ key: "tokenType", value: "classic", enumKey: "tokenTypes" }]
    });
  });
});
