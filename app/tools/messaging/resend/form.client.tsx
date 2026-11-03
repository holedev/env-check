"use client";

import { z } from "zod";
import { ValidationForm } from "@/components/custom/Tools/ValidationForm.client";
import { checkResendKey } from "./actions";

const formSchema = z.object({
  apiKey: z.string().trim().min(1, "required").startsWith("re_", "errors.format")
});

const FormClient = () => (
  <ValidationForm
    action={checkResendKey}
    defaultValues={{ apiKey: "" }}
    fields={[{ name: "apiKey" }]}
    schema={formSchema}
    toolPath='resend'
  />
);

export { FormClient };
