// Typing animation for code blocks
// Makes code appear to be typed out when scrolled into view

(function() {
    'use strict';

    const config = {
        typingSpeed: 15, // ms per character
        cursorBlinkSpeed: 530, // ms
        startDelay: 300, // ms before typing starts
    };

    let hasAnimated = new Set();

    // Create typing effect for a code block
    function typeCode(codeElement) {
        const originalCode = codeElement.textContent;
        const originalHTML = codeElement.innerHTML;
        
        // Store original content
        codeElement.dataset.originalHtml = originalHTML;
        
        // Clear content and add cursor
        codeElement.textContent = '';
        const cursor = document.createElement('span');
        cursor.className = 'typing-cursor';
        cursor.textContent = '▊';
        cursor.style.cssText = `
            opacity: 1;
            animation: blink ${config.cursorBlinkSpeed}ms infinite;
            color: #5dade2;
        `;
        codeElement.appendChild(cursor);
        
        // Add blink animation
        if (!document.getElementById('typing-cursor-style')) {
            const style = document.createElement('style');
            style.id = 'typing-cursor-style';
            style.textContent = `
                @keyframes blink {
                    0%, 49% { opacity: 1; }
                    50%, 100% { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        let charIndex = 0;
        
        function typeNextChar() {
            if (charIndex < originalCode.length) {
                const char = originalCode[charIndex];
                const textNode = document.createTextNode(char);
                codeElement.insertBefore(textNode, cursor);
                charIndex++;
                setTimeout(typeNextChar, config.typingSpeed);
            } else {
                // Typing complete - restore original HTML with syntax highlighting
                setTimeout(() => {
                    cursor.remove();
                    codeElement.innerHTML = originalHTML;
                }, 500);
            }
        }
        
        setTimeout(typeNextChar, config.startDelay);
    }

    // Check if element is in viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + 200 &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // Initialize typing animation for code blocks
    function init() {
        // Find code blocks in dark sections
        const codeBlocks = document.querySelectorAll('.bluepart.blackpart .multitab-code pre code');
        
        function checkScroll() {
            codeBlocks.forEach(codeBlock => {
                if (isInViewport(codeBlock) && !hasAnimated.has(codeBlock)) {
                    hasAnimated.add(codeBlock);
                    typeCode(codeBlock);
                }
            });
        }
        
        // Check on scroll
        window.addEventListener('scroll', checkScroll);
        
        // Check on load
        setTimeout(checkScroll, 100);
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

