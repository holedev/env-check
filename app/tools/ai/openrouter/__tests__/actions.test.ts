/**
 * @jest-environment node
 */
import { jsonResponse, mockFetch } from "@/test/utils/service";
import { checkOpenRouterKey } from "../actions";

const fetchMock = mockFetch();
const KEY = "sk-or-v1-secretvalue";

describe("checkOpenRouterKey", () => {
  it("is valid and shows usage against a credit limit", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        data: { label: "ci-key", usage: 1.2345, limit: 10, limit_remaining: 8.7655, is_free_tier: false }
      })
    );

    const result = await checkOpenRouterKey({ apiKey: KEY });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://openrouter.ai/api/v1/key",
      expect.objectContaining({ headers: { Authorization: `Bearer ${KEY}` } })
    );
    expect(result.data?.payload).toEqual({
      outcome: "valid",
      summary: [
        { key: "label", value: "ci-key" },
        { key: "usage", value: "$1.23" },
        { key: "limit", value: "$10.00" },
        { key: "limitRemaining", value: "$8.77" },
        { key: "freeTier", value: false }
      ]
    });
  });

  it("marks keys without a limit as unlimited", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ data: { label: "dev", usage: 0, limit: null, limit_remaining: null, is_free_tier: true } })
    );

    const result = await checkOpenRouterKey({ apiKey: KEY });

    expect(result.data?.payload).toEqual({
      outcome: "valid",
      summary: [
        { key: "label", value: "dev" },
        { key: "usage", value: "$0.00" },
        { key: "limit", value: "unlimited", enumKey: "limits" },
        { key: "freeTier", value: true }
      ]
    });
  });

  it("is invalid on 401", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: { message: "User not found.", code: 401 } }, 401));

    const result = await checkOpenRouterKey({ apiKey: KEY });

    expect(result.error?.message).toBe("User not found.");
  });
});
