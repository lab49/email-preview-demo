import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';

export interface EncodingResult {
  success: boolean;
  encodedData?: string;
  rawSize: number;
  compressedSize: number;
  compressionRatio: number;
  error?: string;
}

export interface DecodingResult {
  success: boolean;
  html?: string;
  error?: string;
}

const MAX_URL_LENGTH = 2_000_000; // 2MB limit for Chrome/Edge

export function encodeHtml(html: string): EncodingResult {
  const rawSize = new Blob([html]).size;
  
  try {
    const encoded = compressToEncodedURIComponent(html);
    const compressedSize = encoded.length;
    const compressionRatio = rawSize > 0 ? (1 - compressedSize / rawSize) * 100 : 0;
    
    if (compressedSize > MAX_URL_LENGTH) {
      return {
        success: false,
        rawSize,
        compressedSize,
        compressionRatio,
        error: `Encoded data is ${formatBytes(compressedSize)}, which exceeds the ~2MB browser limit. Try reducing image sizes or content length.`
      };
    }
    
    return {
      success: true,
      encodedData: encoded,
      rawSize,
      compressedSize,
      compressionRatio
    };
  } catch (e) {
    return {
      success: false,
      rawSize,
      compressedSize: 0,
      compressionRatio: 0,
      error: `Encoding failed: ${e instanceof Error ? e.message : 'Unknown error'}`
    };
  }
}

export function decodeHtml(encodedData: string): DecodingResult {
  try {
    const html = decompressFromEncodedURIComponent(encodedData);
    
    if (!html) {
      return {
        success: false,
        error: 'Failed to decode data. The URL may be corrupted or invalid.'
      };
    }
    
    return {
      success: true,
      html
    };
  } catch (e) {
    return {
      success: false,
      error: `Decoding failed: ${e instanceof Error ? e.message : 'Unknown error'}`
    };
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getUrlSizeStatus(compressedSize: number): 'ok' | 'warning' | 'error' {
  if (compressedSize > MAX_URL_LENGTH) return 'error';
  if (compressedSize > MAX_URL_LENGTH * 0.8) return 'warning';
  return 'ok';
}
