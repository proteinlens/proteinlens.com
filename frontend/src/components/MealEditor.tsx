// MealEditor Component - Edit food items in meal analysis
// Feature: 001-blob-vision-analysis, User Story 2
// T056-T058: Editable food list with inline editing

import React, { useState, useCallback } from 'react';
import { FoodItem, MealCorrections, apiClient } from '../services/apiClient';
import './MealEditor.css';

interface MealEditorProps {
  mealId: string;
  foods: FoodItem[];
  totalProtein: number;
  originalFoods?: FoodItem[];
  onSave?: (corrections: MealCorrections) => void;
  onCancel?: () => void;
}

interface EditableFood extends FoodItem {
  isEdited: boolean;
}

export const MealEditor: React.FC<MealEditorProps> = ({
  mealId,
  foods,
  totalProtein: initialTotalProtein,
  originalFoods,
  onSave,
  onCancel,
}) => {
  const [editableFoods, setEditableFoods] = useState<EditableFood[]>(
    foods.map(f => ({ ...f, isEdited: false }))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Calculate total protein from edited foods
  const calculatedTotal = editableFoods.reduce((sum, f) => sum + f.protein, 0);

  // T057: Handle inline editing for food fields
  const handleFoodChange = useCallback((index: number, field: keyof FoodItem, value: string | number) => {
    setEditableFoods(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: field === 'protein' ? Number(value) || 0 : value,
        isEdited: true,
      };
      return updated;
    });
    setHasChanges(true);
    setError(null);
  }, []);

  // Add new food item
  const handleAddFood = useCallback(() => {
    setEditableFoods(prev => [
      ...prev,
      { name: '', portion: '', protein: 0, isEdited: true },
    ]);
    setHasChanges(true);
  }, []);

  // Remove food item
  const handleRemoveFood = useCallback((index: number) => {
    setEditableFoods(prev => prev.filter((_, i) => i !== index));
    setHasChanges(true);
  }, []);

  // T058: Save corrections
  const handleSave = async () => {
    // Validate
    const invalidFoods = editableFoods.filter(f => !f.name.trim() || f.protein < 0);
    if (invalidFoods.length > 0) {
      setError('Please ensure all foods have names and valid protein values');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const corrections: MealCorrections = {
        foods: editableFoods.map(({ name, portion, protein }) => ({
          name,
          portion,
          protein,
        })),
        totalProtein: calculatedTotal,
      };

      await apiClient.updateMeal(mealId, corrections);
      
      // Update edited state
      setEditableFoods(prev => prev.map(f => ({ ...f, isEdited: false })));
      setHasChanges(false);
      
      onSave?.(corrections);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save corrections');
    } finally {
      setSaving(false);
    }
  };

  // Reset to original values
  const handleReset = useCallback(() => {
    if (originalFoods) {
      setEditableFoods(originalFoods.map(f => ({ ...f, isEdited: false })));
    } else {
      setEditableFoods(foods.map(f => ({ ...f, isEdited: false })));
    }
    setHasChanges(false);
    setError(null);
  }, [foods, originalFoods]);

  return (
    <div className="meal-editor">
      <div className="meal-editor__header">
        <h3 className="meal-editor__title">Edit Analysis</h3>
        <p className="meal-editor__subtitle">
          Correct the AI's analysis by editing food items below
        </p>
      </div>

      <div className="meal-editor__foods">
        {editableFoods.map((food, index) => (
          <div 
            key={index} 
            className={`meal-editor__food ${food.isEdited ? 'meal-editor__food--edited' : ''}`}
          >
            {/* T59: Visual distinction for edited items */}
            {food.isEdited && (
              <span className="meal-editor__edited-badge" title="Edited">✏️</span>
            )}
            
            <div className="meal-editor__food-fields">
              <input
                type="text"
                className="meal-editor__input meal-editor__input--name"
                placeholder="Food name"
                value={food.name}
                onChange={(e) => handleFoodChange(index, 'name', e.target.value)}
              />
              <input
                type="text"
                className="meal-editor__input meal-editor__input--portion"
                placeholder="Portion"
                value={food.portion}
                onChange={(e) => handleFoodChange(index, 'portion', e.target.value)}
              />
              <div className="meal-editor__protein-input">
                <input
                  type="number"
                  className="meal-editor__input meal-editor__input--protein"
                  placeholder="0"
                  min="0"
                  max="500"
                  step="0.1"
                  value={food.protein}
                  onChange={(e) => handleFoodChange(index, 'protein', e.target.value)}
                />
                <span className="meal-editor__unit">g</span>
              </div>
            </div>
            
            <button
              type="button"
              className="meal-editor__remove-btn"
              onClick={() => handleRemoveFood(index)}
              title="Remove food"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="meal-editor__add-btn"
        onClick={handleAddFood}
      >
        + Add Food Item
      </button>

      <div className="meal-editor__total">
        <span className="meal-editor__total-label">Total Protein:</span>
        <span className="meal-editor__total-value">
          {calculatedTotal.toFixed(1)}g
          {calculatedTotal !== initialTotalProtein && (
            <span className="meal-editor__total-change">
              (was {initialTotalProtein.toFixed(1)}g)
            </span>
          )}
        </span>
      </div>

      {error && (
        <div className="meal-editor__error">
          {error}
        </div>
      )}

      <div className="meal-editor__actions">
        <button
          type="button"
          className="meal-editor__btn meal-editor__btn--secondary"
          onClick={handleReset}
          disabled={saving || !hasChanges}
        >
          Reset
        </button>
        {onCancel && (
          <button
            type="button"
            className="meal-editor__btn meal-editor__btn--secondary"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          className="meal-editor__btn meal-editor__btn--primary"
          onClick={handleSave}
          disabled={saving || !hasChanges}
        >
          {saving ? 'Saving...' : 'Save Corrections'}
        </button>
      </div>
    </div>
  );
};

export default MealEditor;
