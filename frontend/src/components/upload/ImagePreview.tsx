import React from 'react'
import { cn } from '@/utils/cn'

interface ImagePreviewProps {
  file: File
  onRemove: () => void
  onReplace: () => void
}

export function ImagePreview({ file, onRemove, onReplace }: ImagePreviewProps) {
  const [previewUrl, setPreviewUrl] = React.useState<string>('')

  React.useEffect(() => {
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)

    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [file])

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6">
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {/* Image Container - 1:1 Aspect Ratio */}
        <div className="relative w-full aspect-square bg-muted">
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Meal preview"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* File Info */}
        <div className="p-4 md:p-6 bg-card border-t border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-sm md:text-base truncate">
                {file.name}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={onReplace}
              className={cn(
                'flex-1 h-10 md:h-11 px-4 rounded-lg font-medium transition-all',
                'bg-secondary text-secondary-foreground hover:opacity-90',
                'focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2',
                'min-h-[44px] md:min-h-[40px]' // Touch target
              )}
            >
              <span className="inline-block md:hidden">Replace</span>
              <span className="hidden md:inline-block">Replace Photo</span>
            </button>

            <button
              onClick={onRemove}
              className={cn(
                'flex-1 h-10 md:h-11 px-4 rounded-lg font-medium transition-all',
                'border border-border text-foreground hover:bg-muted',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                'min-h-[44px] md:min-h-[40px]' // Touch target
              )}
            >
              <span className="inline-block md:hidden">Remove</span>
              <span className="hidden md:inline-block">Remove</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
