// Custom error classes for structured error handling
// Constitution compliance: actionable error messages for users

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class BlobNotFoundError extends AppError {
  constructor(blobName: string) {
    super(404, `Blob not found: ${blobName}`);
    Object.setPrototypeOf(this, BlobNotFoundError.prototype);
  }
}

export class SasTokenExpiredError extends AppError {
  constructor() {
    super(410, 'SAS token has expired. Please request a new upload URL.');
    Object.setPrototypeOf(this, SasTokenExpiredError.prototype);
  }
}

export class AIAnalysisError extends AppError {
  constructor(message: string) {
    super(500, `AI analysis failed: ${message}`);
    Object.setPrototypeOf(this, AIAnalysisError.prototype);
  }
}

export class SchemaValidationError extends AppError {
  constructor(details: string) {
    super(500, `Invalid AI response schema: ${details}`);
    Object.setPrototypeOf(this, SchemaValidationError.prototype);
  }
}

export class FileSizeLimitError extends AppError {
  constructor(maxSize: number) {
    super(413, `File size exceeds limit of ${maxSize} MB`);
    Object.setPrototypeOf(this, FileSizeLimitError.prototype);
  }
}

export class UnsupportedFileTypeError extends AppError {
  constructor(fileType: string) {
    super(415, `Unsupported file type: ${fileType}. Only JPEG, PNG, and HEIC are allowed.`);
    Object.setPrototypeOf(this, UnsupportedFileTypeError.prototype);
  }
}
