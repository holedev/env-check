/**
 * @jest-environment node
 */
import { jsonResponse, mockFetch } from "@/test/utils/service";
import { checkSendGridKey } from "../actions";

const fetchMock = mockFetch();
const KEY = "SG.abc123.secretpart";

describe("checkSendGridKey", () => {
  it("is valid and says whether the key can send mail", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ scopes: ["user.profile.read", "mail.send"] }));

    const result = await checkSendGridKey({ apiKey: KEY, region: "global" });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.sendgrid.com/v3/scopes",
      expect.objectContaining({ headers: { Authorization: `Bearer ${KEY}` } })
    );
    expect(result.data?.payload).toEqual({
      outcome: "valid",
      summary: [
        { key: "canSendMail", value: true },
        { key: "scopesCount", value: 2 },
        { key: "scopes", value: ["mail.send", "user.profile.read"] }
      ]
    });
  });

  it("uses the EU API for the eu region", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ scopes: [] }));

    await checkSendGridKey({ apiKey: KEY, region: "eu" });

    expect(fetchMock).toHaveBeenCalledWith("https://api.eu.sendgrid.com/v3/scopes", expect.anything());
  });

  it("refuses regions outside the fixed list", async () => {
    const result = await checkSendGridKey({ apiKey: KEY, region: "https://evil.example" });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.error?.message).toBe("Unknown SendGrid region");
  });

  it("is restricted on 403 and invalid on 401", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ errors: [{ message: "access forbidden" }] }, 403));
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ errors: [{ field: null, message: "authorization required" }] }, 401)
    );

    const forbidden = await checkSendGridKey({ apiKey: KEY, region: "global" });
    const unauthorized = await checkSendGridKey({ apiKey: KEY, region: "global" });

    expect(forbidden.data?.payload).toEqual({ outcome: "restricted", reason: "access forbidden", summary: [] });
    expect(unauthorized.error?.message).toBe("authorization required");
  });
});
