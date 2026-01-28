# 📧 Email Preview

A proof-of-concept application for validating email content encoding and preview via URL fragments. This tool allows users to compose rich-text email content, encode it into a shareable URL, and preview exactly how it will appear when published.

## 🎯 Purpose

This application validates the feasibility of:
- Encoding HTML email content (including embedded images) into a URL fragment
- Passing that data via URL without server-side storage
- Decoding and rendering the content accurately in a web browser

### How It Works

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│  Compose Page   │      │   URL Fragment   │      │  Preview Page   │
│                 │      │                  │      │                 │
│  Rich text +    │─────▶│  Compressed &    │─────▶│  Decoded &      │
│  Images         │      │  Base64 encoded  │      │  Rendered HTML  │
└─────────────────┘      └──────────────────┘      └─────────────────┘
```

1. **Compose**: Users create formatted email content using a WYSIWYG editor (similar to Outlook)
2. **Encode**: Content is compressed using [lz-string](https://github.com/pieroxy/lz-string) and encoded for URL safety
3. **Share**: A preview URL is generated with the encoded content in the fragment (after `#`)
4. **Preview**: Opening the URL decodes and renders the exact content

### Key Technical Details

- **No server storage**: All data lives in the URL fragment, which is never sent to a server
- **Compression**: lz-string typically achieves 60-80% compression on HTML content
- **URL Limits**: Chrome and Edge support URLs up to ~2MB, plenty for most email content
- **Image handling**: Pasted screenshots are converted to base64 and embedded inline

## 🚀 Try the Demo

The application is deployed at: **[https://lab49.github.io/email-preview-demo/compose.html](https://lab49.github.io/email-preview-demo/compose.html)**

### Using the Demo

1. **Open the Compose page** at the URL above
2. **Create your content**:
   - Use the toolbar to format text (bold, italic, headings, lists, colors)
   - Paste screenshots directly with `Ctrl+V` / `Cmd+V`
   - Watch the stats bar for real-time size information
3. **Choose image quality** (optional):
   - Select from Original, High, Medium, or Low compression
   - Lower quality = smaller URL size
4. **Generate Preview**:
   - Click "Generate Preview Link"
   - A new tab opens with your rendered preview
5. **Share**:
   - Click "Copy URL" on the preview page
   - Share the URL with others - they'll see the exact same content

### Understanding the Stats

| Stat | Description |
|------|-------------|
| **Raw Size** | Uncompressed HTML content size |
| **Compressed** | Size after lz-string compression |
| **Compression** | Percentage of size reduction |
| **URL Length** | Total characters in the preview URL |
| **Status** | ✓ OK, ⚠️ Getting large, or ❌ Too large |

## 🛠️ Developer Guide

### Prerequisites

- Node.js 18+ 
- npm 9+

### Local Development

```bash
# Clone the repository
git clone https://github.com/lab49/email-preview-demo.git
cd email-preview-demo

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173/compose.html`

### Project Structure

```
email-preview/
├── src/
│   ├── main.ts           # Entry point, route handling
│   ├── router.ts         # Simple path-based routing
│   ├── composePage.ts    # Rich text editor & compose UI
│   ├── previewPage.ts    # Preview rendering
│   ├── encoding.ts       # lz-string encode/decode utilities
│   ├── imageUtils.ts     # Image compression utilities
│   └── style.css         # All styles
├── index.html            # Redirects to compose
├── compose.html          # Compose page entry
├── preview.html          # Preview page entry
├── vite.config.ts        # Vite configuration
└── .github/workflows/
    └── deploy.yml        # GitHub Pages deployment
```

### Key Technologies

- **[Vite](https://vitejs.dev/)** - Build tool and dev server
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tiptap](https://tiptap.dev/)** - Rich text editor (ProseMirror-based)
- **[lz-string](https://github.com/pieroxy/lz-string)** - Compression library

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |

### Making Changes

1. **Fork the repository** and create a feature branch
2. **Make your changes** with clear, descriptive commits
3. **Test locally** with `npm run dev`
4. **Build and verify** with `npm run build && npm run preview`
5. **Submit a pull request** with a description of your changes

### Deployment

The app automatically deploys to GitHub Pages when changes are pushed to `main`:

1. GitHub Actions runs the build (`npm run build`)
2. The `dist/` folder is deployed to GitHub Pages
3. Changes are live within a few minutes

### Customization

**Changing the editor toolbar**: Edit the toolbar HTML in `src/composePage.ts` and add corresponding actions in `initToolbar()`

**Adding image quality presets**: Modify `IMAGE_QUALITY_PRESETS` in `src/imageUtils.ts`

**Adjusting URL size limits**: Change `MAX_URL_LENGTH` in `src/encoding.ts` (default: 2MB)

## ⚠️ Limitations

- **URL Size**: Very large emails with many images may exceed browser URL limits
- **Browser Support**: Optimized for Chrome and Edge; other browsers may have lower URL limits
- **Not for Production**: This is a proof-of-concept; production use would require additional security considerations (XSS sanitization, etc.)

## 📄 License

MIT
