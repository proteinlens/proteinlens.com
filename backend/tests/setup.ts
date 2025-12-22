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

// Mock PrismaClient globally using class syntax
vi.mock('@prisma/client', () => {
  class MockPrismaClient {
    user = {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
    };
    mealAnalysis = {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    food = {
      findMany: vi.fn(),
      create: vi.fn(),
      createMany: vi.fn(),
      deleteMany: vi.fn(),
    };
    usage = {
      count: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
    };
    $transaction = vi.fn((fn: any) => fn(this));
  }

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
  };
});

// Mock Azure Identity using class syntax
vi.mock('@azure/identity', () => {
  class MockDefaultAzureCredential {
    getToken = vi.fn().mockResolvedValue({ token: 'test-token' });
  }
  return {
    DefaultAzureCredential: MockDefaultAzureCredential,
  };
});

// Mock Azure Storage Blob using class syntax
vi.mock('@azure/storage-blob', () => {
  class MockBlobServiceClient {
    getContainerClient = vi.fn(() => ({
      getBlockBlobClient: vi.fn(() => ({
        generateSasUrl: vi.fn().mockResolvedValue('https://test.blob.core.windows.net/test?sig=test'),
        exists: vi.fn().mockResolvedValue(true),
        delete: vi.fn().mockResolvedValue(undefined),
        getProperties: vi.fn().mockResolvedValue({ contentType: 'image/jpeg' }),
        url: 'https://test.blob.core.windows.net/test',
      })),
    }));
  }
  return {
    BlobServiceClient: MockBlobServiceClient,
    StorageSharedKeyCredential: vi.fn(),
    generateBlobSASQueryParameters: vi.fn().mockReturnValue({ toString: () => 'sig=test' }),
    BlobSASPermissions: {
      parse: vi.fn().mockReturnValue({}),
    },
  };
});

// Mock Stripe using class syntax
vi.mock('stripe', () => {
  class MockStripe {
    customers = {
      create: vi.fn().mockResolvedValue({ id: 'cus_test' }),
    };
    checkout = {
      sessions: {
        create: vi.fn().mockResolvedValue({ url: 'https://checkout.stripe.com/test' }),
      },
    };
    billingPortal = {
      sessions: {
        create: vi.fn().mockResolvedValue({ url: 'https://billing.stripe.com/test' }),
      },
    };
    webhooks = {
      constructEvent: vi.fn(),
    };
  }
  return { default: MockStripe };
});

console.log('Test setup complete');
