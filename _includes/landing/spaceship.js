// Spaceship/rocket flying through dark sections
// One spaceship per section, flying from bottom to top

(function() {
    'use strict';

    const config = {
        speed: 8000, // ms to cross the screen
        delayBetweenFlights: 15000, // ms between flights
        initialDelay: 3000, // ms before first flight
        size: 32, // px (reduced from 40)
        smokeParticles: 8, // number of smoke particles
    };

    // Create spaceship SVG element
    function createSpaceship() {
        const ship = document.createElement('div');
        ship.className = 'spaceship';
        ship.innerHTML = `
            <svg width="${config.size}" height="${config.size * 1.5}" viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg">
                <!-- Rocket body -->
                <path d="M20 5 L15 25 L15 45 L25 45 L25 25 Z" fill="#5dade2" stroke="#85c1e9" stroke-width="1"/>
                <!-- Nose cone -->
                <path d="M20 0 L15 15 L25 15 Z" fill="#85c1e9"/>
                <!-- Window -->
                <circle cx="20" cy="20" r="4" fill="#0d1b2a" opacity="0.6"/>
                <!-- Left fin -->
                <path d="M15 35 L8 50 L15 45 Z" fill="#5dade2" stroke="#85c1e9" stroke-width="1"/>
                <!-- Right fin -->
                <path d="M25 35 L32 50 L25 45 Z" fill="#5dade2" stroke="#85c1e9" stroke-width="1"/>
                <!-- Flame -->
                <ellipse cx="20" cy="50" rx="6" ry="8" fill="#ff6b6b" opacity="0.8">
                    <animate attributeName="ry" values="8;12;8" dur="0.3s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.8;1;0.8" dur="0.3s" repeatCount="indefinite"/>
                </ellipse>
                <ellipse cx="20" cy="52" rx="4" ry="6" fill="#ffd93d" opacity="0.9">
                    <animate attributeName="ry" values="6;9;6" dur="0.2s" repeatCount="indefinite"/>
                </ellipse>
            </svg>
        `;
        ship.style.cssText = `
            position: absolute;
            width: ${config.size}px;
            height: ${config.size * 1.5}px;
            opacity: 0;
            pointer-events: none;
            z-index: 0;
            filter: drop-shadow(0 0 10px rgba(93, 173, 226, 0.5));
            transition: opacity 0.3s ease-in-out;
        `;
        return ship;
    }

    // Create smoke particle
    function createSmokeParticle(x, y, container) {
        const smoke = document.createElement('div');
        smoke.className = 'smoke-particle';
        smoke.textContent = '·';

        const offsetX = (Math.random() - 0.5) * 15;
        const size = 10 + Math.random() * 10;

        smoke.style.cssText = `
            position: absolute;
            left: ${x + offsetX}px;
            top: ${y}px;
            font-size: ${size}px;
            color: rgba(139, 155, 179, ${0.4 + Math.random() * 0.3});
            opacity: 1;
            pointer-events: none;
            user-select: none;
            z-index: 0;
            transition: all 1.5s ease-out;
        `;

        container.appendChild(smoke);

        // Animate smoke
        setTimeout(() => {
            smoke.style.opacity = '0';
            smoke.style.transform = `translateY(${30 + Math.random() * 20}px) scale(1.5)`;
        }, 10);

        // Remove after animation
        setTimeout(() => smoke.remove(), 1500);
    }

    // Animate spaceship flight
    function flySpaceship(section) {
        const container = section.querySelector('.stars-container');
        if (!container) return;

        const ship = createSpaceship();
        const sectionRect = section.getBoundingClientRect();

        // Random horizontal position
        const startX = 20 + Math.random() * 60; // 20-80% across
        const endX = startX + (Math.random() - 0.5) * 20; // Slight horizontal drift

        // Start below, end above
        ship.style.left = `${startX}%`;
        ship.style.top = `calc(100% + 50px)`;

        // Slight tilt based on drift
        const angle = (endX - startX) * 1.5;
        ship.style.transform = `rotate(${angle}deg)`;

        container.appendChild(ship);

        // Fade in
        setTimeout(() => {
            ship.style.opacity = '1';
        }, 10);

        // Animate movement
        setTimeout(() => {
            ship.style.transition = `all ${config.speed}ms linear`;
            ship.style.top = '-100px';
            ship.style.left = `${endX}%`;
        }, 50);

        // Spawn smoke particles periodically
        const smokeInterval = setInterval(() => {
            const rect = ship.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            const x = rect.left - containerRect.left + config.size / 2;
            const y = rect.top - containerRect.top + config.size * 1.5;

            for (let i = 0; i < 2; i++) {
                createSmokeParticle(x, y, container);
            }
        }, 200);

        // Fade out near the end
        setTimeout(() => {
            ship.style.opacity = '0';
            clearInterval(smokeInterval);
        }, config.speed - 500);

        // Remove after animation
        setTimeout(() => {
            ship.remove();
        }, config.speed + 500);
    }

    // Launch rocket from specific position
    function launchRocketAt(section, clickX, clickY) {
        const container = section.querySelector('.stars-container');
        if (!container) return;

        const ship = createSpaceship();
        const sectionRect = section.getBoundingClientRect();

        // Convert click position to percentage
        const startXPercent = (clickX / sectionRect.width) * 100;
        const endXPercent = startXPercent + (Math.random() - 0.5) * 20;

        // Start at click position
        ship.style.left = `${startXPercent}%`;
        ship.style.top = `${clickY}px`;

        // Slight tilt based on drift
        const angle = (endXPercent - startXPercent) * 1.5;
        ship.style.transform = `rotate(${angle}deg)`;

        container.appendChild(ship);

        // Fade in
        setTimeout(() => {
            ship.style.opacity = '1';
        }, 10);

        // Animate movement
        setTimeout(() => {
            ship.style.transition = `all ${config.speed}ms linear`;
            ship.style.top = '-100px';
            ship.style.left = `${endXPercent}%`;
        }, 50);

        // Spawn smoke particles periodically
        const smokeInterval = setInterval(() => {
            const rect = ship.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            const x = rect.left - containerRect.left + config.size / 2;
            const y = rect.top - containerRect.top + config.size * 1.5;

            for (let i = 0; i < 2; i++) {
                createSmokeParticle(x, y, container);
            }
        }, 200);

        // Fade out near the end
        setTimeout(() => {
            ship.style.opacity = '0';
            clearInterval(smokeInterval);
        }, config.speed - 500);

        // Remove after animation
        setTimeout(() => {
            ship.remove();
        }, config.speed + 500);
    }

    // Schedule periodic flights for a section
    function scheduleFlights(section) {
        const fly = () => {
            flySpaceship(section);
            setTimeout(fly, config.speed + config.delayBetweenFlights);
        };

        // Start after initial delay
        setTimeout(fly, config.initialDelay + Math.random() * 5000);
    }

    // Initialize click to spawn rockets
    function initClickRockets() {
        const darkSections = document.querySelectorAll('.bluepart.blackpart');

        darkSections.forEach(section => {
            section.addEventListener('click', (e) => {
                // Don't spawn rockets if clicking on interactive elements
                if (e.target.closest('a, button, .multitab-code')) {
                    return;
                }

                const rect = section.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                launchRocketAt(section, x, y);
            });
        });
    }

    // Initialize spaceships
    function init() {
        const darkSections = document.querySelectorAll('.bluepart.blackpart');
        darkSections.forEach(section => {
            scheduleFlights(section);
        });

        // Enable click rocket spawning
        initClickRockets();
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

