/**
 * Script to check and fix meals with missing shareIds
 * Run with: npx tsx scripts/check-meal-shareids.ts
 */

import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();

const generateShareId = () => nanoid(11);

async function main() {
  console.log('🔍 Checking for meals with missing shareIds...\n');

  // Check for meals without shareId
  const mealsWithoutShareId = await prisma.mealAnalysis.findMany({
    where: {
      OR: [
        { shareId: null },
        { shareId: '' },
      ],
    },
    select: {
      id: true,
      userId: true,
      createdAt: true,
      isPublic: true,
    },
    take: 100,
    orderBy: { createdAt: 'desc' },
  });

  console.log(`Found ${mealsWithoutShareId.length} meals without shareId\n`);

  if (mealsWithoutShareId.length === 0) {
    console.log('✅ All meals have shareIds!\n');
    
    // Now check if the specific meal exists
    console.log('🔍 Checking for meal with shareId "msTBQWZlI0"...\n');
    
    const specificMeal = await prisma.mealAnalysis.findFirst({
      where: { shareId: 'msTBQWZlI0' },
      select: {
        id: true,
        userId: true,
        shareId: true,
        isPublic: true,
        createdAt: true,
        foods: {
          select: {
            name: true,
            protein: true,
          },
        },
      },
    });

    if (specificMeal) {
      console.log('✅ Meal found:', JSON.stringify(specificMeal, null, 2));
    } else {
      console.log('❌ Meal with shareId "msTBQWZlI0" not found in database');
      
      // Check recent meals
      console.log('\n📊 Recent 10 meals in database:');
      const recentMeals = await prisma.mealAnalysis.findMany({
        select: {
          id: true,
          shareId: true,
          isPublic: true,
          createdAt: true,
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      
      console.table(recentMeals);
    }
  } else {
    console.log('📝 Meals without shareId:');
    mealsWithoutShareId.forEach((meal, idx) => {
      console.log(`${idx + 1}. ID: ${meal.id}, Created: ${meal.createdAt.toISOString()}, Public: ${meal.isPublic}`);
    });

    console.log('\n🔧 Fixing meals by generating shareIds...\n');

    let fixed = 0;
    let failed = 0;

    for (const meal of mealsWithoutShareId) {
      try {
        const newShareId = generateShareId();
        await prisma.mealAnalysis.update({
          where: { id: meal.id },
          data: { 
            shareId: newShareId,
            isPublic: meal.isPublic ?? true, // Ensure isPublic is set
          },
        });
        console.log(`✅ Fixed meal ${meal.id}: assigned shareId "${newShareId}"`);
        fixed++;
      } catch (error) {
        console.error(`❌ Failed to fix meal ${meal.id}:`, error);
        failed++;
      }
    }

    console.log(`\n✅ Fixed ${fixed} meals`);
    if (failed > 0) {
      console.log(`❌ Failed to fix ${failed} meals`);
    }
  }
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
