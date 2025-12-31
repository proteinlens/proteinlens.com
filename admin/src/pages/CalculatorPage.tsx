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
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h3 className="text-lg font-bold text-red-800">
            Failed to Load Settings
          </h3>
          <p className="mt-2 text-sm text-red-600">{error}</p>
          <button
            onClick={loadData}
            className="mt-4 px-6 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-green-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25">
              <span className="text-2xl">🧮</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-green-900">
                Protein Calculator Settings
              </h1>
              <p className="text-sm text-green-600 mt-0.5">
                Manage multipliers, meal splits, and global configuration
              </p>
            </div>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 disabled:opacity-50 transition-colors"
          >
            {loading ? '⏳ Loading...' : '🔄 Refresh'}
          </button>
        </div>
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
