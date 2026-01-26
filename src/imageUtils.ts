export interface ImageCompressionOptions {
  maxWidth: number;
  maxHeight: number;
  quality: number;
}

export const IMAGE_QUALITY_PRESETS = {
  original: null,
  high: { maxWidth: 1920, maxHeight: 1080, quality: 0.9 },
  medium: { maxWidth: 1280, maxHeight: 720, quality: 0.8 },
  low: { maxWidth: 800, maxHeight: 600, quality: 0.6 }
} as const;

export type ImageQuality = keyof typeof IMAGE_QUALITY_PRESETS;

export async function compressImage(
  dataUrl: string,
  options: ImageCompressionOptions | null
): Promise<string> {
  // If no compression options, return original
  if (!options) {
    return dataUrl;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      
      // Calculate new dimensions maintaining aspect ratio
      if (width > options.maxWidth || height > options.maxHeight) {
        const ratio = Math.min(options.maxWidth / width, options.maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to JPEG for better compression (unless it's a PNG with transparency)
      const mimeType = dataUrl.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';
      const compressed = canvas.toDataURL(mimeType, options.quality);
      
      resolve(compressed);
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
}

export function getImageSizeFromDataUrl(dataUrl: string): number {
  // Remove the data URL prefix to get just the base64 data
  const base64Data = dataUrl.split(',')[1] || '';
  // Base64 encodes 3 bytes as 4 characters, so we can estimate the size
  return Math.round((base64Data.length * 3) / 4);
}
