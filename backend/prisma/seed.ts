/**
 * Main seed script for ProteinLens
 * 
 * Orchestrates all seed operations for the database.
 * Run with: npx prisma db seed
 */

import { PrismaClient, TrainingLevel, ProteinGoal } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

// ============================================
// Protein Calculator Seeds (Feature 015)
// ============================================

const DEFAULT_PRESETS: {
  trainingLevel: TrainingLevel;
  goal: ProteinGoal;
  multiplierGPerKg: number;
}[] = [
  { trainingLevel: 'NONE', goal: 'MAINTAIN', multiplierGPerKg: 1.0 },
  { trainingLevel: 'NONE', goal: 'LOSE', multiplierGPerKg: 1.2 },
  { trainingLevel: 'NONE', goal: 'GAIN', multiplierGPerKg: 1.2 },
  { trainingLevel: 'REGULAR', goal: 'MAINTAIN', multiplierGPerKg: 1.6 },
  { trainingLevel: 'REGULAR', goal: 'LOSE', multiplierGPerKg: 1.8 },
  { trainingLevel: 'REGULAR', goal: 'GAIN', multiplierGPerKg: 1.8 },
];

const DEFAULT_CONFIG = {
  minGDay: 60,
  maxGDay: 220,
  defaultMealsPerDay: 3,
  mealSplits: {
    '2': [0.45, 0.55],
    '3': [0.25, 0.35, 0.40],
    '4': [0.25, 0.30, 0.25, 0.20],
    '5': [0.20, 0.20, 0.25, 0.20, 0.15],
  },
};

async function seedProteinPresets(): Promise<void> {
  console.log('Seeding protein presets...');

  for (const preset of DEFAULT_PRESETS) {
    await prisma.proteinPreset.upsert({
      where: {
        trainingLevel_goal: {
          trainingLevel: preset.trainingLevel,
          goal: preset.goal,
        },
      },
      update: {
        multiplierGPerKg: new Decimal(preset.multiplierGPerKg),
        active: true,
      },
      create: {
        trainingLevel: preset.trainingLevel,
        goal: preset.goal,
        multiplierGPerKg: new Decimal(preset.multiplierGPerKg),
        active: true,
      },
    });
  }

  console.log(`✓ Seeded ${DEFAULT_PRESETS.length} protein presets`);
}

async function seedProteinConfig(): Promise<void> {
  console.log('Seeding protein config...');

  const existingConfig = await prisma.proteinConfig.findFirst();

  if (existingConfig) {
    await prisma.proteinConfig.update({
      where: { id: existingConfig.id },
      data: {
        minGDay: DEFAULT_CONFIG.minGDay,
        maxGDay: DEFAULT_CONFIG.maxGDay,
        defaultMealsPerDay: DEFAULT_CONFIG.defaultMealsPerDay,
        mealSplits: DEFAULT_CONFIG.mealSplits,
      },
    });
  } else {
    await prisma.proteinConfig.create({
      data: {
        minGDay: DEFAULT_CONFIG.minGDay,
        maxGDay: DEFAULT_CONFIG.maxGDay,
        defaultMealsPerDay: DEFAULT_CONFIG.defaultMealsPerDay,
        mealSplits: DEFAULT_CONFIG.mealSplits,
      },
    });
  }

  console.log('✓ Seeded protein config');
}

// ============================================
// Main seed function
// ============================================

async function main(): Promise<void> {
  console.log('🌱 Starting database seed...\n');

  // Protein Calculator (Feature 015)
  await seedProteinPresets();
  await seedProteinConfig();

  console.log('\n✅ Database seed complete!');
}

main()
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
