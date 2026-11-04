"use client";

import { z } from "zod";
import { ValidationForm } from "@/components/custom/Tools/ValidationForm.client";
import { checkPostgreSqlConnection } from "./actions";

const _POSTGRES_URL = /^postgres(ql)?:\/\//;

const formSchema = z.object({
  connectionString: z.string().trim().min(1, "required").regex(_POSTGRES_URL, "errors.format")
});

const FormClient = () => (
  <ValidationForm
    action={checkPostgreSqlConnection}
    defaultValues={{ connectionString: "" }}
    fields={[{ name: "connectionString" }]}
    schema={formSchema}
    toolPath='postgresql'
  />
);

export { FormClient };
