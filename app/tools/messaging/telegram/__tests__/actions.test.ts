/**
 * @jest-environment node
 */
import { jsonResponse, mockFetch } from "@/test/utils/service";
import { checkTelegramToken } from "../actions";

const fetchMock = mockFetch();
const TOKEN = "123456789:AAEsecretsecretsecretsecretsecret";

describe("checkTelegramToken", () => {
  it("is valid and summarises the bot", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        ok: true,
        result: {
          id: 123_456_789,
          is_bot: true,
          first_name: "Deploy Bot",
          username: "deploy_bot",
          can_join_groups: true,
          can_read_all_group_messages: false,
          supports_inline_queries: false
        }
      })
    );

    const result = await checkTelegramToken({ token: TOKEN });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.telegram.org/bot123456789%3AAAEsecretsecretsecretsecretsecret/getMe",
      expect.anything()
    );
    expect(result.data?.payload).toEqual({
      outcome: "valid",
      summary: [
        { key: "username", value: "@deploy_bot" },
        { key: "name", value: "Deploy Bot" },
        { key: "id", value: "123456789" },
        { key: "canJoinGroups", value: true },
        { key: "canReadAllGroupMessages", value: false },
        { key: "supportsInlineQueries", value: false }
      ]
    });
  });

  it("is invalid on 401 Unauthorized", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: false, error_code: 401, description: "Unauthorized" }, 401));

    const result = await checkTelegramToken({ token: TOKEN });

    expect(result.error?.message).toBe("Unauthorized");
  });

  it("never leaks the token, which is part of the URL", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError(`fetch failed https://api.telegram.org/bot${TOKEN}/getMe`));
    const network = await checkTelegramToken({ token: TOKEN });

    fetchMock.mockResolvedValueOnce(jsonResponse({ ok: false, description: `Bad token ${TOKEN}` }, 404));
    const api = await checkTelegramToken({ token: TOKEN });

    expect(network.error?.message).toBe("Could not reach Telegram");
    expect(api.error?.message).toBe("Bad token ***");
    expect(JSON.stringify([network, api])).not.toContain("AAEsecret");
    expect((console.error as jest.Mock).mock.calls.flat().map(String).join(" ")).not.toContain("AAEsecret");
  });
});
