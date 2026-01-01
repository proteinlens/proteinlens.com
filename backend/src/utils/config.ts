// Environment configuration loader
// Constitution Principle I: Zero Secrets in Client or Repository

interface Config {
  storageAccountName: string;
  blobContainerName: string;
  aiFoundryEndpoint: string;
  aiModelDeployment: string;
  azureOpenAIApiKey: string; // From Key Vault via AZURE_OPENAI_API_KEY
  azureOpenAIEndpoint: string; // Azure OpenAI endpoint
  azureOpenAIDeployment: string; // Model deployment name
  databaseUrl: string;
  sasTokenExpiryMinutes: number;
  maxFileSizeMB: number;
  // Feature 017: Shareable URLs
  frontendUrl: string;
}

function loadConfig(): Config {
  const requiredEnvVars = [
    'AZURE_STORAGE_ACCOUNT_NAME',
    'BLOB_CONTAINER_NAME',
    'DATABASE_URL',
  ];
  
  // Azure OpenAI (optional for backward compatibility with AI_FOUNDRY_ENDPOINT)
  const hasAzureOpenAI = process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_ENDPOINT;
  const hasLegacyAIFoundry = process.env.AI_FOUNDRY_ENDPOINT && process.env.AI_MODEL_DEPLOYMENT;
  
  if (!hasAzureOpenAI && !hasLegacyAIFoundry) {
    requiredEnvVars.push('AZURE_OPENAI_API_KEY', 'AZURE_OPENAI_ENDPOINT', 'AZURE_OPENAI_DEPLOYMENT');
  }

  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    storageAccountName: process.env.AZURE_STORAGE_ACCOUNT_NAME!,
    blobContainerName: process.env.BLOB_CONTAINER_NAME!,
    // Prefer new Azure OpenAI env vars, fallback to legacy AI Foundry
    azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY || process.env.AI_API_KEY || '',
    azureOpenAIEndpoint: process.env.AZURE_OPENAI_ENDPOINT || process.env.AI_FOUNDRY_ENDPOINT || '',
    azureOpenAIDeployment: process.env.AZURE_OPENAI_DEPLOYMENT || process.env.AI_MODEL_DEPLOYMENT || '',
    // Legacy fields (deprecated, kept for compatibility)
    aiFoundryEndpoint: process.env.AI_FOUNDRY_ENDPOINT || process.env.AZURE_OPENAI_ENDPOINT || '',
    aiModelDeployment: process.env.AI_MODEL_DEPLOYMENT || process.env.AZURE_OPENAI_DEPLOYMENT || '',
    databaseUrl: process.env.DATABASE_URL!,
    sasTokenExpiryMinutes: parseInt(process.env.SAS_TOKEN_EXPIRY_MINUTES || '10', 10),
    maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB || '8', 10),
    // Feature 017: Frontend URL for shareable links
    frontendUrl: process.env.FRONTEND_URL || 'https://www.proteinlens.com',
  };
}

export const config = loadConfig();
