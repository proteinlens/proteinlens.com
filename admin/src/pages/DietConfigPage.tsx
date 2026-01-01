// Diet Configuration Page
// Feature: 017-shareable-meals-diets
// T043: Admin page for managing diet styles

import { useState } from 'react';
import { useAdminDietStyles, useCreateDietStyle, useUpdateDietStyle, useDeleteDietStyle } from '../hooks/useAdminDietStyles';
import { DietStyleForm, type DietStyleFormData } from '../components/DietStyleForm';
import type { DietStyleItem } from '../services/adminApi';

export function DietConfigPage() {
  const { data, isLoading, error } = useAdminDietStyles();
  const createMutation = useCreateDietStyle();
  const updateMutation = useUpdateDietStyle();
  const deleteMutation = useDeleteDietStyle();

  const [showForm, setShowForm] = useState(false);
  const [editingStyle, setEditingStyle] = useState<DietStyleItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = () => {
    setEditingStyle(null);
    setShowForm(true);
  };

  const handleEdit = (style: DietStyleItem) => {
    setEditingStyle(style);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to deactivate this diet style? Users will no longer see it.')) {
      setDeletingId(id);
      try {
        await deleteMutation.mutateAsync(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleSubmit = async (formData: DietStyleFormData) => {
    try {
      if (editingStyle) {
        await updateMutation.mutateAsync({
          id: editingStyle.id,
          params: formData,
        });
      } else {
        await createMutation.mutateAsync(formData);
      }
      setShowForm(false);
      setEditingStyle(null);
    } catch (err) {
      console.error('Failed to save diet style:', err);
      alert('Failed to save diet style. Please try again.');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingStyle(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Failed to load diet styles: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Diet Configuration</h1>
          <p className="text-gray-500 mt-1">Manage diet style options available to users</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
        >
          <span>+</span>
          <span>Add Diet Style</span>
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingStyle ? 'Edit Diet Style' : 'Create Diet Style'}
              </h2>
              <DietStyleForm
                initialData={editingStyle}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSubmitting={createMutation.isPending || updateMutation.isPending}
              />
            </div>
          </div>
        </div>
      )}

      {/* Diet Styles Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Diet Style
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Constraints
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Users
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.dietStyles.map((style) => (
                <tr key={style.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{style.name}</div>
                      <div className="text-sm text-gray-500">
                        <code className="text-xs bg-gray-100 px-1 rounded">{style.slug}</code>
                      </div>
                      <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {style.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1 text-sm">
                      {style.netCarbCapG !== null && (
                        <div className="flex items-center gap-2">
                          <span className="text-orange-500">🍞</span>
                          <span>Max {style.netCarbCapG}g carbs/day</span>
                        </div>
                      )}
                      {style.fatTargetPercent !== null && (
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-500">🥑</span>
                          <span>{style.fatTargetPercent}% fat target</span>
                        </div>
                      )}
                      {style.netCarbCapG === null && style.fatTargetPercent === null && (
                        <span className="text-gray-400 italic">No constraints</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-gray-900 font-medium">{style.usersCount}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {style.isActive ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(style)}
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      {style.isActive && (
                        <button
                          onClick={() => handleDelete(style.id)}
                          disabled={deletingId === style.id}
                          className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                          title="Deactivate"
                        >
                          {deletingId === style.id ? '...' : '🗑️'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {data?.dietStyles.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No diet styles configured yet. Click "Add Diet Style" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-700">
        <h3 className="font-medium mb-2">💡 About Diet Styles</h3>
        <p className="text-sm">
          Diet styles allow users to get personalized feedback on their meals based on their dietary preferences.
          When a user selects a diet style, they'll receive warnings if their meal exceeds the configured carb cap.
          Changes to diet styles are reflected immediately for all users.
        </p>
      </div>
    </div>
  );
}
