let theFuture = "Geological Unmanned Terraforming System";
let audio = new Audio('/assets/audio/megaman-royaltyfree.mp3');
audio.volume = 0.1;

let argEnabled = false;

function initARG() {
    document.addEventListener('selectionchange', function() {
        selection = document.getSelection()

        var selectedText = selection ? selection.toString() : null;

        // Warning for old browsers again: May want to polyfill https://caniuse.com/#search=includes
        if (selectedText == theFuture && !argEnabled) {
            argEnabled = true
            crtSwitch()
            theWillOfOne()
        }
    });
}


function getSelectedText() {
    if (window.getSelection) {
        return window.getSelection().toString();
    } else if (document.selection) {
        return document.selection.createRange().text;
    }
    return '';
}

function theWillOfOne() {
    var hero = document.querySelector('header[role="banner"]');
    if (!hero) return;

    var btn = document.createElement('button');
    btn.textContent = '> megaman_';
    btn.setAttribute('aria-label', 'Play Mega Man theme');
    btn.style.cssText = [
        'display: block',
        'margin-top: 1.5rem',
        'background: none',
        'border: none',
        'cursor: pointer',
        'color: var(--accent)',
        'font-family: var(--font-mono)',
        'font-size: 0.72rem',
        'letter-spacing: 0.05em',
        'padding: 0',
    ].join(';');
    btn.addEventListener('click', protomanWasBorn);
    hero.append(btn);
}

function protomanWasBorn() {
    if (audio.paused) {
        audio.play();
    } else {
        audio.pause()
    }

}

function crtSwitch() {
    document.body.className += "crt";
}

initARG();
