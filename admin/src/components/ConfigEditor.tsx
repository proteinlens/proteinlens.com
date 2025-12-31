/**
 * ConfigEditor Component (Feature 015)
 * 
 * Editor for protein calculator global config (min/max protein, default meals)
 */
import { useState } from 'react';
import type { ProteinConfig, UpdateConfigRequest } from '../services/calculatorApi';

interface ConfigEditorProps {
  config: ProteinConfig | null;
  onUpdate: (request: UpdateConfigRequest) => Promise<void>;
  isLoading?: boolean;
}

export function ConfigEditor({ config, onUpdate, isLoading }: ConfigEditorProps) {
  const [editing, setEditing] = useState(false);
  const [minGDay, setMinGDay] = useState<string>('');
  const [maxGDay, setMaxGDay] = useState<string>('');
  const [defaultMeals, setDefaultMeals] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const handleEdit = () => {
    if (config) {
      setMinGDay(config.minGDay.toString());
      setMaxGDay(config.maxGDay.toString());
      setDefaultMeals(config.defaultMealsPerDay.toString());
    }
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
  };

  const handleSave = async () => {
    const min = parseInt(minGDay, 10);
    const max = parseInt(maxGDay, 10);
    const meals = parseInt(defaultMeals, 10);

    if (isNaN(min) || min < 10 || min > 100) {
      alert('Minimum protein must be between 10 and 100g');
      return;
    }
    if (isNaN(max) || max < 100 || max > 500) {
      alert('Maximum protein must be between 100 and 500g');
      return;
    }
    if (min >= max) {
      alert('Minimum must be less than maximum');
      return;
    }
    if (isNaN(meals) || meals < 2 || meals > 5) {
      alert('Default meals must be between 2 and 5');
      return;
    }

    setSaving(true);
    try {
      await onUpdate({
        minGDay: min,
        maxGDay: max,
        defaultMealsPerDay: meals,
      });
      setEditing(false);
    } catch (error) {
      console.error('Failed to update config:', error);
      alert(error instanceof Error ? error.message : 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-green-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">⚙️</span>
          <h2 className="text-lg font-bold text-green-900">Global Settings</h2>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-10 bg-green-100 rounded-xl w-1/2" />
          <div className="h-10 bg-green-100 rounded-xl w-1/2" />
          <div className="h-10 bg-green-100 rounded-xl w-1/3" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-green-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-green-100 bg-gradient-to-r from-green-50 to-emerald-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚙️</span>
          <div>
            <h2 className="text-lg font-bold text-green-900">Global Settings</h2>
            <p className="text-sm text-green-600 mt-0.5">
              Configure protein calculator limits and defaults
            </p>
          </div>
        </div>
        {!editing && (
          <button
            onClick={handleEdit}
            className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-xl hover:bg-green-200 transition-colors"
          >
            ✏️ Edit
          </button>
        )}
      </div>

      <div className="p-6">
        {editing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-green-800 mb-1">
                  Minimum Daily Protein (g)
                </label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={minGDay}
                  onChange={(e) => setMinGDay(e.target.value)}
                  className="w-full px-3 py-2.5 border border-green-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <p className="text-xs text-green-600 mt-1">Range: 10-100g</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-green-800 mb-1">
                  Maximum Daily Protein (g)
                </label>
                <input
                  type="number"
                  min="100"
                  max="500"
                  value={maxGDay}
                  onChange={(e) => setMaxGDay(e.target.value)}
                  className="w-full px-3 py-2.5 border border-green-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <p className="text-xs text-green-600 mt-1">Range: 100-500g</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-green-800 mb-1">
                  Default Meals per Day
                </label>
                <select
                  value={defaultMeals}
                  onChange={(e) => setDefaultMeals(e.target.value)}
                  className="w-full px-3 py-2.5 border border-green-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="2">2 meals</option>
                  <option value="3">3 meals</option>
                  <option value="4">4 meals</option>
                  <option value="5">5 meals</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-green-100">
              <button
                onClick={handleCancel}
                disabled={saving}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {saving ? '⏳ Saving...' : '✓ Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
              <div className="text-sm text-green-600">Minimum Daily Protein</div>
              <div className="text-2xl font-bold text-green-900 mt-1">
                {config?.minGDay ?? '-'}g
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
              <div className="text-sm text-green-600">Maximum Daily Protein</div>
              <div className="text-2xl font-bold text-green-900 mt-1">
                {config?.maxGDay ?? '-'}g
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
              <div className="text-sm text-green-600">Default Meals per Day</div>
              <div className="text-2xl font-bold text-green-900 mt-1">
                {config?.defaultMealsPerDay ?? '-'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
