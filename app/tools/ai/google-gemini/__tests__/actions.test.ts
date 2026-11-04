/**
 * @jest-environment node
 */
import { jsonResponse, mockFetch } from "@/test/utils/service";
import { checkGeminiKey } from "../actions";

const fetchMock = mockFetch();
const KEY = `AIza${"x".repeat(35)}`;

describe("checkGeminiKey", () => {
  it("lists models without the models/ prefix", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ object: "list", data: [{ id: "models/gemini-2.5-pro" }, { id: "models/gemini-2.5-flash" }] })
    );

    const result = await checkGeminiKey({ apiKey: KEY });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://generativelanguage.googleapis.com/v1beta/openai/models",
      expect.objectContaining({ headers: { Authorization: `Bearer ${KEY}` } })
    );
    expect(result.data?.payload).toEqual({
      outcome: "valid",
      summary: [
        { key: "modelsCount", value: 2 },
        { key: "models", value: ["gemini-2.5-flash", "gemini-2.5-pro"] }
      ]
    });
  });

  it("reads Google's array-wrapped error", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse([{ error: { code: 400, message: "API key not valid. Please pass a valid API key." } }], 400)
    );

    const result = await checkGeminiKey({ apiKey: KEY });

    expect(result.data).toBeNull();
    expect(result.error?.message).toBe("API key not valid. Please pass a valid API key.");
  });
});
