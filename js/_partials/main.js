// add target blank to all external links
for (let i = 0; i < document.links.length; i++) {
    if (document.links[i].hostname !== window.location.hostname) {
        document.links[i].target = "_blank";
        document.links[i].rel = "noopener";
    }
}

if (document.location.pathname.includes("/documentation")) {
    // "Added in" labels
    let addedTags = {
        // "heading-id": "version",
    };
    Object.keys(addedTags).forEach(key => {
        document.getElementById(key).classList.add("added-parent");
        document.getElementById(key).insertAdjacentHTML("beforeend",
            `<span class="added-in">Added in v${addedTags[key]}</span>`
        )
    });
}
