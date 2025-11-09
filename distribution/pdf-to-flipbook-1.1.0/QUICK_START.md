# Quick Start Guide

## Setup (30 seconds)

### macOS/Linux
```bash
chmod +x flipbook-macos-arm64  # Make executable (Apple Silicon)
# or: chmod +x flipbook-macos-x64  (Intel Mac)
# or: chmod +x flipbook-linux-x64  (Linux)
```

### Windows
No setup needed - just use `flipbook-win-x64.exe` directly.

## Convert Your First PDF

```bash
# macOS (Apple Silicon)
./flipbook-macos-arm64 mybook.pdf

# macOS (Intel)
./flipbook-macos-x64 mybook.pdf

# Linux
./flipbook-linux-x64 mybook.pdf

# Windows
flipbook-win-x64.exe mybook.pdf
```

## View Your Flipbook

1. The conversion creates a folder (e.g., `mybook_flipbook/`)
2. Open `flipbook.html` in your web browser
3. Done! 🎉

## Common Commands

```bash
# Custom output directory
./flipbook-macos-arm64 mybook.pdf ./my-flipbook

# Add custom title
./flipbook-macos-arm64 mybook.pdf --title "My Book"

# High quality (slower, larger file)
./flipbook-macos-arm64 mybook.pdf --quality 95 --dpi 200

# Fast conversion (lower quality)
./flipbook-macos-arm64 mybook.pdf --quality 60 --dpi 100
```

## Next Steps

- See `README.md` for complete documentation
- Use `--theme-dir` to customize the look with your own CSS
- Use `--template-dir` to customize the HTML structure

For help:
```bash
./flipbook-macos-arm64 --help
```

Enjoy! 📚✨
