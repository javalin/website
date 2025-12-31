let reactionIcons = {};
reactionIcons.alert = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M13 13H11V7H13M11 15H13V17H11M15.73 3H8.27L3 8.27V15.73L8.27 21H15.73L21 15.73V8.27L15.73 3Z" /></svg>`;
reactionIcons.check = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9M12,3A1,1 0 0,1 13,4A1,1 0 0,1 12,5A1,1 0 0,1 11,4A1,1 0 0,1 12,3M19,3H14.82C14.4,1.84 13.3,1 12,1C10.7,1 9.6,1.84 9.18,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3Z" /></svg>`;

function setPluginReports(pluginName, apiUrl) {
    let cached = JSON.parse(sessionStorage.getItem(apiUrl));
    if (cached?.url) { // check if we have a valid response cached
        setReports(cached.comments);
    } else {
        fetch(apiUrl)
            .then(res => res.json())
            .then(data => {
                if (!data?.url) return; // check if we got a valid response
                sessionStorage.setItem(apiUrl, JSON.stringify(data));
                setReports(data.comments);
            });
    }

    function setReports(comments) {
        document.querySelector(`.${pluginName} .plugin-reports`).insertAdjacentHTML("afterbegin", `
          ${comments > 0
            ? `<span class="r-icon r-alert">${reactionIcons.alert} ${comments} reports</span>`
            : `<span class="r-icon r-check">${reactionIcons.check} Never reported</span>`}
        `)
    }
}

