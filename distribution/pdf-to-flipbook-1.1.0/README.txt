╔══════════════════════════════════════════════════════════════════════════════╗
║                        PDF to Flipbook Converter v1.1.0                      ║
║                  Convert PDFs into Interactive Web Flipbooks                 ║
╚══════════════════════════════════════════════════════════════════════════════╝

WHAT'S INCLUDED
═══════════════════════════════════════════════════════════════════════════════

This package contains executables for all operating systems:

• flipbook-macos-arm64  - For Apple Silicon (M1/M2/M3) Macs
• flipbook-macos-x64    - For Intel Macs
• flipbook-linux-x64    - For 64-bit Linux
• flipbook-win-x64.exe  - For Windows (64-bit)
• README.md             - Documentation

GETTING STARTED
═══════════════════════════════════════════════════════════════════════════════

1. Select the correct executable for your operating system:
   - Apple Silicon Mac (M1/M2/M3): use "flipbook-macos-arm64"
   - Intel Mac: use "flipbook-macos-x64"
   - Linux: use "flipbook-linux-x64"
   - Windows: use "flipbook-win-x64.exe"

2. Make it executable (macOS/Linux only):
   chmod +x flipbook-macos-arm64
   (or the appropriate executable for your system)

3. Try a test conversion:
   ./flipbook-macos-arm64 mybook.pdf
   (or: flipbook-win-x64.exe mybook.pdf on Windows)

QUICK START
═══════════════════════════════════════════════════════════════════════════════

macOS (Apple Silicon):
  ./flipbook-macos-arm64 document.pdf

macOS (Intel):
  ./flipbook-macos-x64 document.pdf

Linux:
  ./flipbook-linux-x64 document.pdf

Windows:
  flipbook-win-x64.exe document.pdf

This creates a folder with an interactive flipbook. Open flipbook.html in your
browser to view it!

SYSTEM REQUIREMENTS
═══════════════════════════════════════════════════════════════════════════════

• macOS 10.13 or later
• Linux with glibc 2.28+
• Windows 7 SP1 or later
• Modern web browser (Chrome, Firefox, Safari, Edge)
• 2GB RAM minimum

NEED HELP?
═══════════════════════════════════════════════════════════════════════════════

1. Review this README.txt file
2. Check the included README.md for more details
3. Run with --help flag for command options:
   ./flipbook-macos-arm64 --help (or your platform's executable)

SUPPORT
═══════════════════════════════════════════════════════════════════════════════

For questions or issues:
• Review the included README.md documentation
• Run: ./flipbook-macos-arm64 --help (for command options)
• Make sure you are using the correct executable for your OS

TROUBLESHOOTING
═══════════════════════════════════════════════════════════════════════════════

"Command not found":
  Make sure the file is executable: chmod +x flipbook-macos-arm64

"Permission denied":
  chmod +x flipbook-macos-arm64

"Cannot execute binary file":
  Make sure you downloaded the correct version:
  - Apple Silicon Mac: flipbook-macos-arm64
  - Intel Mac: flipbook-macos-x64
  - Linux: flipbook-linux-x64
  - Windows: flipbook-win-x64.exe

═══════════════════════════════════════════════════════════════════════════════

Ready to convert PDFs? See README.md or QUICK_START.md for more information.

Happy flipping! 📚
