/**
 * @jest-environment node
 */
import { jsonResponse, mockFetch } from "@/test/utils/service";
import { checkSlackToken } from "../actions";

const fetchMock = mockFetch();
const TOKEN = "xoxb-1234-5678-secret";

describe("checkSlackToken", () => {
  it("is valid and summarises workspace, user, token type and scopes", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        { ok: true, team: "Acme", url: "https://acme.slack.com/", user: "deploy-bot", team_id: "T1", user_id: "U1" },
        200,
        { "x-oauth-scopes": "chat:write, channels:read" }
      )
    );

    const result = await checkSlackToken({ token: TOKEN });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://slack.com/api/auth.test",
      expect.objectContaining({ method: "POST", headers: { Authorization: `Bearer ${TOKEN}` } })
    );
    expect(result.data?.payload).toEqual({
      outcome: "valid",
      summary: [
        { key: "team", value: "Acme" },
        { key: "url", value: "https://acme.slack.com/" },
        { key: "user", value: "deploy-bot" },
        { key: "tokenType", value: "bot", enumKey: "tokenTypes" },
        { key: "scopes", value: ["chat:write", "channels:read"] }
      ]
    });
  });

  it("treats Slack's 200 + ok:false as invalid", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: false, error: "invalid_auth" }));

    const result = await checkSlackToken({ token: TOKEN });

    expect(result.data).toBeNull();
    expect(result.error?.message).toBe("invalid_auth");
  });

  it("is restricted for app-level tokens", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: false, error: "not_allowed_token_type" }));

    const result = await checkSlackToken({ token: "xapp-1-A1-secret" });

    expect(result.data?.payload).toEqual({
      outcome: "restricted",
      reason: "not_allowed_token_type",
      summary: [{ key: "tokenType", value: "appLevel", enumKey: "tokenTypes" }]
    });
  });
});
