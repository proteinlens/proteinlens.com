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
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Protein Multipliers</h2>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-10 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Protein Multipliers</h2>
        <p className="text-sm text-gray-500 mt-1">
          Configure protein multipliers (g per kg body weight) for each training level and goal combination
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Training Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Goal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Multiplier (g/kg)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {multipliers.map((multiplier) => (
              <tr key={multiplier.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {TRAINING_LABELS[multiplier.trainingLevel]}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
                      className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-900">
                      {multiplier.multiplierGPerKg.toFixed(1)}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      multiplier.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {multiplier.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {editingId === multiplier.id ? (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleSave(multiplier)}
                        disabled={saving}
                        className="text-green-600 hover:text-green-900 disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={saving}
                        className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEdit(multiplier)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
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
