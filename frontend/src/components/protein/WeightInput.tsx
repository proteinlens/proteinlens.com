/**
 * Weight Input Component (Feature 015)
 * 
 * Input field for weight with kg/lbs toggle and auto-conversion
 */

import React, { useState, useEffect } from 'react';
import { cn } from '@/utils/cn';

export type WeightUnit = 'kg' | 'lbs';

interface WeightInputProps {
  value: number;  // Always in kg
  onChange: (valueKg: number) => void;
  unit: WeightUnit;
  onUnitChange: (unit: WeightUnit) => void;
  disabled?: boolean;
  className?: string;
}

// Conversion factors
const LBS_TO_KG = 0.453592;
const KG_TO_LBS = 2.20462;

export function WeightInput({
  value,
  onChange,
  unit,
  onUnitChange,
  disabled = false,
  className,
}: WeightInputProps) {
  // Display value in the current unit
  const displayValue = unit === 'kg' 
    ? Math.round(value) 
    : Math.round(value * KG_TO_LBS);

  const [inputValue, setInputValue] = useState<string>(String(displayValue));

  // Update input when value or unit changes externally
  useEffect(() => {
    const newDisplay = unit === 'kg' 
      ? Math.round(value) 
      : Math.round(value * KG_TO_LBS);
    setInputValue(String(newDisplay));
  }, [value, unit]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputValue(raw);

    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed) && parsed > 0) {
      // Convert to kg if needed
      const valueKg = unit === 'kg' ? parsed : parsed * LBS_TO_KG;
      onChange(valueKg);
    }
  };

  const handleUnitToggle = () => {
    const newUnit = unit === 'kg' ? 'lbs' : 'kg';
    onUnitChange(newUnit);
    // Value stays the same in kg, display updates automatically
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label className="text-sm font-medium text-foreground">
        Your Weight
      </label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          inputMode="numeric"
          min="1"
          max={unit === 'kg' ? 500 : 1100}
          value={inputValue}
          onChange={handleInputChange}
          disabled={disabled}
          className={cn(
            'flex-1 h-12 px-4 text-lg font-semibold text-center',
            'border border-border rounded-lg',
            'bg-background text-foreground',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
          )}
          aria-label={`Weight in ${unit}`}
        />
        <button
          type="button"
          onClick={handleUnitToggle}
          disabled={disabled}
          className={cn(
            'h-12 w-16 px-3 text-sm font-semibold',
            'border border-border rounded-lg',
            'bg-muted hover:bg-muted/80 text-foreground',
            'focus:outline-none focus:ring-2 focus:ring-primary',
            'transition-colors duration-150',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          aria-label={`Switch to ${unit === 'kg' ? 'pounds' : 'kilograms'}`}
        >
          {unit}
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        {unit === 'lbs' && value > 0 && (
          <>≈ {Math.round(value)} kg</>
        )}
        {unit === 'kg' && value > 0 && (
          <>≈ {Math.round(value * KG_TO_LBS)} lbs</>
        )}
      </p>
    </div>
  );
}
