# S3 Module Usage Examples

## Setup

1. **Import S3Module in your app.module.ts** (it's `@Global()` so once imported, it's available everywhere):

```typescript
import { S3Module } from './s3/s3.module';

@Module({
  imports: [
    // ... other modules
    S3Module,
  ],
})
export class AppModule {}
```

2. **Inject S3Service into any controller or service**:

```typescript
import { S3Service } from './s3/s3.service';

@Injectable()
export class MyService {
  constructor(private s3Service: S3Service) {}
}
```

## Common Use Cases

### Upload a File

```typescript
import { Readable } from 'stream';

async uploadFile(fileName: string, fileBuffer: Buffer) {
  await this.s3Service.uploadFile(
    `uploads/${fileName}`,
    fileBuffer,
    {
      contentType: 'application/octet-stream',
      metadata: { 'original-name': fileName },
      cacheControl: 'max-age=31536000', // Cache for 1 year
    }
  );
}

// Or with a stream
async uploadStream(fileName: string, readableStream: Readable) {
  await this.s3Service.uploadFile(
    `uploads/${fileName}`,
    readableStream
  );
}
```

### Download File as Stream (with Range Support for Audio/Video Seeking)

```typescript
import { Controller, Get, Param, Req, StreamableFile } from '@nestjs/common';

@Controller('files')
export class FilesController {
  constructor(private s3Service: S3Service) {}

  @Get('stream/:key')
  async streamFile(@Param('key') key: string, @Req() req: any): Promise<StreamableFile> {
    const rangeHeader = req.headers.range; // "bytes=0-1023"

    const { stream, contentType, contentLength, statusCode } = await this.s3Service.getFileStream(
      key,
      rangeHeader,
    );

    return new StreamableFile(stream, {
      type: contentType,
      length: contentLength,
    });
  }
}
```

### Download Entire File to Memory (for small files only)

```typescript
async downloadSmallFile(key: string): Promise<Buffer> {
  // ⚠️ Only use for files < 5MB!
  return this.s3Service.getFileBuffer(key);
}
```

### Check File Metadata Without Downloading

```typescript
async checkFileExists(key: string): Promise<boolean> {
  const metadata = await this.s3Service.getObjectMetadata(key);
  return metadata !== null;
}

async getFileSize(key: string): Promise<number | undefined> {
  const metadata = await this.s3Service.getObjectMetadata(key);
  return metadata?.contentLength;
}
```

### Delete a Single File

```typescript
async deleteFile(key: string) {
  await this.s3Service.deleteFile(key);
}
```

### Bulk Delete Multiple Files

```typescript
async deleteMany(keys: string[]) {
  const results = await this.s3Service.deleteFiles(keys);

  results.forEach(result => {
    if (result.success) {
      console.log(`✓ Deleted: ${result.key}`);
    } else {
      console.log(`✗ Failed: ${result.key} - ${result.error}`);
    }
  });
}
```

### Generate Presigned URL for Temporary Access

```typescript
async getDownloadLink(key: string): Promise<string> {
  // Valid for 1 hour (3600 seconds)
  const url = await this.s3Service.generatePresignedUrl(key, 3600);
  return url;
}

async getShortLivedLink(key: string): Promise<string> {
  // Valid for 5 minutes
  return this.s3Service.generatePresignedUrl(key, 300);
}
```

## Environment Variables

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
S3_BUCKET_NAME=my-bucket-name
```

## Error Handling

All methods throw NestJS HTTP exceptions:

```typescript
import {
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

try {
  await this.s3Service.getFileStream(key, 'bytes=0-1023');
} catch (error) {
  if (error instanceof NotFoundException) {
    // File doesn't exist
  } else if (error instanceof BadRequestException) {
    // Invalid range header
  } else if (error instanceof InternalServerErrorException) {
    // S3 or other server error
  }
}
```

## Best Practices

1. **Use streaming for large files** — always prefer `getFileStream()` over `getFileBuffer()` for files > 5MB
2. **Cache metadata** — call `getObjectMetadata()` once and reuse the result instead of calling it multiple times
3. **Set appropriate Content-Type** — specify the right MIME type during upload for proper browser handling
4. **Use presigned URLs for public access** — never expose AWS credentials; use `generatePresignedUrl()` instead
5. **Handle errors gracefully** — always catch and log S3 service errors in your controllers
