/**
 * @jest-environment node
 */
import { jsonResponse, mockFetch } from "@/test/utils/service";
import { checkDigitalOceanToken } from "../actions";

const fetchMock = mockFetch();
const TOKEN = "dop_v1_secretvalue";

describe("checkDigitalOceanToken", () => {
  it("is valid and shows team, status and limits but not the email", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        account: {
          droplet_limit: 25,
          email: "hole@example.com",
          email_verified: true,
          status: "active",
          team: { name: "My Team" }
        }
      })
    );

    const result = await checkDigitalOceanToken({ token: TOKEN });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.digitalocean.com/v2/account",
      expect.objectContaining({ headers: { Authorization: `Bearer ${TOKEN}` } })
    );
    expect(result.data?.payload).toEqual({
      outcome: "valid",
      summary: [
        { key: "team", value: "My Team" },
        { key: "status", value: "active", enumKey: "statuses" },
        { key: "dropletLimit", value: 25 },
        { key: "emailVerified", value: true }
      ]
    });
    expect(JSON.stringify(result)).not.toContain("hole@example.com");
  });

  it("is restricted for a scoped token without account:read", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ id: "forbidden", message: "You are not authorized to perform this operation" }, 403)
    );

    const result = await checkDigitalOceanToken({ token: TOKEN });

    expect(result.data?.payload).toEqual({
      outcome: "restricted",
      reason: "You are not authorized to perform this operation",
      summary: []
    });
  });

  it("is invalid on 401", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: "Unauthorized", message: "Unable to authenticate you" }, 401));

    const result = await checkDigitalOceanToken({ token: TOKEN });

    expect(result.error?.message).toBe("Unable to authenticate you");
  });
});
