const dataThemeAttribute = "data-theme"
const lightOffText="Cast: Light (Evocation)"
const lightOnText="Cast: Darkness (Evocation)"

const prismLink = document.getElementById("prism-theme");

let firstInvocation = true

function isLight() {
    if (firstInvocation) {
        html = document.documentElement

        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            html.setAttribute(dataThemeAttribute, 'dark')
        } else {
            html.setAttribute(dataThemeAttribute, 'light')
        }

        firstInvocation = false
    }

    dataTheme = html.getAttribute(dataThemeAttribute)
    return (dataTheme == 'light')
}

// Toggle theme
const switchTheme = (event) => {
    event.preventDefault();

    html = document.documentElement
    html.setAttribute(dataThemeAttribute, isLight()? 'dark':'light')
    prismLink.setAttribute("href", isLight()?"/css/prism.css":"/css/prism-tomorrow.css");

    setLightswitchTooltip()
};

function setLightswitchTooltip() {
    lightswitch = document.getElementById("lightswitch")
    
    lightswitch.setAttribute("title", isLight()? lightOnText : lightOffText)
}