import { S3Client } from "@aws-sdk/client-s3";
import { RekognitionClient } from "@aws-sdk/client-rekognition";

// AWS Configuration
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const rekognitionClient = new RekognitionClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const AWS_CONFIG = {
  S3_BUCKET: process.env.AWS_S3_BUCKET || "aragorn-construction-images",
  REGION: process.env.AWS_REGION || "us-east-1",
};
