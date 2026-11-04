"use client";

import { z } from "zod";
import { ValidationForm } from "@/components/custom/Tools/ValidationForm.client";
import { checkMistralKey } from "./actions";

const formSchema = z.object({
  apiKey: z.string().trim().min(1, "required")
});

const FormClient = () => (
  <ValidationForm
    action={checkMistralKey}
    defaultValues={{ apiKey: "" }}
    fields={[{ name: "apiKey" }]}
    schema={formSchema}
    toolPath='mistral'
  />
);

export { FormClient };
