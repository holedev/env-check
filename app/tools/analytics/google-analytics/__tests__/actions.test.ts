/**
 * @jest-environment node
 */
import { jsonResponse, mockFetch } from "@/test/utils/service";
import { checkGoogleAnalyticsCredentials } from "../actions";

const fetchMock = mockFetch();
const SECRET = "mp-secret-value";

describe("checkGoogleAnalyticsCredentials", () => {
  it("is valid when the debug endpoint reports no problems", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ validationMessages: [] }));

    const result = await checkGoogleAnalyticsCredentials({ measurementId: "G-ABC123", apiSecret: SECRET });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`https://www.google-analytics.com/debug/mp/collect?measurement_id=G-ABC123&api_secret=${SECRET}`);
    expect(init).toMatchObject({ method: "POST" });
    expect(result.data?.payload).toEqual({ outcome: "valid", summary: [{ key: "measurementId", value: "G-ABC123" }] });
  });

  it("is invalid when Google returns validation messages", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        validationMessages: [{ description: "Measurement ID is not valid", validationCode: "VALUE_INVALID" }]
      })
    );

    const result = await checkGoogleAnalyticsCredentials({ measurementId: "G-ABC123", apiSecret: SECRET });

    expect(result.error?.message).toBe("Measurement ID is not valid");
  });

  it("refuses malformed measurement IDs before calling Google", async () => {
    const result = await checkGoogleAnalyticsCredentials({ measurementId: "UA-123&x=1", apiSecret: SECRET });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.error?.message).toBe("Measurement ID must look like G-XXXXXXXXXX");
  });
});
