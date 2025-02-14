function init() {
    initARG()
    initTheme()
}

function initTheme() {
    theme = localStorage.getItem("theme")
    if (theme == "auto") {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            theme = "dark"

        } else {
            theme = "light"
        }
        localStorage.setItem("theme", theme)
    } 

    setTheme(theme);
}