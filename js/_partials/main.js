// add target blank to all external links
for (let i = 0; i < document.links.length; i++) {
    if (document.links[i].hostname !== window.location.hostname) {
        document.links[i].target = "_blank";
        document.links[i].rel = "noopener";
    }
}

(() => {
    let collapsibleLimit = 4;
    let subMenus = Array.from(document.querySelectorAll(".right-menu li > ul")).filter(ul => ul.children.length > collapsibleLimit);
    subMenus.forEach(ul => ul.style.display = "none");
    let subMenuParents = subMenus.map(ul => ul.parentElement);

    // opening the menu
    document.addEventListener("click", e => tryOpenSubMenu(e.target.parentElement));
    document.addEventListener("menu-scroll-enter", e => tryOpenSubMenu(e.detail.nav.parentElement.parentElement.parentElement));

    function tryOpenSubMenu(element) {
        if (!subMenuParents.includes(element) || openingDisabled) return;
        if (element.querySelector(".submenu-close") === null) {
            element.querySelector("a").insertAdjacentHTML("afterend", `<span class="submenu-close">×</span>`);
        }
        element.querySelector("ul").style.display = "block";
    }

    // we don't want to trigger the open when scrolling "through" as submenu
    // by clicking menu elements, so we disable opening on click
    let openingDisabled = false;
    document.addEventListener("click", () => {
        openingDisabled = true;
        setTimeout(() => openingDisabled = false, 250); // scroll duration
    });

    // closing the menu
    document.addEventListener("click", e => {
        if (!e.target.classList.contains("submenu-close")) return;
        let submenuLi = e.target.parentElement;
        submenuLi.removeChild(submenuLi.querySelector(".submenu-close"));
        submenuLi.querySelector("ul").style.display = "none";
    });
})();
