// Button rocket animation - backs up then shoots to the right before navigating
(function() {
    'use strict';

    const config = {
        backupDistance: 30, // px to move left
        backupDuration: 400, // ms (longer wind-up)
        pauseDuration: 200, // ms (pause after wind-up)
        shootDuration: 500, // ms (slower shoot)
        particleCount: 15, // number of particles to spawn
        minScreenWidth: 1200, // minimum screen width to enable animation
        wobbleAmplitude: 8, // px up/down movement during flight
    };

    // Create particle effect
    function createParticle(x, y) {
        const particle = document.createElement('div');
        const angle = Math.random() * Math.PI * 2;
        const velocity = 2 + Math.random() * 3;
        const size = 3 + Math.random() * 4;
        const colors = ['#5dade2', '#85c1e9', '#ffffff', '#ffd93d'];
        const color = colors[Math.floor(Math.random() * colors.length)];

        particle.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border-radius: 50%;
            pointer-events: none;
            z-index: 10000;
            opacity: 1;
            transition: all 0.6s ease-out;
        `;

        document.body.appendChild(particle);

        // Animate particle
        requestAnimationFrame(() => {
            const dx = Math.cos(angle) * velocity * 50;
            const dy = Math.sin(angle) * velocity * 50;
            particle.style.transform = `translate(${dx}px, ${dy}px)`;
            particle.style.opacity = '0';
        });

        // Remove after animation
        setTimeout(() => particle.remove(), 600);
    }

    // Spawn particles during flight
    function spawnParticles(button) {
        const rect = button.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < config.particleCount; i++) {
            setTimeout(() => {
                const currentRect = button.getBoundingClientRect();
                // Spawn particles more to the left (at 30% of button width instead of center)
                const x = currentRect.left + currentRect.width * 0.3;
                const y = currentRect.top + currentRect.height / 2;
                createParticle(x, y);
            }, i * 20); // Stagger particle creation
        }
    }

    function init() {
        document.body.addEventListener('click', function(e) {
            // Check if clicked element is the documentation button
            const button = e.target.closest('.landing-btn.arrow[href="/documentation"]');

            if (!button) return;

            // Only enable animation on screens >= 1200px wide
            if (window.innerWidth < config.minScreenWidth) {
                // Let the default link behavior happen
                return;
            }

            // Check if user has spawned at least 10 rockets
            const rocketCount = window.rocketSpawnCount || 0;
            if (rocketCount < 10) {
                // Let the default link behavior happen
                return;
            }

            e.preventDefault();

            const targetUrl = button.getAttribute('href');
            const buttonRect = button.getBoundingClientRect();
            const windowWidth = window.innerWidth;
            const shootDistance = windowWidth - buttonRect.left;

            // Force hover state and add rocket shape
            button.classList.add('force-hover');
            const style = document.createElement('style');
            style.textContent = `
                .landing-btn.force-hover {
                    background: #fff !important;
                    color: #0d1b2a !important;
                    border-color: #fff !important;
                }
                .landing-btn.force-hover svg {
                    fill: #0d1b2a !important;
                }
            `;
            document.head.appendChild(style);

            // Set up for animation
            button.style.position = 'relative';

            // Set initial clip-path (rectangle) with points at corners
            button.style.clipPath = 'polygon(0 0, 0 50%, 0 100%, 100% 100%, 100% 50%, 100% 0)';

            // Force a reflow to ensure initial state is set
            button.offsetHeight;

            button.style.transition = `transform ${config.backupDuration}ms ease-in, clip-path ${config.backupDuration}ms ease-in, padding ${config.backupDuration}ms ease-in, border-radius ${config.backupDuration}ms ease-in`;

            // Phase 1: Back up to the left and transform into rocket shape
            requestAnimationFrame(() => {
                button.style.transform = `translateX(-${config.backupDistance}px)`;
                // Rocket shape: concave on left, arrow on right (> >)
                // Straight lines, but we'll use border-radius to round the tips
                button.style.clipPath = 'polygon(0 0, 15% 50%, 0 100%, 85% 100%, 100% 50%, 85% 0)';
                button.style.borderRadius = '8px';
                // Increase padding to compensate for clipped areas (more on left)
                button.style.paddingLeft = '55px';
                button.style.paddingRight = '45px';
            });

            // Phase 2: Pause after wind-up
            setTimeout(() => {
                // Just hold position, no transition change needed
            }, config.backupDuration);

            // Phase 3: Shoot to the right after pause
            setTimeout(() => {
                button.style.transition = `transform ${config.shootDuration}ms ease-out`;

                // Animate with wobble using multiple steps
                let startTime = null;
                const startX = -config.backupDistance;

                function animateWobble(timestamp) {
                    if (!startTime) startTime = timestamp;
                    const elapsed = timestamp - startTime;
                    const progress = Math.min(elapsed / config.shootDuration, 1);

                    // Calculate X position (linear from start to end)
                    const currentX = startX + (shootDistance - startX) * progress;

                    // Calculate Y wobble (sine wave)
                    const wobbleProgress = progress * Math.PI * 2; // 2 full cycles
                    const currentY = Math.sin(wobbleProgress) * config.wobbleAmplitude;

                    button.style.transform = `translateX(${currentX}px) translateY(${currentY}px)`;

                    if (progress < 1) {
                        requestAnimationFrame(animateWobble);
                    }
                }

                requestAnimationFrame(animateWobble);

                // Start spawning particles
                spawnParticles(button);
            }, config.backupDuration + config.pauseDuration);

            // Phase 4: Navigate after rocket is off screen (add extra delay)
            setTimeout(() => {
                window.location.href = targetUrl;
            }, config.backupDuration + config.pauseDuration + config.shootDuration + 200);
        });
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

