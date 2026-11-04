"use server";

import { ListBucketsCommand, S3Client, type S3ClientConfig } from "@aws-sdk/client-s3";
import { enumFact, redact, restricted, summarize, valid } from "@/lib/validation";
import type { SummaryItem } from "@/types/validation";
import { handleErrorServerNoAuth } from "@/utils/handle-error-server";
import { assertPublicHost } from "@/utils/network-guard";

type S3Config = {
  accessKeyId: string;
  endpoint: string;
  region: string;
  secretAccessKey: string;
};

const nameOf = (error: unknown) =>
  typeof error === "object" && error !== null && "name" in error ? String(error.name) : "";

/**
 * Probe: ListBuckets. A custom endpoint is user-supplied, so it must be http(s)
 * and pass the network guard. AccessDenied (a key scoped to one bucket, common
 * on R2) is Restricted.
 */
const checkS3Connection = async ({ accessKeyId, endpoint, region, secretAccessKey }: S3Config) =>
  handleErrorServerNoAuth({
    cb: async () => {
      const clientConfig: S3ClientConfig = { region, credentials: { accessKeyId, secretAccessKey } };
      let endpointFact: SummaryItem = enumFact("endpoint", "endpoints", "aws");

      if (endpoint.trim() !== "") {
        const url = new URL(endpoint.trim());
        if (!(url.protocol === "https:" || url.protocol === "http:")) {
          throw new Error("Endpoint must be an http(s) URL");
        }
        await assertPublicHost(url.hostname);
        clientConfig.endpoint = url.origin;
        clientConfig.forcePathStyle = true;
        endpointFact = { key: "endpoint", value: url.host };
      }

      const facts = [endpointFact, ...summarize({ region })];
      try {
        const response = await new S3Client(clientConfig).send(new ListBucketsCommand({}));
        const buckets = (response.Buckets ?? []).map((bucket) => bucket.Name ?? "").filter(Boolean);
        return valid([...facts, ...summarize({ bucketsCount: buckets.length, buckets })]);
      } catch (error) {
        const message = redact(error instanceof Error ? error.message : "Failed to reach the S3 endpoint", [
          secretAccessKey
        ]);
        if (nameOf(error) === "AccessDenied") {
          return restricted(message, facts);
        }
        throw new Error(message);
      }
    }
  });

export { checkS3Connection };
