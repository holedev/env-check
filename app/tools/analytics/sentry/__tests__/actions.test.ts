/**
 * @jest-environment node
 */
import { jsonResponse, mockFetch } from "@/test/utils/service";
import { checkSentryToken } from "../actions";

const fetchMock = mockFetch();
const TOKEN = "sntryu_secretvalue";

describe("checkSentryToken", () => {
  it("is valid and lists the token's scopes", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ version: "0", auth: { scopes: ["org:read", "project:read"] }, user: { username: "hole" } })
    );

    const result = await checkSentryToken({ token: TOKEN, region: "us" });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://sentry.io/api/0/",
      expect.objectContaining({ headers: { Authorization: `Bearer ${TOKEN}` } })
    );
    expect(result.data?.payload).toEqual({
      outcome: "valid",
      summary: [
        { key: "tokenType", value: "user", enumKey: "tokenTypes" },
        { key: "user", value: "hole" },
        { key: "scopes", value: ["org:read", "project:read"] }
      ]
    });
  });

  it("uses the EU host for the eu region", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ auth: { scopes: ["org:ci"] }, user: null }));

    const result = await checkSentryToken({ token: "sntrys_orgtoken", region: "eu" });

    expect(fetchMock).toHaveBeenCalledWith("https://de.sentry.io/api/0/", expect.anything());
    expect(result.data?.payload).toMatchObject({
      summary: [{ key: "tokenType", value: "organization" }, { key: "scopes" }]
    });
  });

  it.each(["https://169.254.169.254", "constructor", "__proto__"])("refuses region %s", async (region) => {
    const result = await checkSentryToken({ token: TOKEN, region });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.error?.message).toBe("Unknown Sentry region");
  });

  it("is invalid on 401 or when the token is ignored", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ detail: "Invalid token" }, 401));
    fetchMock.mockResolvedValueOnce(jsonResponse({ version: "0", auth: null, user: null }));

    const rejected = await checkSentryToken({ token: TOKEN, region: "us" });
    const ignored = await checkSentryToken({ token: TOKEN, region: "us" });

    expect(rejected.error?.message).toBe("Invalid token");
    expect(ignored.error?.message).toBe("Sentry returned HTTP 200");
  });
});
