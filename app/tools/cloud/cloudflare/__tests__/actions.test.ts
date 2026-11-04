/**
 * @jest-environment node
 */
import { jsonResponse, mockFetch } from "@/test/utils/service";
import { checkCloudflareToken } from "../actions";

const fetchMock = mockFetch();
const TOKEN = "cf-secret-token-value";

describe("checkCloudflareToken", () => {
  it("is valid for an active token and shows its validity window", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        success: true,
        result: { id: "t1", status: "active", expires_on: "2027-01-01T00:00:00Z" },
        errors: [],
        messages: []
      })
    );

    const result = await checkCloudflareToken({ apiToken: TOKEN });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.cloudflare.com/client/v4/user/tokens/verify",
      expect.objectContaining({ headers: { Authorization: `Bearer ${TOKEN}` } })
    );
    expect(result.data?.payload).toEqual({
      outcome: "valid",
      summary: [
        { key: "status", value: "active", enumKey: "statuses" },
        { key: "expiresOn", value: "2027-01-01T00:00:00Z" }
      ]
    });
  });

  it("is invalid when the token is disabled or expired", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ success: true, result: { id: "t1", status: "expired" } }));

    const result = await checkCloudflareToken({ apiToken: TOKEN });

    expect(result.error?.message).toBe("Token is expired");
  });

  it("is invalid when Cloudflare rejects the token", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ success: false, errors: [{ code: 1000, message: "Invalid API Token" }] }, 401)
    );

    const result = await checkCloudflareToken({ apiToken: TOKEN });

    expect(result.data).toBeNull();
    expect(result.error?.message).toBe("Invalid API Token");
  });
});
