/**
 * @jest-environment node
 */
import { deleteApp, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { checkFirebaseServiceAccount } from "../actions";

jest.mock("firebase-admin/app", () => ({
  cert: jest.fn((sa) => sa),
  initializeApp: jest.fn(() => ({ name: "app" })),
  deleteApp: jest.fn().mockResolvedValue(undefined)
}));
jest.mock("firebase-admin/auth", () => ({ getAuth: jest.fn() }));

const mockGetAuth = getAuth as unknown as jest.Mock;
const PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\\nMIIEsecretsecret\\n-----END PRIVATE KEY-----\\n";
const SERVICE_ACCOUNT = JSON.stringify({
  type: "service_account",
  project_id: "envcheck-demo",
  client_email: "admin@envcheck-demo.iam.gserviceaccount.com",
  private_key: PRIVATE_KEY
});

const listUsers = (impl: jest.Mock) => mockGetAuth.mockReturnValue({ listUsers: impl });

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => undefined);
});

describe("checkFirebaseServiceAccount", () => {
  it("is valid and shows project and service account", async () => {
    listUsers(jest.fn().mockResolvedValue({ users: [{ email: "someone@example.com" }] }));

    const result = await checkFirebaseServiceAccount({ serviceAccountJson: SERVICE_ACCOUNT });

    expect(result.data?.payload).toEqual({
      outcome: "valid",
      summary: [
        { key: "projectId", value: "envcheck-demo" },
        { key: "clientEmail", value: "admin@envcheck-demo.iam.gserviceaccount.com" }
      ]
    });
    expect(JSON.stringify(result)).not.toContain("someone@example.com");
    expect(deleteApp).toHaveBeenCalled();
  });

  it("is restricted without the Auth admin role", async () => {
    listUsers(
      jest
        .fn()
        .mockRejectedValue(
          Object.assign(new Error("Caller lacks permission"), { code: "auth/insufficient-permission" })
        )
    );

    const result = await checkFirebaseServiceAccount({ serviceAccountJson: SERVICE_ACCOUNT });

    expect(result.data?.payload).toMatchObject({ outcome: "restricted", reason: "Caller lacks permission" });
  });

  it("is invalid for a rejected key, without leaking it", async () => {
    listUsers(jest.fn().mockRejectedValue(new Error(`invalid_grant for key ${PRIVATE_KEY}`)));

    const result = await checkFirebaseServiceAccount({ serviceAccountJson: SERVICE_ACCOUNT });

    expect(result.data).toBeNull();
    expect(result.error?.message).toBe("invalid_grant for key ***");
    expect(deleteApp).toHaveBeenCalled();
  });

  it.each([
    ["not json", "Service account must be valid JSON"],
    [JSON.stringify({ project_id: "p" }), "Service account is missing project_id, client_email or private_key"]
  ])("rejects %s before initialising the SDK", async (serviceAccountJson, message) => {
    const result = await checkFirebaseServiceAccount({ serviceAccountJson });

    expect(initializeApp).not.toHaveBeenCalled();
    expect(result.error?.message).toBe(message);
  });
});
