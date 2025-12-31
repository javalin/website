// Dark mode toggle functionality
// Excludes landing page (page with splash class)
(() => {
    // Check if we're on the landing page
    const isLandingPage = document.body.querySelector('.landing') !== null;

    // Don't initialize dark mode on landing page
    if (isLandingPage) {
        return;
    }

    const darkModeToggle = document.getElementById('dark-mode-toggle');

    // Don't proceed if toggle button doesn't exist
    if (!darkModeToggle) {
        return;
    }

    const sunIcon = darkModeToggle.querySelector('.icon-sun');
    const moonIcon = darkModeToggle.querySelector('.icon-moon');
    const logo = document.querySelector('#logo img');
    const STORAGE_KEY = 'javalin-dark-mode';

    // Function to update icon and logo
    function updateIcon(isDark) {
        if (isDark) {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
            if (logo) {
                logo.src = '/img/logo_inv.svg';
            }
        } else {
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
            if (logo) {
                logo.src = '/img/logo.svg';
            }
        }
    }

    // Function to apply dark mode
    function applyDarkMode(isDark) {
        if (isDark) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        updateIcon(isDark);
        localStorage.setItem(STORAGE_KEY, isDark ? 'true' : 'false');
    }

    // Check for theme query parameter, then saved preference, or default to light mode
    const urlParams = new URLSearchParams(window.location.search);
    const themeParam = urlParams.get('theme');
    const savedMode = localStorage.getItem(STORAGE_KEY);

    let prefersDark;
    if (themeParam === 'dark') {
        prefersDark = true;
    } else if (themeParam === 'light') {
        prefersDark = false;
    } else {
        prefersDark = savedMode === 'true';
    }

    // Apply preference immediately
    applyDarkMode(prefersDark);

    // Toggle dark mode on button click
    darkModeToggle.addEventListener('click', () => {
        const isDark = !document.body.classList.contains('dark-mode');
        applyDarkMode(isDark);
    });
})();

