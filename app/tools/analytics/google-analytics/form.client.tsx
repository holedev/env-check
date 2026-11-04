"use client";

import { z } from "zod";
import { ValidationForm } from "@/components/custom/Tools/ValidationForm.client";
import { checkGoogleAnalyticsCredentials } from "./actions";

const _MEASUREMENT_ID = /^G-[A-Z0-9]+$/;

const formSchema = z.object({
  measurementId: z.string().trim().min(1, "required").regex(_MEASUREMENT_ID, "errors.format"),
  apiSecret: z.string().trim().min(1, "required")
});

const FormClient = () => (
  <ValidationForm
    action={checkGoogleAnalyticsCredentials}
    defaultValues={{ measurementId: "", apiSecret: "" }}
    fields={[{ name: "measurementId", kind: "text" }, { name: "apiSecret" }]}
    schema={formSchema}
    toolPath='google-analytics'
  />
);

export { FormClient };
