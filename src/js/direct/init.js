function init() {
    setLightswitchTooltip()
    initARG()
    initTheme()
}

function initTheme() {
    const prismLink = document.getElementById("prism-theme");

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        prismLink.setAttribute("href", "/css/prism-tomorrow.css")
    } else {
        prismLink.setAttribute("href", "/css/prism.css");
    }
}