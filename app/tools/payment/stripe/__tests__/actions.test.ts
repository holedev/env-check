/**
 * @jest-environment node
 */
import { jsonResponse, mockFetch } from "@/test/utils/service";
import { checkStripeKey } from "../actions";

const fetchMock = mockFetch();

describe("checkStripeKey", () => {
  it("is valid and reports mode, key type and currencies without amounts", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        livemode: false,
        available: [
          { amount: 1200, currency: "usd" },
          { amount: 50, currency: "eur" },
          { amount: 7, currency: "usd" }
        ]
      })
    );

    const result = await checkStripeKey({ apiKey: "sk_test_51abc" });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.stripe.com/v1/balance",
      expect.objectContaining({ headers: { Authorization: "Bearer sk_test_51abc" } })
    );
    expect(result.data?.payload).toEqual({
      outcome: "valid",
      summary: [
        { key: "mode", value: "test", enumKey: "modes" },
        { key: "keyType", value: "secret", enumKey: "keyTypes" },
        { key: "currencies", value: ["USD", "EUR"] }
      ]
    });
    expect(JSON.stringify(result)).not.toContain("1200");
  });

  it("is restricted when a restricted key can't read the balance", async () => {
    const key = "rk_live_51secret";
    fetchMock.mockResolvedValue(
      jsonResponse({ error: { message: `The provided key '${key}' does not have the required permissions` } }, 403)
    );

    const result = await checkStripeKey({ apiKey: key });

    expect(result.data?.payload).toEqual({
      outcome: "restricted",
      reason: "The provided key '***' does not have the required permissions",
      summary: [
        { key: "mode", value: "live", enumKey: "modes" },
        { key: "keyType", value: "restricted", enumKey: "keyTypes" }
      ]
    });
  });

  it("is invalid on 401", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: { message: "Invalid API Key provided: sk_test_****abc" } }, 401));

    const result = await checkStripeKey({ apiKey: "sk_test_51abc" });

    expect(result.data).toBeNull();
    expect(result.error?.message).toBe("Invalid API Key provided: sk_test_****abc");
  });
});
