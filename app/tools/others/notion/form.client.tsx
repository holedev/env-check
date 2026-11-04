"use client";

import { z } from "zod";
import { ValidationForm } from "@/components/custom/Tools/ValidationForm.client";
import { checkNotionToken } from "./actions";

const _NOTION_TOKEN = /^(ntn_|secret_)/;

const formSchema = z.object({
  token: z.string().trim().min(1, "required").regex(_NOTION_TOKEN, "errors.format")
});

const FormClient = () => (
  <ValidationForm
    action={checkNotionToken}
    defaultValues={{ token: "" }}
    fields={[{ name: "token" }]}
    schema={formSchema}
    toolPath='notion'
  />
);

export { FormClient };
