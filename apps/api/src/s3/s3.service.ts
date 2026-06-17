import { Readable } from 'stream';
import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  type S3ClientConfig,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3UploadOptions, S3FileStream, S3ObjectMetadata, S3DeleteResult } from './s3.types';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private configService: ConfigService) {
    const region = this.configService.get<string>('s3.region') ?? 'us-east-1';
    const accessKeyId = this.configService.get<string>('s3.accessKeyId');
    const secretAccessKey = this.configService.get<string>('s3.secretAccessKey');
    const bucketName = this.configService.get<string>('s3.bucketName');

    if (!bucketName) {
      throw new Error('S3_BUCKET_NAME environment variable is required');
    }

    this.bucketName = bucketName;

    const clientConfig: S3ClientConfig = {
      region,
      credentials: {
        accessKeyId: accessKeyId ?? '',
        secretAccessKey: secretAccessKey ?? '',
      },
    };

    this.s3Client = new S3Client(clientConfig);
  }

  /**
   * Uploads a file to S3 using streaming (no buffering to disk).
   * @param key - The S3 object key (path)
   * @param body - File content as Buffer, Readable stream, or Uint8Array
   * @param options - Optional upload settings (contentType, metadata, caching, etc.)
   * @throws InternalServerErrorException if upload fails
   */
  async uploadFile(
    key: string,
    body: Buffer | Readable | Uint8Array,
    options: S3UploadOptions = {},
  ): Promise<void> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: body,
        ContentType: options.contentType,
        ContentDisposition: options.contentDisposition,
        Metadata: options.metadata,
        CacheControl: options.cacheControl,
      });

      await this.s3Client.send(command);
      this.logger.log(`File uploaded successfully: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to upload file ${key}:`, error);
      throw new InternalServerErrorException('Failed to upload file to S3');
    }
  }

  /**
   * Retrieves a file from S3 as a stream with optional Range header support.
   * Enables audio/video seeking (e.g., dragging progress bar in a player).
   * @param key - The S3 object key (path)
   * @param range - Optional HTTP Range header (e.g., "bytes=0-1023")
   * @returns Stream, content type, length, and metadata
   * @throws NotFoundException if file doesn't exist
   * @throws BadRequestException if Range header is invalid
   * @throws InternalServerErrorException if retrieval fails
   */
  async getFileStream(key: string, range?: string): Promise<S3FileStream> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ...(range && { Range: range }),
      });

      const response = await this.s3Client.send(command);

      return {
        stream: response.Body as Readable,
        contentType: response.ContentType ?? undefined,
        contentLength: response.ContentLength,
        contentRange: response.ContentRange,
        etag: response.ETag,
        statusCode: response.$metadata.httpStatusCode ?? 200,
      };
    } catch (error) {
      const err = error as { name?: string; Code?: string; message?: string };
      if (err.Code === 'InvalidRange' || err.name === 'InvalidRange') {
        throw new BadRequestException('Invalid range request');
      }
      if (err.Code === 'NoSuchKey' || err.name === 'NoSuchKey') {
        throw new NotFoundException(`File not found: ${key}`);
      }
      this.logger.error(`Failed to get file stream ${key}:`, error);
      throw new InternalServerErrorException('Failed to retrieve file from S3');
    }
  }

  /**
   * Downloads the entire file into memory as a Buffer.
   * ⚠️ WARNING: Only use for small files (< 5MB). For larger files, use getFileStream()
   * to avoid memory pressure and OOM errors. Buffering large files can crash your server.
   * @param key - The S3 object key (path)
   * @returns File contents as Buffer
   * @throws NotFoundException if file doesn't exist
   * @throws InternalServerErrorException if retrieval fails
   */
  async getFileBuffer(key: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);
      if (!response.Body) {
        throw new InternalServerErrorException('Empty response body from S3');
      }
      return Buffer.from(await response.Body.transformToByteArray());
    } catch (error) {
      const err = error as { Code?: string; name?: string; message?: string };
      if (err.Code === 'NoSuchKey' || err.name === 'NoSuchKey') {
        throw new NotFoundException(`File not found: ${key}`);
      }
      this.logger.error(`Failed to get file buffer ${key}:`, error);
      throw new InternalServerErrorException('Failed to retrieve file from S3');
    }
  }

  /**
   * Retrieves metadata about an S3 object without downloading its contents.
   * @param key - The S3 object key (path)
   * @returns Object metadata (size, type, ETag, etc.) or null if not found
   * @throws InternalServerErrorException if request fails
   */
  async getObjectMetadata(key: string): Promise<S3ObjectMetadata | null> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);

      return {
        contentLength: response.ContentLength,
        contentType: response.ContentType,
        etag: response.ETag,
        lastModified: response.LastModified,
        storageClass: response.StorageClass,
      };
    } catch (error) {
      const err = error as { Code?: string; name?: string; message?: string };
      if (err.Code === 'NotFound' || err.name === 'NotFound') {
        return null;
      }
      this.logger.error(`Failed to get metadata for ${key}:`, error);
      throw new InternalServerErrorException('Failed to retrieve file metadata from S3');
    }
  }

  /**
   * Deletes a single file from S3.
   * @param key - The S3 object key (path) to delete
   * @throws InternalServerErrorException if deletion fails
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file ${key}:`, error);
      throw new InternalServerErrorException('Failed to delete file from S3');
    }
  }

  /**
   * Deletes multiple files from S3 in a single batch operation.
   * Logs individual failures but doesn't throw—returns results for each key.
   * @param keys - Array of S3 object keys to delete
   * @returns Array of delete results with success/failure status per key
   * @throws InternalServerErrorException if the entire batch operation fails
   */
  async deleteFiles(keys: string[]): Promise<S3DeleteResult[]> {
    if (keys.length === 0) {
      return [];
    }

    try {
      const command = new DeleteObjectsCommand({
        Bucket: this.bucketName,
        Delete: {
          Objects: keys.map((key: string) => ({ Key: key })),
        },
      });

      const response = await this.s3Client.send(command);
      const results: S3DeleteResult[] = [];

      if (response.Deleted) {
        response.Deleted.forEach((item) => {
          if (item.Key) {
            results.push({ key: item.Key, success: true });
            this.logger.log(`File deleted: ${item.Key}`);
          }
        });
      }

      if (response.Errors) {
        response.Errors.forEach((error) => {
          if (error.Key) {
            const result: S3DeleteResult = {
              key: error.Key,
              success: false,
            };
            if (error.Message) {
              result.error = error.Message;
            }
            results.push(result);
            this.logger.warn(`Failed to delete ${error.Key}: ${error.Message}`);
          }
        });
      }

      return results;
    } catch (error) {
      this.logger.error(`Bulk delete operation failed:`, error);
      throw new InternalServerErrorException('Failed to delete files from S3');
    }
  }

  /**
   * Generates a presigned URL that grants temporary public access to a file.
   * Useful for sharing download links without exposing credentials.
   * @param key - The S3 object key (path)
   * @param expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
   * @returns Presigned URL valid for the specified duration
   * @throws InternalServerErrorException if generation fails
   */
  async generatePresignedUrl(key: string, expiresIn = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn });
      return url;
    } catch (error) {
      this.logger.error(`Failed to generate presigned URL for ${key}:`, error);
      throw new InternalServerErrorException('Failed to generate presigned URL');
    }
  }
}
