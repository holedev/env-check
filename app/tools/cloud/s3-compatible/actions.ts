"use server";

import { handleErrorServerNoAuth } from "@/utils/handleErrorServer";
import { ListBucketsCommand, S3Client, type S3ClientConfig } from "@aws-sdk/client-s3";

interface S3Config {
  endpoint?: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}

const checkS3Connection = async (config: S3Config) =>
  handleErrorServerNoAuth({
    cb: async () => {
      // Configure S3 client
      const clientConfig: S3ClientConfig = {
        region: config.region,
        credentials: {
          accessKeyId: config.accessKeyId,
          secretAccessKey: config.secretAccessKey
        }
      };

      // Add endpoint if provided (for non-AWS S3-compatible services)
      if (config.endpoint && config.endpoint.trim() !== "") {
        clientConfig.endpoint = config.endpoint;
        clientConfig.forcePathStyle = true; // Required for most S3-compatible services
      }

      const s3Client = new S3Client(clientConfig);

      try {
        // Test: List buckets (basic connectivity test)
        const listBucketsCommand = new ListBucketsCommand({});
        const bucketsResponse = await s3Client.send(listBucketsCommand);

        const result = {
          success: true,
          connectionDetails: {
            endpoint: config.endpoint || "AWS S3",
            region: config.region,
            accessKeyId: config.accessKeyId
          },
          buckets:
            bucketsResponse.Buckets?.map((bucket) => ({
              name: bucket.Name || "Unknown",
              creationDate: bucket.CreationDate?.toISOString() || null
            })) || [],
          bucketsCount: bucketsResponse.Buckets?.length || 0
        };

        return result;
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : "Failed to connect to S3-compatible service");
      }
    }
  });

export { checkS3Connection };
