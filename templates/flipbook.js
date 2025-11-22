        const totalPages = <%= totalPages %>;
        let currentPage = 1;
        let isAnimating = false;

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
                // currentPage represents the left page number
                leftPageNum = currentPage;
                rightPageNum = currentPage + 1;
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

        function updateUI(skipAnimation = false) {
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
            document.getElementById('lastBtn').disabled = currentPage >= totalPages;

            if (skipAnimation) {
                initPages();
            }
        }

        function updateUIElements() {
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
            document.getElementById('lastBtn').disabled = currentPage >= totalPages;
        }

        function turnPageForward() {
            if (isAnimating || currentPage >= totalPages || totalPages === 1) {
                return;
            }

            console.log('Starting forward animation from page', currentPage);
            isAnimating = true;
            
            // Calculate new page position
            // From page 1 (cover), go to page 2 (shows pages 2-3)
            // From page 2, go to page 4 (shows pages 4-5)
            // currentPage is the LEFT page number
            let newPagePosition;
            
            if (currentPage === 1) {
                // From cover, go to page 2 (shows pages 2-3)
                newPagePosition = 2;
            } else {
                // From a two-page spread, move forward by 2
                newPagePosition = Math.min(currentPage + 2, totalPages);
                
                // Adjust for edge cases - if we land on the last page or near it
                if (newPagePosition === totalPages - 1) {
                    newPagePosition = totalPages;
                } else if (newPagePosition > totalPages) {
                    newPagePosition = totalPages;
                }
            }
            
            currentPage = newPagePosition;

            // Get the right page element that will turn
            const rightPage = pagesContainer.querySelector('.page.right, .page.full');
            if (!rightPage) {
                isAnimating = false;
                updateUI(true); // This is the only place we need to reset
                return;
            }

            // Prepare new pages that will appear behind
            // currentPage is the LEFT page number
            let newLeftPageNum = null;
            let newRightPageNum = null;

            if (currentPage === 1) {
                // Only page 1 (full width)
                newRightPageNum = 1;
            } else if (currentPage === totalPages) {
                // Only last page (full width)
                newLeftPageNum = totalPages;
            } else {
                // Two-page spread: currentPage is on the left, currentPage+1 is on the right
                newLeftPageNum = currentPage;
                newRightPageNum = currentPage + 1;
            }

            // Create new pages behind the turning page
            const newLeftPage = newLeftPageNum ? createPageElement(newLeftPageNum, 'left') : null;
            const newRightPage = newRightPageNum ? createPageElement(newRightPageNum, currentPage === 1 || currentPage === totalPages ? 'full' : 'right') : null;

            if (newLeftPage) {
                newLeftPage.classList.add('page-behind');
                pagesContainer.appendChild(newLeftPage);
            }
            if (newRightPage) {
                newRightPage.classList.add('page-behind');
                pagesContainer.appendChild(newRightPage);
            }

            // Add turning class and start animation
            rightPage.classList.add('page-turning-forward');
            rightPage.style.zIndex = '100';

            // Update UI elements immediately (progress bar, buttons, etc.) but don't touch pages
            updateUIElements();

            // Wait for animation to complete
            rightPage.addEventListener('animationend', function onAnimationEnd() {
                console.log('Forward animation completed');
                rightPage.removeEventListener('animationend', onAnimationEnd);
                rightPage.remove();
                if (newLeftPage) newLeftPage.classList.remove('page-behind');
                if (newRightPage) newRightPage.classList.remove('page-behind');
                isAnimating = false;
                // Don't need to call initPages as the new pages are already in place
            }, { once: true });

            // Fallback timeout in case animation doesn't complete
            setTimeout(() => {
                if (isAnimating) {
                    console.log('Forward animation timeout, forcing completion');
                    rightPage.remove();
                    if (newLeftPage) newLeftPage.classList.remove('page-behind');
                    if (newRightPage) newRightPage.classList.remove('page-behind');
                    isAnimating = false;
                }
            }, 1000);
        }

        function turnPageBackward() {
            if (isAnimating || currentPage <= 1 || totalPages === 1) {
                return;
            }

            console.log('Starting backward animation from page', currentPage);
            isAnimating = true;
            
            // Calculate new page position
            // From page 2, go back to page 1 (cover)
            // From any other page, move backward by 2
            // currentPage is the LEFT page number
            let newPagePosition;
            
            if (currentPage === 2) {
                // From page 2 (pages 2-3), go back to cover (page 1)
                newPagePosition = 1;
            } else {
                // From a two-page spread, move backward by 2
                newPagePosition = Math.max(currentPage - 2, 1);
            }
            
            currentPage = newPagePosition;

            // Get the left page element that will turn
            const leftPage = pagesContainer.querySelector('.page.left');
            if (!leftPage) {
                isAnimating = false;
                updateUI(true);
                return;
            }

            // Prepare new pages that will appear behind
            // currentPage is the LEFT page number
            let newLeftPageNum = null;
            let newRightPageNum = null;

            if (currentPage === 1) {
                // Only page 1 (full width)
                newRightPageNum = 1;
            } else if (currentPage === totalPages) {
                // Only last page (full width)
                newLeftPageNum = totalPages;
            } else {
                // Two-page spread: currentPage is on the left, currentPage+1 is on the right
                newLeftPageNum = currentPage;
                newRightPageNum = currentPage + 1;
            }

            // Create new pages behind the turning page
            const newLeftPage = newLeftPageNum ? createPageElement(newLeftPageNum, 'left') : null;
            const newRightPage = newRightPageNum ? createPageElement(newRightPageNum, currentPage === 1 || currentPage === totalPages ? 'full' : 'right') : null;

            if (newLeftPage) {
                newLeftPage.classList.add('page-behind');
                pagesContainer.appendChild(newLeftPage);
            }
            if (newRightPage) {
                newRightPage.classList.add('page-behind');
                pagesContainer.appendChild(newRightPage);
            }

            // Set z-index for turning page
            leftPage.style.zIndex = '100';

            // Update UI elements immediately (progress bar, buttons, etc.) but don't touch pages
            updateUIElements();

            // Add turning class and start animation
            leftPage.classList.add('page-turning-backward');

            // Wait for animation to complete
            leftPage.addEventListener('animationend', function onAnimationEnd() {
                console.log('Backward animation completed');
                leftPage.removeEventListener('animationend', onAnimationEnd);
                leftPage.remove();
                if (newLeftPage) newLeftPage.classList.remove('page-behind');
                if (newRightPage) newRightPage.classList.remove('page-behind');
                isAnimating = false;
                // Don't need to call initPages as the new pages are already in place
            }, { once: true });

            // Fallback timeout in case animation doesn't complete
            setTimeout(() => {
                if (isAnimating) {
                    console.log('Backward animation timeout, forcing completion');
                    leftPage.remove();
                    if (newLeftPage) newLeftPage.classList.remove('page-behind');
                    if (newRightPage) newRightPage.classList.remove('page-behind');
                    isAnimating = false;
                }
            }, 1000);
        }

        function nextPage() {
            console.log('nextPage called, currentPage:', currentPage, 'isAnimating:', isAnimating);
            if (currentPage < totalPages && !isAnimating) {
                console.log('Calling turnPageForward');
                turnPageForward();
            } else {
                console.log('Not calling turnPageForward, conditions not met');
            }
        }

        function previousPage() {
            console.log('previousPage called, currentPage:', currentPage, 'isAnimating:', isAnimating);
            if (currentPage > 1 && !isAnimating) {
                console.log('Calling turnPageBackward');
                turnPageBackward();
            } else {
                console.log('Not calling turnPageBackward, conditions not met');
            }
        }

        function goToPage(pageNum) {
            if (isAnimating) {
                return;
            }
            pageNum = Math.max(1, Math.min(parseInt(pageNum) || 1, totalPages));
            const pageDiff = Math.abs(pageNum - currentPage);
            
            // For large jumps or single page, skip animation
            if (pageDiff > 4 || totalPages === 1) {
                currentPage = pageNum;
                updateUI(true);
                return;
            }

            // For small jumps, use animation
            if (pageNum > currentPage) {
                // Turn forward until we reach the target
                const turnForward = () => {
                    if (currentPage < pageNum && !isAnimating) {
                        turnPageForward();
                        setTimeout(() => {
                            if (currentPage < pageNum) {
                                turnForward();
                            }
                        }, 850);
                    }
                };
                turnForward();
            } else if (pageNum < currentPage) {
                // Turn backward until we reach the target
                const turnBackward = () => {
                    if (currentPage > pageNum && !isAnimating) {
                        turnPageBackward();
                        setTimeout(() => {
                            if (currentPage > pageNum) {
                                turnBackward();
                            }
                        }, 850);
                    }
                };
                turnBackward();
            }
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
        updateUI(true);
