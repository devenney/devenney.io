let isLight = true

// Toggle theme
const switchTheme = (event) => {
    event.preventDefault();

    isLight = !isLight

    html = document.documentElement
    html.setAttribute('data-theme', isLight? 'light':'dark')
};