-- CreateTable (IF NOT EXISTS for idempotency)
CREATE TABLE IF NOT EXISTS "AnonymousUsage" (
    "id" TEXT NOT NULL,
    "ipAddress" VARCHAR(45) NOT NULL,
    "mealId" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnonymousUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (IF NOT EXISTS for idempotency)
CREATE INDEX IF NOT EXISTS "AnonymousUsage_ipAddress_createdAt_idx" ON "AnonymousUsage"("ipAddress", "createdAt");
