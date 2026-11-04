"use client";

import { z } from "zod";
import { ValidationForm } from "@/components/custom/Tools/ValidationForm.client";
import { checkSlackToken } from "./actions";

const _SLACK_TOKEN = /^(xoxb|xoxp|xoxe|xapp)-/;

const formSchema = z.object({
  token: z.string().trim().min(1, "required").regex(_SLACK_TOKEN, "errors.format")
});

const FormClient = () => (
  <ValidationForm
    action={checkSlackToken}
    defaultValues={{ token: "" }}
    fields={[{ name: "token" }]}
    schema={formSchema}
    toolPath='slack'
  />
);

export { FormClient };
