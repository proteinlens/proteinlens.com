-- CreateTable
CREATE TABLE "MealAnalysis" (
    "id" TEXT NOT NULL,
    "userId" VARCHAR(255) NOT NULL,
    "blobName" VARCHAR(500) NOT NULL,
    "blobUrl" TEXT NOT NULL,
    "blobHash" VARCHAR(64),
    "requestId" UUID NOT NULL,
    "aiModel" VARCHAR(100) NOT NULL,
    "aiResponseRaw" JSONB NOT NULL,
    "totalProtein" DECIMAL(6,2) NOT NULL,
    "confidence" VARCHAR(20) NOT NULL,
    "notes" TEXT,
    "userCorrections" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Food" (
    "id" TEXT NOT NULL,
    "mealAnalysisId" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "portion" VARCHAR(100) NOT NULL,
    "protein" DECIMAL(6,2) NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Food_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MealAnalysis_userId_createdAt_idx" ON "MealAnalysis"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "MealAnalysis_blobHash_idx" ON "MealAnalysis"("blobHash");

-- CreateIndex
CREATE INDEX "MealAnalysis_requestId_idx" ON "MealAnalysis"("requestId");

-- CreateIndex
CREATE INDEX "Food_mealAnalysisId_idx" ON "Food"("mealAnalysisId");

-- AddForeignKey
ALTER TABLE "Food" ADD CONSTRAINT "Food_mealAnalysisId_fkey" FOREIGN KEY ("mealAnalysisId") REFERENCES "MealAnalysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
