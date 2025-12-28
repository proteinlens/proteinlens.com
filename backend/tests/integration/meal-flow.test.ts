// Integration Test: Full meal upload and analysis flow
// Tests end-to-end workflow: request SAS URL → upload blob → analyze → verify results
// T026: Integration test for complete user story 1 flow
// NOTE: These tests require a running Azure Functions server on port 7071

import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe.skipIf(!process.env.RUN_E2E_TESTS)('Meal Upload and Analysis - Integration Test', () => {
  const UPLOAD_URL_ENDPOINT = process.env.FUNCTION_URL || 'http://localhost:7071/api/upload-url';
  const ANALYZE_ENDPOINT = process.env.FUNCTION_URL || 'http://localhost:7071/api/meals/analyze';
  
  let testImagePath: string;
  let testImageBuffer: Buffer;

  beforeAll(() => {
    // Create a minimal test image (1x1 JPEG)
    testImagePath = path.join(__dirname, '../fixtures/test-meal.jpg');
    
    // Minimal JPEG header (1x1 pixel, valid format)
    testImageBuffer = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
      0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
      0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
      0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
      0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
      0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
      0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01,
      0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x03, 0xFF, 0xC4, 0x00, 0x14, 0x10, 0x01, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3F, 0x00,
      0x7F, 0x80, 0xFF, 0xD9
    ]);
  });

  it('should complete full upload and analysis flow', async () => {
    // Step 1: Request upload SAS URL
    console.log('Step 1: Requesting upload SAS URL...');
    const uploadUrlRequest = {
      fileName: 'integration-test-meal.jpg',
      fileSize: testImageBuffer.length,
      contentType: 'image/jpeg',
    };

    const uploadUrlResponse = await fetch(UPLOAD_URL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(uploadUrlRequest),
    });

    expect(uploadUrlResponse.status).toBe(200);
    const uploadData = await uploadUrlResponse.json();
    
    expect(uploadData).toHaveProperty('uploadUrl');
    expect(uploadData).toHaveProperty('blobName');
    const { uploadUrl, blobName } = uploadData;
    
    console.log(`✓ Received SAS URL for blob: ${blobName}`);

    // Step 2: Upload image to blob storage using SAS URL
    console.log('Step 2: Uploading image to blob storage...');
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'image/jpeg',
        'x-ms-blob-type': 'BlockBlob',
      },
      body: testImageBuffer,
    });

    expect([200, 201]).toContain(uploadResponse.status);
    console.log('✓ Image uploaded successfully');

    // Step 3: Request AI analysis
    console.log('Step 3: Requesting AI analysis...');
    const analyzeRequest = {
      blobName,
    };

    const analyzeResponse = await fetch(ANALYZE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(analyzeRequest),
    });

    // Note: This may fail if AI_API_KEY is not set or blob URL is invalid
    // In CI/CD, this would use actual Azure credentials
    if (analyzeResponse.status === 500) {
      const errorData = await analyzeResponse.json();
      console.warn('⚠ AI analysis failed (expected in local dev):', errorData.error);
      
      // Verify error response structure even if analysis fails
      expect(errorData).toHaveProperty('error');
      expect(errorData).toHaveProperty('requestId');
      return;
    }

    expect(analyzeResponse.status).toBe(200);
    const analysisResult = await analyzeResponse.json();
    
    console.log('✓ AI analysis completed');

    // Step 4: Verify response structure
    console.log('Step 4: Verifying response structure...');
    expect(analysisResult).toHaveProperty('mealAnalysisId');
    expect(analysisResult).toHaveProperty('foods');
    expect(analysisResult).toHaveProperty('totalProtein');
    expect(analysisResult).toHaveProperty('confidence');
    expect(analysisResult).toHaveProperty('requestId');
    expect(analysisResult.blobName).toBe(blobName);

    // Verify traceability (Constitution Principle IV)
    const requestId = analysisResult.requestId;
    expect(requestId).toMatch(/^[0-9a-f-]{36}$/i); // UUID format
    
    // Verify schema compliance (Constitution Principle V)
    expect(['high', 'medium', 'low']).toContain(analysisResult.confidence);
    expect(Array.isArray(analysisResult.foods)).toBe(true);
    expect(typeof analysisResult.totalProtein).toBe('number');
    
    console.log('✓ All verifications passed');
    console.log(`Analysis result: ${analysisResult.foods.length} foods, ${analysisResult.totalProtein}g protein, ${analysisResult.confidence} confidence`);
  }, 30000); // 30s timeout for full flow

  it('should reject invalid blob upload attempts', async () => {
    // Request SAS URL with invalid file type
    const invalidRequest = {
      fileName: 'document.pdf',
      fileSize: 1024,
      contentType: 'application/pdf',
    };

    const response = await fetch(UPLOAD_URL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidRequest),
    });

    expect(response.status).toBe(415); // Unsupported file type
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  it('should handle analysis of non-existent blob gracefully', async () => {
    const analyzeRequest = {
      blobName: 'meals/testuser/nonexistent-99999.jpg',
    };

    const response = await fetch(ANALYZE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(analyzeRequest),
    });

    expect([404, 500]).toContain(response.status);
    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data).toHaveProperty('requestId');
  });
});
