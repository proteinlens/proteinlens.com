// Blob storage service with Managed Identity
// Constitution Principle II: Least Privilege Access - DefaultAzureCredential/Managed Identity
// User requirement: 6.2 Generate SAS server-side with Entra identity

import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  BlobSASPermissions,
  generateBlobSASQueryParameters,
  ContainerClient,
} from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';
import { config } from '../utils/config.js';
import { Logger } from '../utils/logger.js';
import { UnsupportedFileTypeError, FileSizeLimitError } from '../utils/errors.js';

class BlobService {
  private containerClient: ContainerClient;
  private blobServiceClient: BlobServiceClient;
  private credential: DefaultAzureCredential;

  constructor() {
    // Use DefaultAzureCredential for Managed Identity (Constitution Principle II)
    this.credential = new DefaultAzureCredential();
    
    this.blobServiceClient = new BlobServiceClient(
      `https://${config.storageAccountName}.blob.core.windows.net`,
      this.credential
    );
    
    this.containerClient = this.blobServiceClient.getContainerClient(config.blobContainerName);
    
    Logger.info('BlobService initialized with Managed Identity', {
      storageAccount: config.storageAccountName,
      container: config.blobContainerName,
    });
  }

  /**
   * Validate file type - JPEG, PNG, HEIC only
   * Constitution Principle VI: Cost Controls
   */
  validateFileType(contentType: string): void {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/heic'];
    if (!allowedTypes.includes(contentType.toLowerCase())) {
      throw new UnsupportedFileTypeError(contentType);
    }
  }

  /**
   * Validate file size - 8MB max by default
   * Constitution Principle VI: Cost Controls
   */
  validateFileSize(fileSizeBytes: number): void {
    const maxBytes = config.maxFileSizeMB * 1024 * 1024;
    if (fileSizeBytes > maxBytes) {
      throw new FileSizeLimitError(config.maxFileSizeMB);
    }
  }

  /**
   * Generate upload SAS URL with write permissions
   * User requirement 6.2: Generate SAS server-side with Entra identity
   * Constitution Principle I: Zero Secrets - SAS generated on-demand, short-lived
   */
  async generateUploadSasUrl(blobName: string): Promise<string> {
    const blobClient = this.containerClient.getBlobClient(blobName);
    
    // Get user delegation key (requires Managed Identity with appropriate permissions)
    const blobServiceClient = this.blobServiceClient;
    const startsOn = new Date();
    const expiresOn = new Date(startsOn.getTime() + config.sasTokenExpiryMinutes * 60 * 1000);
    
    try {
      const userDelegationKey = await blobServiceClient.getUserDelegationKey(startsOn, expiresOn);
      
      // Generate SAS token with write permissions only
      const sasToken = generateBlobSASQueryParameters(
        {
          containerName: config.blobContainerName,
          blobName,
          permissions: BlobSASPermissions.parse('cw'), // create + write only
          startsOn,
          expiresOn,
        },
        userDelegationKey,
        config.storageAccountName
      ).toString();
      
      const sasUrl = `${blobClient.url}?${sasToken}`;
      
      Logger.info('Generated upload SAS URL', {
        blobName,
        expiresIn: `${config.sasTokenExpiryMinutes} minutes`,
      });
      
      return sasUrl;
    } catch (error) {
      Logger.error('Failed to generate upload SAS URL', error as Error, { blobName });
      throw error;
    }
  }

  /**
   * Generate read SAS URL for AI access
   * User requirement 6.2: Generate SAS server-side with Entra identity
   */
  async generateReadSasUrl(blobName: string): Promise<string> {
    const blobClient = this.containerClient.getBlobClient(blobName);
    
    const blobServiceClient = this.blobServiceClient;
    const startsOn = new Date();
    const expiresOn = new Date(startsOn.getTime() + 15 * 60 * 1000); // 15 min for AI processing
    
    try {
      const userDelegationKey = await blobServiceClient.getUserDelegationKey(startsOn, expiresOn);
      
      // Generate SAS token with read permissions only
      const sasToken = generateBlobSASQueryParameters(
        {
          containerName: config.blobContainerName,
          blobName,
          permissions: BlobSASPermissions.parse('r'), // read only
          startsOn,
          expiresOn,
        },
        userDelegationKey,
        config.storageAccountName
      ).toString();
      
      const sasUrl = `${blobClient.url}?${sasToken}`;
      
      Logger.info('Generated read SAS URL', { blobName });
      
      return sasUrl;
    } catch (error) {
      Logger.error('Failed to generate read SAS URL', error as Error, { blobName });
      throw error;
    }
  }

  /**
   * Get blob URL without SAS token (for database storage)
   * Constitution Principle I: No SAS tokens in database
   */
  getBlobUrl(blobName: string): string {
    return this.containerClient.getBlobClient(blobName).url;
  }

  /**
   * Delete blob from storage
   * Constitution Principle VII: Privacy & User Data Rights
   */
  async deleteBlob(blobName: string): Promise<void> {
    try {
      const blobClient = this.containerClient.getBlobClient(blobName);
      await blobClient.deleteIfExists();
      
      Logger.info('Deleted blob', { blobName });
    } catch (error) {
      Logger.error('Failed to delete blob', error as Error, { blobName });
      throw error;
    }
  }

  /**
   * T076: Calculate SHA-256 hash of blob content for caching
   * Used to detect duplicate images and return cached analysis results
   */
  async calculateBlobHash(blobName: string): Promise<string> {
    const crypto = await import('crypto');
    
    try {
      const blobClient = this.containerClient.getBlobClient(blobName);
      const downloadResponse = await blobClient.download();
      
      if (!downloadResponse.readableStreamBody) {
        throw new Error('No readable stream from blob');
      }

      // Read stream into buffer
      const chunks: Buffer[] = [];
      for await (const chunk of downloadResponse.readableStreamBody) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      const buffer = Buffer.concat(chunks);

      // Calculate SHA-256 hash
      const hash = crypto.createHash('sha256').update(buffer).digest('hex');
      
      Logger.info('Calculated blob hash', { blobName, hash: hash.substring(0, 16) + '...' });
      
      return hash;
    } catch (error) {
      Logger.error('Failed to calculate blob hash', error as Error, { blobName });
      throw error;
    }
  }

  /**
   * Get blob metadata (including content hash if set)
   */
  async getBlobMetadata(blobName: string): Promise<Record<string, string>> {
    try {
      const blobClient = this.containerClient.getBlobClient(blobName);
      const properties = await blobClient.getProperties();
      return properties.metadata || {};
    } catch (error) {
      Logger.error('Failed to get blob metadata', error as Error, { blobName });
      return {};
    }
  }

  /**
   * Set blob metadata (e.g., content hash for caching)
   */
  async setBlobMetadata(blobName: string, metadata: Record<string, string>): Promise<void> {
    try {
      const blobClient = this.containerClient.getBlobClient(blobName);
      await blobClient.setMetadata(metadata);
      Logger.info('Set blob metadata', { blobName, keys: Object.keys(metadata) });
    } catch (error) {
      Logger.error('Failed to set blob metadata', error as Error, { blobName });
      throw error;
    }
  }

  /**
   * Generate unique blob name for user upload
   */
  generateBlobName(userId: string, originalFileName: string): string {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(7);
    const extension = originalFileName.split('.').pop() || 'jpg';
    return `meals/${userId}/${timestamp}-${randomSuffix}.${extension}`;
  }
}

export const blobService = new BlobService();
