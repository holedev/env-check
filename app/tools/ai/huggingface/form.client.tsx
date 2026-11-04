"use client";

import { z } from "zod";
import { ValidationForm } from "@/components/custom/Tools/ValidationForm.client";
import { checkHuggingFaceToken } from "./actions";

const formSchema = z.object({
  token: z.string().trim().min(1, "required").startsWith("hf_", "errors.format")
});

const FormClient = () => (
  <ValidationForm
    action={checkHuggingFaceToken}
    defaultValues={{ token: "" }}
    fields={[{ name: "token" }]}
    schema={formSchema}
    toolPath='huggingface'
  />
);

export { FormClient };
