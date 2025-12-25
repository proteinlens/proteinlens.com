// Entry point for Azure Functions
// This file is required for Azure Functions v4 programming model

// Database migrations - run on application startup (cold start)
import { runMigrations } from './utils/migrations.js';

// Initialize database migrations before loading functions
console.log('[STARTUP] Starting database migrations...');
runMigrations()
  .then(() => {
    console.log('[STARTUP] Database migrations completed successfully');
  })
  .catch((error) => {
    console.error('[STARTUP] Database migrations failed:', error);
    // Don't exit - let Azure Functions framework handle the startup failure
    // The Function App will be marked as unhealthy until migrations succeed
  });

// Feature 001: Blob Upload + Vision
import './functions/upload-url';
import './functions/analyze';
import './functions/get-meals';
import './functions/update-meal';
import './functions/delete-meal';
import './functions/export';
import './functions/health';
import './functions/me';

// Feature 002: SaaS Billing
import './functions/plans';
import './functions/checkout';
import './functions/portal';
import './functions/usage';
import './functions/webhook';
import './functions/admin-user';
// deployment trigger: 1766497410
// trigger 1766497563
// deploy 1766497752
// new deploy 1766497932
// trigger key-based 1766498070
// login mode 1766498255
