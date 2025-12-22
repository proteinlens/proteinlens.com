import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HeroUploadCard } from '@/components/home/HeroUploadCard'
import { UploadDropzone } from '@/components/upload/UploadDropzone'
import { ImagePreview } from '@/components/upload/ImagePreview'
import { AnalyzeProgress } from '@/components/upload/AnalyzeProgress'
import { MealSummaryCard } from '@/components/results/MealSummaryCard'
import { FoodItemList } from '@/components/results/FoodItemList'
import { ProteinGapWidget } from '@/components/coaching/ProteinGapWidget'
import { useUpload } from '@/hooks/useUpload'
import { useGoal } from '@/hooks/useGoal'
import { useProteinGap } from '@/hooks/useProteinGap'
import { apiClient } from '@/services/apiClient'
import imageCompression from 'browser-image-compression'
import { getPageVariants, getPageTransition } from '@/utils/animations'
import { Button } from '@/components/ui/Button'

export function Home() {
  const uploadState = useUpload()
  const [uploadError, setUploadError] = useState<string | null>(null)
  const { goal } = useGoal()
  const gap = useProteinGap({ userId: 'mock-user', dailyGoalGrams: goal })
  
  const pageVariants = getPageVariants()
  const pageTransition = getPageTransition()

  // Handle file selection (upload or replace)
  const handleFileSelected = async (file: File) => {
    setUploadError(null)
    uploadState.selectFile(file)
  }

  // Handle upload when user proceeds
  const handleUpload = async () => {
    if (!uploadState.state.file) return

    try {
      uploadState.startUpload()

      // Compress image if needed
      let fileToUpload = uploadState.state.file
      if (uploadState.state.file.size > 1024 * 1024) {
        // Compress if > 1MB
        fileToUpload = await imageCompression(uploadState.state.file, {
          maxSizeMB: 0.8,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        })
      }

      // Get upload URL from backend
      const uploadUrlResponse = await apiClient.requestUploadUrl({
        fileName: fileToUpload.name,
        fileSize: fileToUpload.size,
        contentType: fileToUpload.type,
      })

      // Upload to blob storage directly
      await apiClient.uploadToBlob(uploadUrlResponse.uploadUrl, fileToUpload)

      uploadState.completeUpload(uploadUrlResponse.blobName)

      // Request analysis
      uploadState.startAnalyze()
      
      const analysisResponse = await apiClient.analyzeMeal({
        blobName: uploadUrlResponse.blobName,
      })

      uploadState.completeAnalyze(analysisResponse.mealAnalysisId, analysisResponse)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed'
      setUploadError(message)
      uploadState.setError(message)
    }
  }

  // Render different UI based on upload state
  const renderContent = () => {
    switch (uploadState.state.state) {
      case 'idle':
        return (
          <motion.div
            key="hero"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <HeroUploadCard
              onUploadClick={() => uploadState.selectFile(new File([], ''))}
            />
          </motion.div>
        )

      case 'selected':
        return (
          <motion.div
            key="preview"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="space-y-6"
          >
            <ImagePreview
              file={uploadState.state.file!}
              onRemove={() => uploadState.reset()}
              onReplace={() => uploadState.selectFile(new File([], ''))}
            />
            <div className="max-w-2xl mx-auto px-4">
              <Button
                onClick={handleUpload}
                variant="primary"
                size="lg"
                className="w-full"
              >
                Analyze Meal
              </Button>
            </div>
          </motion.div>
        )

      case 'uploading':
      case 'analyzing':
        return (
          <motion.div
            key="progress"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <AnalyzeProgress
              progress={uploadState.state.state === 'uploading' ? uploadState.state.progress : 100}
              message={uploadState.state.state === 'uploading' ? 'Uploading photo...' : 'Analyzing with AI...'}
            />
          </motion.div>
        )

      case 'done':
        return (
          <motion.div
            key="results"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="space-y-6 pb-8"
          >
            <MealSummaryCard
              meal={{
                id: uploadState.state.mealId || '',
                userId: '',
                uploadedAt: new Date().toISOString(),
                imageUrl: uploadState.state.blobUrl || '',
                analysis: uploadState.state.analysis,
                corrections: [],
              }}
            />
            {uploadState.state.analysis?.foods && (
              <FoodItemList 
                mealId={uploadState.state.mealId || ''}
                items={uploadState.state.analysis.foods} 
              />
            )}
            {gap.gapGrams > 0 && (
              <ProteinGapWidget gap={gap} />
            )}
            <div className="max-w-2xl mx-auto px-4 space-y-3">
              <Button
                onClick={() => uploadState.reset()}
                variant="primary"
                size="lg"
                className="w-full"
              >
                Upload Another Meal
              </Button>
            </div>
          </motion.div>
        )

      case 'error':
        return (
          <motion.div
            key="error"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="max-w-2xl mx-auto px-4 py-12"
          >
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-destructive mb-2">
                Analysis Failed
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {uploadState.state.error}
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => uploadState.retry()}
                  variant="primary"
                  className="flex-1"
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => uploadState.reset()}
                  variant="outline"
                  className="flex-1"
                >
                  Start Over
                </Button>
              </div>
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>
    </div>
  )
}
