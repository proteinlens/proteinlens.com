// Vitest global test setup
// Sets up test environment with mock environment variables

import { vi } from 'vitest';

// Set test environment variables BEFORE any imports
process.env.AZURE_STORAGE_ACCOUNT_NAME = 'testaccount';
process.env.BLOB_CONTAINER_NAME = 'test-container';
process.env.AI_FOUNDRY_ENDPOINT = 'https://test.openai.azure.com';
process.env.AI_MODEL_DEPLOYMENT = 'gpt-5.1-vision';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.STRIPE_SECRET_KEY = 'sk_test_123';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_123';
process.env.STRIPE_PRO_PRICE_ID = 'price_test_123';

// Auth-related environment variables
process.env.JWT_SECRET = 'test-jwt-secret-that-is-at-least-32-characters-long-for-testing';
process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret';
process.env.MICROSOFT_CLIENT_ID = 'test-microsoft-client-id';
process.env.MICROSOFT_CLIENT_SECRET = 'test-microsoft-client-secret';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.NODE_ENV = 'test';

// Mock PrismaClient globally using constructor function syntax
vi.mock('@prisma/client', () => {
  const MockPrismaClient = function(this: any, options?: any) {
    this.user = {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
    };
    this.mealAnalysis = {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    this.food = {
      findMany: vi.fn(),
      create: vi.fn(),
      createMany: vi.fn(),
      deleteMany: vi.fn(),
    };
    this.usage = {
      count: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
    };
    // Auth-related models
    this.signupAttempt = {
      create: vi.fn(),
      findMany: vi.fn(),
    };
    this.refreshToken = {
      create: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      update: vi.fn(),
    };
    this.emailVerificationToken = {
      create: vi.fn(),
      findFirst: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    };
    this.passwordResetToken = {
      create: vi.fn(),
      findFirst: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    };
    this.consentRecord = {
      create: vi.fn(),
      createMany: vi.fn(),
      findMany: vi.fn(),
    };
    this.$transaction = vi.fn((fn: any) => fn(this));
    this.$on = vi.fn();
  } as any;

  return {
    PrismaClient: MockPrismaClient,
    Plan: {
      FREE: 'FREE',
      PRO: 'PRO',
    },
    SubscriptionStatus: {
      active: 'active',
      canceled: 'canceled',
      past_due: 'past_due',
      trialing: 'trialing',
    },
    UsageType: {
      MEAL_ANALYSIS: 'MEAL_ANALYSIS',
    },
    AuthProvider: {
      LOCAL: 'LOCAL',
      GOOGLE: 'GOOGLE',
      MICROSOFT: 'MICROSOFT',
    },
    ConsentType: {
      TERMS_OF_SERVICE: 'TERMS_OF_SERVICE',
      PRIVACY_POLICY: 'PRIVACY_POLICY',
      MARKETING: 'MARKETING',
    },
  };
});

// Mock Azure Identity using constructor function syntax
vi.mock('@azure/identity', () => {
  const MockDefaultAzureCredential = function(this: any) {
    this.getToken = vi.fn().mockResolvedValue({ token: 'test-token' });
  } as any;
  return {
    DefaultAzureCredential: MockDefaultAzureCredential,
  };
});

// Mock Azure Storage Blob using constructor function syntax
vi.mock('@azure/storage-blob', () => {
  const MockBlobServiceClient = function(this: any) {
    this.getContainerClient = vi.fn(() => ({
      getBlockBlobClient: vi.fn(() => ({
        generateSasUrl: vi.fn().mockResolvedValue('https://test.blob.core.windows.net/test?sig=test'),
        exists: vi.fn().mockResolvedValue(true),
        delete: vi.fn().mockResolvedValue(undefined),
        getProperties: vi.fn().mockResolvedValue({ contentType: 'image/jpeg' }),
        url: 'https://test.blob.core.windows.net/test',
      })),
    }));
  } as any;
  return {
    BlobServiceClient: MockBlobServiceClient,
    StorageSharedKeyCredential: vi.fn(),
    generateBlobSASQueryParameters: vi.fn().mockReturnValue({ toString: () => 'sig=test' }),
    BlobSASPermissions: {
      parse: vi.fn().mockReturnValue({}),
    },
  };
});

// Mock Stripe using constructor function syntax
vi.mock('stripe', () => {
  const MockStripe = function(this: any, apiKey?: string) {
    this.customers = {
      create: vi.fn().mockResolvedValue({ id: 'cus_test' }),
    };
    this.checkout = {
      sessions: {
        create: vi.fn().mockResolvedValue({ url: 'https://checkout.stripe.com/test' }),
      },
    };
    this.billingPortal = {
      sessions: {
        create: vi.fn().mockResolvedValue({ url: 'https://billing.stripe.com/test' }),
      },
    };
    this.webhooks = {
      constructEvent: vi.fn(),
    };
  } as any;
  return { default: MockStripe };
});

console.log('Test setup complete');
