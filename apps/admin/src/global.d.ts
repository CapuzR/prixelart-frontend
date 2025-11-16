/// <reference types="vite/client" />

declare module "*.scss" {
  const content: { [className: string]: string };
  export default content;
}

import { BasePlugin, Uppy, UppyFile } from "@uppy/core";

interface AwsS3Part {
  PartNumber: number;
  ETag: string;
}

interface CreateMultipartUploadResponse {
  uploadId: string;
  key: string;
}

interface SignPartResponse {
  url: string;
  headers?: Record<string, string>;
}

interface CompleteMultipartUploadResponse {
  location?: string;
}

declare module "@uppy/aws-s3-multipart" {
  export interface AwsS3MultipartOptions {
    limit?: number;
    shouldUseMultipart?: boolean | ((file: UppyFile) => boolean);
    companionUrl?: string | null;
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
    ) => Promise<AwsS3Part[]>;
  }

  export default class AwsS3Multipart extends BasePlugin<
    AwsS3MultipartOptions,
    any,
    any
  > {
    constructor(uppy: Uppy, opts?: AwsS3MultipartOptions);
  }
}
