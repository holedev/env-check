/**
 * @jest-environment node
 */
import { jsonResponse, mockFetch } from "@/test/utils/service";
import { checkMistralKey } from "../actions";

const fetchMock = mockFetch();
const KEY = "key-secret123value";

describe("checkMistralKey", () => {
  it("lists models from https://api.mistral.ai/v1/models", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ object: "list", data: [{ id: "model-b" }, { id: "model-a" }] }));

    const result = await checkMistralKey({ apiKey: KEY });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.mistral.ai/v1/models",
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

    const result = await checkMistralKey({ apiKey: KEY });

    expect(result.data).toBeNull();
    expect(result.error?.message).toBe("Invalid API Key: ***");
  });
});
