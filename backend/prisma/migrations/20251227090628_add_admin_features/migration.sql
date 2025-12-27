-- CreateEnum
CREATE TYPE "AdminActionType" AS ENUM ('VIEW_USER_LIST', 'VIEW_USER_DETAIL', 'PLAN_OVERRIDE', 'SUSPEND_USER', 'REACTIVATE_USER', 'EXPORT_USERS', 'VIEW_AUDIT_LOG');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "suspended" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "suspendedAt" TIMESTAMP(3),
ADD COLUMN     "suspendedBy" VARCHAR(255),
ADD COLUMN     "suspendedReason" VARCHAR(500);

-- CreateTable
CREATE TABLE "AdminAuditLog" (
    "id" TEXT NOT NULL,
    "adminEmail" VARCHAR(320) NOT NULL,
    "adminId" VARCHAR(255),
    "action" "AdminActionType" NOT NULL,
    "targetUserId" VARCHAR(255),
    "targetEmail" VARCHAR(320),
    "details" JSONB,
    "reason" VARCHAR(500),
    "requestId" UUID NOT NULL,
    "ipAddress" VARCHAR(45) NOT NULL,
    "userAgent" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdminAuditLog_adminEmail_createdAt_idx" ON "AdminAuditLog"("adminEmail", "createdAt");

-- CreateIndex
CREATE INDEX "AdminAuditLog_targetUserId_createdAt_idx" ON "AdminAuditLog"("targetUserId", "createdAt");

-- CreateIndex
CREATE INDEX "AdminAuditLog_action_createdAt_idx" ON "AdminAuditLog"("action", "createdAt");

-- CreateIndex
CREATE INDEX "AdminAuditLog_createdAt_idx" ON "AdminAuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "User_suspended_idx" ON "User"("suspended");
