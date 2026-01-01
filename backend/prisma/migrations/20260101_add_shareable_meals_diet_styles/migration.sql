-- CreateTable DietStyle
CREATE TABLE "DietStyle" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "netCarbCapG" INTEGER NOT NULL DEFAULT 100,
    "fatTargetPercent" INTEGER NOT NULL DEFAULT 30,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deactivatedAt" TIMESTAMP(3),

    CONSTRAINT "DietStyle_pkey" PRIMARY KEY ("id")
);

-- Add unique constraint on slug
CREATE UNIQUE INDEX "DietStyle_slug_key" ON "DietStyle"("slug");

-- AddColumn to User
ALTER TABLE "User" ADD COLUMN "dietStyleId" UUID;

-- AddForeignKey to User.dietStyleId -> DietStyle.id
ALTER TABLE "User" ADD CONSTRAINT "User_dietStyleId_fkey" FOREIGN KEY ("dietStyleId") REFERENCES "DietStyle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddColumn to MealAnalysis
ALTER TABLE "MealAnalysis" ADD COLUMN "shareId" TEXT UNIQUE;
ALTER TABLE "MealAnalysis" ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "MealAnalysis" ADD COLUMN "dietStyleAtScanId" UUID;

-- AddForeignKey to MealAnalysis.dietStyleAtScanId -> DietStyle.id
ALTER TABLE "MealAnalysis" ADD CONSTRAINT "MealAnalysis_dietStyleAtScanId_fkey" FOREIGN KEY ("dietStyleAtScanId") REFERENCES "DietStyle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex on shareId
CREATE INDEX "MealAnalysis_shareId_idx" ON "MealAnalysis"("shareId");
