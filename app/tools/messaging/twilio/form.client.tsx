"use client";

import { z } from "zod";
import { ValidationForm } from "@/components/custom/Tools/ValidationForm.client";
import { checkTwilioCredentials } from "./actions";

const _ACCOUNT_SID = /^AC[0-9a-f]{32}$/i;

const formSchema = z.object({
  accountSid: z.string().trim().min(1, "required").regex(_ACCOUNT_SID, "errors.format"),
  authToken: z.string().trim().min(1, "required")
});

const FormClient = () => (
  <ValidationForm
    action={checkTwilioCredentials}
    defaultValues={{ accountSid: "", authToken: "" }}
    fields={[{ name: "accountSid", kind: "text" }, { name: "authToken" }]}
    schema={formSchema}
    toolPath='twilio'
  />
);

export { FormClient };
