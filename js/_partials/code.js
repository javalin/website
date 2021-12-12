(() => {
    // trim blank lines around code
    let codeBlocks = document.getElementsByTagName("code");
    for (let i = 0; i < codeBlocks.length; i++) {
        codeBlocks[i].innerHTML = codeBlocks[i].innerHTML.trim();
    }

    // multi-tab code
    document.addEventListener("click", function (e) {
        const targetTab = e.target.getAttribute("data-tab");
        if (targetTab == null) {
            return;
        }
        const grandParent = e.target.parentElement.parentElement;
        if (grandParent == null || !grandParent.classList.contains("multitab-code")) {
            return;
        }
        grandParent.setAttribute("data-tab", targetTab);
        if (!grandParent.classList.contains("dependencies")) {
            localStorage.setItem("language", e.target.textContent.toLowerCase());
            document.querySelectorAll(".multitab-code:not(.dependencies)").forEach(multitab => {
                multitab.setAttribute("data-tab", targetTab);
            });
        }
    });

    // set language for multi-tab code
    function setLanguage() {
        const queryParams = new URLSearchParams(window.location.search);
        const language = (queryParams.get("language") || localStorage.getItem("language") || "").toLowerCase();
        const languages = new Map();
        const codeTabs = document.querySelectorAll(".multitab-code:not(.dependencies) li") || [];
        Array.from(codeTabs).forEach(it => {
            languages.set(it.textContent.toLowerCase(), it.getAttribute("data-tab")); // language and index
        });
        if (languages.get(language) !== undefined) {
            codeTabs[0].parentElement.querySelector(`[data-tab='${languages.get(language)}']`).click();
        }
    }

    const intervalId = setInterval(() => {
        if (document.querySelector(".multitab-code") !== null) {
            clearInterval(intervalId);
            setLanguage();
        }
    }, 10);
})();
