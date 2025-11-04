// Animated stars background for dark sections
// Inspired by Super Mario World underground backgrounds

(function() {
    'use strict';

    // Configuration
    const config = {
        starCount: 40,
        blinkDuration: 1500, // ms
        minBlinkInterval: 2000, // ms
        maxBlinkInterval: 5000, // ms
        starSize: 10, // px
        colors: ['#5dade2', '#85c1e9', '#ffffff', '#8b9bb3'],
        shapes: ['+', '✦', '·', '✧']
    };

    // Create stars for a dark section
    function createStarsForSection(section) {
        const container = document.createElement('div');
        container.className = 'stars-container';
        container.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            pointer-events: none;
            z-index: 0;
        `;

        // Determine how many stars should start immediately visible
        const immediateStars = Math.floor(Math.random() * 6) + 10; // 10-15 stars

        // Create individual stars
        for (let i = 0; i < config.starCount; i++) {
            const star = createStar();
            container.appendChild(star);
            // First 10-15 stars start immediately visible
            scheduleBlink(star, i < immediateStars);
        }

        section.style.position = 'relative';
        section.insertBefore(container, section.firstChild);
    }

    // Create a single star element
    function createStar() {
        const star = document.createElement('div');
        const shape = config.shapes[Math.floor(Math.random() * config.shapes.length)];
        const color = config.colors[Math.floor(Math.random() * config.colors.length)];
        const size = config.starSize + Math.random() * 8;
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        
        star.className = 'star';
        star.textContent = shape;
        star.style.cssText = `
            position: absolute;
            left: ${x}%;
            top: ${y}%;
            font-size: ${size}px;
            color: ${color};
            opacity: 0;
            transition: opacity ${config.blinkDuration}ms ease-in-out;
            user-select: none;
            font-family: Arial, sans-serif;
        `;

        return star;
    }

    // Schedule blinking animation for a star
    function scheduleBlink(star, startImmediately = false) {
        const blink = () => {
            // Fade in
            star.style.opacity = Math.random() * 0.4 + 0.3; // 0.3 to 0.7

            // Fade out after blink duration
            setTimeout(() => {
                star.style.opacity = 0;
            }, config.blinkDuration);

            // Schedule next blink
            const nextBlink = config.minBlinkInterval +
                Math.random() * (config.maxBlinkInterval - config.minBlinkInterval);
            setTimeout(blink, nextBlink);
        };

        if (startImmediately) {
            // Start immediately with visible star, then fade out
            star.style.opacity = Math.random() * 0.4 + 0.3;
            // Fade out after blink duration
            setTimeout(() => {
                star.style.opacity = 0;
                // Then continue with normal blinking cycle
                const nextBlink = config.minBlinkInterval +
                    Math.random() * (config.maxBlinkInterval - config.minBlinkInterval);
                setTimeout(blink, nextBlink);
            }, config.blinkDuration);
        } else {
            // Start with random initial delay
            const initialDelay = Math.random() * config.maxBlinkInterval;
            setTimeout(blink, initialDelay);
        }
    }

    // Create cursor trail star
    function createCursorStar(x, y, container) {
        const star = document.createElement('div');
        const shape = config.shapes[Math.floor(Math.random() * config.shapes.length)];
        const color = config.colors[Math.floor(Math.random() * config.colors.length)];
        const size = 8 + Math.random() * 6;

        // Random position within 100px radius
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 100;
        const offsetX = Math.cos(angle) * distance;
        const offsetY = Math.sin(angle) * distance;

        star.className = 'cursor-star';
        star.textContent = shape;
        star.style.cssText = `
            position: absolute;
            left: ${x + offsetX}px;
            top: ${y + offsetY}px;
            font-size: ${size}px;
            color: ${color};
            opacity: 0;
            pointer-events: none;
            user-select: none;
            font-family: Arial, sans-serif;
            z-index: 0;
            transition: opacity 1.5s ease-in-out;
        `;

        container.appendChild(star);

        // Fade in then fade out (like the background stars)
        setTimeout(() => {
            star.style.opacity = Math.random() * 0.4 + 0.3;
        }, 10);

        setTimeout(() => {
            star.style.opacity = '0';
        }, 1500);

        // Remove after animation
        setTimeout(() => star.remove(), 3000);
    }

    // Initialize cursor trail effect
    function initCursorTrail() {
        const darkSections = document.querySelectorAll('.bluepart.blackpart');
        let lastSpawn = 0;
        const spawnInterval = 100; // ms between spawns

        darkSections.forEach(section => {
            const container = section.querySelector('.stars-container');
            if (!container) return;

            section.addEventListener('mousemove', (e) => {
                const now = Date.now();
                if (now - lastSpawn < spawnInterval) return;
                lastSpawn = now;

                const rect = section.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                // Only spawn if moving (not just hovering)
                if (Math.random() > 0.3) { // 70% chance to spawn
                    createCursorStar(x, y, container);
                }
            });
        });
    }

    // Initialize stars on page load
    function init() {
        // Find all dark sections (blackpart)
        const darkSections = document.querySelectorAll('.bluepart.blackpart');
        darkSections.forEach(section => {
            createStarsForSection(section);
        });

        // Initialize cursor trail
        initCursorTrail();
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

