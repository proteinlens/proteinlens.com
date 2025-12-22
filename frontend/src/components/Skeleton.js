import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import './Skeleton.css';
/**
 * Base skeleton block component
 */
export function Skeleton({ width = '100%', height = '1rem', borderRadius = '4px', className = '' }) {
    return (_jsx("div", { className: `skeleton ${className}`, style: {
            width: typeof width === 'number' ? `${width}px` : width,
            height: typeof height === 'number' ? `${height}px` : height,
            borderRadius,
        } }));
}
/**
 * Skeleton for text content
 */
export function SkeletonText({ lines = 3, className = '' }) {
    return (_jsx("div", { className: `skeleton-text ${className}`, children: Array.from({ length: lines }).map((_, i) => (_jsx(Skeleton, { width: i === lines - 1 ? '60%' : '100%', height: "1rem", className: "skeleton-text__line" }, i))) }));
}
/**
 * Skeleton for a single food item in analysis results
 */
export function SkeletonFoodItem() {
    return (_jsxs("div", { className: "skeleton-food-item", children: [_jsxs("div", { className: "skeleton-food-item__details", children: [_jsx(Skeleton, { width: "60%", height: "1.1rem", className: "skeleton-food-item__name" }), _jsx(Skeleton, { width: "40%", height: "0.9rem", className: "skeleton-food-item__portion" })] }), _jsx(Skeleton, { width: "60px", height: "1.3rem", className: "skeleton-food-item__protein" })] }));
}
/**
 * Skeleton for the entire analysis results card
 */
export function SkeletonAnalysisResults() {
    return (_jsxs("div", { className: "skeleton-analysis", children: [_jsx("div", { className: "skeleton-analysis__image", children: _jsx(Skeleton, { width: "100%", height: "200px", borderRadius: "8px" }) }), _jsxs("div", { className: "skeleton-analysis__total", children: [_jsx(Skeleton, { width: "120px", height: "4rem", className: "skeleton-analysis__protein-value" }), _jsx(Skeleton, { width: "80px", height: "1rem" })] }), _jsx("div", { className: "skeleton-analysis__confidence", children: _jsx(Skeleton, { width: "100px", height: "2rem", borderRadius: "2rem" }) }), _jsxs("div", { className: "skeleton-analysis__foods", children: [_jsx(Skeleton, { width: "150px", height: "1.5rem", className: "skeleton-analysis__title" }), _jsx(SkeletonFoodItem, {}), _jsx(SkeletonFoodItem, {}), _jsx(SkeletonFoodItem, {})] }), _jsxs("div", { className: "skeleton-analysis__notes", children: [_jsx(Skeleton, { width: "100px", height: "1rem", className: "skeleton-analysis__notes-title" }), _jsx(SkeletonText, { lines: 2 })] })] }));
}
/**
 * Skeleton for pricing card
 */
export function SkeletonPricingCard() {
    return (_jsxs("div", { className: "skeleton-pricing-card", children: [_jsx(Skeleton, { width: "60%", height: "1.5rem", className: "skeleton-pricing-card__name" }), _jsx(Skeleton, { width: "40%", height: "2.5rem", className: "skeleton-pricing-card__price" }), _jsx("div", { className: "skeleton-pricing-card__features", children: Array.from({ length: 4 }).map((_, i) => (_jsx(Skeleton, { width: "90%", height: "1rem", className: "skeleton-pricing-card__feature" }, i))) }), _jsx(Skeleton, { width: "100%", height: "44px", borderRadius: "8px", className: "skeleton-pricing-card__button" })] }));
}
/**
 * Skeleton for history list item
 */
export function SkeletonHistoryItem() {
    return (_jsxs("div", { className: "skeleton-history-item", children: [_jsx(Skeleton, { width: "60px", height: "60px", borderRadius: "8px", className: "skeleton-history-item__image" }), _jsxs("div", { className: "skeleton-history-item__content", children: [_jsx(Skeleton, { width: "70%", height: "1rem" }), _jsx(Skeleton, { width: "50%", height: "0.9rem" })] }), _jsx(Skeleton, { width: "50px", height: "1.2rem", className: "skeleton-history-item__protein" })] }));
}
/**
 * Skeleton for meal history list
 */
export function SkeletonMealHistory({ count = 5 }) {
    return (_jsx("div", { className: "skeleton-meal-history", children: Array.from({ length: count }).map((_, i) => (_jsx(SkeletonHistoryItem, {}, i))) }));
}
/**
 * Full-page loading skeleton
 */
export function SkeletonPage() {
    return (_jsxs("div", { className: "skeleton-page", children: [_jsxs("div", { className: "skeleton-page__header", children: [_jsx(Skeleton, { width: "200px", height: "2rem" }), _jsx(Skeleton, { width: "100px", height: "36px", borderRadius: "8px" })] }), _jsx("div", { className: "skeleton-page__content", children: _jsx(SkeletonAnalysisResults, {}) })] }));
}
