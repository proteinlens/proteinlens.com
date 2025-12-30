/**
 * PresetEditor Component (Feature 015)
 * 
 * Table/form for editing protein multiplier presets
 */
import { useState } from 'react';
import type { ProteinPreset, TrainingLevel, ProteinGoal, UpdatePresetRequest } from '../services/adminProteinApi';

interface PresetEditorProps {
  presets: ProteinPreset[];
  onUpdate: (request: UpdatePresetRequest) => Promise<void>;
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

export function PresetEditor({ presets, onUpdate, isLoading }: PresetEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const handleEdit = (preset: ProteinPreset) => {
    setEditingId(preset.id);
    setEditValue(preset.multiplierGPerKg.toString());
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleSave = async (preset: ProteinPreset) => {
    const value = parseFloat(editValue);
    if (isNaN(value) || value <= 0 || value > 3.0) {
      alert('Multiplier must be greater than 0 and no more than 3.0 g/kg');
      return;
    }

    setSaving(true);
    try {
      await onUpdate({
        trainingLevel: preset.trainingLevel,
        goal: preset.goal,
        multiplierGPerKg: value,
      });
      setEditingId(null);
      setEditValue('');
    } catch (error) {
      console.error('Failed to update preset:', error);
      alert(error instanceof Error ? error.message : 'Failed to update preset');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Protein Multiplier Presets</h2>
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
        <h2 className="text-lg font-semibold text-gray-900">Protein Multiplier Presets</h2>
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
            {presets.map((preset) => (
              <tr key={preset.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {TRAINING_LABELS[preset.trainingLevel]}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {GOAL_LABELS[preset.goal]}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === preset.id ? (
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
                      {preset.multiplierGPerKg.toFixed(1)}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      preset.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {preset.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {editingId === preset.id ? (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleSave(preset)}
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
                      onClick={() => handleEdit(preset)}
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
