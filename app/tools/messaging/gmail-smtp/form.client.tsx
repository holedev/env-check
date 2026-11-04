"use client";

import { z } from "zod";
import { ValidationForm } from "@/components/custom/Tools/ValidationForm.client";
import { checkSMTPConnection } from "./actions";

const _SECURITY = ["ssl", "starttls"] as const;
const _TEST_TYPES = ["verify", "sendEmail"] as const;

const formSchema = z.object({
  host: z.string().trim().min(1, "required"),
  security: z.enum(_SECURITY),
  username: z.string().trim().min(1, "required").email("errors.format"),
  password: z.string().trim().min(1, "required"),
  testType: z.enum(_TEST_TYPES)
});

const FormClient = () => (
  <ValidationForm
    action={checkSMTPConnection}
    defaultValues={{ host: "smtp.gmail.com", security: "ssl", username: "", password: "", testType: "verify" }}
    fields={[
      { name: "host", kind: "text" },
      { name: "security", kind: "select", options: _SECURITY },
      { name: "username", kind: "text" },
      { name: "password" },
      { name: "testType", kind: "select", options: _TEST_TYPES }
    ]}
    schema={formSchema}
    toolPath='gmail-smtp'
  />
);

export { FormClient };
