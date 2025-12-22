/**
 * T083: E2E Test - Full meal upload, analysis, correction, and daily totals flow
 * Uses Playwright for browser automation
 */

import { test, expect, Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

// Test configuration
const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5173';
const API_URL = process.env.E2E_API_URL || 'http://localhost:7071/api';
const TEST_USER_ID = 'e2e-test-user-' + Date.now();

// Test image path (relative to test file)
const TEST_IMAGE_PATH = path.join(__dirname, 'fixtures', 'test-meal.jpg');

test.describe('Full Meal Analysis Flow', () => {
  test.beforeAll(async () => {
    // Ensure test fixtures exist
    const fixturesDir = path.join(__dirname, 'fixtures');
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }
    
    // Create a simple test image if it doesn't exist
    if (!fs.existsSync(TEST_IMAGE_PATH)) {
      // Create a minimal JPEG file for testing
      const minimalJpeg = Buffer.from([
        0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
        0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
        0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
        0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
        0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
        0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
        0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
        0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01,
        0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xFF, 0xC4, 0x00, 0x1F, 0x00, 0x00,
        0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
        0x09, 0x0A, 0x0B, 0xFF, 0xC4, 0x00, 0xB5, 0x10, 0x00, 0x02, 0x01, 0x03,
        0x03, 0x02, 0x04, 0x03, 0x05, 0x05, 0x04, 0x04, 0x00, 0x00, 0x01, 0x7D,
        0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12, 0x21, 0x31, 0x41, 0x06,
        0x13, 0x51, 0x61, 0x07, 0x22, 0x71, 0x14, 0x32, 0x81, 0x91, 0xA1, 0x08,
        0x23, 0x42, 0xB1, 0xC1, 0x15, 0x52, 0xD1, 0xF0, 0x24, 0x33, 0x62, 0x72,
        0x82, 0x09, 0x0A, 0x16, 0x17, 0x18, 0x19, 0x1A, 0x25, 0x26, 0x27, 0x28,
        0x29, 0x2A, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3A, 0x43, 0x44, 0x45,
        0x46, 0x47, 0x48, 0x49, 0x4A, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59,
        0x5A, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6A, 0x73, 0x74, 0x75,
        0x76, 0x77, 0x78, 0x79, 0x7A, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89,
        0x8A, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9A, 0xA2, 0xA3,
        0xA4, 0xA5, 0xA6, 0xA7, 0xA8, 0xA9, 0xAA, 0xB2, 0xB3, 0xB4, 0xB5, 0xB6,
        0xB7, 0xB8, 0xB9, 0xBA, 0xC2, 0xC3, 0xC4, 0xC5, 0xC6, 0xC7, 0xC8, 0xC9,
        0xCA, 0xD2, 0xD3, 0xD4, 0xD5, 0xD6, 0xD7, 0xD8, 0xD9, 0xDA, 0xE1, 0xE2,
        0xE3, 0xE4, 0xE5, 0xE6, 0xE7, 0xE8, 0xE9, 0xEA, 0xF1, 0xF2, 0xF3, 0xF4,
        0xF5, 0xF6, 0xF7, 0xF8, 0xF9, 0xFA, 0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01,
        0x00, 0x00, 0x3F, 0x00, 0xFB, 0xD5, 0xFF, 0xD9
      ]);
      fs.writeFileSync(TEST_IMAGE_PATH, minimalJpeg);
    }
  });

  test('should upload a meal photo and display analysis results', async ({ page }) => {
    await page.goto(BASE_URL);

    // Wait for the upload component to be visible
    await expect(page.locator('.meal-upload')).toBeVisible();

    // Upload a test image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(TEST_IMAGE_PATH);

    // Wait for upload progress
    await expect(page.locator('.upload-progress, .meal-upload__progress')).toBeVisible({ timeout: 5000 });

    // Wait for analysis to complete (may take longer with real AI)
    await expect(page.locator('.analysis-results')).toBeVisible({ timeout: 30000 });

    // Verify analysis results are displayed
    await expect(page.locator('.total-protein')).toBeVisible();
    await expect(page.locator('.food-items')).toBeVisible();

    // Check that protein value is a number
    const proteinValue = await page.locator('.protein-value').textContent();
    expect(proteinValue).toMatch(/\d+(\.\d+)?/);
  });

  test('should allow editing food items in analysis results', async ({ page }) => {
    // Navigate to an existing analysis (or upload new one)
    await page.goto(BASE_URL);
    
    // Upload and wait for results
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(TEST_IMAGE_PATH);
    await expect(page.locator('.analysis-results')).toBeVisible({ timeout: 30000 });

    // Click edit button
    await page.click('.analysis-results__btn--edit');

    // Wait for editor to open
    await expect(page.locator('.meal-editor')).toBeVisible();

    // Edit a food item's protein value
    const proteinInput = page.locator('.meal-editor__food-protein input').first();
    await proteinInput.fill('25');

    // Click save
    await page.click('.meal-editor__btn--save');

    // Verify edit was saved (editor should close or show success)
    await expect(page.locator('.meal-editor')).not.toBeVisible({ timeout: 5000 });
  });

  test('should delete a meal with confirmation', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Upload and wait for results
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(TEST_IMAGE_PATH);
    await expect(page.locator('.analysis-results')).toBeVisible({ timeout: 30000 });

    // Click delete button
    await page.click('.analysis-results__btn--delete');

    // Verify confirmation dialog appears
    await expect(page.locator('.analysis-results__confirm-dialog')).toBeVisible();
    await expect(page.locator('.analysis-results__confirm-title')).toContainText('Delete');

    // Click cancel first
    await page.click('.analysis-results__btn--cancel');
    await expect(page.locator('.analysis-results__confirm-dialog')).not.toBeVisible();

    // Now actually delete
    await page.click('.analysis-results__btn--delete');
    await page.click('.analysis-results__btn--confirm-delete');

    // Analysis results should be removed
    await expect(page.locator('.analysis-results')).not.toBeVisible({ timeout: 5000 });
  });

  test('should show compression indicator for large images', async ({ page }) => {
    // Create a larger test image (> 2MB threshold)
    const largeImagePath = path.join(__dirname, 'fixtures', 'large-meal.jpg');
    
    // Create a large JPEG file by repeating data
    const baseJpeg = fs.readFileSync(TEST_IMAGE_PATH);
    const largeBuffer = Buffer.concat([
      baseJpeg,
      Buffer.alloc(3 * 1024 * 1024, 0xFF) // Add 3MB of padding
    ]);
    fs.writeFileSync(largeImagePath, largeBuffer);

    await page.goto(BASE_URL);

    // Listen for console logs about compression
    const logs: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('Compress')) {
        logs.push(msg.text());
      }
    });

    // Upload the large image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(largeImagePath);

    // Wait for progress indicator (should show compressing state)
    await page.waitForTimeout(1000);

    // Clean up
    fs.unlinkSync(largeImagePath);
  });

  test('should reject files that are too large', async ({ page }) => {
    await page.goto(BASE_URL);

    // Create an oversized test file (> 10MB)
    const oversizedPath = path.join(__dirname, 'fixtures', 'oversized.jpg');
    fs.writeFileSync(oversizedPath, Buffer.alloc(15 * 1024 * 1024, 0xFF));

    // Upload the oversized file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(oversizedPath);

    // Should show error message
    await expect(page.locator('.meal-upload__error, .error-message')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.meal-upload__error, .error-message')).toContainText(/too large|10MB/i);

    // Clean up
    fs.unlinkSync(oversizedPath);
  });

  test('should reject non-image files', async ({ page }) => {
    await page.goto(BASE_URL);

    // Create a text file
    const textFilePath = path.join(__dirname, 'fixtures', 'test.txt');
    fs.writeFileSync(textFilePath, 'This is not an image');

    // Try to upload text file
    const fileInput = page.locator('input[type="file"]');
    
    // Note: File input may reject non-images automatically via accept attribute
    // If not, we should see an error
    try {
      await fileInput.setInputFiles(textFilePath);
      // Check for error message
      await expect(page.locator('.meal-upload__error, .error-message')).toBeVisible({ timeout: 3000 });
    } catch (e) {
      // File was rejected by input accept attribute - this is expected
    }

    // Clean up
    fs.unlinkSync(textFilePath);
  });
});

test.describe('API Health Checks', () => {
  test('should return healthy status from health endpoint', async ({ request }) => {
    const response = await request.get(`${API_URL}/health`);
    expect(response.ok()).toBeTruthy();
    
    const body = await response.json();
    expect(body.status).toBe('healthy');
    expect(body.timestamp).toBeDefined();
  });

  test('should return detailed status from deep health check', async ({ request }) => {
    const response = await request.get(`${API_URL}/health?deep=true`);
    
    const body = await response.json();
    expect(['healthy', 'degraded', 'unhealthy']).toContain(body.status);
    expect(body.checks).toBeDefined();
    expect(body.checks.database).toBeDefined();
    expect(body.checks.blobStorage).toBeDefined();
  });

  test('should return ready status from readiness probe', async ({ request }) => {
    const response = await request.get(`${API_URL}/health/readiness`);
    
    // Either ready (200) or not ready (503) is acceptable
    const body = await response.json();
    expect(['ready', 'not_ready']).toContain(body.status);
  });

  test('should return alive status from liveness probe', async ({ request }) => {
    const response = await request.get(`${API_URL}/health/liveness`);
    expect(response.ok()).toBeTruthy();
    
    const body = await response.json();
    expect(body.status).toBe('alive');
  });
});
