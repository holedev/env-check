"use client";

import { z } from "zod";
import { ValidationForm } from "@/components/custom/Tools/ValidationForm.client";
import { checkStripeKey } from "./actions";

const _STRIPE_KEY = /^(sk|rk)_(live|test)_\w+$/;

const formSchema = z.object({
  apiKey: z
    .string()
    .trim()
    .min(1, "required")
    .refine((value) => !value.startsWith("pk_"), "errors.publishable")
    .refine((value) => value.startsWith("pk_") || _STRIPE_KEY.test(value), "errors.format")
});

const FormClient = () => (
  <ValidationForm
    action={checkStripeKey}
    defaultValues={{ apiKey: "" }}
    fields={[{ name: "apiKey" }]}
    schema={formSchema}
    toolPath='stripe'
  />
);

export { FormClient };
