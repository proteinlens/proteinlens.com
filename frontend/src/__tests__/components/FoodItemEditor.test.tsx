import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FoodItemEditor } from '@/components/FoodItemEditor';
import React from 'react';

describe('FoodItemEditor', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
      },
    });
  });

  const mockFoodItem = {
    id: 'food-1',
    name: 'Grilled Chicken',
    portion: '150g',
    proteinGrams: 28,
    confidence: 95,
    aiDetected: true,
    isEdited: false,
  };

  const renderEditor = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <FoodItemEditor
          foodItem={mockFoodItem}
          onSave={vi.fn()}
          onCancel={vi.fn()}
          {...props}
        />
      </QueryClientProvider>
    );
  };

  it('should render food item in editable form', () => {
    renderEditor();

    const nameInput = screen.getByDisplayValue('Grilled Chicken');
    const portionInput = screen.getByDisplayValue('150g');
    const proteinInput = screen.getByDisplayValue('28');

    expect(nameInput).toBeInTheDocument();
    expect(portionInput).toBeInTheDocument();
    expect(proteinInput).toBeInTheDocument();
  });

  it('should call onCancel when Cancel button clicked', async () => {
    const onCancel = vi.fn();
    renderEditor({ onCancel });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await userEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalled();
  });

  it('should submit form with updated values on Save', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    renderEditor({ onSave });

    const nameInput = screen.getByDisplayValue('Grilled Chicken');
    const proteinInput = screen.getByDisplayValue('28');

    // Update values
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Roasted Chicken');
    
    await userEvent.clear(proteinInput);
    await userEvent.type(proteinInput, '32');

    const saveButton = screen.getByRole('button', { name: /save/i });
    await userEvent.click(saveButton);

    expect(onSave).toHaveBeenCalledWith({
      name: 'Roasted Chicken',
      portion: '150g',
      proteinGrams: 32,
    });
  });

  it('should support Enter key to submit', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    renderEditor({ onSave });

    const nameInput = screen.getByDisplayValue('Grilled Chicken') as HTMLInputElement;

    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'New Name{Enter}');

    expect(onSave).toHaveBeenCalled();
  });

  it('should support Escape key to cancel', async () => {
    const onCancel = vi.fn();
    renderEditor({ onCancel });

    const nameInput = screen.getByDisplayValue('Grilled Chicken');

    await userEvent.type(nameInput, '{Escape}');

    expect(onCancel).toHaveBeenCalled();
  });

  it('should validate protein input as number', async () => {
    renderEditor();

    const proteinInput = screen.getByDisplayValue('28') as HTMLInputElement;

    await userEvent.clear(proteinInput);
    await userEvent.type(proteinInput, 'invalid');

    // Input type number should not accept non-numeric
    expect(proteinInput.value).not.toBe('invalid');
  });

  it('should show AI detected indicator when applicable', () => {
    renderEditor();

    expect(screen.getByText(/AI detected/i)).toBeInTheDocument();
  });

  it('should disable Save button while submitting', async () => {
    const onSave = vi.fn(
      () =>
        new Promise((resolve) => {
          setTimeout(resolve, 100);
        })
    );
    renderEditor({ onSave });

    const saveButton = screen.getByRole('button', { name: /save/i });

    await userEvent.click(saveButton);

    expect(saveButton).toBeDisabled();
  });

  it('should focus name input on mount', () => {
    renderEditor();

    const nameInput = screen.getByDisplayValue('Grilled Chicken') as HTMLInputElement;

    expect(nameInput).toHaveFocus();
  });
});
