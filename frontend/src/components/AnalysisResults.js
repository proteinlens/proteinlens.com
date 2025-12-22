import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// AnalysisResults Component
// Displays AI analysis results with protein breakdown
// T044-T046: Results display, confidence indicator, total protein
// T059-T060: Integration with MealEditor for corrections
// T069-T071: Delete functionality with confirmation
import { useState } from 'react';
import { apiClient } from '../services/apiClient';
import { MealEditor } from './MealEditor';
import './AnalysisResults.css';
export const AnalysisResults = ({ result, imageUrl, onDelete, onCorrectionsSaved, }) => {
    // T060: Toggle edit mode
    const [isEditing, setIsEditing] = useState(false);
    const [currentResult, setCurrentResult] = useState(result);
    // T069: Delete confirmation state
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState(null);
    // T070: Handle delete with confirmation
    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
        setDeleteError(null);
    };
    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        setDeleteError(null);
        try {
            await apiClient.deleteMeal(currentResult.mealAnalysisId);
            setShowDeleteConfirm(false);
            onDelete?.();
        }
        catch (err) {
            setDeleteError(err instanceof Error ? err.message : 'Failed to delete meal');
        }
        finally {
            setIsDeleting(false);
        }
    };
    const handleDeleteCancel = () => {
        setShowDeleteConfirm(false);
        setDeleteError(null);
    };
    // T045: Confidence indicator
    const getConfidenceColor = (confidence) => {
        switch (confidence) {
            case 'high':
                return '#22c55e'; // Green
            case 'medium':
                return '#f59e0b'; // Orange
            case 'low':
                return '#ef4444'; // Red
            default:
                return '#6b7280'; // Gray
        }
    };
    const getConfidenceLabel = (confidence) => {
        switch (confidence) {
            case 'high':
                return 'High Confidence';
            case 'medium':
                return 'Medium Confidence';
            case 'low':
                return 'Low Confidence';
            default:
                return 'Unknown';
        }
    };
    return (_jsxs("div", { className: "analysis-results", children: [_jsx("h2", { children: "\u2705 Analysis Complete" }), imageUrl && (_jsx("div", { className: "result-image", children: _jsx("img", { src: imageUrl, alt: "Analyzed meal" }) })), _jsxs("div", { className: "total-protein", children: [_jsxs("div", { className: "protein-value", children: [currentResult.totalProtein, "g"] }), _jsx("div", { className: "protein-label", children: "Total Protein" })] }), _jsx("div", { className: "confidence-indicator", children: _jsx("span", { className: "confidence-badge", style: { backgroundColor: getConfidenceColor(currentResult.confidence) }, children: getConfidenceLabel(currentResult.confidence) }) }), _jsxs("div", { className: "food-items", children: [_jsx("h3", { children: "Food Breakdown" }), currentResult.foods.length === 0 ? (_jsx("p", { className: "no-foods", children: "No food items detected in this image" })) : (_jsx("ul", { className: "food-list", children: currentResult.foods.map((food, index) => (_jsxs("li", { className: "food-item", children: [_jsxs("div", { className: "food-details", children: [_jsx("span", { className: "food-name", children: food.name }), _jsx("span", { className: "food-portion", children: food.portion })] }), _jsxs("span", { className: "food-protein", children: [food.protein, "g"] })] }, index))) }))] }), currentResult.notes && (_jsxs("div", { className: "ai-notes", children: [_jsx("h4", { children: "Additional Notes" }), _jsx("p", { children: currentResult.notes })] })), _jsxs("div", { className: "metadata", children: [_jsxs("p", { className: "meta-item", children: [_jsx("strong", { children: "Analysis ID:" }), " ", currentResult.mealAnalysisId] }), _jsxs("p", { className: "meta-item", children: [_jsx("strong", { children: "Request ID:" }), " ", currentResult.requestId] })] }), _jsxs("div", { className: "analysis-results__actions", children: [_jsx("button", { className: "analysis-results__btn analysis-results__btn--edit", onClick: () => setIsEditing(true), children: "\u270F\uFE0F Edit Analysis" }), onDelete && (_jsx("button", { className: "analysis-results__btn analysis-results__btn--delete", onClick: handleDeleteClick, children: "\uD83D\uDDD1\uFE0F Delete" }))] }), showDeleteConfirm && (_jsx("div", { className: "analysis-results__confirm-overlay", children: _jsxs("div", { className: "analysis-results__confirm-dialog", children: [_jsx("h3", { className: "analysis-results__confirm-title", children: "Delete Meal?" }), _jsx("p", { className: "analysis-results__confirm-message", children: "Are you sure you want to delete this meal analysis? This action cannot be undone." }), deleteError && (_jsx("p", { className: "analysis-results__confirm-error", children: deleteError })), _jsxs("div", { className: "analysis-results__confirm-actions", children: [_jsx("button", { className: "analysis-results__btn analysis-results__btn--cancel", onClick: handleDeleteCancel, disabled: isDeleting, children: "Cancel" }), _jsx("button", { className: "analysis-results__btn analysis-results__btn--confirm-delete", onClick: handleDeleteConfirm, disabled: isDeleting, children: isDeleting ? 'Deleting...' : 'Yes, Delete' })] })] }) })), isEditing && (_jsx("div", { className: "analysis-results__editor-overlay", children: _jsx("div", { className: "analysis-results__editor-modal", children: _jsx(MealEditor, { mealId: currentResult.mealAnalysisId, foods: currentResult.foods, totalProtein: currentResult.totalProtein, originalFoods: result.foods, onSave: (corrections) => {
                            // Update local state with corrections
                            if (corrections.foods) {
                                setCurrentResult(prev => ({
                                    ...prev,
                                    foods: corrections.foods,
                                    totalProtein: corrections.totalProtein || prev.totalProtein,
                                }));
                            }
                            setIsEditing(false);
                            onCorrectionsSaved?.(corrections);
                        }, onCancel: () => setIsEditing(false) }) }) }))] }));
};
