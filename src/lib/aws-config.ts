/**
 * AWS Configuration Module
 * 
 * This module initializes and exports AWS SDK clients for S3 and Rekognition services.
 * These clients are used throughout the application for image storage and AI analysis.
 * 
 * @module aws-config
 * @requires @aws-sdk/client-s3
 * @requires @aws-sdk/client-rekognition
 */

import { S3Client } from "@aws-sdk/client-s3";
import { RekognitionClient } from "@aws-sdk/client-rekognition";

/**
 * AWS S3 Client Configuration
 * 
 * Initializes the S3 client with credentials from environment variables.
 * Used for uploading and storing construction site images.
 * 
 * @constant {S3Client}
 * @throws {Error} If AWS credentials are not set in environment variables
 */
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

/**
 * AWS Rekognition Client Configuration
 * 
 * Initializes the Rekognition client for AI-powered image analysis.
 * Used for PPE detection, object recognition, and safety compliance checks.
 * 
 * @constant {RekognitionClient}
 * @throws {Error} If AWS credentials are not set in environment variables
 */
export const rekognitionClient = new RekognitionClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

/**
 * AWS Configuration Constants
 * 
 * Centralized configuration object for AWS services.
 * These values are used across the application for consistency.
 * 
 * @constant {Object}
 * @property {string} S3_BUCKET - The S3 bucket name for image storage
 * @property {string} REGION - The AWS region for all services
 */
export const AWS_CONFIG = {
  S3_BUCKET: process.env.AWS_S3_BUCKET || "aragorn-construction-images",
  REGION: process.env.AWS_REGION || "us-east-1",
};
