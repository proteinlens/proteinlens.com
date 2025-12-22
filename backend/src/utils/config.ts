// Environment configuration loader
// Constitution Principle I: Zero Secrets in Client or Repository

interface Config {
  storageAccountName: string;
  blobContainerName: string;
  aiFoundryEndpoint: string;
  aiModelDeployment: string;
  databaseUrl: string;
  sasTokenExpiryMinutes: number;
  maxFileSizeMB: number;
}

function loadConfig(): Config {
  const requiredEnvVars = [
    'AZURE_STORAGE_ACCOUNT_NAME',
    'BLOB_CONTAINER_NAME',
    'AI_FOUNDRY_ENDPOINT',
    'AI_MODEL_DEPLOYMENT',
    'DATABASE_URL',
  ];

  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    storageAccountName: process.env.AZURE_STORAGE_ACCOUNT_NAME!,
    blobContainerName: process.env.BLOB_CONTAINER_NAME!,
    aiFoundryEndpoint: process.env.AI_FOUNDRY_ENDPOINT!,
    aiModelDeployment: process.env.AI_MODEL_DEPLOYMENT!,
    databaseUrl: process.env.DATABASE_URL!,
    sasTokenExpiryMinutes: parseInt(process.env.SAS_TOKEN_EXPIRY_MINUTES || '10', 10),
    maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB || '8', 10),
  };
}

export const config = loadConfig();
