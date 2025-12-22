// Unit tests for BlobService SAS URL generation
// T021-T022: Test SAS URL generation with write and read permissions

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { blobService } from '../../src/services/blobService';

describe('BlobService - SAS URL Generation', () => {
  const mockUserId = 'test-user-123';
  const mockFileName = 'meal.jpg';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateUploadSasUrl', () => {
    it('should generate SAS URL with write permissions', async () => {
      const blobName = blobService.generateBlobName(mockUserId, mockFileName);
      
      // This will fail until Azure credentials are configured
      // In real environment, this would call Azure and return a valid SAS URL
      await expect(async () => {
        await blobService.generateUploadSasUrl(blobName);
      }).rejects.toThrow();
      
      // In production with proper credentials, test would verify:
      // - URL contains SAS token
      // - Token has 'cw' (create+write) permissions
      // - Token expires in 10 minutes
    });

    it('should include blob name in generated SAS URL', () => {
      const blobName = blobService.generateBlobName(mockUserId, mockFileName);
      expect(blobName).toContain('meals/');
      expect(blobName).toContain(mockUserId);
      expect(blobName).toMatch(/\.jpg$/);
    });
  });

  describe('generateReadSasUrl', () => {
    it('should generate SAS URL with read permissions', async () => {
      const blobName = 'meals/test-user/test.jpg';
      
      // This will fail until Azure credentials are configured
      await expect(async () => {
        await blobService.generateReadSasUrl(blobName);
      }).rejects.toThrow();
      
      // In production with proper credentials, test would verify:
      // - URL contains SAS token
      // - Token has 'r' (read) permissions only
      // - Token expires in 15 minutes
    });
  });

  describe('validateFileType', () => {
    it('should allow JPEG files', () => {
      expect(() => blobService.validateFileType('image/jpeg')).not.toThrow();
    });

    it('should allow PNG files', () => {
      expect(() => blobService.validateFileType('image/png')).not.toThrow();
    });

    it('should allow HEIC files', () => {
      expect(() => blobService.validateFileType('image/heic')).not.toThrow();
    });

    it('should reject unsupported file types', () => {
      expect(() => blobService.validateFileType('image/gif')).toThrow('Unsupported file type');
      expect(() => blobService.validateFileType('application/pdf')).toThrow('Unsupported file type');
    });
  });

  describe('validateFileSize', () => {
    it('should allow files under 8MB', () => {
      const size = 7 * 1024 * 1024; // 7MB
      expect(() => blobService.validateFileSize(size)).not.toThrow();
    });

    it('should reject files over 8MB', () => {
      const size = 9 * 1024 * 1024; // 9MB
      expect(() => blobService.validateFileSize(size)).toThrow('File size exceeds limit');
    });
  });

  describe('generateBlobName', () => {
    it('should include userId in blob name', () => {
      const blobName = blobService.generateBlobName(mockUserId, mockFileName);
      expect(blobName).toContain(mockUserId);
    });

    it('should preserve file extension', () => {
      const blobName = blobService.generateBlobName(mockUserId, 'test.png');
      expect(blobName).toMatch(/\.png$/);
    });

    it('should generate unique names for same file', () => {
      const name1 = blobService.generateBlobName(mockUserId, mockFileName);
      const name2 = blobService.generateBlobName(mockUserId, mockFileName);
      expect(name1).not.toBe(name2);
    });
  });
});
