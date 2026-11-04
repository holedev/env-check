"use client";

import { z } from "zod";
import { ValidationForm } from "@/components/custom/Tools/ValidationForm.client";
import { checkSupabaseCredentials } from "./actions";

const _HTTP_URL = /^https?:\/\/\S+$/;

const formSchema = z.object({
  projectUrl: z.string().trim().min(1, "required").regex(_HTTP_URL, "errors.format"),
  serviceRoleKey: z.string().trim().min(1, "required")
});

const FormClient = () => (
  <ValidationForm
    action={checkSupabaseCredentials}
    defaultValues={{ projectUrl: "", serviceRoleKey: "" }}
    fields={[{ name: "projectUrl", kind: "text" }, { name: "serviceRoleKey" }]}
    schema={formSchema}
    toolPath='supabase'
  />
);

export { FormClient };
