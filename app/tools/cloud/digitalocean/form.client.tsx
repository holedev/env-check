"use client";

import { z } from "zod";
import { ValidationForm } from "@/components/custom/Tools/ValidationForm.client";
import { checkDigitalOceanToken } from "./actions";

const formSchema = z.object({
  token: z.string().trim().min(1, "required")
});

const FormClient = () => (
  <ValidationForm
    action={checkDigitalOceanToken}
    defaultValues={{ token: "" }}
    fields={[{ name: "token" }]}
    schema={formSchema}
    toolPath='digitalocean'
  />
);

export { FormClient };
