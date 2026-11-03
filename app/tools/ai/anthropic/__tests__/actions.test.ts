/**
 * @jest-environment node
 */
import { jsonResponse, mockFetch } from "@/test/utils/service";
import { checkAnthropicKey } from "../actions";

const fetchMock = mockFetch();
const KEY = "sk-ant-api03-secretvalue";

describe("checkAnthropicKey", () => {
  it("is valid and lists models", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: [{ id: "claude-opus-5-5" }, { id: "claude-haiku-5-5" }] }));

    const result = await checkAnthropicKey({ apiKey: KEY });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.anthropic.com/v1/models?limit=1000",
      expect.objectContaining({ headers: { "x-api-key": KEY, "anthropic-version": "2023-06-01" } })
    );
    expect(result.data?.payload).toEqual({
      outcome: "valid",
      summary: [
        { key: "modelsCount", value: 2 },
        { key: "models", value: ["claude-opus-5-5", "claude-haiku-5-5"] }
      ]
    });
  });

  it("is restricted on permission_error", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ type: "error", error: { type: "permission_error", message: "Not allowed" } }, 403)
    );

    const result = await checkAnthropicKey({ apiKey: KEY });

    expect(result.data?.payload).toEqual({ outcome: "restricted", reason: "Not allowed", summary: [] });
  });

  it("is invalid on authentication_error, without echoing the key", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ type: "error", error: { type: "authentication_error", message: `invalid x-api-key ${KEY}` } }, 401)
    );

    const result = await checkAnthropicKey({ apiKey: KEY });

    expect(result.error?.message).toBe("invalid x-api-key ***");
  });
});
