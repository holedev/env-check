/**
 * @jest-environment node
 */
import { probeOpenAiCompatible } from "@/lib/openai-compatible";
import { jsonResponse, mockFetch } from "@/test/utils/service";

const fetchMock = mockFetch();
const probe = (apiKey = "key-secret-123") =>
  probeOpenAiCompatible({ service: "Example", modelsUrl: "https://api.example.com/v1/models", apiKey });

describe("probeOpenAiCompatible", () => {
  it("sorts model ids and counts them", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: [{ id: "models/b" }, { id: "a" }] }));

    await expect(probe()).resolves.toEqual({
      outcome: "valid",
      summary: [
        { key: "modelsCount", value: 2 },
        { key: "models", value: ["a", "b"] }
      ]
    });
  });

  it.each([
    [{ error: { message: "Invalid API Key" } }, "Invalid API Key"],
    [{ error: "invalid_api_key" }, "invalid_api_key"],
    [{ message: "Unauthorized" }, "Unauthorized"],
    [{ detail: "Authentication failed" }, "Authentication failed"],
    [[{ error: { code: 400, message: "API key not valid" } }], "API key not valid"],
    [null, "Example returned HTTP 401"]
  ])("reads the error message from %j", async (body, message) => {
    fetchMock.mockResolvedValue(jsonResponse(body, 401));

    await expect(probe()).rejects.toThrow(message);
  });

  it("treats 403 as Restricted and redacts the key", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: { message: "key key-secret-123 lacks model access" } }, 403));

    await expect(probe()).resolves.toEqual({
      outcome: "restricted",
      reason: "key *** lacks model access",
      summary: []
    });
  });
});
