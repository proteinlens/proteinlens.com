import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// MealUpload Component
// User Story 1: Upload meal photo and get protein analysis
// T040-T043: File picker, upload UI, progress states, error handling
// T039: Handle 429 response to show UpgradePrompt (Feature 002)
import { useRef, useState } from 'react';
import { useMealUpload } from '../hooks/useMealUpload';
import { AnalysisResults } from './AnalysisResults';
import { UpgradePrompt } from './UpgradePrompt';
import './MealUpload.css';
export const MealUpload = () => {
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
    const [quotaInfo, setQuotaInfo] = useState(null);
    const { uploadMeal, isUploading, isAnalyzing, analysisResult, error, progress, reset, } = useMealUpload();
    // T040: File picker with validation
    const handleFileSelect = (event) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }
        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/heic'];
        if (!validTypes.includes(file.type)) {
            alert('Please select a JPEG, PNG, or HEIC image');
            return;
        }
        // Validate file size (8MB max)
        const maxSize = 8 * 1024 * 1024;
        if (file.size > maxSize) {
            alert('File size must be less than 8MB');
            return;
        }
        setSelectedFile(file);
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewUrl(e.target?.result);
        };
        reader.readAsDataURL(file);
    };
    // T041: Upload button handler (T039: Handle 429 quota exceeded)
    const handleUpload = async () => {
        if (!selectedFile) {
            return;
        }
        try {
            await uploadMeal(selectedFile);
        }
        catch (err) {
            // Check for 429 quota exceeded response
            if (err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('Quota exceeded')) {
                const quota = err?.quota || { used: 5, limit: 5 };
                setQuotaInfo({ used: quota.used, limit: quota.limit });
                setShowUpgradePrompt(true);
            }
        }
    };
    // Reset to upload new photo
    const handleReset = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setShowUpgradePrompt(false);
        setQuotaInfo(null);
        reset();
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    // T042: Progress states UI
    const renderProgressState = () => {
        if (isUploading) {
            return (_jsxs("div", { className: "progress-state", children: [_jsx("div", { className: "spinner" }), _jsx("p", { children: "Uploading photo..." })] }));
        }
        if (isAnalyzing) {
            return (_jsxs("div", { className: "progress-state", children: [_jsx("div", { className: "spinner" }), _jsx("p", { children: "Analyzing protein content with AI..." }), _jsx("p", { className: "progress-subtext", children: "This may take a few seconds" })] }));
        }
        return null;
    };
    // T043: Error handling UI (T039: Check for quota error)
    const renderError = () => {
        if (!error) {
            return null;
        }
        // Check if error is quota-related (show upgrade prompt instead)
        if (error.includes('429') || error.includes('Quota exceeded') || error.includes('limit')) {
            return (_jsxs("div", { className: "error-message error-message--quota", children: [_jsx("h3", { children: "\uD83D\uDCCA Weekly Scan Limit Reached" }), _jsx("p", { children: "You've used all your free scans this week." }), _jsx("button", { onClick: () => setShowUpgradePrompt(true), className: "btn-primary", children: "View Upgrade Options" }), _jsx("button", { onClick: handleReset, className: "btn-secondary", children: "Close" })] }));
        }
        return (_jsxs("div", { className: "error-message", children: [_jsx("h3", { children: "\u26A0\uFE0F Error" }), _jsx("p", { children: error }), _jsx("button", { onClick: handleReset, className: "btn-secondary", children: "Try Again" })] }));
    };
    // Show results if analysis is complete
    if (analysisResult) {
        return (_jsxs("div", { className: "meal-upload", children: [_jsx(AnalysisResults, { result: analysisResult, imageUrl: previewUrl }), _jsx("button", { onClick: handleReset, className: "btn-primary", children: "Analyze Another Meal" })] }));
    }
    return (_jsxs("div", { className: "meal-upload", children: [_jsx("h1", { children: "\uD83D\uDCF8 ProteinLens" }), _jsx("p", { className: "subtitle", children: "Upload a meal photo to analyze protein content" }), _jsxs("div", { className: "upload-section", children: [_jsx("input", { ref: fileInputRef, type: "file", accept: "image/jpeg,image/png,image/heic", onChange: handleFileSelect, disabled: isUploading || isAnalyzing, className: "file-input", id: "file-input" }), _jsx("label", { htmlFor: "file-input", className: "file-label", children: selectedFile ? '✓ Photo Selected' : '📁 Choose Photo' })] }), previewUrl && (_jsxs("div", { className: "preview-section", children: [_jsx("img", { src: previewUrl, alt: "Meal preview", className: "preview-image" }), _jsxs("p", { className: "file-info", children: [selectedFile?.name, " (", (selectedFile.size / 1024).toFixed(0), " KB)"] })] })), selectedFile && !isUploading && !isAnalyzing && (_jsx("button", { onClick: handleUpload, className: "btn-primary", disabled: !selectedFile, children: "\uD83D\uDD0D Analyze Protein" })), renderProgressState(), renderError(), !selectedFile && !error && (_jsxs("div", { className: "tips", children: [_jsx("h3", { children: "Tips for best results:" }), _jsxs("ul", { children: [_jsx("li", { children: "Take photos in good lighting" }), _jsx("li", { children: "Ensure all food items are visible" }), _jsx("li", { children: "Use JPEG, PNG, or HEIC format" }), _jsx("li", { children: "Maximum file size: 8MB" })] })] })), _jsx(UpgradePrompt, { isOpen: showUpgradePrompt, onClose: () => setShowUpgradePrompt(false), scansUsed: quotaInfo?.used, scansLimit: quotaInfo?.limit })] }));
};
