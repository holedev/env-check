"use server";

import * as nodemailer from "nodemailer";
import { handleErrorServerNoAuth } from "@/utils/handleErrorServer";

interface SMTPConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  secure: boolean;
  testType: "verify" | "sendEmail";
}

const checkSMTPConnection = async (config: SMTPConfig) =>
  handleErrorServerNoAuth({
    cb: async () => {
      const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.username,
          pass: config.password
        }
      });

      try {
        // Always verify connection configuration first
        await transporter.verify();

        const result = {
          success: true,
          testType: config.testType,
          connectionDetails: {
            host: config.host,
            port: config.port,
            secure: config.secure,
            username: config.username
          },
          messageId: null as string | null
        };

        // If user wants to send test email, do it after verification
        if (config.testType === "sendEmail") {
          const info = await transporter.sendMail({
            from: config.username,
            to: config.username,
            subject: "Gmail SMTP Test - Connection Successful",
            text: "This is a test email to verify your Gmail SMTP configuration is working correctly.",
            html: `
              <h2>Gmail SMTP Test Successful</h2>
              <p>This is a test email to verify your Gmail SMTP configuration is working correctly.</p>
              <p><strong>Connection Details:</strong></p>
              <ul>
                <li>Host: ${config.host}</li>
                <li>Port: ${config.port}</li>
                <li>Secure: ${config.secure ? "Yes" : "No"}</li>
                <li>Username: ${config.username}</li>
              </ul>
              <p>Your Gmail SMTP is configured properly and ready to use!</p>
            `
          });
          result.messageId = info.messageId;
        }

        return result;
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : "Failed to connect to Gmail SMTP");
      }
    }
  });

export { checkSMTPConnection };
