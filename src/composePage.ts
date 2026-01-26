import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Placeholder from '@tiptap/extension-placeholder';
import { encodeHtml, formatBytes, getUrlSizeStatus } from './encoding';
import { navigateToPreview } from './router';
import { 
  compressImage, 
  IMAGE_QUALITY_PRESETS, 
  getImageSizeFromDataUrl 
} from './imageUtils';
import type { ImageQuality } from './imageUtils';

let editor: Editor | null = null;
let selectedImageQuality: ImageQuality = 'medium';

export function initComposePage(container: HTMLElement): void {
  container.innerHTML = `
    <div class="compose-page">
      <header class="page-header">
        <h1>📧 Email Preview Composer</h1>
        <p class="subtitle">Compose your email content, then preview how it will appear</p>
      </header>
      
      <div class="editor-container">
        <div class="toolbar">
          <div class="toolbar-group">
            <button type="button" data-action="bold" title="Bold (Ctrl+B)"><strong>B</strong></button>
            <button type="button" data-action="italic" title="Italic (Ctrl+I)"><em>I</em></button>
            <button type="button" data-action="underline" title="Underline (Ctrl+U)"><u>U</u></button>
            <button type="button" data-action="strike" title="Strikethrough"><s>S</s></button>
          </div>
          
          <div class="toolbar-divider"></div>
          
          <div class="toolbar-group">
            <button type="button" data-action="heading1" title="Heading 1">H1</button>
            <button type="button" data-action="heading2" title="Heading 2">H2</button>
            <button type="button" data-action="heading3" title="Heading 3">H3</button>
            <button type="button" data-action="paragraph" title="Paragraph">¶</button>
          </div>
          
          <div class="toolbar-divider"></div>
          
          <div class="toolbar-group">
            <button type="button" data-action="bulletList" title="Bullet List">• List</button>
            <button type="button" data-action="orderedList" title="Numbered List">1. List</button>
          </div>
          
          <div class="toolbar-divider"></div>
          
          <div class="toolbar-group">
            <label class="color-picker-label" title="Text Color">
              A
              <input type="color" id="text-color" value="#000000">
            </label>
          </div>
          
          <div class="toolbar-divider"></div>
          
          <div class="toolbar-group">
            <button type="button" data-action="undo" title="Undo (Ctrl+Z)">↩</button>
            <button type="button" data-action="redo" title="Redo (Ctrl+Shift+Z)">↪</button>
          </div>
        </div>
        
        <div id="editor" class="editor"></div>
        
        <div class="image-settings">
          <label for="image-quality">Image Quality:</label>
          <select id="image-quality">
            <option value="original">Original (largest)</option>
            <option value="high">High (1920×1080, 90%)</option>
            <option value="medium" selected>Medium (1280×720, 80%)</option>
            <option value="low">Low (800×600, 60%)</option>
          </select>
          <span class="image-hint">💡 Paste screenshots with Ctrl+V</span>
        </div>
      </div>
      
      <div class="stats-bar">
        <div class="stats">
          <span class="stat">
            <span class="stat-label">Raw Size:</span>
            <span id="raw-size">0 Bytes</span>
          </span>
          <span class="stat">
            <span class="stat-label">Compressed:</span>
            <span id="compressed-size">0 Bytes</span>
          </span>
          <span class="stat">
            <span class="stat-label">Compression:</span>
            <span id="compression-ratio">0%</span>
          </span>
          <span class="stat status-indicator" id="size-status">
            ✓ OK
          </span>
        </div>
      </div>
      
      <div class="action-bar">
        <button type="button" id="preview-btn" class="btn-primary">
          🔍 Generate Preview Link
        </button>
      </div>
    </div>
  `;

  initEditor();
  initToolbar();
  initImageQualitySelector();
  initPreviewButton();
}

function initEditor(): void {
  const editorElement = document.querySelector('#editor');
  if (!editorElement) return;

  editor = new Editor({
    element: editorElement,
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Underline,
      TextStyle,
      Color,
      Placeholder.configure({
        placeholder: 'Start typing your email content here... You can paste screenshots directly with Ctrl+V',
      }),
    ],
    content: `
      <h2>Welcome to Email Preview!</h2>
      <p>This is a sample email with <strong>rich formatting</strong>. You can:</p>
      <ul>
        <li>Format text with <em>bold</em>, <em>italic</em>, and <u>underline</u></li>
        <li>Create bulleted and numbered lists</li>
        <li>Add headings of different sizes</li>
        <li>Paste screenshots directly (Ctrl+V)</li>
      </ul>
      <p>Try editing this content or paste a screenshot to see it in action!</p>
    `,
    onUpdate: () => {
      updateStats();
    },
    editorProps: {
      handlePaste: (_view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;

        for (const item of items) {
          if (item.type.startsWith('image/')) {
            event.preventDefault();
            
            const file = item.getAsFile();
            if (!file) continue;

            const reader = new FileReader();
            reader.onload = async (e) => {
              const dataUrl = e.target?.result as string;
              const options = IMAGE_QUALITY_PRESETS[selectedImageQuality];
              
              try {
                const processedDataUrl = await compressImage(dataUrl, options);
                
                const originalSize = getImageSizeFromDataUrl(dataUrl);
                const newSize = getImageSizeFromDataUrl(processedDataUrl);
                console.log(`Image: ${formatBytes(originalSize)} → ${formatBytes(newSize)} (${selectedImageQuality})`);
                
                editor?.chain().focus().setImage({ src: processedDataUrl }).run();
              } catch (err) {
                console.error('Failed to process image:', err);
                // Fallback to original image
                editor?.chain().focus().setImage({ src: dataUrl }).run();
              }
            };
            reader.readAsDataURL(file);
            return true;
          }
        }
        return false;
      },
    },
  });

  // Initial stats update
  setTimeout(updateStats, 100);
}

function initToolbar(): void {
  const toolbar = document.querySelector('.toolbar');
  if (!toolbar || !editor) return;

  toolbar.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const button = target.closest('button');
    if (!button) return;

    const action = button.dataset.action;
    if (!action || !editor) return;

    switch (action) {
      case 'bold':
        editor.chain().focus().toggleBold().run();
        break;
      case 'italic':
        editor.chain().focus().toggleItalic().run();
        break;
      case 'underline':
        editor.chain().focus().toggleUnderline().run();
        break;
      case 'strike':
        editor.chain().focus().toggleStrike().run();
        break;
      case 'heading1':
        editor.chain().focus().toggleHeading({ level: 1 }).run();
        break;
      case 'heading2':
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        break;
      case 'heading3':
        editor.chain().focus().toggleHeading({ level: 3 }).run();
        break;
      case 'paragraph':
        editor.chain().focus().setParagraph().run();
        break;
      case 'bulletList':
        editor.chain().focus().toggleBulletList().run();
        break;
      case 'orderedList':
        editor.chain().focus().toggleOrderedList().run();
        break;
      case 'undo':
        editor.chain().focus().undo().run();
        break;
      case 'redo':
        editor.chain().focus().redo().run();
        break;
    }
  });

  // Color picker
  const colorInput = document.querySelector('#text-color') as HTMLInputElement;
  if (colorInput && editor) {
    colorInput.addEventListener('input', (e) => {
      const color = (e.target as HTMLInputElement).value;
      editor?.chain().focus().setColor(color).run();
    });
  }
}

function initImageQualitySelector(): void {
  const selector = document.querySelector('#image-quality') as HTMLSelectElement;
  if (!selector) return;

  selector.addEventListener('change', (e) => {
    selectedImageQuality = (e.target as HTMLSelectElement).value as ImageQuality;
  });
}

function initPreviewButton(): void {
  const button = document.querySelector('#preview-btn');
  if (!button) return;

  button.addEventListener('click', () => {
    if (!editor) return;

    const html = editor.getHTML();
    const result = encodeHtml(html);

    if (!result.success) {
      alert(result.error);
      return;
    }

    if (result.encodedData) {
      navigateToPreview(result.encodedData);
    }
  });
}

function updateStats(): void {
  if (!editor) return;

  const html = editor.getHTML();
  const result = encodeHtml(html);

  const rawSizeEl = document.querySelector('#raw-size');
  const compressedSizeEl = document.querySelector('#compressed-size');
  const ratioEl = document.querySelector('#compression-ratio');
  const statusEl = document.querySelector('#size-status');

  if (rawSizeEl) rawSizeEl.textContent = formatBytes(result.rawSize);
  if (compressedSizeEl) compressedSizeEl.textContent = formatBytes(result.compressedSize);
  if (ratioEl) ratioEl.textContent = `${result.compressionRatio.toFixed(1)}% saved`;
  
  if (statusEl) {
    const status = getUrlSizeStatus(result.compressedSize);
    statusEl.className = `stat status-indicator status-${status}`;
    
    switch (status) {
      case 'ok':
        statusEl.textContent = '✓ Size OK';
        break;
      case 'warning':
        statusEl.textContent = '⚠️ Getting large';
        break;
      case 'error':
        statusEl.textContent = '❌ Too large!';
        break;
    }
  }
}
