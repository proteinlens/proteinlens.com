-- CreateEnum
CREATE TYPE "TrainingLevel" AS ENUM ('NONE', 'REGULAR');

-- CreateEnum
CREATE TYPE "ProteinGoal" AS ENUM ('MAINTAIN', 'LOSE', 'GAIN');

-- CreateEnum
CREATE TYPE "WeightUnit" AS ENUM ('KG', 'LBS');

-- CreateTable
CREATE TABLE "UserProteinProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weightKg" DECIMAL(5,2) NOT NULL,
    "weightUnit" "WeightUnit" NOT NULL DEFAULT 'KG',
    "trainingLevel" "TrainingLevel" NOT NULL,
    "goal" "ProteinGoal" NOT NULL,
    "mealsPerDay" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProteinProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProteinTarget" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "proteinTargetG" INTEGER NOT NULL,
    "perMealTargetsG" JSONB NOT NULL,
    "multiplierUsed" DECIMAL(3,2) NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProteinTarget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProteinPreset" (
    "id" TEXT NOT NULL,
    "trainingLevel" "TrainingLevel" NOT NULL,
    "goal" "ProteinGoal" NOT NULL,
    "multiplierGPerKg" DECIMAL(3,2) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProteinPreset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProteinConfig" (
    "id" TEXT NOT NULL,
    "minGDay" INTEGER NOT NULL DEFAULT 60,
    "maxGDay" INTEGER NOT NULL DEFAULT 220,
    "defaultMealsPerDay" INTEGER NOT NULL DEFAULT 3,
    "mealSplits" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProteinConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProteinProfile_userId_key" ON "UserProteinProfile"("userId");

-- CreateIndex
CREATE INDEX "UserProteinProfile_userId_idx" ON "UserProteinProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProteinTarget_profileId_key" ON "ProteinTarget"("profileId");

-- CreateIndex
CREATE INDEX "ProteinTarget_profileId_idx" ON "ProteinTarget"("profileId");

-- CreateIndex
CREATE INDEX "ProteinPreset_active_idx" ON "ProteinPreset"("active");

-- CreateIndex
CREATE UNIQUE INDEX "ProteinPreset_trainingLevel_goal_key" ON "ProteinPreset"("trainingLevel", "goal");

-- AddForeignKey
ALTER TABLE "UserProteinProfile" ADD CONSTRAINT "UserProteinProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProteinTarget" ADD CONSTRAINT "ProteinTarget_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "UserProteinProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
