// AnalysisResults Component
// Displays AI analysis results with protein breakdown
// T044-T046: Results display, confidence indicator, total protein
// T059-T060: Integration with MealEditor for corrections
// T069-T071: Delete functionality with confirmation

import React, { useState } from 'react';
import { AnalysisResponse, MealCorrections, apiClient } from '../services/apiClient';
import { MealEditor } from './MealEditor';
import { calculateMacroPercentages, calculateTotalCalories } from '../utils/nutrition';
import './AnalysisResults.css';

export interface AnalysisResultsProps {
  result: AnalysisResponse;
  imageUrl: string | null;
  onDelete?: () => void;
  onCorrectionsSaved?: (corrections: MealCorrections) => void;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ 
  result, 
  imageUrl,
  onDelete,
  onCorrectionsSaved,
}) => {
  // T060: Toggle edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [currentResult, setCurrentResult] = useState(result);
  // T069: Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete meal');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setDeleteError(null);
  };

  // T045: Confidence indicator
  const getConfidenceColor = (confidence: string): string => {
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

  const getConfidenceLabel = (confidence: string): string => {
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

  return (
    <div className="analysis-results">
      <h2>✅ Analysis Complete</h2>

      {/* Image thumbnail */}
      {imageUrl && (
        <div className="result-image">
          <img src={imageUrl} alt="Analyzed meal" />
        </div>
      )}

      {/* T046: Total macronutrient display */}
      <div className="total-macros">
        {/* NEW - macro ingredients analysis: display all macros */}
        {currentResult.totalCarbs !== undefined && currentResult.totalFat !== undefined ? (
          <>
            <div className="macros-grid" role="region" aria-label="Meal macronutrient breakdown">
              <div className="macro-card protein-card" role="article" aria-label="Protein content">
                <div className="macro-value" aria-label={`${currentResult.totalProtein.toFixed(1)} grams of protein`}>
                  {currentResult.totalProtein.toFixed(1)}g
                </div>
                <div className="macro-label">Protein</div>
              </div>
              <div className="macro-card carbs-card" role="article" aria-label="Carbohydrates content">
                <div className="macro-value" aria-label={`${currentResult.totalCarbs.toFixed(1)} grams of carbohydrates`}>
                  {currentResult.totalCarbs.toFixed(1)}g
                </div>
                <div className="macro-label">Carbs</div>
              </div>
              <div className="macro-card fat-card" role="article" aria-label="Fat content">
                <div className="macro-value" aria-label={`${currentResult.totalFat.toFixed(1)} grams of fat`}>
                  {currentResult.totalFat.toFixed(1)}g
                </div>
                <div className="macro-label">Fat</div>
              </div>
            </div>
            
            {/* Macro percentages and calories */}
            {(() => {
              const percentages = calculateMacroPercentages(
                currentResult.totalProtein,
                currentResult.totalCarbs,
                currentResult.totalFat
              );
              const totalCals = calculateTotalCalories(
                currentResult.totalProtein,
                currentResult.totalCarbs,
                currentResult.totalFat
              );
              return percentages ? (
                <div className="macro-breakdown" role="complementary" aria-label="Calorie breakdown">
                  <div className="calories" aria-label={`${totalCals} total calories`}>
                    <strong>{totalCals}</strong> calories
                  </div>
                  <div className="percentages" role="list" aria-label="Macronutrient percentages">
                    <span className="percentage protein-pct" role="listitem" aria-label={`${percentages.protein} percent of calories from protein`}>
                      {percentages.protein}% protein
                    </span>
                    <span className="percentage carbs-pct" role="listitem" aria-label={`${percentages.carbs} percent of calories from carbohydrates`}>
                      {percentages.carbs}% carbs
                    </span>
                    <span className="percentage fat-pct" role="listitem" aria-label={`${percentages.fat} percent of calories from fat`}>
                      {percentages.fat}% fat
                    </span>
                  </div>
                </div>
              ) : null;
            })()}
          </>
        ) : (
          /* Legacy meal display - protein only */
          <div className="total-protein">
            <div className="protein-value">{currentResult.totalProtein.toFixed(1)}g</div>
            <div className="protein-label">Total Protein</div>
            <div className="legacy-note">Macro data unavailable for this meal</div>
          </div>
        )}
      </div>

      {/* T045: Confidence indicator */}
      <div className="confidence-indicator">
        <span
          className="confidence-badge"
          style={{ backgroundColor: getConfidenceColor(currentResult.confidence) }}
        >
          {getConfidenceLabel(currentResult.confidence)}
        </span>
      </div>

      {/* T044: Food items breakdown */}
      <div className="food-items">
        <h3>Food Breakdown</h3>
        {currentResult.foods.length === 0 ? (
          <p className="no-foods">No food items detected in this image</p>
        ) : (
          <ul className="food-list">
            {currentResult.foods.map((food, index) => (
              <li key={index} className="food-item">
                <div className="food-details">
                  <span className="food-name">{food.name}</span>
                  <span className="food-portion">{food.portion}</span>
                </div>
                <div className="food-macros">
                  <span className="food-macro protein-macro" title="Protein">
                    P: {food.protein ? food.protein.toFixed(1) : 'N/A'}g
                  </span>
                  {food.carbs !== undefined && food.carbs !== null && (
                    <span className="food-macro carbs-macro" title="Carbohydrates">
                      C: {food.carbs.toFixed(1)}g
                    </span>
                  )}
                  {food.fat !== undefined && food.fat !== null && (
                    <span className="food-macro fat-macro" title="Fat">
                      F: {food.fat.toFixed(1)}g
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Optional notes from AI */}
      {currentResult.notes && (
        <div className="ai-notes">
          <h4>Additional Notes</h4>
          <p>{currentResult.notes}</p>
        </div>
      )}

      {/* Metadata */}
      <div className="metadata">
        <p className="meta-item">
          <strong>Analysis ID:</strong> {currentResult.mealAnalysisId}
        </p>
        <p className="meta-item">
          <strong>Request ID:</strong> {currentResult.requestId}
        </p>
      </div>

      {/* T60: Edit button to toggle MealEditor */}
      <div className="analysis-results__actions">
        <button
          className="analysis-results__btn analysis-results__btn--edit"
          onClick={() => setIsEditing(true)}
        >
          ✏️ Edit Analysis
        </button>
        {onDelete && (
          <button
            className="analysis-results__btn analysis-results__btn--delete"
            onClick={handleDeleteClick}
          >
            🗑️ Delete
          </button>
        )}
      </div>

      {/* T69: Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="analysis-results__confirm-overlay">
          <div className="analysis-results__confirm-dialog">
            <h3 className="analysis-results__confirm-title">Delete Meal?</h3>
            <p className="analysis-results__confirm-message">
              Are you sure you want to delete this meal analysis? This action cannot be undone.
            </p>
            {deleteError && (
              <p className="analysis-results__confirm-error">{deleteError}</p>
            )}
            <div className="analysis-results__confirm-actions">
              <button
                className="analysis-results__btn analysis-results__btn--cancel"
                onClick={handleDeleteCancel}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="analysis-results__btn analysis-results__btn--confirm-delete"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* T60: MealEditor modal/panel */}
      {isEditing && (
        <div className="analysis-results__editor-overlay">
          <div className="analysis-results__editor-modal">
            <MealEditor
              mealId={currentResult.mealAnalysisId}
              foods={currentResult.foods}
              totalProtein={currentResult.totalProtein}
              originalFoods={result.foods}
              onSave={(corrections) => {
                // Update local state with corrections
                if (corrections.foods) {
                  setCurrentResult(prev => ({
                    ...prev,
                    foods: corrections.foods! as any,
                    totalProtein: corrections.totalProtein || prev.totalProtein,
                  }));
                }
                setIsEditing(false);
                onCorrectionsSaved?.(corrections);
              }}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
