// add target blank to all external links
for (let i = 0; i < document.links.length; i++) {
    if (document.links[i].hostname !== window.location.hostname) {
        document.links[i].target = "_blank";
        document.links[i].rel = "noopener";
    }
}
