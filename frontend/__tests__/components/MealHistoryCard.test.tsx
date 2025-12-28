import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MealHistoryCard } from '@/components/history/MealHistoryCard';
import React from 'react';

const mutateAsync = vi.fn().mockResolvedValue(undefined);

vi.mock('@/hooks/useMeal', () => ({
  useDeleteMeal: () => ({
    mutateAsync,
    isPending: false,
  }),
}));

describe('MealHistoryCard', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
      },
    });
    mutateAsync.mockClear();
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
          mealId="meal-1"
          meal={mockMeal}
          onDelete={vi.fn()}
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

    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText(/grams/i)).toBeInTheDocument();
  });

  it('should display food count', () => {
    renderCard();

    expect(screen.getByText(/2 items/)).toBeInTheDocument();
  });

  it('should display formatted timestamp', () => {
    renderCard();

    expect(screen.getByText(/12:00 PM/)).toBeInTheDocument();
  });

  it('should show delete button on hover', async () => {
    renderCard();

    expect(screen.getByTitle('Delete meal')).toBeInTheDocument();
  });

  it('should call onMealDelete with meal ID', async () => {
    const onDelete = vi.fn();
    renderCard({ onDelete });

    const deleteButton = screen.getByTitle('Delete meal');
    await userEvent.click(deleteButton);

    // Should show confirmation dialog
    expect(screen.getByText(/Delete this meal\?/i)).toBeInTheDocument();

    // Confirm delete
    const confirmButton = screen.getByRole('button', { name: /^Delete$/i });
    await userEvent.click(confirmButton);

    expect(mutateAsync).toHaveBeenCalledWith('meal-1');
    await waitFor(() => {
      expect(onDelete).toHaveBeenCalled();
    });
  });

  it('should cancel delete on Cancel button', async () => {
    const onDelete = vi.fn();
    renderCard({ onDelete });

    const deleteButton = screen.getByTitle('Delete meal');
    await userEvent.click(deleteButton);

    expect(screen.getByText(/Delete this meal\?/i)).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await userEvent.click(cancelButton);

    // onMealDelete should not be called
    expect(onDelete).not.toHaveBeenCalled();

    // Dialog should disappear
    expect(screen.queryByText(/Delete this meal\?/i)).not.toBeInTheDocument();
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

    expect(screen.getByText('120')).toBeInTheDocument();
  });
});
