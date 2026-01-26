import { getEncodedDataFromUrl, navigateToCompose } from './router';
import { decodeHtml, formatBytes } from './encoding';

export function initPreviewPage(container: HTMLElement): void {
  const encodedData = getEncodedDataFromUrl();
  
  if (!encodedData) {
    renderError(container, 'No content found in URL. Please go back and generate a preview link.');
    return;
  }

  const result = decodeHtml(encodedData);

  if (!result.success || !result.html) {
    renderError(container, result.error || 'Failed to decode content.');
    return;
  }

  renderPreview(container, result.html, encodedData.length);
}

function renderError(container: HTMLElement, message: string): void {
  container.innerHTML = `
    <div class="preview-page">
      <header class="page-header">
        <h1>📧 Email Preview</h1>
      </header>
      
      <div class="error-container">
        <div class="error-icon">⚠️</div>
        <h2>Unable to Load Preview</h2>
        <p>${message}</p>
        <button type="button" id="back-btn" class="btn-primary">
          ← Back to Compose
        </button>
      </div>
    </div>
  `;

  document.querySelector('#back-btn')?.addEventListener('click', () => {
    navigateToCompose();
  });
}

function renderPreview(container: HTMLElement, html: string, urlSize: number): void {
  container.innerHTML = `
    <div class="preview-page preview-mode">
      <div class="preview-mode-banner">
        <span class="preview-mode-icon">👁️</span>
        <span class="preview-mode-text">PREVIEW MODE</span>
        <span class="preview-mode-hint">This is a read-only preview of your email</span>
      </div>
      
      <header class="page-header">
        <h1>📧 Email Preview</h1>
        <p class="subtitle">This is exactly how your email content will appear when published</p>
      </header>
      
      <div class="preview-container">
        <div class="preview-frame">
          <div class="preview-header">
            <span class="preview-badge">📄 Rendered Content</span>
            <span class="preview-readonly-badge">Read Only</span>
          </div>
          <div id="preview-content" class="preview-content"></div>
        </div>
      </div>
      
      <div class="preview-stats">
        <div class="stats">
          <span class="stat">
            <span class="stat-label">URL Size:</span>
            <span>${formatBytes(urlSize)}</span>
          </span>
          <span class="stat">
            <span class="stat-label">URL Length:</span>
            <span>${window.location.href.length.toLocaleString()} chars</span>
          </span>
          <span class="stat">
            <span class="stat-label">Status:</span>
            <span class="status-ok">✓ Successfully decoded</span>
          </span>
        </div>
      </div>
      
      <div class="action-bar">
        <button type="button" id="copy-url-btn" class="btn-secondary">
          📋 Copy URL
        </button>
        <button type="button" id="back-btn" class="btn-primary">
          ✏️ Back to Compose
        </button>
      </div>
    </div>
  `;

  // Render the HTML content
  const previewContent = document.querySelector('#preview-content');
  if (previewContent) {
    previewContent.innerHTML = html;
  }

  // Set up button handlers
  document.querySelector('#back-btn')?.addEventListener('click', () => {
    navigateToCompose();
  });

  document.querySelector('#copy-url-btn')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      const btn = document.querySelector('#copy-url-btn');
      if (btn) {
        btn.textContent = '✓ Copied!';
        setTimeout(() => {
          btn.textContent = '📋 Copy URL';
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to copy URL:', err);
      alert('Failed to copy URL to clipboard');
    }
  });
}
