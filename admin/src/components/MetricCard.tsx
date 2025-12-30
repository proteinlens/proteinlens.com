// MetricCard component
// Feature: 012-admin-dashboard
// T040: Single metric card component

import { clsx } from 'clsx';
import { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  variant = 'default',
}: MetricCardProps) {
  const variantStyles = {
    default: {
      border: 'border-gray-100 hover:border-admin-200',
      iconBg: 'bg-admin-50',
      iconColor: 'text-admin-600',
    },
    success: {
      border: 'border-gray-100 hover:border-emerald-200',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    warning: {
      border: 'border-gray-100 hover:border-amber-200',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    danger: {
      border: 'border-gray-100 hover:border-red-200',
      iconBg: 'bg-red-50',
      iconColor: 'text-red-600',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={clsx(
        'bg-white rounded-2xl shadow-sm border p-5 lg:p-6 transition-all duration-200 hover:shadow-md',
        styles.border
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
          <p className="mt-2 text-2xl lg:text-3xl font-bold text-gray-900">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          )}
          {trend && (
            <div
              className={clsx(
                'mt-2 inline-flex items-center gap-1 text-sm font-medium px-2 py-0.5 rounded-full',
                trend.isPositive 
                  ? 'text-emerald-700 bg-emerald-50' 
                  : 'text-red-700 bg-red-50'
              )}
            >
              {trend.isPositive ? (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        {icon && (
          <div className={clsx(
            'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center',
            styles.iconBg,
            styles.iconColor
          )}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
