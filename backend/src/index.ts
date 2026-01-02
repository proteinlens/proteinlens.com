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

// Feature 009: User Auth (Organization)
import './functions/organization';

// Feature 010: User Signup & Self-Managed Auth
import './functions/signup';
import './functions/auth';
import './functions/oauth';

// Feature 012: Admin Dashboard
import './functions/admin-users';
import './functions/admin-user-detail';
import './functions/admin-metrics';
import './functions/admin-plan-override';
import './functions/admin-suspend';
import './functions/admin-audit-log';
import './functions/admin-meals';

// Feature 015: Protein Calculator
import './functions/protein-calculator';
import './functions/admin-protein';

// Feature 017: Shareable Meal Scans & Diet Style Profiles
import './functions/public-meal';
import './functions/get-daily-summary';
