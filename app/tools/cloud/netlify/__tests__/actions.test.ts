/**
 * @jest-environment node
 */
import { jsonResponse, mockFetch } from "@/test/utils/service";
import { checkNetlifyToken } from "../actions";

const fetchMock = mockFetch();
const TOKEN = "nfp_secretvalue";

describe("checkNetlifyToken", () => {
  it("is valid and shows name and site count but not the email", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ id: "u1", full_name: "Hole Dev", email: "hole@example.com", site_count: 4 })
    );

    const result = await checkNetlifyToken({ token: TOKEN });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.netlify.com/api/v1/user",
      expect.objectContaining({ headers: { Authorization: `Bearer ${TOKEN}` } })
    );
    expect(result.data?.payload).toEqual({
      outcome: "valid",
      summary: [
        { key: "name", value: "Hole Dev" },
        { key: "siteCount", value: 4 }
      ]
    });
    expect(JSON.stringify(result)).not.toContain("hole@example.com");
  });

  it("is invalid on 401", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ code: 401, message: "Access Denied: Invalid token supplied" }, 401));

    const result = await checkNetlifyToken({ token: TOKEN });

    expect(result.error?.message).toBe("Access Denied: Invalid token supplied");
  });
});
