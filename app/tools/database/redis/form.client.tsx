"use client";

import { z } from "zod";
import { ValidationForm } from "@/components/custom/Tools/ValidationForm.client";
import { checkRedisConnection } from "./actions";

const _REDIS_URL = /^rediss?:\/\//;

const formSchema = z.object({
  connectionString: z.string().trim().min(1, "required").regex(_REDIS_URL, "errors.format")
});

const FormClient = () => (
  <ValidationForm
    action={checkRedisConnection}
    defaultValues={{ connectionString: "" }}
    fields={[{ name: "connectionString" }]}
    schema={formSchema}
    toolPath='redis'
  />
);

export { FormClient };
