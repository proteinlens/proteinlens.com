// Contract Test: POST /api/upload-url
// Verifies API contract returns valid SAS URL structure
// T024: Contract test for upload-url endpoint

import { describe, it, expect } from '@jest/globals';

describe('POST /api/upload-url - Contract Test', () => {
  const FUNCTION_URL = process.env.FUNCTION_URL || 'http://localhost:7071/api/upload-url';

  it('should return 200 with valid SAS URL structure for JPEG', async () => {
    const requestBody = {
      fileName: 'test-meal.jpg',
      fileSize: 1024000, // 1MB
      contentType: 'image/jpeg',
    };

    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    expect(response.status).toBe(200);
    
    const data = await response.json();
    
    // Verify response structure
    expect(data).toHaveProperty('uploadUrl');
    expect(data).toHaveProperty('blobName');
    expect(data).toHaveProperty('expiresIn');
    
    // Verify uploadUrl is a valid SAS URL
    expect(data.uploadUrl).toMatch(/^https:\/\/.*blob\.core\.windows\.net\/.*\?.*sig=/);
    
    // Verify blobName follows pattern: meals/{userId}/{timestamp}-{random}.{ext}
    expect(data.blobName).toMatch(/^meals\/[^\/]+\/\d+-[a-z0-9]+\.jpg$/);
    
    // Verify expiration
    expect(data.expiresIn).toBe(600);
    
    // Verify request ID header
    expect(response.headers.get('X-Request-ID')).toBeTruthy();
  });

  it('should return 200 for PNG files', async () => {
    const requestBody = {
      fileName: 'dinner.png',
      fileSize: 2048000, // 2MB
      contentType: 'image/png',
    };

    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.blobName).toMatch(/\.png$/);
  });

  it('should return 415 for unsupported file types', async () => {
    const requestBody = {
      fileName: 'document.pdf',
      fileSize: 500000,
      contentType: 'application/pdf',
    };

    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    expect(response.status).toBe(415);
    
    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toMatch(/unsupported file type/i);
  });

  it('should return 413 for files exceeding size limit', async () => {
    const requestBody = {
      fileName: 'large-image.jpg',
      fileSize: 10 * 1024 * 1024, // 10MB
      contentType: 'image/jpeg',
    };

    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    expect(response.status).toBe(413);
    
    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toMatch(/file size exceeds maximum/i);
  });

  it('should return 400 for missing required fields', async () => {
    const requestBody = {
      fileName: 'test.jpg',
      // Missing fileSize and contentType
    };

    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  it('should return 400 for invalid content type value', async () => {
    const requestBody = {
      fileName: 'test.jpg',
      fileSize: 1024000,
      contentType: 'image/invalid',
    };

    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    expect(response.status).toBe(400);
  });
});
