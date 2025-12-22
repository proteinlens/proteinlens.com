import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Export Button Component - Download meal data (Pro-only)
// Feature: 002-saas-billing, User Story 4
// T063: Export button for Pro users
import { useState } from 'react';
import { exportMeals } from '../services/billingApi';
import './ExportButton.css';
export const ExportButton = ({ isPro, onUpgradeClick, }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showFormatMenu, setShowFormatMenu] = useState(false);
    const handleExport = async (format) => {
        setShowFormatMenu(false);
        setError(null);
        setLoading(true);
        try {
            await exportMeals(format);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Export failed');
        }
        finally {
            setLoading(false);
        }
    };
    if (!isPro) {
        return (_jsxs("button", { className: "export-button export-button--locked", onClick: onUpgradeClick, title: "Upgrade to Pro to export your data", children: [_jsx("span", { className: "export-button__icon", children: "\uD83D\uDCE5" }), _jsx("span", { className: "export-button__text", children: "Export" }), _jsx("span", { className: "export-button__lock", children: "\uD83D\uDD12" })] }));
    }
    return (_jsxs("div", { className: "export-button-wrapper", children: [_jsxs("button", { className: `export-button ${loading ? 'export-button--loading' : ''}`, onClick: () => setShowFormatMenu(!showFormatMenu), disabled: loading, children: [_jsx("span", { className: "export-button__icon", children: loading ? '⏳' : '📥' }), _jsx("span", { className: "export-button__text", children: loading ? 'Exporting...' : 'Export' })] }), showFormatMenu && (_jsxs("div", { className: "export-button__menu", children: [_jsxs("button", { className: "export-button__menu-item", onClick: () => handleExport('csv'), children: [_jsx("span", { className: "export-button__format-icon", children: "\uD83D\uDCCA" }), "CSV (Spreadsheet)"] }), _jsxs("button", { className: "export-button__menu-item", onClick: () => handleExport('json'), children: [_jsx("span", { className: "export-button__format-icon", children: "\uD83D\uDCC4" }), "JSON (Data)"] })] })), error && (_jsx("div", { className: "export-button__error", children: error }))] }));
};
export default ExportButton;
