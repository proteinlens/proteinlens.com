-- Auth Events Migration
-- Feature 013 - Self-Managed Authentication Audit Log
-- 
-- This migration adds the AuthEvent table for audit logging
-- per FR-031 requirements.
--
-- Run this migration when the database is accessible:
-- npx prisma migrate deploy

-- CreateEnum: AuthEventType
DO $$ BEGIN
    CREATE TYPE "AuthEventType" AS ENUM (
        'SIGNUP_SUCCESS',
        'SIGNUP_FAILED',
        'SIGNIN_SUCCESS',
        'SIGNIN_FAILED',
        'SIGNOUT',
        'EMAIL_VERIFIED',
        'PASSWORD_RESET_REQUESTED',
        'PASSWORD_RESET_SUCCESS',
        'SESSION_REVOKED',
        'PASSWORD_CHANGED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable: AuthEvent
CREATE TABLE IF NOT EXISTS "AuthEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" VARCHAR(320) NOT NULL,
    "eventType" "AuthEventType" NOT NULL,
    "ipAddress" VARCHAR(45) NOT NULL,
    "userAgent" VARCHAR(500),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: AuthEvent
CREATE INDEX IF NOT EXISTS "AuthEvent_userId_idx" ON "AuthEvent"("userId");
CREATE INDEX IF NOT EXISTS "AuthEvent_eventType_idx" ON "AuthEvent"("eventType");
CREATE INDEX IF NOT EXISTS "AuthEvent_createdAt_idx" ON "AuthEvent"("createdAt");
CREATE INDEX IF NOT EXISTS "AuthEvent_email_createdAt_idx" ON "AuthEvent"("email", "createdAt");

-- AddForeignKey: AuthEvent -> User (SetNull on delete to preserve audit history)
DO $$ BEGIN
    ALTER TABLE "AuthEvent" ADD CONSTRAINT "AuthEvent_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
