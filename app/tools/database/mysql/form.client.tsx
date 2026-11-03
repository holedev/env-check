"use client";

import { z } from "zod";
import { ValidationForm } from "@/components/custom/Tools/ValidationForm.client";
import { checkMySqlConnection } from "./actions";

const formSchema = z.object({
  connectionString: z.string().trim().min(1, "required").startsWith("mysql://", "errors.format")
});

const FormClient = () => (
  <ValidationForm
    action={checkMySqlConnection}
    defaultValues={{ connectionString: "" }}
    fields={[{ name: "connectionString" }]}
    schema={formSchema}
    toolPath='mysql'
  />
);

export { FormClient };
