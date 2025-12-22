import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { HeroUploadCard } from '@/components/home/HeroUploadCard';
import { ImagePreview } from '@/components/upload/ImagePreview';
import { AnalyzeProgress } from '@/components/upload/AnalyzeProgress';
import { MealSummaryCard } from '@/components/results/MealSummaryCard';
import { FoodItemList } from '@/components/results/FoodItemList';
import { useUpload } from '@/hooks/useUpload';
import { apiClient } from '@/services/apiClient';
import imageCompression from 'browser-image-compression';
export function Home() {
    const uploadState = useUpload();
    const [uploadError, setUploadError] = useState(null);
    // Handle file selection (upload or replace)
    const handleFileSelected = async (file) => {
        setUploadError(null);
        uploadState.selectFile(file);
    };
    // Handle upload when user proceeds
    const handleUpload = async () => {
        if (!uploadState.state.file)
            return;
        try {
            uploadState.startUpload();
            // Compress image if needed
            let fileToUpload = uploadState.state.file;
            if (uploadState.state.file.size > 1024 * 1024) {
                // Compress if > 1MB
                fileToUpload = await imageCompression(uploadState.state.file, {
                    maxSizeMB: 0.8,
                    maxWidthOrHeight: 1920,
                    useWebWorker: true,
                });
            }
            // Get upload URL from backend
            const uploadUrlResponse = await apiClient.requestUploadUrl({
                fileName: fileToUpload.name,
                fileSize: fileToUpload.size,
                contentType: fileToUpload.type,
            });
            // Upload to blob storage directly
            await apiClient.uploadToBlob(uploadUrlResponse.uploadUrl, fileToUpload);
            uploadState.completeUpload(uploadUrlResponse.blobName);
            // Request analysis
            uploadState.startAnalyze();
            const analysisResponse = await apiClient.analyzeMeal({
                blobName: uploadUrlResponse.blobName,
            });
            uploadState.completeAnalyze(analysisResponse.mealAnalysisId, analysisResponse);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Upload failed';
            setUploadError(message);
            uploadState.setError(message);
        }
    };
    // Render different UI based on upload state
    const renderContent = () => {
        switch (uploadState.state.state) {
            case 'idle':
                return (_jsx(HeroUploadCard, { onUploadClick: () => uploadState.selectFile(new File([], '')) }));
            case 'selected':
                return (_jsxs("div", { className: "space-y-6", children: [_jsx(ImagePreview, { file: uploadState.state.file, onRemove: () => uploadState.reset(), onReplace: () => uploadState.selectFile(new File([], '')) }), _jsx("div", { className: "max-w-2xl mx-auto px-4", children: _jsx("button", { onClick: handleUpload, className: "w-full h-12 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2", children: "Analyze Meal" }) })] }));
            case 'uploading':
            case 'analyzing':
                return (_jsx(AnalyzeProgress, { progress: uploadState.state.state === 'uploading' ? uploadState.state.progress : 100, message: uploadState.state.state === 'uploading' ? 'Uploading photo...' : 'Analyzing with AI...' }));
            case 'done':
                return (_jsxs("div", { className: "space-y-6 pb-8", children: [_jsx(MealSummaryCard, { meal: {
                                id: uploadState.state.mealId || '',
                                userId: '',
                                uploadedAt: new Date().toISOString(),
                                imageUrl: uploadState.state.blobUrl || '',
                                analysis: uploadState.state.analysis,
                                corrections: [],
                            } }), uploadState.state.analysis?.foods && (_jsx(FoodItemList, { items: uploadState.state.analysis.foods })), _jsx("div", { className: "max-w-2xl mx-auto px-4 space-y-3", children: _jsx("button", { onClick: () => uploadState.reset(), className: "w-full h-12 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-all", children: "Upload Another Meal" }) })] }));
            case 'error':
                return (_jsx("div", { className: "max-w-2xl mx-auto px-4 py-12", children: _jsxs("div", { className: "bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center", children: [_jsx("h3", { className: "text-lg font-semibold text-destructive mb-2", children: "Analysis Failed" }), _jsx("p", { className: "text-sm text-muted-foreground mb-6", children: uploadState.state.error }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { onClick: () => uploadState.retry(), className: "flex-1 h-11 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90", children: "Try Again" }), _jsx("button", { onClick: () => uploadState.reset(), className: "flex-1 h-11 border border-border rounded-lg font-semibold hover:bg-muted", children: "Start Over" })] })] }) }));
            default:
                return null;
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-background text-foreground", children: renderContent() }));
}
