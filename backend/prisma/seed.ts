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
// Diet Styles Seeds (Feature 017)
// ============================================

const DEFAULT_DIET_STYLES = [
  {
    slug: 'balanced',
    name: 'Balanced',
    description: 'Standard nutrition with no specific restrictions. Focus on overall protein goals.',
    netCarbCapG: null,
    fatTargetPercent: null,
    isActive: true,
    sortOrder: 0,
  },
  {
    slug: 'mediterranean',
    name: 'Mediterranean',
    description: 'Heart-healthy eating emphasizing olive oil, fish, whole grains, and vegetables.',
    netCarbCapG: null,
    fatTargetPercent: 35,
    isActive: true,
    sortOrder: 1,
  },
  {
    slug: 'low-carb',
    name: 'Low-Carb',
    description: 'Reduced carbohydrate intake while maintaining moderate protein. Good for blood sugar management.',
    netCarbCapG: 100,
    fatTargetPercent: null,
    isActive: true,
    sortOrder: 2,
  },
  {
    slug: 'ketogenic',
    name: 'Ketogenic',
    description: 'Very low carb, high fat diet to achieve ketosis. Strict carb limits with protein moderation.',
    netCarbCapG: 30,
    fatTargetPercent: 70,
    isActive: true,
    sortOrder: 3,
  },
  {
    slug: 'plant-based',
    name: 'Plant-Based',
    description: 'Nutrition from plant sources only. Focus on legumes, tofu, tempeh, and nuts for protein.',
    netCarbCapG: null,
    fatTargetPercent: null,
    isActive: true,
    sortOrder: 4,
  },
];

async function seedDietStyles(): Promise<void> {
  console.log('Seeding diet styles...');

  for (const dietStyle of DEFAULT_DIET_STYLES) {
    await prisma.dietStyle.upsert({
      where: {
        slug: dietStyle.slug,
      },
      update: {
        name: dietStyle.name,
        description: dietStyle.description,
        netCarbCapG: dietStyle.netCarbCapG,
        fatTargetPercent: dietStyle.fatTargetPercent,
        isActive: dietStyle.isActive,
        sortOrder: dietStyle.sortOrder,
      },
      create: dietStyle,
    });
  }

  console.log(`✓ Seeded ${DEFAULT_DIET_STYLES.length} diet styles`);
}

// ============================================
// Main seed function
// ============================================

async function main(): Promise<void> {
  console.log('🌱 Starting database seed...\n');

  // Protein Calculator (Feature 015)
  await seedProteinPresets();
  await seedProteinConfig();

  // Diet Styles (Feature 017)
  await seedDietStyles();

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
