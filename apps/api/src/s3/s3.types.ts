import type { Readable } from 'stream';
import type { StorageClass } from '@aws-sdk/client-s3';

export interface S3UploadOptions {
  contentType?: string;
  contentDisposition?: string;
  metadata?: Record<string, string>;
  cacheControl?: string;
}

export interface S3FileStream {
  stream: Readable;
  contentType?: string | undefined;
  contentLength?: number | undefined;
  contentRange?: string | undefined;
  etag?: string | undefined;
  statusCode: number;
}

export interface S3ObjectMetadata {
  contentLength?: number | undefined;
  contentType?: string | undefined;
  etag?: string | undefined;
  lastModified?: Date | undefined;
  storageClass?: StorageClass | undefined;
}

export interface S3DeleteResult {
  key: string;
  success: boolean;
  error?: string;
}
