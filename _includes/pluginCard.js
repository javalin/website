let reactionIcons = {};
reactionIcons.thumbsUp = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M23,10C23,8.89 22.1,8 21,8H14.68L15.64,3.43C15.66,3.33 15.67,3.22 15.67,3.11C15.67,2.7 15.5,2.32 15.23,2.05L14.17,1L7.59,7.58C7.22,7.95 7,8.45 7,9V19A2,2 0 0,0 9,21H18C18.83,21 19.54,20.5 19.84,19.78L22.86,12.73C22.95,12.5 23,12.26 23,12V10M1,21H5V9H1V21Z" /></svg>`;
reactionIcons.thumbsDown = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19,15H23V3H19M15,3H6C5.17,3 4.46,3.5 4.16,4.22L1.14,11.27C1.05,11.5 1,11.74 1,12V14A2,2 0 0,0 3,16H9.31L8.36,20.57C8.34,20.67 8.33,20.77 8.33,20.88C8.33,21.3 8.5,21.67 8.77,21.94L9.83,23L16.41,16.41C16.78,16.05 17,15.55 17,15V5C17,3.89 16.1,3 15,3Z" /></svg>`;
reactionIcons.confused = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2A10 10 0 1 0 22 12A10 10 0 0 0 12 2M8.5 8A1.5 1.5 0 1 1 7 9.5A1.54 1.54 0 0 1 8.5 8M17 16H13A4 4 0 0 0 9.53 18L7.8 17A6 6 0 0 1 13 14H17M15.5 11A1.5 1.5 0 1 1 17 9.5A1.54 1.54 0 0 1 15.5 11Z" /></svg>`;
reactionIcons.heart = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z" /></svg>`;
reactionIcons.hooray = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M14.53 1.45L13.45 2.53L15.05 4.13C15.27 4.38 15.38 4.67 15.38 5S15.27 5.64 15.05 5.86L11.5 9.47L12.5 10.55L16.13 6.94C16.66 6.35 16.92 5.7 16.92 5C16.92 4.3 16.66 3.64 16.13 3.05L14.53 1.45M10.55 3.47L9.47 4.55L10.08 5.11C10.3 5.33 10.41 5.63 10.41 6S10.3 6.67 10.08 6.89L9.47 7.45L10.55 8.53L11.11 7.92C11.64 7.33 11.91 6.69 11.91 6C11.91 5.28 11.64 4.63 11.11 4.03L10.55 3.47M21 5.06C20.31 5.06 19.67 5.33 19.08 5.86L13.45 11.5L14.53 12.5L20.11 6.94C20.36 6.69 20.66 6.56 21 6.56S21.64 6.69 21.89 6.94L22.5 7.55L23.53 6.47L22.97 5.86C22.38 5.33 21.72 5.06 21 5.06M7 8L2 22L16 17L7 8M19 11.06C18.3 11.06 17.66 11.33 17.06 11.86L15.47 13.45L16.55 14.53L18.14 12.94C18.39 12.69 18.67 12.56 19 12.56C19.33 12.56 19.63 12.69 19.88 12.94L21.5 14.53L22.55 13.5L20.95 11.86C20.36 11.33 19.7 11.06 19 11.06Z" /></svg>`;
reactionIcons.rocket = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M13.13 22.19L11.5 18.36C13.07 17.78 14.54 17 15.9 16.09L13.13 22.19M5.64 12.5L1.81 10.87L7.91 8.1C7 9.46 6.22 10.93 5.64 12.5M21.61 2.39C21.61 2.39 16.66 .269 11 5.93C8.81 8.12 7.5 10.53 6.65 12.64C6.37 13.39 6.56 14.21 7.11 14.77L9.24 16.89C9.79 17.45 10.61 17.63 11.36 17.35C13.5 16.53 15.88 15.19 18.07 13C23.73 7.34 21.61 2.39 21.61 2.39M14.54 9.46C13.76 8.68 13.76 7.41 14.54 6.63S16.59 5.85 17.37 6.63C18.14 7.41 18.15 8.68 17.37 9.46C16.59 10.24 15.32 10.24 14.54 9.46M8.88 16.53L7.47 15.12L8.88 16.53M6.24 22L9.88 18.36C9.54 18.27 9.21 18.12 8.91 17.91L4.83 22H6.24M2 22H3.41L8.18 17.24L6.76 15.83L2 20.59V22M2 19.17L6.09 15.09C5.88 14.79 5.73 14.47 5.64 14.12L2 17.76V19.17Z" /></svg>`;

function setPluginReactions(pluginName, apiUrl) {
    let cached = JSON.parse(sessionStorage.getItem(apiUrl));
    if (cached?.reactions) {
        setReactions(cached.reactions, cached.comments);
    } else {
        fetch(apiUrl)
            .then(res => res.json())
            .then(data => {
                if (!data?.reactions) return;
                setReactions(data.reactions, data.comments);
                sessionStorage.setItem(apiUrl, JSON.stringify(data));
            });
    }

    function setReactions(data, comments) {
        function rIcon(key, icon, className) {
            return data[key] ? `<span class="r-icon ${className}">${reactionIcons[icon]} ${data[key]}</span>` : ""
        }

        document.querySelector(`.${pluginName} .reactions`).insertAdjacentHTML("beforeend", `
                ${rIcon("+1", "thumbsUp", "good")}
                ${rIcon("heart", "heart", "good")}
                ${rIcon("hooray", "hooray", "good")}
                ${rIcon("rocket", "rocket", "good")}
                ${rIcon("-1", "thumbsDown", "bad")}
                ${rIcon("confused", "confused", "bad")}
                ${comments > 0 ? `<span class="r-icon review">Reviews: ${comments}</span>` : ''}
            `)
    }
}

