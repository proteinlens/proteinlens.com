-- CreateEnum
CREATE TYPE "ConsentType" AS ENUM ('TERMS_OF_SERVICE', 'PRIVACY_POLICY', 'MARKETING_EMAILS');

-- CreateEnum
CREATE TYPE "SignupAttemptOutcome" AS ENUM ('SUCCESS', 'VALIDATION_ERROR', 'DUPLICATE_EMAIL', 'RATE_LIMITED', 'CAPTCHA_FAILED', 'BREACH_PASSWORD', 'NETWORK_ERROR');

-- AlterTable: Add profile fields to User
ALTER TABLE "User" ADD COLUMN "firstName" VARCHAR(50);
ALTER TABLE "User" ADD COLUMN "lastName" VARCHAR(50);
ALTER TABLE "User" ADD COLUMN "organizationName" VARCHAR(100);
ALTER TABLE "User" ADD COLUMN "phone" VARCHAR(20);
ALTER TABLE "User" ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "profileCompleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateTable
CREATE TABLE "ConsentRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "consentType" "ConsentType" NOT NULL,
    "documentVersion" VARCHAR(20) NOT NULL,
    "ipAddress" VARCHAR(45) NOT NULL,
    "userAgent" VARCHAR(500),
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "ConsentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SignupAttempt" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "ipAddress" VARCHAR(45) NOT NULL,
    "userAgent" VARCHAR(500),
    "outcome" "SignupAttemptOutcome" NOT NULL,
    "failureReason" VARCHAR(200),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SignupAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConsentRecord_userId_idx" ON "ConsentRecord"("userId");
CREATE INDEX "ConsentRecord_consentType_idx" ON "ConsentRecord"("consentType");
CREATE INDEX "ConsentRecord_grantedAt_idx" ON "ConsentRecord"("grantedAt");
CREATE UNIQUE INDEX "ConsentRecord_userId_consentType_key" ON "ConsentRecord"("userId", "consentType");

-- CreateIndex
CREATE INDEX "SignupAttempt_email_createdAt_idx" ON "SignupAttempt"("email", "createdAt");
CREATE INDEX "SignupAttempt_ipAddress_createdAt_idx" ON "SignupAttempt"("ipAddress", "createdAt");
CREATE INDEX "SignupAttempt_outcome_idx" ON "SignupAttempt"("outcome");

-- AddForeignKey
ALTER TABLE "ConsentRecord" ADD CONSTRAINT "ConsentRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
