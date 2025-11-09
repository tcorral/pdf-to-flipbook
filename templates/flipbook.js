        const totalPages = <%= totalPages %>;
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
                img.src = `files/page/001.webp`;
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
            page.className = `page ${position}`;

            const img = document.createElement('img');
            img.src = `files/page/${String(pageNum).padStart(3, '0')}.webp`;
            img.alt = `Page ${pageNum}`;
            img.loading = 'lazy';

            page.appendChild(img);
            return page;
        }

        function updateUI() {
            pageInput.value = currentPage;
            if (currentPageSpan) {
                currentPageSpan.textContent = currentPage;
            }

            // Update progress bar
            if (progressFill) {
                const progress = (currentPage / totalPages) * 100;
                progressFill.style.width = progress + '%';
            }

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
