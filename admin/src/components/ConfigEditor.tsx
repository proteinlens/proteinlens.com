/**
 * ConfigEditor Component (Feature 015)
 * 
 * Editor for protein calculator global config (min/max protein, default meals)
 */
import { useState } from 'react';
import type { ProteinConfig, UpdateConfigRequest } from '../services/adminProteinApi';

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
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Global Settings</h2>
        <div className="animate-pulse space-y-3">
          <div className="h-10 bg-gray-200 rounded w-1/2" />
          <div className="h-10 bg-gray-200 rounded w-1/2" />
          <div className="h-10 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Global Settings</h2>
          <p className="text-sm text-gray-500 mt-1">
            Configure protein calculator limits and defaults
          </p>
        </div>
        {!editing && (
          <button
            onClick={handleEdit}
            className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800"
          >
            Edit
          </button>
        )}
      </div>

      <div className="p-6">
        {editing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Daily Protein (g)
                </label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={minGDay}
                  onChange={(e) => setMinGDay(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Range: 10-100g</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Daily Protein (g)
                </label>
                <input
                  type="number"
                  min="100"
                  max="500"
                  value={maxGDay}
                  onChange={(e) => setMaxGDay(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Range: 100-500g</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Meals per Day
                </label>
                <select
                  value={defaultMeals}
                  onChange={(e) => setDefaultMeals(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="2">2 meals</option>
                  <option value="3">3 meals</option>
                  <option value="4">4 meals</option>
                  <option value="5">5 meals</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <button
                onClick={handleCancel}
                disabled={saving}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500">Minimum Daily Protein</div>
              <div className="text-2xl font-semibold text-gray-900 mt-1">
                {config?.minGDay ?? '-'}g
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500">Maximum Daily Protein</div>
              <div className="text-2xl font-semibold text-gray-900 mt-1">
                {config?.maxGDay ?? '-'}g
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500">Default Meals per Day</div>
              <div className="text-2xl font-semibold text-gray-900 mt-1">
                {config?.defaultMealsPerDay ?? '-'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
