// Diet Style Form component
// Feature: 017-shareable-meals-diets
// T044: Form for creating/editing diet styles

import { useState, useEffect } from 'react';
import type { DietStyleItem } from '../services/adminApi';

interface DietStyleFormProps {
  initialData?: DietStyleItem | null;
  onSubmit: (data: DietStyleFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export interface DietStyleFormData {
  slug: string;
  name: string;
  description: string;
  netCarbCapG: number | null;
  fatTargetPercent: number | null;
  isActive: boolean;
  sortOrder: number;
}

export function DietStyleForm({ initialData, onSubmit, onCancel, isSubmitting }: DietStyleFormProps) {
  const [formData, setFormData] = useState<DietStyleFormData>({
    slug: '',
    name: '',
    description: '',
    netCarbCapG: null,
    fatTargetPercent: null,
    isActive: true,
    sortOrder: 0,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof DietStyleFormData, string>>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        slug: initialData.slug,
        name: initialData.name,
        description: initialData.description,
        netCarbCapG: initialData.netCarbCapG,
        fatTargetPercent: initialData.fatTargetPercent,
        isActive: initialData.isActive,
        sortOrder: initialData.sortOrder,
      });
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof DietStyleFormData, string>> = {};

    if (!formData.slug || formData.slug.length < 2) {
      newErrors.slug = 'Slug must be at least 2 characters';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug must be lowercase letters, numbers, and hyphens only';
    }

    if (!formData.name || formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.description || formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (formData.netCarbCapG !== null && formData.netCarbCapG < 0) {
      newErrors.netCarbCapG = 'Carb cap must be non-negative';
    }

    if (formData.fatTargetPercent !== null && (formData.fatTargetPercent < 0 || formData.fatTargetPercent > 100)) {
      newErrors.fatTargetPercent = 'Fat target must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleNumberChange = (field: 'netCarbCapG' | 'fatTargetPercent' | 'sortOrder', value: string) => {
    if (value === '' && field !== 'sortOrder') {
      setFormData(prev => ({ ...prev, [field]: null }));
    } else {
      const num = parseInt(value, 10);
      if (!isNaN(num)) {
        setFormData(prev => ({ ...prev, [field]: num }));
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slug *
          </label>
          <input
            type="text"
            value={formData.slug}
            onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase() }))}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.slug ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., ketogenic"
            disabled={!!initialData} // Don't allow slug change on edit
          />
          {errors.slug && <p className="mt-1 text-sm text-red-500">{errors.slug}</p>}
          <p className="mt-1 text-xs text-gray-500">Unique identifier (cannot be changed after creation)</p>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Display Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., Ketogenic Diet"
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <textarea
          value={formData.description}
          onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          rows={3}
          placeholder="Describe this diet style and its goals..."
        />
        {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Net Carb Cap */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Daily Carb Cap (g)
          </label>
          <input
            type="number"
            value={formData.netCarbCapG ?? ''}
            onChange={e => handleNumberChange('netCarbCapG', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.netCarbCapG ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., 30"
            min={0}
          />
          {errors.netCarbCapG && <p className="mt-1 text-sm text-red-500">{errors.netCarbCapG}</p>}
          <p className="mt-1 text-xs text-gray-500">Leave empty for no limit</p>
        </div>

        {/* Fat Target Percent */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fat Target (%)
          </label>
          <input
            type="number"
            value={formData.fatTargetPercent ?? ''}
            onChange={e => handleNumberChange('fatTargetPercent', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.fatTargetPercent ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., 70"
            min={0}
            max={100}
          />
          {errors.fatTargetPercent && <p className="mt-1 text-sm text-red-500">{errors.fatTargetPercent}</p>}
          <p className="mt-1 text-xs text-gray-500">Target fat as % of calories (0-100)</p>
        </div>

        {/* Sort Order */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sort Order
          </label>
          <input
            type="number"
            value={formData.sortOrder}
            onChange={e => handleNumberChange('sortOrder', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            min={0}
          />
          <p className="mt-1 text-xs text-gray-500">Lower numbers appear first</p>
        </div>
      </div>

      {/* Active Toggle */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
          className="h-4 w-4 text-green-500 focus:ring-green-500 border-gray-300 rounded"
        />
        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
          Active (visible to users)
        </label>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : initialData ? 'Update Diet Style' : 'Create Diet Style'}
        </button>
      </div>
    </form>
  );
}
