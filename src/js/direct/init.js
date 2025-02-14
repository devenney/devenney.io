function init() {
    initARG()
    initTheme()
}

function initTheme() {
    theme = localStorage.getItem("theme")
    if (theme == "auto" || theme == null) {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            theme = "dark"

        } else {
            theme = "light"
        }
    }

    setTheme(theme);
}