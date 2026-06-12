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
    banner = document.getElementById("upper-nav-middle")

    let img = document.createElement("img")
    img.setAttribute("src", "/assets/images/mm.png")
    img.setAttribute("height", 32)
    img.setAttribute("width", 32)

    img.setAttribute("onClick", "protomanWasBorn()")

    banner.append(img)
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
