import '@fortawesome/fontawesome-free/js/fontawesome'
import '@fortawesome/fontawesome-free/js/solid'
import '@fortawesome/fontawesome-free/js/regular'
import '@fortawesome/fontawesome-free/js/brands'

import "prismjs";
import "prismjs/components/prism-go"; // ✅ Ensure Go syntax highlighting

document.addEventListener("DOMContentLoaded", () => {
    Prism.highlightAll(); // ✅ Re-highlight after Markdown is loaded
});

require('./sass/main.scss');

require('handlebars');
