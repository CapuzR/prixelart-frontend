/// <reference types="vite/client" />
declare module "*.scss" {
  const content: { [className: string]: string };
  export default content;
}

import { BasePlugin, Uppy, UppyFile } from "@uppy/core";
import { AwsBody } from "@uppy/aws-s3";

interface AwsS3Part {
  PartNumber: number;
  ETag: string;
  // size?: number; // Uppy might add this
}

// Define expected response from createMultipartUpload
interface CreateMultipartUploadResponse {
  uploadId: string;
  key: string;
  // presignedUrls?: string[]; // If you plan to send all presigned URLs at once
}

// Define expected response from signPart (if backend signs individual parts)
interface SignPartResponse {
  url: string;
  headers?: Record<string, string>;
}

// Define expected response from completeMultipartUpload
interface CompleteMultipartUploadResponse {
  location?: string; // The final URL of the uploaded file
  // Add other properties your backend might return
}

declare module "@uppy/aws-s3-multipart" {
  export interface AwsS3MultipartOptions {
    limit?: number;
    shouldUseMultipart?: boolean | ((file: UppyFile) => boolean);
    companionUrl?: string | null; // If not using companion, set to null or remove

    createMultipartUpload?: (
      file: UppyFile,
    ) => Promise<CreateMultipartUploadResponse>;
    signPart?: (
      file: UppyFile,
      params: {
        uploadId: string;
        key: string;
        partNumber: number;
        body: Blob;
        signal: AbortSignal;
      },
    ) => Promise<SignPartResponse>;
    completeMultipartUpload?: (
      file: UppyFile,
      params: {
        uploadId: string;
        key: string;
        parts: AwsS3Part[];
        signal: AbortSignal;
      },
    ) => Promise<CompleteMultipartUploadResponse>;
    abortMultipartUpload?: (
      file: UppyFile,
      params: { uploadId: string; key: string; signal: AbortSignal },
    ) => Promise<void>;
    listParts?: (
      file: UppyFile,
      params: { uploadId: string; key: string; signal: AbortSignal },
    ) => Promise<AwsS3Part[]>; // Optional but good for resumability
  }

  export default class AwsS3Multipart extends BasePlugin<
    AwsS3MultipartOptions,
    any, // Uppy internal state, 'any' is okay to start
    any // Uppy file metadata, 'any' is okay to start
    // Response body type for events like 'upload-success' might vary based on what completeMultipartUpload returns
  > {
    constructor(uppy: Uppy, opts?: AwsS3MultipartOptions);
  }
}
