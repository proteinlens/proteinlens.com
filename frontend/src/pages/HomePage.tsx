import React, { useCallback, useRef, useState } from 'react'
import imageCompression from 'browser-image-compression'
import { apiClient } from '@/services/apiClient'

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

export function HomePage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragActive, setIsDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [progress, setProgress] = useState(0)

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

  const handleAnalyze = async () => {
    if (!selectedFile) return
    try {
      setUploadState('uploading')
      setProgress(10)
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
      setUploadState('error')
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setUploadState('idle')
    setError(null)
    setResult(null)
    setProgress(0)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Results
  if (uploadState === 'done' && result) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
          ✓ Analysis Complete
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
          <h2 className="text-sm font-semibold p-4 border-b border-border">Detected Foods</h2>
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
            <strong>Note:</strong> {result.notes}
          </div>
        )}
        <p className="text-xs text-muted-foreground mb-6 text-center">Estimates are approximate and for informational purposes only</p>
        <button onClick={handleReset} className="w-full py-4 px-6 bg-primary text-primary-foreground border-none rounded-xl text-base font-semibold cursor-pointer">
          Analyze Another Meal
        </button>
      </div>
    )
  }

  // Loading
  if (uploadState === 'uploading' || uploadState === 'analyzing') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-8">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-4xl mx-auto mb-6 animate-pulse">
            🔍
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            {uploadState === 'uploading' ? 'Uploading...' : 'Analyzing with AI...'}
          </h2>
          <p className="text-muted-foreground mb-6">
            {uploadState === 'uploading' ? 'Sending your photo' : 'Identifying foods'}
          </p>
          <div className="w-48 h-1.5 bg-secondary rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <span className="block mt-3 text-sm text-muted-foreground">{progress}%</span>
        </div>
      </div>
    )
  }

  // Error
  if (uploadState === 'error') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-8">
          <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
            ⚠️
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={handleAnalyze} className="py-3 px-6 bg-primary text-primary-foreground border-none rounded-xl font-semibold cursor-pointer">
              Try Again
            </button>
            <button onClick={handleReset} className="py-3 px-6 bg-secondary text-foreground border-none rounded-xl font-semibold cursor-pointer">
              Start Over
            </button>
          </div>
        </div>
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
            onClick={handleAnalyze} 
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

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive p-4 rounded-xl text-sm mb-4">
          {error}
        </div>
      )}

      <p className="text-sm text-primary bg-primary/10 border border-primary/20 py-2.5 px-5 rounded-full inline-block mb-4">
        📸 Take a photo of chicken, eggs, fish, or any meal
      </p>
      
      <p className="text-xs text-muted-foreground mt-6">
        Estimates are approximate and for informational purposes only
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
