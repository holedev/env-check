"use server";

import { createTransport } from "nodemailer";
import { redact, summarize, valid } from "@/lib/validation";
import { handleErrorServerNoAuth } from "@/utils/handle-error-server";
import { assertPublicHost } from "@/utils/network-guard";

type SMTPConfig = {
  host: string;
  security: string;
  username: string;
  password: string;
  testType: string;
};

/** Fixed list: the form can't send arbitrary ports. */
const _SECURITY: Record<string, { port: number; secure: boolean }> = {
  ssl: { port: 465, secure: true },
  starttls: { port: 587, secure: false }
};

const _TIMEOUT_MS = 10_000;

/**
 * Probe: SMTP login (transporter.verify). Optionally, and only when the user
 * picks it, one test email to their own address: the one Tool whose check may
 * send something, by explicit choice.
 */
const checkSMTPConnection = async ({ host, security, username, password, testType }: SMTPConfig) =>
  handleErrorServerNoAuth({
    cb: async () => {
      const mode = Object.hasOwn(_SECURITY, security) ? _SECURITY[security] : undefined;
      if (!mode) {
        throw new Error("Unknown SMTP security mode");
      }
      await assertPublicHost(host);

      const transporter = createTransport({
        host,
        port: mode.port,
        secure: mode.secure,
        auth: { user: username, pass: password },
        connectionTimeout: _TIMEOUT_MS,
        greetingTimeout: _TIMEOUT_MS
      });

      try {
        await transporter.verify();
        let testEmail = false;
        if (testType === "sendEmail") {
          await transporter.sendMail({
            from: username,
            to: username,
            subject: "env-check: SMTP test",
            text: "This test email confirms your SMTP login works. It was sent by env-check because you asked for it."
          });
          testEmail = true;
        }

        return valid(summarize({ server: `${host}:${mode.port}`, username, testEmail }));
      } catch (error) {
        throw new Error(redact(error instanceof Error ? error.message : "SMTP login failed", [password]));
      } finally {
        transporter.close();
      }
    }
  });

export { checkSMTPConnection };
