"use client";

import { z } from "zod";
import { ValidationForm } from "@/components/custom/Tools/ValidationForm.client";
import { checkSentryToken } from "./actions";

const _REGIONS = ["us", "eu"] as const;

const formSchema = z.object({
  token: z.string().trim().min(1, "required"),
  region: z.enum(_REGIONS)
});

const FormClient = () => (
  <ValidationForm
    action={checkSentryToken}
    defaultValues={{ token: "", region: "us" }}
    fields={[{ name: "token" }, { name: "region", kind: "select", options: _REGIONS }]}
    schema={formSchema}
    toolPath='sentry'
  />
);

export { FormClient };
