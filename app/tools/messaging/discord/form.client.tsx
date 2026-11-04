"use client";

import { z } from "zod";
import { ValidationForm } from "@/components/custom/Tools/ValidationForm.client";
import { checkDiscordConnection } from "./actions";

const formSchema = z.object({
  token: z.string().trim().min(1, "required")
});

const FormClient = () => (
  <ValidationForm
    action={checkDiscordConnection}
    defaultValues={{ token: "" }}
    fields={[{ name: "token" }]}
    schema={formSchema}
    toolPath='discord'
  />
);

export { FormClient };
