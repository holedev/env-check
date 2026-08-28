import { checkFirebaseServiceAccount } from "../actions";

jest.mock("firebase-admin/app", () => ({
  initializeApp: jest.fn(() => ({ name: "env-check-test" })),
  cert: jest.fn((value) => value),
  deleteApp: jest.fn().mockResolvedValue(undefined)
}));

jest.mock("firebase-admin/auth", () => ({
  getAuth: jest.fn()
}));

jest.mock("@/utils/handle-error-server", () => ({
  handleErrorServerNoAuth: jest.fn()
}));

type Cb = { cb: () => Promise<object> };

const passThrough = async ({ cb }: Cb) => {
  const result = await cb();
  return { error: null, data: { payload: result } };
};

const catchError = async ({ cb }: Cb) => {
  try {
    await cb();
    return { error: null, data: { payload: {} } };
  } catch (error) {
    return { error: { message: error instanceof Error ? error.message : "Unknown error" }, data: null };
  }
};

const validAccount = JSON.stringify({
  project_id: "demo-project",
  client_email: "sa@demo-project.iam.gserviceaccount.com",
  private_key: "-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----\n"
});

const mockListUsers = (impl: jest.Mock) => {
  const { getAuth } = require("firebase-admin/auth");
  getAuth.mockReturnValue({ listUsers: impl });
};

describe("Firebase Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("checkFirebaseServiceAccount", () => {
    it("should return the project id when the service account is valid", async () => {
      mockListUsers(jest.fn().mockResolvedValue({ users: [] }));

      const { handleErrorServerNoAuth } = require("@/utils/handle-error-server");
      handleErrorServerNoAuth.mockImplementation(passThrough);

      const res = await checkFirebaseServiceAccount({ serviceAccountJson: validAccount });

      expect(res.error).toBeNull();
      expect(res.data?.payload).toEqual({ success: true, projectId: "demo-project" });

      const { deleteApp } = require("firebase-admin/app");
      expect(deleteApp).toHaveBeenCalled();
    });

    it("should error when the JSON cannot be parsed", async () => {
      const { handleErrorServerNoAuth } = require("@/utils/handle-error-server");
      handleErrorServerNoAuth.mockImplementation(catchError);

      const res = await checkFirebaseServiceAccount({ serviceAccountJson: "{not json" });

      expect(res.data).toBeNull();
      expect(res.error?.message).toBe("Service account must be valid JSON");
    });

    it("should error when required fields are missing", async () => {
      const { handleErrorServerNoAuth } = require("@/utils/handle-error-server");
      handleErrorServerNoAuth.mockImplementation(catchError);

      const res = await checkFirebaseServiceAccount({ serviceAccountJson: JSON.stringify({ project_id: "x" }) });

      expect(res.data).toBeNull();
      expect(res.error?.message).toBe("Service account is missing project_id, client_email or private_key");
    });

    it("should error and still tear down the app when auth is rejected", async () => {
      mockListUsers(jest.fn().mockRejectedValue(new Error("Invalid JWT Signature")));

      const { handleErrorServerNoAuth } = require("@/utils/handle-error-server");
      handleErrorServerNoAuth.mockImplementation(catchError);

      const res = await checkFirebaseServiceAccount({ serviceAccountJson: validAccount });

      expect(res.data).toBeNull();
      expect(res.error?.message).toBe("Invalid JWT Signature");

      const { deleteApp } = require("firebase-admin/app");
      expect(deleteApp).toHaveBeenCalled();
    });

    it("should build the credential from the parsed service account", async () => {
      mockListUsers(jest.fn().mockResolvedValue({ users: [] }));

      const { handleErrorServerNoAuth } = require("@/utils/handle-error-server");
      handleErrorServerNoAuth.mockImplementation(passThrough);

      await checkFirebaseServiceAccount({ serviceAccountJson: validAccount });

      const { cert } = require("firebase-admin/app");
      expect(cert).toHaveBeenCalledWith(expect.objectContaining({ projectId: "demo-project" }));
    });
  });
});
