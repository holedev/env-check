"use client";

import { z } from "zod";
import { ValidationForm } from "@/components/custom/Tools/ValidationForm.client";
import { checkS3Connection } from "./actions";

const formSchema = z.object({
  endpoint: z.string().trim(),
  region: z.string().trim().min(1, "required"),
  accessKeyId: z.string().trim().min(1, "required"),
  secretAccessKey: z.string().trim().min(1, "required")
});

const FormClient = () => (
  <ValidationForm
    action={checkS3Connection}
    defaultValues={{ endpoint: "", region: "us-east-1", accessKeyId: "", secretAccessKey: "" }}
    fields={[
      { name: "endpoint", kind: "text" },
      { name: "region", kind: "text" },
      { name: "accessKeyId", kind: "text" },
      { name: "secretAccessKey" }
    ]}
    schema={formSchema}
    toolPath='s3-compatible'
  />
);

export { FormClient };
