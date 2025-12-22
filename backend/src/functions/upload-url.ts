// Azure Function: POST /api/upload-url
// Returns SAS URL for client-side blob upload
// Constitution Principle I: Zero Secrets (SAS via Managed Identity)
// T030: Generate upload URL with file validation

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../utils/logger.js';
import { blobService } from '../services/blobService.js';
import { UploadUrlRequestSchema } from '../models/schemas.js';
import { ValidationError } from '../utils/errors.js';

export async function uploadUrl(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const requestId = uuidv4();
  Logger.info('Upload URL requested', { requestId, url: request.url });

  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = UploadUrlRequestSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new ValidationError(errors);
    }

    const { fileName, fileSize, contentType } = validation.data;

    // Validate file type and size (Constitution Principle VI: Cost Controls)
    blobService.validateFileType(contentType);
    blobService.validateFileSize(fileSize);

    // Generate unique blob name with user ID (from auth header in production)
    const userId = request.headers.get('x-user-id') || 'anonymous'; // Placeholder for auth
    const blobName = blobService.generateBlobName(userId, fileName);

    // Generate SAS URL via Managed Identity (Constitution Principle II: Least Privilege)
    const sasUrl = await blobService.generateUploadSasUrl(blobName);

    Logger.info('Upload URL generated successfully', {
      requestId,
      blobName,
      fileName,
      fileSize,
      contentType,
    });

    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
      },
      jsonBody: {
        uploadUrl: sasUrl,
        blobName,
        expiresIn: 600, // 10 minutes
      },
    };

  } catch (error) {
    Logger.error('Upload URL generation failed', error as Error, { requestId });

    const statusCode = (error as any).statusCode || 500;
    const message = (error as Error).message || 'Internal server error';

    return {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
      },
      jsonBody: {
        error: message,
        requestId,
      },
    };
  }
}

app.http('upload-url', {
  methods: ['POST'],
  authLevel: 'anonymous', // Change to 'function' or use auth middleware in production
  handler: uploadUrl,
});
