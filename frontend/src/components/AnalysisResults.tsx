// AnalysisResults Component
// Displays AI analysis results with protein breakdown
// T044-T046: Results display, confidence indicator, total protein

import React from 'react';
import { AnalysisResponse } from '../services/apiClient';
import './AnalysisResults.css';

export interface AnalysisResultsProps {
  result: AnalysisResponse;
  imageUrl: string | null;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result, imageUrl }) => {
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

      {/* T046: Total protein display */}
      <div className="total-protein">
        <div className="protein-value">{result.totalProtein}g</div>
        <div className="protein-label">Total Protein</div>
      </div>

      {/* T045: Confidence indicator */}
      <div className="confidence-indicator">
        <span
          className="confidence-badge"
          style={{ backgroundColor: getConfidenceColor(result.confidence) }}
        >
          {getConfidenceLabel(result.confidence)}
        </span>
      </div>

      {/* T044: Food items breakdown */}
      <div className="food-items">
        <h3>Food Breakdown</h3>
        {result.foods.length === 0 ? (
          <p className="no-foods">No food items detected in this image</p>
        ) : (
          <ul className="food-list">
            {result.foods.map((food, index) => (
              <li key={index} className="food-item">
                <div className="food-details">
                  <span className="food-name">{food.name}</span>
                  <span className="food-portion">{food.portion}</span>
                </div>
                <span className="food-protein">{food.protein}g</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Optional notes from AI */}
      {result.notes && (
        <div className="ai-notes">
          <h4>Additional Notes</h4>
          <p>{result.notes}</p>
        </div>
      )}

      {/* Metadata */}
      <div className="metadata">
        <p className="meta-item">
          <strong>Analysis ID:</strong> {result.mealAnalysisId}
        </p>
        <p className="meta-item">
          <strong>Request ID:</strong> {result.requestId}
        </p>
      </div>
    </div>
  );
};
