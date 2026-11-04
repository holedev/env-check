"use client";

import { z } from "zod";
import { ValidationForm } from "@/components/custom/Tools/ValidationForm.client";
import { checkFirebaseServiceAccount } from "./actions";

const formSchema = z.object({
  serviceAccountJson: z.string().trim().min(1, "required")
});

const FormClient = () => (
  <ValidationForm
    action={checkFirebaseServiceAccount}
    defaultValues={{ serviceAccountJson: "" }}
    fields={[{ name: "serviceAccountJson" }]}
    schema={formSchema}
    toolPath='firebase'
  />
);

export { FormClient };
