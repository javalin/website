function copyInstructions(toolId) {
    var content = document.getElementById("ai-content-" + toolId).textContent;
    navigator.clipboard.writeText(content).then(function () {
        var btn = document.querySelector('[data-tool="' + toolId + '"] .ai-copy-btn');
        var original = btn.textContent;
        btn.classList.add("copied");
        btn.textContent = "Copied!";
        setTimeout(function () {
            btn.textContent = original;
            btn.classList.remove("copied");
        }, 2000);
    });
}
