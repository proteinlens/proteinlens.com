-- CreateTable
CREATE TABLE "AnonymousUsage" (
    "id" TEXT NOT NULL,
    "ipAddress" VARCHAR(45) NOT NULL,
    "mealId" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnonymousUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AnonymousUsage_ipAddress_createdAt_idx" ON "AnonymousUsage"("ipAddress", "createdAt");
