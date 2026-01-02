-- AlterTable Food - Add carbs and fat columns for macro ingredients tracking
ALTER TABLE "Food" ADD COLUMN "carbs" DECIMAL(6,2),
ADD COLUMN "fat" DECIMAL(6,2);
