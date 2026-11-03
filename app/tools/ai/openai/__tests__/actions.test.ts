/**
 * @jest-environment node
 */
import { jsonResponse, mockFetch } from "@/test/utils/service";
import { checkOpenAiKey } from "../actions";

const fetchMock = mockFetch();
const KEY = "sk-proj-abc123secret";

describe("checkOpenAiKey", () => {
  it("is valid and summarises the models a key can see", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: [{ id: "gpt-5" }, { id: "gpt-4.1" }] }));

    const result = await checkOpenAiKey({ apiKey: KEY });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.openai.com/v1/models",
      expect.objectContaining({ headers: { Authorization: `Bearer ${KEY}` } })
    );
    expect(result.data?.payload).toEqual({
      outcome: "valid",
      summary: [
        { key: "keyType", value: "project", enumKey: "keyTypes" },
        { key: "modelsCount", value: 2 },
        { key: "models", value: ["gpt-4.1", "gpt-5"] }
      ]
    });
  });

  it("is restricted when the key may not read models", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: { message: "Missing scopes: api.model.read" } }, 403));

    const result = await checkOpenAiKey({ apiKey: "sk-svcacct-xyz789" });

    expect(result.data?.payload).toMatchObject({
      outcome: "restricted",
      reason: "Missing scopes: api.model.read",
      summary: [{ key: "keyType", value: "serviceAccount" }]
    });
  });

  it("is invalid on 401, without echoing the key", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: { message: `Incorrect API key provided: ${KEY}.` } }, 401));

    const result = await checkOpenAiKey({ apiKey: KEY });

    expect(result.data).toBeNull();
    expect(result.error?.message).toBe("Incorrect API key provided: ***.");
  });

  it("reports an unreachable API without the URL", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));

    const result = await checkOpenAiKey({ apiKey: KEY });

    expect(result.error?.message).toBe("Could not reach OpenAI");
  });
});
