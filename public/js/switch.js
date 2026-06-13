function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  const lightswitch = document.getElementById('lightswitch');
  if (lightswitch) {
    lightswitch.setAttribute(
      'title',
      theme === 'light' ? 'Cast: Darkness (Evocation)' : 'Cast: Light (Evocation)'
    );
  }
}

const switchTheme = () => {
  const theme = localStorage.getItem('theme');
  setTheme(theme === 'light' ? 'dark' : 'light');
};
