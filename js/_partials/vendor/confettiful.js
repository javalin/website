const Confettiful = function (el) {
    this.el = el;
    this.containerEl = null;
    this.confettiColors = ['#fce18a', '#ff726d', '#b48def', '#f4306d'];
    this.confettiAnimations = ['slow', 'medium', 'fast'];
    this._setupElements();
    this._renderConfetti();
};

Confettiful.prototype._setupElements = function () {
    const containerEl = document.createElement('div');
    const elPosition = this.el.style.position;
    if (elPosition !== 'relative' || elPosition !== 'absolute') {
        this.el.style.position = 'relative';
    }
    containerEl.classList.add('confetti-container');
    this.el.appendChild(containerEl);
    this.containerEl = containerEl;
};

Confettiful.prototype._renderConfetti = function () {
    this.confettiInterval = setInterval(() => {
        const confettiEl = document.createElement('div');
        const confettiSize = (Math.floor(Math.random() * 3) + 7) + 'px';
        const confettiBackground = this.confettiColors[Math.floor(Math.random() * this.confettiColors.length)];
        const confettiLeft = (Math.floor(Math.random() * this.el.offsetWidth)) + 'px';
        const confettiAnimation = this.confettiAnimations[Math.floor(Math.random() * this.confettiAnimations.length)];

        confettiEl.classList.add('confetti', 'confetti--animation-' + confettiAnimation);
        confettiEl.style.left = confettiLeft;
        confettiEl.style.width = confettiSize;
        confettiEl.style.height = confettiSize;
        confettiEl.style.backgroundColor = confettiBackground;

        confettiEl.removeTimeout = setTimeout(function () {
            confettiEl.parentNode.removeChild(confettiEl);
        }, 1500);

        this.containerEl.appendChild(confettiEl);
    }, 20);
};

const path = window.location.pathname;
if (path === "/" || path === "index" || path === "index.html") {
    window.confettiful = new Confettiful(document.querySelector("#v1-stable-party-box"));
    setTimeout(function () {
        document.querySelector("#v1-stable-party-box").classList.add("open");
    }, 1000);
}
