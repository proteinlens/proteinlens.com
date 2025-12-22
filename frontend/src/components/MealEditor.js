import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// MealEditor Component - Edit food items in meal analysis
// Feature: 001-blob-vision-analysis, User Story 2
// T056-T058: Editable food list with inline editing
import { useState, useCallback } from 'react';
import { apiClient } from '../services/apiClient';
import './MealEditor.css';
export const MealEditor = ({ mealId, foods, totalProtein: initialTotalProtein, originalFoods, onSave, onCancel, }) => {
    const [editableFoods, setEditableFoods] = useState(foods.map(f => ({ ...f, isEdited: false })));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);
    // Calculate total protein from edited foods
    const calculatedTotal = editableFoods.reduce((sum, f) => sum + f.protein, 0);
    // T057: Handle inline editing for food fields
    const handleFoodChange = useCallback((index, field, value) => {
        setEditableFoods(prev => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                [field]: field === 'protein' ? Number(value) || 0 : value,
                isEdited: true,
            };
            return updated;
        });
        setHasChanges(true);
        setError(null);
    }, []);
    // Add new food item
    const handleAddFood = useCallback(() => {
        setEditableFoods(prev => [
            ...prev,
            { name: '', portion: '', protein: 0, isEdited: true },
        ]);
        setHasChanges(true);
    }, []);
    // Remove food item
    const handleRemoveFood = useCallback((index) => {
        setEditableFoods(prev => prev.filter((_, i) => i !== index));
        setHasChanges(true);
    }, []);
    // T058: Save corrections
    const handleSave = async () => {
        // Validate
        const invalidFoods = editableFoods.filter(f => !f.name.trim() || f.protein < 0);
        if (invalidFoods.length > 0) {
            setError('Please ensure all foods have names and valid protein values');
            return;
        }
        setSaving(true);
        setError(null);
        try {
            const corrections = {
                foods: editableFoods.map(({ name, portion, protein }) => ({
                    name,
                    portion,
                    protein,
                })),
                totalProtein: calculatedTotal,
            };
            await apiClient.updateMeal(mealId, corrections);
            // Update edited state
            setEditableFoods(prev => prev.map(f => ({ ...f, isEdited: false })));
            setHasChanges(false);
            onSave?.(corrections);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save corrections');
        }
        finally {
            setSaving(false);
        }
    };
    // Reset to original values
    const handleReset = useCallback(() => {
        if (originalFoods) {
            setEditableFoods(originalFoods.map(f => ({ ...f, isEdited: false })));
        }
        else {
            setEditableFoods(foods.map(f => ({ ...f, isEdited: false })));
        }
        setHasChanges(false);
        setError(null);
    }, [foods, originalFoods]);
    return (_jsxs("div", { className: "meal-editor", children: [_jsxs("div", { className: "meal-editor__header", children: [_jsx("h3", { className: "meal-editor__title", children: "Edit Analysis" }), _jsx("p", { className: "meal-editor__subtitle", children: "Correct the AI's analysis by editing food items below" })] }), _jsx("div", { className: "meal-editor__foods", children: editableFoods.map((food, index) => (_jsxs("div", { className: `meal-editor__food ${food.isEdited ? 'meal-editor__food--edited' : ''}`, children: [food.isEdited && (_jsx("span", { className: "meal-editor__edited-badge", title: "Edited", children: "\u270F\uFE0F" })), _jsxs("div", { className: "meal-editor__food-fields", children: [_jsx("input", { type: "text", className: "meal-editor__input meal-editor__input--name", placeholder: "Food name", value: food.name, onChange: (e) => handleFoodChange(index, 'name', e.target.value) }), _jsx("input", { type: "text", className: "meal-editor__input meal-editor__input--portion", placeholder: "Portion", value: food.portion, onChange: (e) => handleFoodChange(index, 'portion', e.target.value) }), _jsxs("div", { className: "meal-editor__protein-input", children: [_jsx("input", { type: "number", className: "meal-editor__input meal-editor__input--protein", placeholder: "0", min: "0", max: "500", step: "0.1", value: food.protein, onChange: (e) => handleFoodChange(index, 'protein', e.target.value) }), _jsx("span", { className: "meal-editor__unit", children: "g" })] })] }), _jsx("button", { type: "button", className: "meal-editor__remove-btn", onClick: () => handleRemoveFood(index), title: "Remove food", children: "\u2715" })] }, index))) }), _jsx("button", { type: "button", className: "meal-editor__add-btn", onClick: handleAddFood, children: "+ Add Food Item" }), _jsxs("div", { className: "meal-editor__total", children: [_jsx("span", { className: "meal-editor__total-label", children: "Total Protein:" }), _jsxs("span", { className: "meal-editor__total-value", children: [calculatedTotal.toFixed(1), "g", calculatedTotal !== initialTotalProtein && (_jsxs("span", { className: "meal-editor__total-change", children: ["(was ", initialTotalProtein.toFixed(1), "g)"] }))] })] }), error && (_jsx("div", { className: "meal-editor__error", children: error })), _jsxs("div", { className: "meal-editor__actions", children: [_jsx("button", { type: "button", className: "meal-editor__btn meal-editor__btn--secondary", onClick: handleReset, disabled: saving || !hasChanges, children: "Reset" }), onCancel && (_jsx("button", { type: "button", className: "meal-editor__btn meal-editor__btn--secondary", onClick: onCancel, disabled: saving, children: "Cancel" })), _jsx("button", { type: "button", className: "meal-editor__btn meal-editor__btn--primary", onClick: handleSave, disabled: saving || !hasChanges, children: saving ? 'Saving...' : 'Save Corrections' })] })] }));
};
export default MealEditor;
