import React, { useCallback, useRef, useState } from 'react'
import imageCompression from 'browser-image-compression'
import { apiClient } from '@/services/apiClient'
import { FriendlyError } from '@/components/ui/FriendlyError'
import { FunLoading } from '@/components/ui/FunLoading'
import { getRandomMessage, successMessages } from '@/utils/friendlyErrors'

interface FoodItem {
  name: string
  portion: string
  protein: number
}

interface AnalysisResult {
  mealAnalysisId: string
  foods: FoodItem[]
  totalProtein: number
  confidence: 'high' | 'medium' | 'low'
  notes?: string
}

type UploadState = 'idle' | 'selected' | 'uploading' | 'analyzing' | 'done' | 'error'

// Max retry attempts for transient errors
const MAX_RETRIES = 3

export function HomePage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragActive, setIsDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [progress, setProgress] = useState(0)
  const [retryCount, setRetryCount] = useState(0)
  const [successMessage] = useState(() => getRandomMessage(successMessages))

  const validateFile = (file: File): string | null => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) return 'Please upload a JPG, PNG, or WebP image'
    if (file.size > 10 * 1024 * 1024) return 'File size must be less than 10MB'
    return null
  }

  const handleFileSelected = useCallback((file: File) => {
    const err = validateFile(file)
    if (err) { setError(err); return }
    setSelectedFile(file)
    setError(null)
    setUploadState('selected')
    setPreviewUrl(URL.createObjectURL(file))
  }, [])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
    if (e.dataTransfer.files?.[0]) handleFileSelected(e.dataTransfer.files[0])
  }

  const handleAnalyze = async (isRetry = false) => {
    if (!selectedFile) return
    try {
      setUploadState('uploading')
      setProgress(10)
      setError(null)
      
      let fileToUpload = selectedFile
      if (selectedFile.size > 1024 * 1024) {
        fileToUpload = await imageCompression(selectedFile, { maxSizeMB: 0.8, maxWidthOrHeight: 1920, useWebWorker: true })
      }
      setProgress(30)
      const uploadUrlResponse = await apiClient.requestUploadUrl({ fileName: fileToUpload.name, fileSize: fileToUpload.size, contentType: fileToUpload.type })
      setProgress(50)
      await apiClient.uploadToBlob(uploadUrlResponse.uploadUrl, fileToUpload)
      setProgress(70)
      setUploadState('analyzing')
      const analysisResponse = await apiClient.analyzeMeal({ blobName: uploadUrlResponse.blobName })
      setProgress(100)
      setResult(analysisResponse)
      setUploadState('done')
      setRetryCount(0) // Reset retry count on success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed'
      setError(errorMessage)
      setUploadState('error')
      
      // Auto-retry for transient errors (network, server issues)
      const isTransientError = errorMessage.toLowerCase().includes('network') || 
                               errorMessage.toLowerCase().includes('fetch') ||
                               errorMessage.toLowerCase().includes('500') ||
                               errorMessage.toLowerCase().includes('503') ||
                               errorMessage.toLowerCase().includes('timeout')
      
      if (isTransientError && retryCount < MAX_RETRIES && !isRetry) {
        setRetryCount(prev => prev + 1)
        // Exponential backoff: 2s, 4s, 8s
        const delay = Math.pow(2, retryCount + 1) * 1000
        setTimeout(() => handleAnalyze(true), delay)
      }
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setUploadState('idle')
    setError(null)
    setResult(null)
    setProgress(0)
    setRetryCount(0)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Results
  if (uploadState === 'done' && result) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
          {successMessage.emoji} {successMessage.text}
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-5">Your Meal Analysis</h1>
        {previewUrl && <img src={previewUrl} alt="Meal" className="w-full h-48 object-cover rounded-2xl mb-5" />}
        <div className="bg-primary text-primary-foreground p-6 rounded-2xl flex justify-between items-center mb-5">
          <div>
            <span className="block text-sm opacity-85">Total Protein</span>
            <span className="block text-4xl font-bold">{result.totalProtein}g</span>
          </div>
          <span className="text-5xl">💪</span>
        </div>
        <div className="bg-card border border-border rounded-2xl overflow-hidden mb-5">
          <h2 className="text-sm font-semibold p-4 border-b border-border">🍽️ What We Found</h2>
          {result.foods.map((food, i) => (
            <div key={i} className="flex justify-between items-center p-4 border-b border-border last:border-b-0">
              <div>
                <div className="font-medium text-foreground">{food.name}</div>
                <div className="text-xs text-muted-foreground">{food.portion}</div>
              </div>
              <div className="text-lg font-bold text-primary">{food.protein}g</div>
            </div>
          ))}
        </div>
        {result.notes && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-xl text-sm text-yellow-800 dark:text-yellow-200 mb-5 text-left">
            <strong>💡 Pro tip:</strong> {result.notes}
          </div>
        )}
        <p className="text-xs text-muted-foreground mb-6 text-center">✨ Estimates are approximate - your mileage may vary!</p>
        <button onClick={handleReset} className="w-full py-4 px-6 bg-primary text-primary-foreground border-none rounded-xl text-base font-semibold cursor-pointer hover:scale-[1.02] transition-transform">
          📸 Analyze Another Meal
        </button>
      </div>
    )
  }

  // Loading - Use FunLoading component
  if (uploadState === 'uploading' || uploadState === 'analyzing') {
    return (
      <FunLoading 
        type={uploadState === 'uploading' ? 'uploading' : 'analyzing'} 
        progress={progress} 
      />
    )
  }

  // Error - Use FriendlyError component
  if (uploadState === 'error' && error) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8">
        <FriendlyError 
          error={error}
          onRetry={() => handleAnalyze()}
          onSecondaryAction={handleReset}
          secondaryActionText="🔄 Start Fresh"
        />
        {retryCount > 0 && (
          <p className="text-center text-xs text-muted-foreground mt-4">
            Auto-retry {retryCount}/{MAX_RETRIES} in progress...
          </p>
        )}
      </div>
    )
  }

  // Main idle state
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 text-center">
      {/* Hero */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Analyze Your Meal's
          <br />
          <span className="text-primary">Protein Content</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Upload a photo of your food and let AI calculate the protein content instantly
        </p>
      </div>

      {/* Upload Area */}
      {uploadState === 'selected' && previewUrl ? (
        <div className="mb-6">
          <div className="relative rounded-2xl overflow-hidden mb-3">
            <img src={previewUrl} alt="Selected" className="w-full h-72 object-cover" />
            <button 
              onClick={handleReset} 
              className="absolute top-3 right-3 w-9 h-9 bg-black/50 text-white border-none rounded-full text-lg cursor-pointer hover:bg-black/70 transition-colors"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-muted-foreground mb-4">{selectedFile?.name}</p>
          <button 
            onClick={() => handleAnalyze()} 
            className="w-full py-4 px-8 bg-primary text-primary-foreground border-none rounded-xl text-lg font-semibold cursor-pointer shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
          >
            🔍 Analyze Protein Content
          </button>
        </div>
      ) : (
        <div
          className={`bg-card border-2 border-dashed rounded-2xl p-16 cursor-pointer transition-all mb-6 ${
            isDragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 transition-colors ${
            isDragActive 
              ? 'bg-primary/20 text-primary' 
              : 'bg-primary/10 text-muted-foreground'
          }`}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 12V4m0 0L8 8m4-4l4 4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Drag & drop your food photo</h3>
          <p className="text-muted-foreground">or click to browse</p>
        </div>
      )}

      {error && uploadState === 'idle' && (
        <FriendlyError 
          error={error} 
          onRetry={() => setError(null)}
          compact
          className="mb-4"
        />
      )}

      <p className="text-sm text-primary bg-primary/10 border border-primary/20 py-2.5 px-5 rounded-full inline-block mb-4">
        📸 Snap a photo of your meal - we'll count the protein!
      </p>
      
      <p className="text-xs text-muted-foreground mt-6">
        🤖 Powered by AI • Results are estimates for fun & guidance
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => e.target.files?.[0] && handleFileSelected(e.target.files[0])}
        className="hidden"
      />
    </div>
  )
}

export default HomePage
