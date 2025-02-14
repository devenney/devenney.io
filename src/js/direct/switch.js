const dataThemeAttribute = "data-theme"
const lightOffText="Cast: Light (Evocation)"
const lightOnText="Cast: Darkness (Evocation)"

const prismLink = document.getElementById("prism-theme");

let firstInvocation = true

// Function to set the theme
function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);

    html = document.documentElement
    html.setAttribute(dataThemeAttribute, theme)

    prismLink.setAttribute("href", (theme == "light")?"/css/prism.css":"/css/prism-tomorrow.css");

    lightswitch = document.getElementById("lightswitch")
    lightswitch.setAttribute("title", (theme == "light") ? lightOnText : lightOffText)
}

// Toggle theme
const switchTheme = (event) => {
    event.preventDefault();

    theme = localStorage.getItem("theme")
    if (theme == "light") {
        setTheme("dark")
    } else {
        setTheme("light")
    }
};