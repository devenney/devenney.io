const dataThemeAttribute = "data-theme"
const lightOffText="Cast: Light (Evocation)"
const lightOnText="Cast: Darkness (Evocation)"

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

    setLightswitchTooltip()
};

function setLightswitchTooltip() {
    lightswitch = document.getElementById("lightswitch")
    
    lightswitch.setAttribute("title", isLight()? lightOnText : lightOffText)
}