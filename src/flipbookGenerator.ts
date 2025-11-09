/**
 * Flipbook HTML generator module
 */

import * as fs from 'fs';
import * as path from 'path';
import { FlipbookConfig } from './types.js';

export class FlipbookGenerator {
  /**
   * Generate the interactive flipbook HTML
   */
  static generateHTML(config: FlipbookConfig): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.title} - Flipbook Viewer</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, ${config.headerColor1} 0%, ${config.headerColor2} 100%);
            height: 100vh;
            display: flex;
            flex-direction: column;
            padding: 10px;
            overflow: hidden;
        }
        
        .header {
            text-align: center;
            color: white;
            margin-bottom: 10px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            flex-shrink: 0;
        }
        
        .header h1 {
            font-size: 2em;
            margin-bottom: 4px;
            font-weight: 700;
        }
        
        .header p {
            font-size: 0.9em;
            opacity: 0.95;
            font-weight: 300;
            letter-spacing: 0.5px;
        }
        
        .container {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 5px;
            min-height: 0;
            width: 100%;
        }
        
        .flipbook-wrapper {
            width: 100%;
            height: 100%;
            max-width: 1200px;
            aspect-ratio: 1.4 / 1;
            background: white;
            border-radius: 10px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            overflow: hidden;
            position: relative;
        }
        
        .book {
            width: 100%;
            height: 100%;
            display: flex;
            background: #f5f5f5;
            position: relative;
        }
        
        .pages-container {
            width: 100%;
            height: 100%;
            display: flex;
            position: relative;
            background: white;
        }
        
        .page {
            position: absolute;
            width: 50%;
            height: 100%;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }
        
        .page.left {
            left: 0;
            border-right: 1px solid #e0e0e0;
        }
        
        .page.right {
            right: 0;
        }
        
        .page.full {
            width: 100%;
            left: 0 !important;
            right: 0 !important;
            border-right: none !important;
        }
        
        .page img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            display: block;
        }
        
        .page-navigation {
            position: absolute;
            top: 0;
            width: 33.333%;
            height: 100%;
            cursor: pointer;
            z-index: 10;
        }
        
        .page-navigation.left {
            left: 0;
        }
        
        .page-navigation.right {
            right: 0;
        }
        
        .page-transition {
            animation: pageFlip 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }
        
        @keyframes pageFlip {
            0% {
                opacity: 1;
                transform: scaleX(1) rotateY(0deg);
            }
            50% {
                opacity: 0.7;
            }
            100% {
                opacity: 1;
                transform: scaleX(1) rotateY(0deg);
            }
        }
        
        .controls {
            background: white;
            border-radius: 10px;
            padding: 8px 15px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }
        
        .control-group {
            display: flex;
            gap: 10px;
            align-items: center;
        }
        
        button {
            padding: 6px 12px;
            background: linear-gradient(135deg, ${config.headerColor1} 0%, ${config.headerColor2} 100%);
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.85em;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        
        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(102, 126, 234, 0.6);
        }
        
        button:active {
            transform: translateY(0px);
        }
        
        button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }
        
        .page-input {
            padding: 10px 12px;
            border: 2px solid #ddd;
            border-radius: 6px;
            font-size: 0.95em;
            width: 80px;
            text-align: center;
            transition: border-color 0.3s ease;
        }
        
        .page-input:focus {
            outline: none;
            border-color: ${config.headerColor1};
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .page-info {
            font-size: 0.95em;
            color: #666;
            font-weight: 500;
            min-width: 120px;
            text-align: center;
        }
        
        .progress-bar {
            width: 200px;
            height: 6px;
            background: #e0e0e0;
            border-radius: 3px;
            overflow: hidden;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, ${config.headerColor1} 0%, ${config.headerColor2} 100%);
            width: 0%;
            transition: width 0.3s ease;
        }
        
        .shortcuts {
            font-size: 0.7em;
            color: #999;
            padding: 2px 0;
            text-align: center;
            width: 100%;
            flex-shrink: 0;
        }
        
        .shortcut-item {
            display: inline-block;
            margin: 0 6px;
        }
        
        .shortcut-item kbd {
            background: #f0f0f0;
            border: 1px solid #ccc;
            border-radius: 4px;
            padding: 2px 6px;
            font-family: monospace;
            font-size: 0.9em;
        }
        
        /* Responsive Design */
        @media (max-width: 1024px) {
            .header h1 {
                font-size: 2em;
            }
            
            .header p {
                font-size: 1em;
            }
        }
        
        @media (max-width: 768px) {
            .header h1 {
                font-size: 1.5em;
            }
            
            .header p {
                font-size: 0.9em;
            }
            
            .controls {
                flex-direction: column;
                gap: 10px;
            }
            
            .control-group {
                width: 100%;
                justify-content: center;
                flex-wrap: wrap;
            }
            
            .page-info {
                min-width: 100%;
            }
            
            .progress-bar {
                width: 100%;
            }
            
            .shortcuts {
                font-size: 0.75em;
            }
            
            .shortcut-item {
                margin: 0 6px;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${config.title}</h1>
        <p>${config.subtitle}</p>
    </div>
    
    <div class="container">
        <div class="flipbook-wrapper">
            <div class="book">
                <div class="pages-container" id="pagesContainer"></div>
                <div class="page-navigation left" id="navLeft"></div>
                <div class="page-navigation right" id="navRight"></div>
            </div>
        </div>
    </div>
    
    <div class="controls">
        <div class="control-group">
            <button id="firstBtn" onclick="goToPage(1)">⏮ First</button>
            <button id="prevBtn" onclick="previousPage()">◀ Previous</button>
            <button id="nextBtn" onclick="nextPage()">Next ▶</button>
            <button id="lastBtn" onclick="goToPage(totalPages)">Last ⏭</button>
        </div>
        
        <div class="control-group">
            <label for="pageInput">Go to page:</label>
            <input type="number" id="pageInput" class="page-input" min="1" max="${config.totalPages}" onkeypress="if(event.key==='Enter') goToPage(parseInt(this.value))" />
        </div>
        
        <div class="page-info">
            <span id="currentPage">1</span> / ${config.totalPages}
        </div>
        
        <div class="progress-bar">
            <div class="progress-fill" id="progressFill"></div>
        </div>
    </div>
    
    <div class="shortcuts">
        <div class="shortcut-item"><kbd>←</kbd> / <kbd>→</kbd> Previous/Next</div>
        <div class="shortcut-item"><kbd>Space</kbd> Next page</div>
        <div class="shortcut-item"><kbd>Home</kbd> / <kbd>End</kbd> First/Last</div>
        <div class="shortcut-item">Click edges to navigate</div>
    </div>
    
    <script>
        const totalPages = ${config.totalPages};
        let currentPage = 1;
        
        const pagesContainer = document.getElementById('pagesContainer');
        const pageInput = document.getElementById('pageInput');
        const currentPageSpan = document.getElementById('currentPage');
        const progressFill = document.getElementById('progressFill');
        const navLeft = document.getElementById('navLeft');
        const navRight = document.getElementById('navRight');
        
        // Initialize pages
        function initPages() {
            pagesContainer.innerHTML = '';
            
            // Single page logic
            if (totalPages === 1) {
                const img = document.createElement('img');
                img.src = \`files/page/001.webp\`;
                img.alt = 'Page 1';
                const page = document.createElement('div');
                page.className = 'page full';
                page.appendChild(img);
                pagesContainer.appendChild(page);
                return;
            }
            
            // Determine which pages to display
            let leftPageNum = null;
            let rightPageNum = null;
            
            if (currentPage === 1) {
                // Front cover alone on right
                rightPageNum = 1;
            } else if (currentPage === totalPages) {
                // Back cover alone on left
                leftPageNum = totalPages;
            } else {
                // Two-page spread
                if (currentPage % 2 === 1) {
                    // Odd page on left, even page on right
                    leftPageNum = currentPage;
                    rightPageNum = currentPage + 1 <= totalPages ? currentPage + 1 : null;
                } else {
                    // Even page on left, odd page on right
                    leftPageNum = currentPage - 1;
                    rightPageNum = currentPage;
                }
            }
            
            // Create left page
            if (leftPageNum) {
                const leftPage = createPageElement(leftPageNum, 'left');
                pagesContainer.appendChild(leftPage);
            }
            
            // Create right page
            if (rightPageNum) {
                const rightPage = createPageElement(rightPageNum, currentPage === 1 || currentPage === totalPages ? 'full' : 'right');
                pagesContainer.appendChild(rightPage);
            }
        }
        
        function createPageElement(pageNum, position) {
            const page = document.createElement('div');
            page.className = \`page \${position}\`;
            
            const img = document.createElement('img');
            img.src = \`files/page/\${String(pageNum).padStart(3, '0')}.webp\`;
            img.alt = \`Page \${pageNum}\`;
            img.loading = 'lazy';
            
            page.appendChild(img);
            return page;
        }
        
        function updateUI() {
            pageInput.value = currentPage;
            currentPageSpan.textContent = currentPage;
            
            // Update progress bar
            const progress = (currentPage / totalPages) * 100;
            progressFill.style.width = progress + '%';
            
            // Update button states
            document.getElementById('firstBtn').disabled = currentPage === 1;
            document.getElementById('prevBtn').disabled = currentPage === 1;
            document.getElementById('nextBtn').disabled = currentPage >= totalPages;
            document.getElementById('lastBtn').disabled = currentPage === totalPages;
            
            initPages();
        }
        
        function nextPage() {
            if (currentPage < totalPages) {
                currentPage = Math.min(currentPage + 2, totalPages);
                if (currentPage === totalPages - 1) currentPage = totalPages;
                updateUI();
            }
        }
        
        function previousPage() {
            if (currentPage > 1) {
                currentPage = Math.max(currentPage - 2, 1);
                updateUI();
            }
        }
        
        function goToPage(pageNum) {
            pageNum = Math.max(1, Math.min(parseInt(pageNum) || 1, totalPages));
            currentPage = pageNum;
            updateUI();
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowRight':
                    e.preventDefault();
                    nextPage();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    previousPage();
                    break;
                case ' ':
                    e.preventDefault();
                    nextPage();
                    break;
                case 'Home':
                    e.preventDefault();
                    goToPage(1);
                    break;
                case 'End':
                    e.preventDefault();
                    goToPage(totalPages);
                    break;
            }
        });
        
        // Click navigation
        navLeft.addEventListener('click', previousPage);
        navRight.addEventListener('click', nextPage);
        
        // Initialize
        updateUI();
    </script>
</body>
</html>`;
  }

  /**
   * Save HTML to file
   */
  static saveHTML(html: string, outputPath: string): void {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, html, 'utf-8');
  }
}

