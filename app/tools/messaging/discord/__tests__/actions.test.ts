/**
 * @jest-environment node
 */
import { jsonResponse, mockFetch } from "@/test/utils/service";
import { checkDiscordConnection } from "../actions";

const fetchMock = mockFetch();
const TOKEN = "MTIzNDU2Nzg5.secret.value";

describe("checkDiscordConnection", () => {
  it("is valid and shows bot name, id and verification", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ id: "123", username: "deploy-bot", bot: true, public_flags: 65_536, email: null })
    );

    const result = await checkDiscordConnection({ token: TOKEN });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://discord.com/api/v10/users/@me",
      expect.objectContaining({ headers: { Authorization: `Bot ${TOKEN}` } })
    );
    expect(result.data?.payload).toEqual({
      outcome: "valid",
      summary: [
        { key: "username", value: "deploy-bot" },
        { key: "id", value: "123" },
        { key: "verified", value: true }
      ]
    });
  });

  it("is invalid on 401", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: "401: Unauthorized", code: 0 }, 401));

    const result = await checkDiscordConnection({ token: TOKEN });

    expect(result.data).toBeNull();
    expect(result.error?.message).toBe("401: Unauthorized");
  });
});
