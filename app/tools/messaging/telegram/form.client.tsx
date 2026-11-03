"use client";

import { z } from "zod";
import { ValidationForm } from "@/components/custom/Tools/ValidationForm.client";
import { checkTelegramToken } from "./actions";

const _TELEGRAM_TOKEN = /^\d+:[\w-]{30,}$/;

const formSchema = z.object({
  token: z.string().trim().min(1, "required").regex(_TELEGRAM_TOKEN, "errors.format")
});

const FormClient = () => (
  <ValidationForm
    action={checkTelegramToken}
    defaultValues={{ token: "" }}
    fields={[{ name: "token" }]}
    schema={formSchema}
    toolPath='telegram'
  />
);

export { FormClient };
