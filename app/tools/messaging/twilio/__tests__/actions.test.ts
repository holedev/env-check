/**
 * @jest-environment node
 */
import { jsonResponse, mockFetch } from "@/test/utils/service";
import { checkTwilioCredentials } from "../actions";

const fetchMock = mockFetch();
const SID = `AC${"a1".repeat(16)}`;
const TOKEN = "authtokensecret123";

describe("checkTwilioCredentials", () => {
  it("is valid and shows account name, status and type", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ sid: SID, friendly_name: "Acme", status: "active", type: "Trial" }));

    const result = await checkTwilioCredentials({ accountSid: SID, authToken: TOKEN });

    const basic = Buffer.from(`${SID}:${TOKEN}`).toString("base64");
    expect(fetchMock).toHaveBeenCalledWith(
      `https://api.twilio.com/2010-04-01/Accounts/${SID}.json`,
      expect.objectContaining({ headers: { Authorization: `Basic ${basic}` } })
    );
    expect(result.data?.payload).toEqual({
      outcome: "valid",
      summary: [
        { key: "friendlyName", value: "Acme" },
        { key: "status", value: "active", enumKey: "statuses" },
        { key: "type", value: "Trial", enumKey: "types" }
      ]
    });
  });

  it("is invalid on 401", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ code: 20_003, message: "Authenticate", status: 401 }, 401));

    const result = await checkTwilioCredentials({ accountSid: SID, authToken: TOKEN });

    expect(result.error?.message).toBe("Authenticate");
  });

  it.each(["AC123", `AC${"a1".repeat(16)}/../../Messages`, "SKxyz"])(
    "never puts a malformed SID (%s) in the URL",
    async (accountSid) => {
      const result = await checkTwilioCredentials({ accountSid, authToken: TOKEN });

      expect(fetchMock).not.toHaveBeenCalled();
      expect(result.error?.message).toBe("Invalid Account SID format");
    }
  );
});
