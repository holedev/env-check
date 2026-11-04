"use client";

import { z } from "zod";
import { ValidationForm } from "@/components/custom/Tools/ValidationForm.client";
import { checkSendGridKey } from "./actions";

const _REGIONS = ["global", "eu"] as const;
const _SENDGRID_KEY = /^SG\.[\w-]+\.[\w-]+$/;

const formSchema = z.object({
  apiKey: z.string().trim().min(1, "required").regex(_SENDGRID_KEY, "errors.format"),
  region: z.enum(_REGIONS)
});

const FormClient = () => (
  <ValidationForm
    action={checkSendGridKey}
    defaultValues={{ apiKey: "", region: "global" }}
    fields={[{ name: "apiKey" }, { name: "region", kind: "select", options: _REGIONS }]}
    schema={formSchema}
    toolPath='sendgrid'
  />
);

export { FormClient };
