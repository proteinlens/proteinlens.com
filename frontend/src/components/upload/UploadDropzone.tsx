import React, { useCallback, useRef } from 'react'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/Button'

interface UploadDropzoneProps {
  onFileSelected: (file: File) => void
  isLoading?: boolean
  error?: string | null
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function UploadDropzone({ onFileSelected, isLoading = false, error = null }: UploadDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragActive, setIsDragActive] = React.useState(false)

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Please upload a JPG, PNG, or WebP image'
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 10MB'
    }
    return null
  }

  const handleFileChange = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    const validationError = validateFile(file)

    if (validationError) {
      // You might want to show this error to the user
      console.error(validationError)
      return
    }

    onFileSelected(file)
  }, [onFileSelected])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true)
    } else if (e.type === 'dragleave') {
      setIsDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    const files = e.dataTransfer.files
    handleFileChange(files)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 md:p-12 cursor-pointer transition-colors',
          'flex flex-col items-center justify-center min-h-[300px] md:min-h-[400px]',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-border bg-background hover:border-primary/50',
          isLoading && 'opacity-50 pointer-events-none'
        )}
      >
        {/* Upload Icon */}
        <svg
          className={cn(
            'w-12 h-12 mb-4 transition-colors',
            isDragActive ? 'text-primary' : 'text-muted-foreground'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>

        <h3 className="text-lg md:text-xl font-semibold mb-2">
          {isDragActive ? 'Drop your photo here' : 'Drag & drop your meal photo'}
        </h3>

        <p className="text-sm text-muted-foreground mb-6">
          or
        </p>

        <Button
          type="button"
          disabled={isLoading}
          variant="primary"
          size="md"
          className="min-h-[44px]"
        >
          {isLoading ? 'Processing...' : 'Choose File'}
        </Button>

        <p className="text-xs text-muted-foreground mt-6">
          Supports JPG, PNG, WebP • Max 10MB
        </p>

        {error && (
          <p className="text-sm text-destructive mt-4 text-center">
            {error}
          </p>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        onChange={(e) => handleFileChange(e.target.files)}
        className="hidden"
        disabled={isLoading}
      />
    </div>
  )
}
