/**
 * @jest-environment node
 */
import { jsonResponse, mockFetch } from "@/test/utils/service";
import { checkDeepSeekKey } from "../actions";

const fetchMock = mockFetch();
const KEY = "sk-secret123value";

describe("checkDeepSeekKey", () => {
  it("lists models from https://api.deepseek.com/models", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ object: "list", data: [{ id: "model-b" }, { id: "model-a" }] }));

    const result = await checkDeepSeekKey({ apiKey: KEY });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.deepseek.com/models",
      expect.objectContaining({ headers: { Authorization: `Bearer ${KEY}` } })
    );
    expect(result.data?.payload).toEqual({
      outcome: "valid",
      summary: [
        { key: "modelsCount", value: 2 },
        { key: "models", value: ["model-a", "model-b"] }
      ]
    });
  });

  it("is invalid on 401, without echoing the key", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: { message: `Invalid API Key: ${KEY}` } }, 401));

    const result = await checkDeepSeekKey({ apiKey: KEY });

    expect(result.data).toBeNull();
    expect(result.error?.message).toBe("Invalid API Key: ***");
  });
});
