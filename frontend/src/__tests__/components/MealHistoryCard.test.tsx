import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MealHistoryCard } from '@/components/MealHistoryCard';
import React from 'react';

describe('MealHistoryCard', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
      },
    });
  });

  const mockMeal = {
    id: 'meal-1',
    userId: 'user-1',
    uploadedAt: new Date('2024-01-15T12:00:00').toISOString(),
    imageUrl: 'https://example.com/meal.jpg',
    analysis: {
      foods: [
        { id: '1', name: 'Chicken', proteinGrams: 25, confidence: 95, aiDetected: true, isEdited: false },
        { id: '2', name: 'Rice', proteinGrams: 5, confidence: 90, aiDetected: true, isEdited: false },
      ],
      totalProtein: 30,
    },
    corrections: [],
  };

  const renderCard = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MealHistoryCard
          meal={mockMeal}
          onMealDelete={vi.fn()}
          {...props}
        />
      </QueryClientProvider>
    );
  };

  it('should render meal thumbnail', () => {
    renderCard();

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', 'https://example.com/meal.jpg');
  });

  it('should display total protein', () => {
    renderCard();

    expect(screen.getByText(/30g/)).toBeInTheDocument();
  });

  it('should display food count', () => {
    renderCard();

    expect(screen.getByText(/2 items/)).toBeInTheDocument();
  });

  it('should display formatted timestamp', () => {
    renderCard();

    expect(screen.getByText(/Jan 15/)).toBeInTheDocument();
  });

  it('should show delete button on hover', async () => {
    const { container } = renderCard();

    const card = container.firstChild;
    
    // Initially delete button should be hidden or not visible
    // After hover, it should appear
    if (card) {
      fireEvent.mouseEnter(card);
      // Wait for delete button to appear
      expect(screen.queryByRole('button', { name: /delete/i })).toBeTruthy();
    }
  });

  it('should call onMealDelete with meal ID', async () => {
    const onMealDelete = vi.fn();
    renderCard({ onMealDelete });

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteButton);

    // Should show confirmation dialog
    expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();

    // Confirm delete
    const confirmButton = screen.getByRole('button', { name: /confirm|yes|delete/i });
    await userEvent.click(confirmButton);

    // Wait for callback
    expect(onMealDelete).toHaveBeenCalledWith('meal-1');
  });

  it('should cancel delete on Cancel button', async () => {
    const onMealDelete = vi.fn();
    renderCard({ onMealDelete });

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteButton);

    expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await userEvent.click(cancelButton);

    // onMealDelete should not be called
    expect(onMealDelete).not.toHaveBeenCalled();

    // Dialog should disappear
    expect(screen.queryByText(/Are you sure/i)).not.toBeInTheDocument();
  });

  it('should display food items on expanded view', async () => {
    renderCard();

    // Click on card to expand
    const cardContent = screen.getByText('Chicken');
    fireEvent.click(cardContent);

    expect(screen.getByText('Chicken')).toBeInTheDocument();
    expect(screen.getByText('Rice')).toBeInTheDocument();
  });

  it('should show confidence badges for low confidence items', () => {
    const mealWithLowConfidence = {
      ...mockMeal,
      analysis: {
        ...mockMeal.analysis,
        foods: [
          { id: '1', name: 'Mystery Food', proteinGrams: 20, confidence: 75, aiDetected: true, isEdited: false },
        ],
      },
    };

    renderCard({ meal: mealWithLowConfidence });

    expect(screen.getByText(/75%/)).toBeInTheDocument();
  });

  it('should format large protein values correctly', () => {
    const mealLargeProtein = {
      ...mockMeal,
      analysis: {
        ...mockMeal.analysis,
        totalProtein: 120,
      },
    };

    renderCard({ meal: mealLargeProtein });

    expect(screen.getByText(/120g/)).toBeInTheDocument();
  });
});

function fireEvent(params: {
  mouseEnter: (card: Element) => void;
  click: (element: HTMLElement) => void;
}): void;
