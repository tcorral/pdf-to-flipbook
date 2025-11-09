# PDF to Flipbook Converter

Convert PDF files into beautiful, interactive web-based flipbooks. Works on macOS, Linux, and Windows.

## 🚀 Quick Start (< 5 minutes)

### 1. Setup
```bash
# macOS/Linux only
chmod +x flipbook
```

### 2. Convert
```bash
# macOS/Linux
./flipbook document.pdf

# Windows
flipbook.exe document.pdf
```

### 3. View
Open `document_flipbook/flipbook.html` in your browser. Done! 🎉

---

## 📖 Commands

### Basic
```bash
./flipbook file.pdf
```

### Custom Output
```bash
./flipbook file.pdf ./output
```

### Quality Settings
```bash
# Fast (lower quality)
./flipbook file.pdf --quality 60 --dpi 100

# High quality (slower)
./flipbook file.pdf --quality 95 --dpi 200

# Custom title
./flipbook file.pdf --title "My Book"
```

### All Options
```bash
./flipbook --help
```

---

## ⌨️ Options

| Option | Short | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--pdf` | `-p` | path | required | PDF file path |
| `--output` | `-o` | path | `{name}_flipbook` | Output directory |
| `--dpi` | | number | 150 | Resolution (100-300) |
| `--quality` | `-q` | 0-100 | 85 | Image quality |
| `--title` | `-t` | text | "Flipbook" | Title |
| `--subtitle` | `-s` | text | "Interactive Flipbook Viewer" | Subtitle |
| `--help` | `-h` | | | Show help |

---

## 💻 System Requirements

- **macOS:** 10.13+, Intel or Apple Silicon
- **Linux:** Ubuntu 18.04+, Debian 9+, or equivalent
- **Windows:** Windows 7 SP1 or later
- **RAM:** 2GB minimum (4GB recommended)
- **Browser:** Any modern browser

---

## 🎮 Navigation

- **Buttons:** Previous/Next/First/Last
- **Keys:** Arrow keys, Space, Home, End
- **Mouse:** Click left/right edges
- **Jump:** Type page number

---

## 📊 Quality Guide

**DPI:** 100 (fast), 150 (default), 200 (high), 300 (very high)

**Quality:** 60 (small), 85 (default), 95 (high quality)

---

## 🔄 Batch Convert

**macOS/Linux:**
```bash
for pdf in *.pdf; do
  ./flipbook "$pdf"
done
```

**Windows:**
```batch
for %%f in (*.pdf) do flipbook.exe "%%f"
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Command not found" | `chmod +x flipbook` |
| Slow conversion | Use `--quality 60 --dpi 100` |
| Out of memory | Close apps or use lower quality |
| Images not loading | Keep folder structure intact |

---

## 📤 Share Flipbooks

1. Compress output folder as ZIP
2. Share via email, cloud, USB, or web server
3. Recipients extract and open `flipbook.html`

---

## 🔧 Build from Source

### Prerequisites
Node.js 18+ and npm

### Build
```bash
npm install
npm run pkg:build
```

Creates `flipbook` and `flipbook.exe`

### Development
```bash
npm run dev        # Run with TypeScript
npm run build      # Compile TypeScript
npm run bundle     # Bundle with esbuild
```

---

## 📄 Output Structure

```
document_flipbook/
├── flipbook.html      ← Open in browser
├── README.md          ← Generated docs
├── QUICK_START.txt    ← Quick ref
└── files/page/        ← All pages as WebP
    ├── 001.webp
    ├── 002.webp
    └── ...
```

---

## 📝 Examples

```bash
# Simple
./flipbook book.pdf

# Custom output
./flipbook book.pdf ./flipbooks

# High quality
./flipbook book.pdf --quality 90 --dpi 200 --title "My Book"

# Windows
flipbook.exe book.pdf .\output
```

---

## 📄 License

MIT License - Free to use, modify, and distribute.

---

## 🎉 Get Started!

```bash
chmod +x flipbook              # macOS/Linux
./flipbook document.pdf        # Convert
# Open document_flipbook/flipbook.html
```

Enjoy creating flipbooks! 📚✨
