// Contract Test: POST /api/meals/analyze
// Verifies API returns schema-valid AI analysis response
// T025: Contract test for analyze endpoint

import { describe, it, expect } from 'vitest';
import { AIAnalysisResponseSchema } from '../../src/models/schemas.js';

describe('POST /api/meals/analyze - Contract Test', () => {
  const FUNCTION_URL = process.env.FUNCTION_URL || 'http://localhost:7071/api/meals/analyze';
  const SKIP_LIVE_TESTS = !process.env.FUNCTION_URL; // Skip if no live function URL

  it.skipIf(SKIP_LIVE_TESTS)('should return 200 with valid AI analysis response schema', async () => {
    // Note: This test requires a valid blobName from a prior upload
    // In integration tests, we'll do full upload → analyze flow
    const requestBody = {
      blobName: 'meals/testuser/1234567890-abc123.jpg',
    };

    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    // May return 404 if blob doesn't exist (expected in isolated contract test)
    if (response.status === 404) {
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toMatch(/blob not found|not found/i);
      return;
    }

    expect(response.status).toBe(200);
    
    const data = await response.json();
    
    // Verify response has required fields
    expect(data).toHaveProperty('mealAnalysisId');
    expect(data).toHaveProperty('foods');
    expect(data).toHaveProperty('totalProtein');
    expect(data).toHaveProperty('confidence');
    expect(data).toHaveProperty('requestId');
    
    // Verify response matches AIAnalysisResponseSchema
    const analysisData = {
      foods: data.foods,
      totalProtein: data.totalProtein,
      confidence: data.confidence,
      notes: data.notes,
    };
    
    const validation = AIAnalysisResponseSchema.safeParse(analysisData);
    expect(validation.success).toBe(true);
    
    // Verify foods array structure
    if (data.foods.length > 0) {
      const food = data.foods[0];
      expect(food).toHaveProperty('name');
      expect(food).toHaveProperty('portion');
      expect(food).toHaveProperty('protein');
      expect(typeof food.name).toBe('string');
      expect(typeof food.portion).toBe('string');
      expect(typeof food.protein).toBe('number');
    }
    
    // Verify confidence is valid enum value
    expect(['high', 'medium', 'low']).toContain(data.confidence);
    
    // Verify totalProtein is a number
    expect(typeof data.totalProtein).toBe('number');
    expect(data.totalProtein).toBeGreaterThanOrEqual(0);
    
    // Verify request ID header
    expect(response.headers.get('X-Request-ID')).toBeTruthy();
  });

  it.skipIf(SKIP_LIVE_TESTS)('should return 400 for missing blobName', async () => {
    const requestBody = {};

    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toMatch(/blobName.*required/i);
  });

  it.skipIf(SKIP_LIVE_TESTS)('should return 400 for invalid blobName format', async () => {
    const requestBody = {
      blobName: 'invalid-format.jpg', // Missing meals/{userId}/ prefix
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

  it.skipIf(SKIP_LIVE_TESTS)('should return 404 for non-existent blob', async () => {
    const requestBody = {
      blobName: 'meals/testuser/nonexistent-12345.jpg',
    };

    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    // Should return 404 or 500 depending on Azure error
    expect([404, 500]).toContain(response.status);
    
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  it.skipIf(SKIP_LIVE_TESTS)('should include requestId in response for traceability', async () => {
    const requestBody = {
      blobName: 'meals/testuser/trace-test.jpg',
    };

    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    
    // Should have requestId in response body
    expect(data).toHaveProperty('requestId');
    expect(typeof data.requestId).toBe('string');
    expect(data.requestId).toMatch(/^[0-9a-f-]{36}$/i); // UUID format
    
    // Should have requestId in response header
    const headerRequestId = response.headers.get('X-Request-ID');
    expect(headerRequestId).toBe(data.requestId);
  });
});
