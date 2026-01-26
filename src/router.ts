// Simple hash-based router for /compose and /preview

export type Route = 'compose' | 'preview';

export function getCurrentRoute(): Route {
  const path = window.location.pathname;
  
  if (path.includes('/preview')) {
    return 'preview';
  }
  
  return 'compose';
}

export function navigateToPreview(encodedData: string): void {
  window.location.href = `/preview#${encodedData}`;
}

export function navigateToCompose(): void {
  window.location.href = '/compose';
}

export function getEncodedDataFromUrl(): string | null {
  const hash = window.location.hash;
  if (hash && hash.length > 1) {
    return hash.slice(1); // Remove the leading #
  }
  return null;
}
