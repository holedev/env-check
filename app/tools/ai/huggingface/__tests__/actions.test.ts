/**
 * @jest-environment node
 */
import { jsonResponse, mockFetch } from "@/test/utils/service";
import { checkHuggingFaceToken } from "../actions";

const fetchMock = mockFetch();
const TOKEN = "hf_secretvalue";

describe("checkHuggingFaceToken", () => {
  it("is valid and shows user, token name, permission and orgs but not the email", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        type: "user",
        name: "holedev",
        email: "hole@example.com",
        orgs: [{ name: "hcmcou" }],
        auth: { type: "access_token", accessToken: { displayName: "ci", role: "read" } }
      })
    );

    const result = await checkHuggingFaceToken({ token: TOKEN });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://huggingface.co/api/whoami-v2",
      expect.objectContaining({ headers: { Authorization: `Bearer ${TOKEN}` } })
    );
    expect(result.data?.payload).toEqual({
      outcome: "valid",
      summary: [
        { key: "user", value: "holedev" },
        { key: "tokenName", value: "ci" },
        { key: "role", value: "read", enumKey: "roles" },
        { key: "orgs", value: ["hcmcou"] }
      ]
    });
    expect(JSON.stringify(result)).not.toContain("hole@example.com");
  });

  it("skips an unknown permission instead of showing a raw code", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ name: "bot", auth: { accessToken: { role: "something-new" } } }));

    const result = await checkHuggingFaceToken({ token: TOKEN });

    expect(result.data?.payload).toEqual({ outcome: "valid", summary: [{ key: "user", value: "bot" }] });
  });

  it("is invalid on 401", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: "Invalid credentials in Authorization header" }, 401));

    const result = await checkHuggingFaceToken({ token: TOKEN });

    expect(result.error?.message).toBe("Invalid credentials in Authorization header");
  });
});
