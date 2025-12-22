// Entry point for Azure Functions
// This file is required for Azure Functions v4 programming model

// Feature 001: Blob Upload + Vision
import './functions/upload-url';
import './functions/analyze';
import './functions/update-meal';
import './functions/delete-meal';
import './functions/export';
import './functions/health';

// Feature 002: SaaS Billing
import './functions/plans';
import './functions/checkout';
import './functions/portal';
import './functions/usage';
import './functions/webhook';
import './functions/admin-user';
