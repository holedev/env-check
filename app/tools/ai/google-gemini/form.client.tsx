"use client";

import { z } from "zod";
import { ValidationForm } from "@/components/custom/Tools/ValidationForm.client";
import { checkGeminiKey } from "./actions";

const _GEMINI_KEY = /^AIza[\w-]{35}$/;

const formSchema = z.object({
  apiKey: z.string().trim().min(1, "required").regex(_GEMINI_KEY, "errors.format")
});

const FormClient = () => (
  <ValidationForm
    action={checkGeminiKey}
    defaultValues={{ apiKey: "" }}
    fields={[{ name: "apiKey" }]}
    schema={formSchema}
    toolPath='google-gemini'
  />
);

export { FormClient };
