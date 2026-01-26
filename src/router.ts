// Simple path-based router for /compose and /preview
// Works with GitHub Pages static hosting

export type Route = 'compose' | 'preview';

// Get base path from Vite's import.meta.env or default
const BASE_PATH = import.meta.env.BASE_URL || '/';

export function getCurrentRoute(): Route {
  const path = window.location.pathname;
  
  if (path.includes('/preview')) {
    return 'preview';
  }
  
  return 'compose';
}

export function navigateToPreview(encodedData: string): void {
  const url = `${BASE_PATH}preview.html#${encodedData}`;
  window.open(url, '_blank');
}

export function getPreviewUrl(encodedData: string): string {
  return `${window.location.origin}${BASE_PATH}preview.html#${encodedData}`;
}

export function navigateToCompose(): void {
  window.location.href = `${BASE_PATH}compose.html`;
}

export function getEncodedDataFromUrl(): string | null {
  const hash = window.location.hash;
  if (hash && hash.length > 1) {
    return hash.slice(1); // Remove the leading #
  }
  return null;
}
