/**
 * MealSplitEditor Component (Feature 015)
 * 
 * Editor for configuring meal split percentages
 */
import { useState, useEffect } from 'react';

interface MealSplitEditorProps {
  mealSplits: Record<string, number[]>;
  onUpdate: (mealSplits: Record<string, number[]>) => Promise<void>;
  isLoading?: boolean;
}

const MEAL_LABELS = ['Breakfast', 'Lunch', 'Snack', 'Dinner', 'Evening'];

export function MealSplitEditor({ mealSplits, onUpdate, isLoading }: MealSplitEditorProps) {
  const [editingSplit, setEditingSplit] = useState<string | null>(null);
  const [splitValues, setSplitValues] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  const sortedKeys = ['2', '3', '4', '5'];

  useEffect(() => {
    if (editingSplit && mealSplits[editingSplit]) {
      setSplitValues([...mealSplits[editingSplit]]);
    }
  }, [editingSplit, mealSplits]);

  const handleEdit = (key: string) => {
    setEditingSplit(key);
    setSplitValues([...(mealSplits[key] || [])]);
  };

  const handleCancel = () => {
    setEditingSplit(null);
    setSplitValues([]);
  };

  const handleValueChange = (index: number, value: string) => {
    const numValue = parseInt(value, 10) || 0;
    const newValues = [...splitValues];
    newValues[index] = numValue;
    setSplitValues(newValues);
  };

  const getTotalPercentage = () => {
    return splitValues.reduce((sum, val) => sum + val, 0);
  };

  const handleSave = async () => {
    const total = getTotalPercentage();
    if (total !== 100) {
      alert(`Percentages must sum to 100%. Current total: ${total}%`);
      return;
    }

    if (!editingSplit) return;

    setSaving(true);
    try {
      const newSplits = { ...mealSplits, [editingSplit]: splitValues };
      await onUpdate(newSplits);
      setEditingSplit(null);
      setSplitValues([]);
    } catch (error) {
      console.error('Failed to update meal splits:', error);
      alert(error instanceof Error ? error.message : 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-green-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🍽️</span>
          <h2 className="text-lg font-bold text-green-900">Meal Split Configuration</h2>
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-green-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-green-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-green-100 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🍽️</span>
          <div>
            <h2 className="text-lg font-bold text-green-900">Meal Split Configuration</h2>
            <p className="text-sm text-green-600 mt-0.5">
              Configure how daily protein is distributed across meals (must total 100%)
            </p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-green-100">
        {sortedKeys.map((key) => {
          const splits = mealSplits[key] || [];
          const numMeals = parseInt(key, 10);
          const mealLabels = MEAL_LABELS.slice(0, numMeals);
          const isEditing = editingSplit === key;

          return (
            <div key={key} className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-green-900">
                  {numMeals} Meals per Day
                </h3>
                {isEditing ? (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-3 py-1.5 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      {saving ? '⏳ Saving...' : '✓ Save'}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleEdit(key)}
                    className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    ✏️ Edit
                  </button>
                )}
              </div>

              {isEditing ? (
                <div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {mealLabels.map((label, index) => (
                      <div key={label}>
                        <label className="block text-xs font-medium text-green-700 mb-1">
                          {label}
                        </label>
                        <div className="flex items-center">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={splitValues[index] || 0}
                            onChange={(e) => handleValueChange(index, e.target.value)}
                            className="w-16 px-2 py-1.5 border border-green-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          />
                          <span className="ml-1 text-green-600">%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-sm">
                    <span
                      className={
                        getTotalPercentage() === 100
                          ? 'text-green-600 font-medium'
                          : 'text-red-600 font-medium'
                      }
                    >
                      Total: {getTotalPercentage()}%
                      {getTotalPercentage() !== 100 && ' (must equal 100%)'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {mealLabels.map((label, index) => (
                    <div
                      key={label}
                      className="flex items-center gap-2 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 px-3 py-2 rounded-lg"
                    >
                      <span className="text-xs text-green-600">{label}</span>
                      <span className="text-sm font-bold text-green-900">
                        {splits[index] || 0}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
