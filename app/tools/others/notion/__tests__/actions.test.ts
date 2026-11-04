/**
 * @jest-environment node
 */
import { jsonResponse, mockFetch } from "@/test/utils/service";
import { checkNotionToken } from "../actions";

const fetchMock = mockFetch();
const TOKEN = "ntn_secretvalue";

describe("checkNotionToken", () => {
  it("is valid and shows integration, workspace and type", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        object: "user",
        id: "b1",
        name: "env-check bot",
        type: "bot",
        bot: { owner: { type: "workspace", workspace: true }, workspace_name: "HCMCOU" }
      })
    );

    const result = await checkNotionToken({ token: TOKEN });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.notion.com/v1/users/me",
      expect.objectContaining({ headers: { Authorization: `Bearer ${TOKEN}`, "Notion-Version": "2022-06-28" } })
    );
    expect(result.data?.payload).toEqual({
      outcome: "valid",
      summary: [
        { key: "name", value: "env-check bot" },
        { key: "workspace", value: "HCMCOU" },
        { key: "ownerType", value: "workspace", enumKey: "ownerTypes" }
      ]
    });
  });

  it("is invalid on 401", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ object: "error", status: 401, code: "unauthorized", message: "API token is invalid." }, 401)
    );

    const result = await checkNotionToken({ token: TOKEN });

    expect(result.error?.message).toBe("API token is invalid.");
  });
});
