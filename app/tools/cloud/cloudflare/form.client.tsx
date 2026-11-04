"use client";

import { z } from "zod";
import { ValidationForm } from "@/components/custom/Tools/ValidationForm.client";
import { checkCloudflareToken } from "./actions";

const formSchema = z.object({
  apiToken: z.string().trim().min(1, "required")
});

const FormClient = () => (
  <ValidationForm
    action={checkCloudflareToken}
    defaultValues={{ apiToken: "" }}
    fields={[{ name: "apiToken" }]}
    schema={formSchema}
    toolPath='cloudflare'
  />
);

export { FormClient };
