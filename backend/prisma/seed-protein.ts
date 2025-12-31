/**
 * Seed script for Protein Calculator (Feature 015)
 * 
 * Creates default presets and configuration.
 * Run with: npx prisma db seed
 */

import { PrismaClient, TrainingLevel, ProteinGoal } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

// Default presets (6 rows) - from data-model.md
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

// Default config (1 row) - from data-model.md
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

  // Get existing config or create new one
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

export async function seedProtein(): Promise<void> {
  try {
    await seedProteinPresets();
    await seedProteinConfig();
    console.log('✓ Protein calculator seed complete');
  } catch (error) {
    console.error('Error seeding protein data:', error);
    throw error;
  }
}

// Run standalone if executed directly
async function main(): Promise<void> {
  await seedProtein();
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
