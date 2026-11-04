"use server";

import { enumFact, redact, requestService, summarize, valid } from "@/lib/validation";
import type { SummaryItem } from "@/types/validation";
import { handleErrorServerNoAuth } from "@/utils/handle-error-server";

type TwilioConfig = { accountSid: string; authToken: string };

type TwilioAccount = {
  friendly_name?: string;
  status?: string;
  type?: string;
  message?: string;
};

const _ACCOUNT_SID = /^AC[0-9a-f]{32}$/i;
const _STATUSES = new Set(["active", "suspended", "closed"]);
const _TYPES = new Set(["Full", "Trial"]);

const knownEnum = (key: string, enumKey: string, value: string | undefined, known: Set<string>): SummaryItem[] =>
  value && known.has(value) ? [enumFact(key, enumKey, value)] : [];

/** Probe: fetch the account itself with HTTP Basic (SID:token). Read-only. */
const checkTwilioCredentials = async ({ accountSid, authToken }: TwilioConfig) =>
  handleErrorServerNoAuth({
    cb: async () => {
      // The SID goes into the URL path, so it must be exactly an Account SID.
      if (!_ACCOUNT_SID.test(accountSid)) {
        throw new Error("Invalid Account SID format");
      }

      const basic = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
      const res = await requestService<TwilioAccount>(
        "Twilio",
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`,
        { headers: { Authorization: `Basic ${basic}` } }
      );

      if (!res.ok) {
        throw new Error(redact(res.body?.message ?? `Twilio returned HTTP ${res.status}`, [authToken, basic]));
      }

      return valid([
        ...summarize({ friendlyName: res.body?.friendly_name }),
        ...knownEnum("status", "statuses", res.body?.status, _STATUSES),
        ...knownEnum("type", "types", res.body?.type, _TYPES)
      ]);
    }
  });

export { checkTwilioCredentials };
