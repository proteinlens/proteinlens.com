/**
 * Calculator Page (Feature 015)
 * 
 * Admin page for managing protein calculator configuration
 */
import { useState, useEffect, useCallback } from 'react';
import { MultiplierEditor } from '../components/MultiplierEditor';
import { MealSplitEditor } from '../components/MealSplitEditor';
import { ConfigEditor } from '../components/ConfigEditor';
import {
  getMultipliers,
  updateMultiplier,
  getProteinConfig,
  updateProteinConfig,
  type Multiplier,
  type ProteinConfig,
  type UpdateMultiplierRequest,
  type UpdateConfigRequest,
} from '../services/calculatorApi';

export function CalculatorPage() {
  const [multipliers, setMultipliers] = useState<Multiplier[]>([]);
  const [config, setConfig] = useState<ProteinConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [multipliersRes, configRes] = await Promise.all([
        getMultipliers(),
        getProteinConfig(),
      ]);
      setMultipliers(multipliersRes.presets);
      setConfig(configRes);
    } catch (err) {
      console.error('Failed to load protein settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdateMultiplier = async (request: UpdateMultiplierRequest) => {
    const updated = await updateMultiplier(request);
    setMultipliers((prev) =>
      prev.map((m) =>
        m.trainingLevel === updated.trainingLevel && m.goal === updated.goal
          ? updated
          : m
      )
    );
  };

  const handleUpdateConfig = async (request: UpdateConfigRequest) => {
    const updated = await updateProteinConfig(request);
    setConfig(updated);
  };

  const handleUpdateMealSplits = async (mealSplits: Record<string, number[]>) => {
    const updated = await updateProteinConfig({ mealSplits });
    setConfig(updated);
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <svg
            className="mx-auto h-12 w-12 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-red-800">
            Failed to Load Settings
          </h3>
          <p className="mt-2 text-sm text-red-600">{error}</p>
          <button
            onClick={loadData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Protein Calculator Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage protein multipliers, meal splits, and global configuration
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Global Settings */}
      <ConfigEditor
        config={config}
        onUpdate={handleUpdateConfig}
        isLoading={loading}
      />

      {/* Multipliers */}
      <MultiplierEditor
        multipliers={multipliers}
        onUpdate={handleUpdateMultiplier}
        isLoading={loading}
      />

      {/* Meal Splits */}
      <MealSplitEditor
        mealSplits={config?.mealSplits || {}}
        onUpdate={handleUpdateMealSplits}
        isLoading={loading}
      />
    </div>
  );
}
