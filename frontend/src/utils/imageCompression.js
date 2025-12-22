/**
 * T072: Client-side image compression utility
 * Reduces image file size before upload to Azure Blob Storage
 */
const DEFAULT_OPTIONS = {
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 0.85,
    maxSizeMB: 5,
};
/**
 * Load an image file into an HTMLImageElement
 */
function loadImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
    });
}
/**
 * Calculate new dimensions maintaining aspect ratio
 */
function calculateDimensions(originalWidth, originalHeight, maxWidth, maxHeight) {
    let width = originalWidth;
    let height = originalHeight;
    // Scale down if exceeds max dimensions
    if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
    }
    if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
    }
    return { width, height };
}
/**
 * Convert canvas to blob with specified quality
 */
function canvasToBlob(canvas, mimeType, quality) {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) {
                resolve(blob);
            }
            else {
                reject(new Error('Failed to create blob from canvas'));
            }
        }, mimeType, quality);
    });
}
/**
 * Get the output MIME type based on input file type
 * HEIC is converted to JPEG for browser compatibility
 */
function getOutputMimeType(file) {
    const type = file.type.toLowerCase();
    // HEIC/HEIF should be converted to JPEG
    if (type.includes('heic') || type.includes('heif')) {
        return 'image/jpeg';
    }
    // PNG keeps transparency, JPEG for photos
    if (type === 'image/png') {
        return 'image/png';
    }
    // Default to JPEG for best compression
    return 'image/jpeg';
}
/**
 * Compress an image file to reduce size while maintaining quality
 *
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Compressed image blob with metadata
 *
 * @example
 * ```ts
 * const result = await compressImage(file, { maxWidth: 1200, quality: 0.8 });
 * console.log(`Reduced from ${result.originalSize} to ${result.compressedSize} bytes`);
 * ```
 */
export async function compressImage(file, options = {}) {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const originalSize = file.size;
    // Load the image
    const img = await loadImage(file);
    // Clean up object URL
    URL.revokeObjectURL(img.src);
    // Calculate target dimensions
    const { width, height } = calculateDimensions(img.naturalWidth, img.naturalHeight, opts.maxWidth, opts.maxHeight);
    // Create canvas and draw resized image
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Failed to get canvas 2D context');
    }
    // Use high-quality image rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);
    // Get output MIME type
    const mimeType = getOutputMimeType(file);
    // Compress with initial quality
    let blob = await canvasToBlob(canvas, mimeType, opts.quality);
    let quality = opts.quality;
    // If still too large, progressively reduce quality
    const maxSizeBytes = opts.maxSizeMB * 1024 * 1024;
    while (blob.size > maxSizeBytes && quality > 0.1) {
        quality -= 0.1;
        blob = await canvasToBlob(canvas, mimeType, quality);
    }
    const compressedSize = blob.size;
    const compressionRatio = originalSize > 0
        ? (1 - compressedSize / originalSize) * 100
        : 0;
    return {
        blob,
        originalSize,
        compressedSize,
        compressionRatio,
        width,
        height,
    };
}
/**
 * Check if a file needs compression based on size threshold
 *
 * @param file - The file to check
 * @param thresholdMB - Size threshold in MB (default: 1MB)
 * @returns true if file should be compressed
 */
export function shouldCompress(file, thresholdMB = 1) {
    const thresholdBytes = thresholdMB * 1024 * 1024;
    return file.size > thresholdBytes;
}
/**
 * Format file size for display
 */
export function formatFileSize(bytes) {
    if (bytes < 1024) {
        return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
