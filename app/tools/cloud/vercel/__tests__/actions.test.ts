/**
 * @jest-environment node
 */
import { jsonResponse, mockFetch } from "@/test/utils/service";
import { checkVercelToken } from "../actions";

const fetchMock = mockFetch();
const TOKEN = "vcp_secret_token_value";

describe("checkVercelToken", () => {
  it("is valid and shows username, name and plan but not the email", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        user: { id: "u1", username: "hole", name: "Hole Dev", email: "hole@example.com", billing: { plan: "hobby" } }
      })
    );

    const result = await checkVercelToken({ token: TOKEN });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.vercel.com/v2/user",
      expect.objectContaining({ headers: { Authorization: `Bearer ${TOKEN}` } })
    );
    expect(result.data?.payload).toEqual({
      outcome: "valid",
      summary: [
        { key: "username", value: "hole" },
        { key: "name", value: "Hole Dev" },
        { key: "plan", value: "hobby" }
      ]
    });
    expect(JSON.stringify(result)).not.toContain("hole@example.com");
  });

  it("is invalid when Vercel flags the token", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ error: { code: "forbidden", message: "Not authorized", invalidToken: true } }, 403)
    );

    const result = await checkVercelToken({ token: TOKEN });

    expect(result.error?.message).toBe("Not authorized");
  });

  it("is restricted on a 403 for a valid token", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: { code: "forbidden", message: "Missing scope" } }, 403));

    const result = await checkVercelToken({ token: TOKEN });

    expect(result.data?.payload).toEqual({ outcome: "restricted", reason: "Missing scope", summary: [] });
  });
});
