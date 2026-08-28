"use server";

import { type App, cert, deleteApp, initializeApp, type ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { handleErrorServerNoAuth } from "@/utils/handle-error-server";

type FirebaseConfig = {
  serviceAccountJson: string;
};

const parseServiceAccount = (raw: string) => {
  try {
    return JSON.parse(raw) as { project_id?: string; client_email?: string; private_key?: string };
  } catch {
    throw new Error("Service account must be valid JSON");
  }
};

const checkFirebaseServiceAccount = async (config: FirebaseConfig) =>
  handleErrorServerNoAuth({
    cb: async () => {
      const parsed = parseServiceAccount(config.serviceAccountJson);

      if (!(parsed.project_id && parsed.client_email && parsed.private_key)) {
        throw new Error("Service account is missing project_id, client_email or private_key");
      }

      const serviceAccount: ServiceAccount = {
        projectId: parsed.project_id,
        clientEmail: parsed.client_email,
        privateKey: parsed.private_key
      };

      let app: App | undefined;
      try {
        app = initializeApp({ credential: cert(serviceAccount) }, `env-check-${Date.now()}`);
        await getAuth(app).listUsers(1);

        return {
          success: true,
          projectId: parsed.project_id
        };
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : "Failed to authenticate with Firebase");
      } finally {
        if (app) {
          await deleteApp(app);
        }
      }
    }
  });

export { checkFirebaseServiceAccount };
