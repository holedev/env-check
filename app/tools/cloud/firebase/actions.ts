"use server";

import { type App, cert, deleteApp, initializeApp, type ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { redact, restricted, summarize, valid } from "@/lib/validation";
import { handleErrorServerNoAuth } from "@/utils/handle-error-server";

type FirebaseConfig = { serviceAccountJson: string };

type ParsedServiceAccount = { project_id?: string; client_email?: string; private_key?: string };

const parseServiceAccount = (raw: string): ParsedServiceAccount => {
  try {
    return JSON.parse(raw) as ParsedServiceAccount;
  } catch {
    throw new Error("Service account must be valid JSON");
  }
};

const codeOf = (error: unknown) =>
  typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";

/**
 * Probe: Admin SDK listUsers(1), read-only. A service account without the
 * Auth admin role gets auth/insufficient-permission: Restricted. The private
 * key is redacted from every error.
 */
const checkFirebaseServiceAccount = async ({ serviceAccountJson }: FirebaseConfig) =>
  handleErrorServerNoAuth({
    cb: async () => {
      const parsed = parseServiceAccount(serviceAccountJson);
      if (!(parsed.project_id && parsed.client_email && parsed.private_key)) {
        throw new Error("Service account is missing project_id, client_email or private_key");
      }

      const facts = summarize({ projectId: parsed.project_id, clientEmail: parsed.client_email });
      const serviceAccount: ServiceAccount = {
        projectId: parsed.project_id,
        clientEmail: parsed.client_email,
        privateKey: parsed.private_key
      };

      let app: App | undefined;
      try {
        app = initializeApp({ credential: cert(serviceAccount) }, `env-check-${crypto.randomUUID()}`);
        await getAuth(app).listUsers(1);
        return valid(facts);
      } catch (error) {
        const message = redact(error instanceof Error ? error.message : "Failed to authenticate with Firebase", [
          parsed.private_key,
          serviceAccountJson
        ]);
        if (codeOf(error) === "auth/insufficient-permission") {
          return restricted(message, facts);
        }
        throw new Error(message);
      } finally {
        if (app) {
          await deleteApp(app);
        }
      }
    }
  });

export { checkFirebaseServiceAccount };
