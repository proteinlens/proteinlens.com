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
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Meal Split Configuration</h2>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Meal Split Configuration</h2>
        <p className="text-sm text-gray-500 mt-1">
          Configure how daily protein is distributed across meals (percentages must total 100%)
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {sortedKeys.map((key) => {
          const splits = mealSplits[key] || [];
          const numMeals = parseInt(key, 10);
          const mealLabels = MEAL_LABELS.slice(0, numMeals);
          const isEditing = editingSplit === key;

          return (
            <div key={key} className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900">
                  {numMeals} Meals per Day
                </h3>
                {isEditing ? (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleEdit(key)}
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                )}
              </div>

              {isEditing ? (
                <div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {mealLabels.map((label, index) => (
                      <div key={label}>
                        <label className="block text-xs text-gray-500 mb-1">
                          {label}
                        </label>
                        <div className="flex items-center">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={splitValues[index] || 0}
                            onChange={(e) => handleValueChange(index, e.target.value)}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="ml-1 text-gray-500">%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-sm">
                    <span
                      className={
                        getTotalPercentage() === 100
                          ? 'text-green-600'
                          : 'text-red-600'
                      }
                    >
                      Total: {getTotalPercentage()}%
                      {getTotalPercentage() !== 100 && ' (must equal 100%)'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {mealLabels.map((label, index) => (
                    <div
                      key={label}
                      className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded"
                    >
                      <span className="text-xs text-gray-500">{label}</span>
                      <span className="text-sm font-medium text-gray-900">
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
