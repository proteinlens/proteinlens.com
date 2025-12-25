import React, { useCallback, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
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
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.successBadge}>✓ Analysis Complete</div>
          <h1 style={styles.resultTitle}>Your Meal Analysis</h1>
          {previewUrl && <img src={previewUrl} alt="Meal" style={styles.resultImage} />}
          <div style={styles.totalCard}>
            <div><span style={styles.totalLabel}>Total Protein</span><span style={styles.totalValue}>{result.totalProtein}g</span></div>
            <span style={styles.emoji}>💪</span>
          </div>
          <div style={styles.foodList}>
            <h2 style={styles.foodListTitle}>Detected Foods</h2>
            {result.foods.map((food, i) => (
              <div key={i} style={styles.foodItem}>
                <div><div style={styles.foodName}>{food.name}</div><div style={styles.foodPortion}>{food.portion}</div></div>
                <div style={styles.foodProtein}>{food.protein}g</div>
              </div>
            ))}
          </div>
          {result.notes && <div style={styles.note}><strong>Note:</strong> {result.notes}</div>}
          <p style={styles.disclaimer}>Estimates are approximate and for informational purposes only</p>
          <button onClick={handleReset} style={styles.primaryBtn}>Analyze Another Meal</button>
        </div>
      </div>
    )
  }

  // Loading
  if (uploadState === 'uploading' || uploadState === 'analyzing') {
    return (
      <div style={{ ...styles.page, ...styles.centered }}>
        <div style={styles.loadingBox}>
          <div style={styles.spinner}>🔍</div>
          <h2 style={styles.loadingTitle}>{uploadState === 'uploading' ? 'Uploading...' : 'Analyzing with AI...'}</h2>
          <p style={styles.loadingText}>{uploadState === 'uploading' ? 'Sending your photo' : 'Identifying foods'}</p>
          <div style={styles.progressBar}><div style={{ ...styles.progressFill, width: `${progress}%` }} /></div>
          <span style={styles.progressText}>{progress}%</span>
        </div>
      </div>
    )
  }

  // Error
  if (uploadState === 'error') {
    return (
      <div style={{ ...styles.page, ...styles.centered }}>
        <div style={styles.errorBox}>
          <div style={styles.errorIcon}>⚠️</div>
          <h2 style={styles.loadingTitle}>Something went wrong</h2>
          <p style={styles.loadingText}>{error}</p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={handleAnalyze} style={styles.primaryBtn}>Try Again</button>
            <button onClick={handleReset} style={styles.secondaryBtn}>Start Over</button>
          </div>
        </div>
      </div>
    )
  }

  // Main
  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>🍽️</div>
            <span style={styles.logoText}>ProteinLens</span>
          </div>
          
          {/* Navigation */}
          <nav style={styles.nav}>
            <Link to="/" style={styles.navLinkActive}>Home</Link>
            <Link to="/history" style={styles.navLink}>History</Link>
            <Link to="/pricing" style={styles.navLink}>Pricing</Link>
            <Link to="/settings" style={styles.navLink}>Settings</Link>
          </nav>
          
          <div style={styles.aiBadge}>
            <span style={styles.aiDot} />
            AI Powered
          </div>
        </div>
      </header>

      {/* Hero */}
      <main style={styles.main}>
        <h1 style={styles.headline}>
          Analyze Your Meal's
          <br />
          <span style={styles.headlineGreen}>Protein Content</span>
        </h1>
        <p style={styles.subtitle}>
          Upload a photo of your food and let AI calculate the protein content instantly
        </p>

        {/* Upload Area */}
        {uploadState === 'selected' && previewUrl ? (
          <div style={styles.previewCard}>
            <div style={styles.previewImgWrap}>
              <img src={previewUrl} alt="Selected" style={styles.previewImg} />
              <button onClick={handleReset} style={styles.closeBtn}>✕</button>
            </div>
            <div style={styles.previewInfo}>{selectedFile?.name}</div>
            <button onClick={handleAnalyze} style={styles.analyzeBtn}>🔍 Analyze Protein Content</button>
          </div>
        ) : (
          <div
            style={{ ...styles.dropzone, ...(isDragActive ? styles.dropzoneActive : {}) }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div style={{ ...styles.dropzoneIcon, ...(isDragActive ? styles.dropzoneIconActive : {}) }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 12V4m0 0L8 8m4-4l4 4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 style={styles.dropzoneTitle}>Drag & drop your food photo</h3>
            <p style={styles.dropzoneSubtitle}>or click to browse</p>
          </div>
        )}

        {error && <div style={styles.errorMsg}>{error}</div>}

        <p style={styles.hint}>📸 Take a photo of chicken, eggs, fish, or any meal</p>
        <p style={styles.disclaimer}>Estimates are approximate and for informational purposes only</p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => e.target.files?.[0] && handleFileSelected(e.target.files[0])}
          style={{ display: 'none' }}
        />
      </main>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: '100vh',
    background: '#ffffff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  centered: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    maxWidth: 600,
    margin: '0 auto',
    padding: '24px 16px',
  },
  header: {
    borderBottom: '1px solid #f0f0f0',
    background: '#fff',
  },
  headerInner: {
    maxWidth: 900,
    margin: '0 auto',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    width: 40,
    height: 40,
    background: 'linear-gradient(135deg, #10b981, #059669)',
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 700,
    color: '#111',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  navLink: {
    padding: '8px 16px',
    fontSize: 14,
    fontWeight: 500,
    color: '#6b7280',
    textDecoration: 'none',
    borderRadius: 8,
    transition: 'all 0.2s',
  },
  navLinkActive: {
    padding: '8px 16px',
    fontSize: 14,
    fontWeight: 500,
    color: '#10b981',
    textDecoration: 'none',
    borderRadius: 8,
    background: '#f0fdf4',
  },
  aiBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 14px',
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: 50,
    fontSize: 13,
    fontWeight: 500,
    color: '#166534',
  },
  aiDot: {
    width: 8,
    height: 8,
    background: '#22c55e',
    borderRadius: '50%',
    animation: 'pulse 2s infinite',
  },
  main: {
    maxWidth: 700,
    margin: '0 auto',
    padding: '48px 24px',
    textAlign: 'center' as const,
  },
  headline: {
    fontSize: 42,
    fontWeight: 700,
    lineHeight: 1.15,
    color: '#111',
    marginBottom: 16,
  },
  headlineGreen: {
    color: '#10b981',
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 40,
    maxWidth: 500,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  dropzone: {
    background: '#fafafa',
    border: '2px dashed #e5e7eb',
    borderRadius: 16,
    padding: '60px 40px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginBottom: 24,
  },
  dropzoneActive: {
    borderColor: '#10b981',
    background: '#f0fdf4',
  },
  dropzoneIcon: {
    width: 72,
    height: 72,
    background: '#f0fdf4',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    color: '#9ca3af',
  },
  dropzoneIconActive: {
    background: '#dcfce7',
    color: '#10b981',
  },
  dropzoneTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#111',
    marginBottom: 8,
  },
  dropzoneSubtitle: {
    color: '#9ca3af',
    fontSize: 15,
  },
  hint: {
    fontSize: 14,
    color: '#10b981',
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    padding: '10px 20px',
    borderRadius: 50,
    display: 'inline-block',
    marginBottom: 16,
  },
  disclaimer: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 24,
  },
  previewCard: {
    marginBottom: 24,
  },
  previewImgWrap: {
    position: 'relative' as const,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  previewImg: {
    width: '100%',
    height: 280,
    objectFit: 'cover' as const,
  },
  closeBtn: {
    position: 'absolute' as const,
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    background: 'rgba(0,0,0,0.5)',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    fontSize: 18,
    cursor: 'pointer',
  },
  previewInfo: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  analyzeBtn: {
    width: '100%',
    padding: '16px 32px',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 17,
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(16,185,129,0.3)',
  },
  primaryBtn: {
    padding: '14px 28px',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
  },
  secondaryBtn: {
    padding: '14px 28px',
    background: '#f3f4f6',
    color: '#374151',
    border: 'none',
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
  },
  errorMsg: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    padding: '14px',
    borderRadius: 12,
    fontSize: 14,
    marginBottom: 16,
  },
  loadingBox: {
    textAlign: 'center' as const,
    padding: 32,
  },
  spinner: {
    width: 80,
    height: 80,
    background: 'linear-gradient(135deg, #10b981, #059669)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 36,
    margin: '0 auto 24px',
    animation: 'spin 2s linear infinite',
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: '#111',
    marginBottom: 8,
  },
  loadingText: {
    color: '#6b7280',
    marginBottom: 24,
  },
  progressBar: {
    width: 200,
    height: 6,
    background: '#e5e7eb',
    borderRadius: 10,
    margin: '0 auto',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    transition: 'width 0.3s',
  },
  progressText: {
    display: 'block',
    marginTop: 12,
    fontSize: 14,
    color: '#9ca3af',
  },
  errorBox: {
    textAlign: 'center' as const,
    padding: 32,
  },
  errorIcon: {
    width: 80,
    height: 80,
    background: '#fef2f2',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 36,
    margin: '0 auto 24px',
  },
  successBadge: {
    display: 'inline-block',
    background: '#f0fdf4',
    color: '#166534',
    padding: '8px 16px',
    borderRadius: 50,
    fontSize: 14,
    fontWeight: 500,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 20,
  },
  resultImage: {
    width: '100%',
    height: 200,
    objectFit: 'cover' as const,
    borderRadius: 16,
    marginBottom: 20,
  },
  totalCard: {
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: '#fff',
    padding: 24,
    borderRadius: 16,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  totalLabel: {
    display: 'block',
    fontSize: 14,
    opacity: 0.85,
  },
  totalValue: {
    display: 'block',
    fontSize: 40,
    fontWeight: 700,
  },
  emoji: {
    fontSize: 48,
  },
  foodList: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  foodListTitle: {
    fontSize: 15,
    fontWeight: 600,
    padding: '16px 20px',
    borderBottom: '1px solid #f3f4f6',
    margin: 0,
  },
  foodItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #f3f4f6',
  },
  foodName: {
    fontWeight: 500,
    color: '#111',
  },
  foodPortion: {
    fontSize: 13,
    color: '#6b7280',
  },
  foodProtein: {
    fontSize: 18,
    fontWeight: 700,
    color: '#10b981',
  },
  note: {
    background: '#fffbeb',
    border: '1px solid #fde68a',
    padding: '14px 18px',
    borderRadius: 12,
    fontSize: 14,
    color: '#92400e',
    marginBottom: 20,
    textAlign: 'left' as const,
  },
}

export default HomePage
