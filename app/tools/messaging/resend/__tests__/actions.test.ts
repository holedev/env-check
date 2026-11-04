/**
 * @jest-environment node
 */
import { jsonResponse, mockFetch } from "@/test/utils/service";
import { checkResendKey } from "../actions";

const fetchMock = mockFetch();
const KEY = "re_123_secret";

describe("checkResendKey", () => {
  it("is valid for a full-access key and lists domain status", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        object: "list",
        data: [
          { id: "d1", name: "acme.com", status: "verified", region: "us-east-1" },
          { id: "d2", name: "mail.acme.dev", status: "pending", region: "eu-west-1" }
        ]
      })
    );

    const result = await checkResendKey({ apiKey: KEY });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.resend.com/domains",
      expect.objectContaining({ headers: { Authorization: `Bearer ${KEY}`, "User-Agent": "env-check" } })
    );
    expect(result.data?.payload).toEqual({
      outcome: "valid",
      summary: [
        { key: "domainsCount", value: 2 },
        { key: "domains", value: ["acme.com (verified)", "mail.acme.dev (pending)"] }
      ]
    });
  });

  it("is restricted for a sending-only key", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        { statusCode: 401, name: "restricted_api_key", message: "This API key is restricted to only send emails" },
        401
      )
    );

    const result = await checkResendKey({ apiKey: KEY });

    expect(result.data?.payload).toEqual({
      outcome: "restricted",
      reason: "This API key is restricted to only send emails",
      summary: []
    });
  });

  it("is invalid for a bad key", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ statusCode: 400, name: "validation_error", message: "API key is invalid" }, 400)
    );

    const result = await checkResendKey({ apiKey: KEY });

    expect(result.error?.message).toBe("API key is invalid");
  });
});
