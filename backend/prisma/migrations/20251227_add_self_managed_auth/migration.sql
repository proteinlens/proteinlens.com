-- Self-Managed Authentication Migration
-- Feature 010 - User Signup with PostgreSQL-based Auth
-- 
-- This migration adds support for self-managed authentication:
-- - Email/password authentication (LOCAL provider)
-- - Google OAuth (GOOGLE provider)
-- - Microsoft OAuth (MICROSOFT provider)
-- - Refresh token management with rotation
-- - Email verification tokens
-- - Password reset tokens
--
-- Run this migration when the database is accessible:
-- npx prisma migrate deploy
-- or manually via psql/Azure Data Studio

-- CreateEnum: AuthProvider (if not exists)
DO $$ BEGIN
    CREATE TYPE "AuthProvider" AS ENUM ('LOCAL', 'GOOGLE', 'MICROSOFT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add new columns to User table (if they don't exist)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordHash" VARCHAR(255);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "authProvider" "AuthProvider" NOT NULL DEFAULT 'LOCAL';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "oauthProviderId" VARCHAR(255);

-- Make email unique (if not already) - this may fail if there are duplicates
-- First, check if the constraint exists
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'User_email_key'
    ) THEN
        ALTER TABLE "User" ADD CONSTRAINT "User_email_key" UNIQUE ("email");
    END IF;
END $$;

-- Create index on authProvider + oauthProviderId for OAuth lookups
CREATE INDEX IF NOT EXISTS "User_authProvider_oauthProviderId_idx" ON "User"("authProvider", "oauthProviderId");

-- Create index on email for lookups
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");

-- CreateTable: RefreshToken
CREATE TABLE IF NOT EXISTS "RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" VARCHAR(64) NOT NULL,
    "deviceInfo" VARCHAR(255),
    "ipAddress" VARCHAR(45),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: RefreshToken
CREATE UNIQUE INDEX IF NOT EXISTS "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");
CREATE INDEX IF NOT EXISTS "RefreshToken_userId_idx" ON "RefreshToken"("userId");
CREATE INDEX IF NOT EXISTS "RefreshToken_tokenHash_idx" ON "RefreshToken"("tokenHash");
CREATE INDEX IF NOT EXISTS "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");

-- AddForeignKey: RefreshToken -> User
DO $$ BEGIN
    ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable: EmailVerificationToken
CREATE TABLE IF NOT EXISTS "EmailVerificationToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" VARCHAR(64) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailVerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: EmailVerificationToken
CREATE UNIQUE INDEX IF NOT EXISTS "EmailVerificationToken_tokenHash_key" ON "EmailVerificationToken"("tokenHash");
CREATE INDEX IF NOT EXISTS "EmailVerificationToken_userId_idx" ON "EmailVerificationToken"("userId");
CREATE INDEX IF NOT EXISTS "EmailVerificationToken_tokenHash_idx" ON "EmailVerificationToken"("tokenHash");

-- AddForeignKey: EmailVerificationToken -> User
DO $$ BEGIN
    ALTER TABLE "EmailVerificationToken" ADD CONSTRAINT "EmailVerificationToken_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable: PasswordResetToken
CREATE TABLE IF NOT EXISTS "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" VARCHAR(64) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: PasswordResetToken
CREATE UNIQUE INDEX IF NOT EXISTS "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");
CREATE INDEX IF NOT EXISTS "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");
CREATE INDEX IF NOT EXISTS "PasswordResetToken_tokenHash_idx" ON "PasswordResetToken"("tokenHash");

-- AddForeignKey: PasswordResetToken -> User
DO $$ BEGIN
    ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Migrate existing users: set authProvider to LOCAL for users with externalId (B2C users)
-- These users won't have passwordHash, so they'll need to use "forgot password" to set one
-- or continue using social login if their externalId matches an OAuth provider
UPDATE "User" SET "authProvider" = 'LOCAL' WHERE "authProvider" IS NULL;
