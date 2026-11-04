"use client";

import { z } from "zod";
import { ValidationForm } from "@/components/custom/Tools/ValidationForm.client";
import { checkMongoDbConnection } from "./actions";

const _MONGO_URL = /^mongodb(\+srv)?:\/\//;

const formSchema = z.object({
  connectionString: z.string().trim().min(1, "required").regex(_MONGO_URL, "errors.format")
});

const FormClient = () => (
  <ValidationForm
    action={checkMongoDbConnection}
    defaultValues={{ connectionString: "" }}
    fields={[{ name: "connectionString" }]}
    schema={formSchema}
    toolPath='mongodb'
  />
);

export { FormClient };
