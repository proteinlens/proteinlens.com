/**
 * MultiplierEditor Component (Feature 015)
 * 
 * Table/form for editing protein multipliers
 */
import { useState } from 'react';
import type { Multiplier, TrainingLevel, ProteinGoal, UpdateMultiplierRequest } from '../services/calculatorApi';

interface MultiplierEditorProps {
  multipliers: Multiplier[];
  onUpdate: (request: UpdateMultiplierRequest) => Promise<void>;
  isLoading?: boolean;
}

const TRAINING_LABELS: Record<TrainingLevel, string> = {
  none: 'No Training',
  regular: 'Regular Training',
};

const GOAL_LABELS: Record<ProteinGoal, string> = {
  maintain: 'Maintain Weight',
  lose: 'Lose Weight',
  gain: 'Gain Muscle',
};

export function MultiplierEditor({ multipliers, onUpdate, isLoading }: MultiplierEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const handleEdit = (multiplier: Multiplier) => {
    setEditingId(multiplier.id);
    setEditValue(multiplier.multiplierGPerKg.toString());
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleSave = async (multiplier: Multiplier) => {
    const value = parseFloat(editValue);
    if (isNaN(value) || value <= 0 || value > 3.0) {
      alert('Multiplier must be greater than 0 and no more than 3.0 g/kg');
      return;
    }

    setSaving(true);
    try {
      await onUpdate({
        trainingLevel: multiplier.trainingLevel,
        goal: multiplier.goal,
        multiplierGPerKg: value,
      });
      setEditingId(null);
      setEditValue('');
    } catch (error) {
      console.error('Failed to update multiplier:', error);
      alert(error instanceof Error ? error.message : 'Failed to update multiplier');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-green-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">💪</span>
          <h2 className="text-lg font-bold text-green-900">Protein Multipliers</h2>
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-10 bg-green-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-green-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-green-100 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💪</span>
          <div>
            <h2 className="text-lg font-bold text-green-900">Protein Multipliers</h2>
            <p className="text-sm text-green-600 mt-0.5">
              Configure g per kg body weight for each training level and goal
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-green-100">
          <thead className="bg-green-50/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-green-700 uppercase tracking-wider">
                Training Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-green-700 uppercase tracking-wider">
                Goal
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-green-700 uppercase tracking-wider">
                Multiplier (g/kg)
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-green-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-green-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-green-100">
            {multipliers.map((multiplier) => (
              <tr key={multiplier.id} className="hover:bg-green-50/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-900">
                  {TRAINING_LABELS[multiplier.trainingLevel]}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-800">
                  {GOAL_LABELS[multiplier.goal]}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === multiplier.id ? (
                    <input
                      type="number"
                      step="0.1"
                      min="0.5"
                      max="5"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-24 px-3 py-1.5 border border-green-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      autoFocus
                    />
                  ) : (
                    <span className="text-sm font-bold text-green-900 bg-green-100 px-3 py-1 rounded-full">
                      {multiplier.multiplierGPerKg.toFixed(1)}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                      multiplier.active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {multiplier.active ? '✓ Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {editingId === multiplier.id ? (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleSave(multiplier)}
                        disabled={saving}
                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        {saving ? '⏳ Saving...' : '✓ Save'}
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={saving}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEdit(multiplier)}
                      className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200 transition-colors"
                    >
                      ✏️ Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
