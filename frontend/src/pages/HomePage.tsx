import React, { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import imageCompression from 'browser-image-compression'
import { apiClient } from '@/services/apiClient'
import { FriendlyError } from '@/components/ui/FriendlyError'
import { FunLoading } from '@/components/ui/FunLoading'
import { getRandomMessage, successMessages } from '@/utils/friendlyErrors'
import { useAuth } from '@/contexts/AuthProvider'
import { getRandomDemoMeal, DEFAULT_PROTEIN_GOAL, type DemoMeal } from '@/data/demoMeals'

interface FoodItem {
  name: string
  portion: string
  protein: number
}

interface AnalysisResult {
  mealAnalysisId: string;
  foods: FoodItem[];
  totalProtein: number;
  totalCarbs?: number;
  totalFat?: number;
  confidence: 'high' | 'medium' | 'low';
  notes?: string;
  dietFeedback?: string; // Feature 017: Diet-specific feedback
  shareUrl?: string;
  shareId?: string;
}

type UploadState = 'idle' | 'selected' | 'uploading' | 'analyzing' | 'done' | 'error' | 'demo'

// Max retry attempts for transient errors
const MAX_RETRIES = 3

// Progress steps for loading animation
const ANALYSIS_STEPS = [
  { progress: 10, text: '📷 Preparing your photo...' },
  { progress: 30, text: '🔍 Finding foods in your meal...' },
  { progress: 50, text: '📏 Estimating portion sizes...' },
  { progress: 70, text: '🧮 Calculating protein content...' },
  { progress: 90, text: '✨ Putting it all together...' },
]

export function HomePage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [isDragActive, setIsDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [demoMeal, setDemoMeal] = useState<DemoMeal | null>(null)
  const [progress, setProgress] = useState(0)
  const [progressText, setProgressText] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const [successMessage] = useState(() => getRandomMessage(successMessages))

  // Today's protein from previous meals (in production, fetch from API for authenticated users)
  // For now, show 0g for logged-in users until real tracking is implemented
  const todayProtein = isAuthenticated ? 0 : 0
  const proteinGoal = DEFAULT_PROTEIN_GOAL

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

  // Demo scan - shows example results without uploading
  const handleDemoScan = () => {
    const demo = getRandomDemoMeal()
    setDemoMeal(demo)
    setPreviewUrl(demo.imageUrl)
    setResult({
      mealAnalysisId: `demo-${demo.id}`,
      foods: demo.foods,
      totalProtein: demo.totalProtein,
      confidence: demo.confidence,
      notes: demo.notes,
    })
    setUploadState('demo')
  }

  const handleAnalyze = async (isRetry = false) => {
    if (!selectedFile) return
    try {
      setUploadState('uploading')
      setProgress(10)
      setProgressText(ANALYSIS_STEPS[0].text)
      setError(null)
      
      let fileToUpload: File | Blob = selectedFile
      let contentType = selectedFile.type
      let fileName = selectedFile.name
      
      // Compress large images (common on mobile)
      if (selectedFile.size > 1024 * 1024) {
        try {
          const compressed = await imageCompression(selectedFile, { 
            maxSizeMB: 0.8, 
            maxWidthOrHeight: 1920, 
            useWebWorker: true,
            fileType: 'image/jpeg', // Force JPEG for better compatibility
          })
          fileToUpload = compressed
          contentType = 'image/jpeg'
          // Keep original name but change extension
          fileName = fileName.replace(/\.[^.]+$/, '.jpg')
        } catch (compressionError) {
          console.warn('Image compression failed, using original:', compressionError)
          // Continue with original file if compression fails
        }
      }
      
      // Step 1: Prepare
      setProgress(30)
      setProgressText(ANALYSIS_STEPS[1].text)
      const uploadUrlResponse = await apiClient.requestUploadUrl({ 
        fileName, 
        fileSize: fileToUpload.size, 
        contentType 
      })
      
      // Step 2: Upload
      setProgress(50)
      setProgressText(ANALYSIS_STEPS[2].text)
      await apiClient.uploadToBlob(uploadUrlResponse.uploadUrl, fileToUpload, contentType)
      
      // Step 3: Analyze
      setProgress(70)
      setProgressText(ANALYSIS_STEPS[3].text)
      setUploadState('analyzing')
      const analysisResponse = await apiClient.analyzeMeal({ blobName: uploadUrlResponse.blobName })
      
      // Step 4: Complete
      setProgress(100)
      setProgressText(ANALYSIS_STEPS[4].text)
      setResult(analysisResponse)
      setUploadState('done')
      setRetryCount(0) // Reset retry count on success
      
      // Auto-navigate to shareable link if available
      if (analysisResponse.shareUrl) {
        // Wait a moment for state to settle, then navigate
        setTimeout(() => {
          navigate(analysisResponse.shareUrl!)
        }, 500)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed'
      setError(errorMessage)
      setUploadState('error')
      
      // Auto-retry for transient errors (network, server issues)
      const isTransientError = errorMessage.toLowerCase().includes('network') || 
                               errorMessage.toLowerCase().includes('fetch') ||
                               errorMessage.toLowerCase().includes('500') ||
                               errorMessage.toLowerCase().includes('503') ||
                               errorMessage.toLowerCase().includes('timeout') ||
                               errorMessage.toLowerCase().includes('timed out') ||
                               errorMessage.toLowerCase().includes('aborted')
      
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
    setDemoMeal(null)
    setProgress(0)
    setProgressText('')
    setRetryCount(0)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Calculate progress percentage
  const getProgressPercentage = (mealProtein: number) => {
    const newTotal = todayProtein + mealProtein
    return Math.min(Math.round((newTotal / proteinGoal) * 100), 100)
  }

  // Results (including demo results)
  if ((uploadState === 'done' || uploadState === 'demo') && result) {
    const isDemo = uploadState === 'demo'
    const progressPercent = getProgressPercentage(result.totalProtein)
    const newTotalProtein = todayProtein + result.totalProtein
    
    return (
      <div className="max-w-xl mx-auto px-4 py-8">
        {/* Success badge */}
        {!isDemo && (
          <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            {successMessage.emoji} {successMessage.text}
          </div>
        )}
        
        {/* Demo banner */}
        {isDemo && (
          <div className="bg-gradient-to-r from-accent/20 to-primary/20 border border-accent/30 rounded-xl p-4 mb-4 text-center">
            <span className="text-sm font-medium text-foreground">
              ✨ This is an example result • <button onClick={handleReset} className="text-primary underline hover:no-underline">Try with your own photo</button>
            </span>
          </div>
        )}
        
        <h1 className="text-2xl font-bold text-foreground mb-5">
          {isDemo ? 'Example Result' : 'Your Meal Analysis'}
        </h1>
        
        {/* Meal image */}
        {previewUrl && <img src={previewUrl} alt="Meal" className="w-full h-48 object-cover rounded-2xl mb-5" />}
        
        {/* Progress toward goal - THE KEY "AHA" MOMENT */}
        <div className="bg-gradient-to-br from-primary to-accent text-white p-6 rounded-2xl mb-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="block text-sm opacity-85">This meal</span>
              <span className="block text-4xl font-bold">{result.totalProtein}g</span>
              <span className="block text-sm opacity-85 mt-1">of protein</span>
            </div>
            <span className="text-5xl">💪</span>
          </div>
          
          {/* Daily progress bar */}
          <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
            {isAuthenticated ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Today's Progress</span>
                  <span className="text-sm font-bold">{newTotalProtein}g / {proteinGoal}g</span>
                </div>
                <div className="h-3 bg-white/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-sm mt-2 opacity-90">
                  {progressPercent >= 100 
                    ? "🎉 You've hit your protein goal today!" 
                    : `${progressPercent}% toward your ${proteinGoal}g goal`
                  }
                </p>
              </>
            ) : (
              <div className="text-center py-2">
                <p className="text-sm font-medium mb-2">📊 Track Your Daily Progress</p>
                <p className="text-xs opacity-85 mb-3">Log in to see how this meal fits into your daily protein goal</p>
                <button
                  onClick={() => navigate('/login')}
                  className="bg-white text-primary px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white/90 transition-colors"
                >
                  Log In to Track
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Foods breakdown */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden mb-5">
          <div className="flex justify-between items-center p-4 border-b border-border">
            <h2 className="text-sm font-semibold">🍽️ What We Found</h2>
            <span className={`text-xs px-2 py-1 rounded-full ${
              result.confidence === 'high' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
              result.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
              'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
            }`}>
              {result.confidence === 'high' ? '✓ High confidence' : 
               result.confidence === 'medium' ? '~ Estimate' : '? Best guess'}
            </span>
          </div>
          {result.foods.map((food, i) => (
            <div key={i} className="flex justify-between items-center p-4 border-b border-border last:border-b-0 hover:bg-secondary/30 transition-colors">
              <div>
                <div className="font-medium text-foreground">{food.name}</div>
                <div className="text-xs text-muted-foreground">{food.portion}</div>
              </div>
              <div className="text-lg font-bold text-primary">{food.protein}g</div>
            </div>
          ))}
        </div>
        
        {/* Notes/tips */}
        {result.notes && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-xl text-sm text-yellow-800 dark:text-yellow-200 mb-5 text-left">
            <strong>💡 Pro tip:</strong> {result.notes}
          </div>
        )}
        
        {/* Diet feedback - Feature 017 */}
        {result.dietFeedback && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl text-sm text-blue-800 dark:text-blue-200 mb-5 text-left">
            <strong>🥗 Diet Insight:</strong> {result.dietFeedback}
          </div>
        )}
        
        {/* Accuracy disclaimer */}
        <p className="text-xs text-muted-foreground mb-6 text-center">
          ✨ Estimates are approximate—portion sizes and preparation can affect actual values
        </p>
        
        {/* Action buttons */}
        {isDemo ? (
          <button 
            onClick={handleReset} 
            className="w-full py-4 px-6 bg-gradient-to-r from-primary to-accent text-primary-foreground border-none rounded-xl text-base font-semibold cursor-pointer shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] transition-all mb-3"
          >
            📸 Try With Your Own Photo
          </button>
        ) : (
          <>
            {!isAuthenticated && (
              <button 
                onClick={() => navigate('/login?returnTo=/history')} 
                className="w-full py-4 px-6 bg-gradient-to-r from-primary to-accent text-primary-foreground border-none rounded-xl text-base font-semibold cursor-pointer shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] transition-all mb-3"
              >
                💾 Save to My History
              </button>
            )}
            
            {isAuthenticated && (
              <button 
                onClick={() => navigate('/history')} 
                className="w-full py-4 px-6 bg-gradient-to-r from-primary to-accent text-primary-foreground border-none rounded-xl text-base font-semibold cursor-pointer shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] transition-all mb-3"
              >
                📊 View in History
              </button>
            )}
            
            <button onClick={handleReset} className="w-full py-4 px-6 bg-secondary text-secondary-foreground border border-border rounded-xl text-base font-semibold cursor-pointer hover:bg-secondary/80 transition-colors">
              📸 Analyze Another Meal
            </button>
          </>
        )}
      </div>
    )
  }

  // Loading with step-by-step progress
  if (uploadState === 'uploading' || uploadState === 'analyzing') {
    return (
      <FunLoading 
        type={uploadState === 'uploading' ? 'uploading' : 'analyzing'} 
        progress={progress}
        progressText={progressText}
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

  // Main landing/idle state
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 text-center">
      {/* Hero section - Clear value proposition */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
          Snap a meal photo.
          <br />
          <span className="text-primary">Get protein estimate.</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          No logging, no guessing. AI-powered protein tracking in seconds.
        </p>
      </div>

      {/* 3-step visual how it works */}
      <div className="flex justify-center items-center gap-2 md:gap-4 mb-8 text-sm">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <span className="text-2xl">📸</span>
          </div>
          <span className="text-muted-foreground">Snap photo</span>
        </div>
        <span className="text-muted-foreground text-2xl">→</span>
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <span className="text-2xl">🤖</span>
          </div>
          <span className="text-muted-foreground">AI analyzes</span>
        </div>
        <span className="text-muted-foreground text-2xl">→</span>
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <span className="text-2xl">💪</span>
          </div>
          <span className="text-muted-foreground">Track progress</span>
        </div>
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
          
          {/* Capture tips */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 mb-4 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">📷 For best results:</span> Good lighting • Plate centered • All food visible
          </div>
          
          <button 
            onClick={() => handleAnalyze()} 
            className="w-full py-4 px-8 bg-gradient-to-r from-primary to-accent text-primary-foreground border-none rounded-xl text-lg font-semibold cursor-pointer shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] transition-all"
          >
            🔍 Analyze Protein Content
          </button>
        </div>
      ) : (
        <>
          {/* Primary CTA - Scan a meal */}
          <div
            className={`bg-card border-2 border-dashed rounded-2xl p-12 md:p-16 cursor-pointer transition-all mb-4 ${
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
            <h3 className="text-xl font-semibold text-foreground mb-2">📸 Scan a Meal</h3>
            <p className="text-muted-foreground">Drag & drop or click to upload</p>
          </div>

          {/* Secondary CTA - Demo scan */}
          <button
            onClick={handleDemoScan}
            className="text-emerald-700 hover:text-emerald-800 text-sm font-medium mb-6 underline decoration-emerald-400 hover:decoration-emerald-600 transition-colors"
          >
            See an example (no photo needed)
          </button>

          {/* No account needed message */}
          <p className="text-sm text-primary bg-primary/10 border border-primary/20 py-2.5 px-5 rounded-full inline-block mb-4">
            ✨ No account needed for your first scan
          </p>
        </>
      )}

      {error && uploadState === 'idle' && (
        <FriendlyError 
          error={error} 
          onRetry={() => setError(null)}
          compact
          className="mb-4"
        />
      )}
      
      <p className="text-xs text-muted-foreground mt-6">
        🔒 Privacy first • Photos processed securely • Results are estimates
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
