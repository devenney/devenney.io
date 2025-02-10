let theFuture = "Geological Unmanned Terraforming System";

function initARG() {
    egg = document.getElementById("modal-easter-egg")
    egg.addEventListener('mouseup', function() {
        var text = getSelectedText()
        if (text == theFuture) {
            crtSwitch()
            theWillOfOne()
        }
    })
}


function getSelectedText() {
    if (window.getSelection) {
        return window.getSelection().toString();
    } else if (document.selection) {
        return document.selection.createRange().text;
    }
    return '';
}​

function theWillOfOne() {
    banner = document.getElementById("upper-nav-middle")

    let img = document.createElement("img")
    img.setAttribute("src", "images/mm.png")
    img.setAttribute("height", 32)
    img.setAttribute("width", 32)

    img.setAttribute("onClick", "protomanWasBorn()")

    banner.append(img)
}

function protomanWasBorn() {
    main = document.getElementById("main")

    let iframe = document.createElement("iframe")
    iframe.setAttribute("src", "https://static.arcadespot.com/retroemulator.php?system=nes&game=2016/08/mega-man.nes")
    iframe.setAttribute("class", "fullscreen")
    iframe.setAttribute("scrolling", "no")
    iframe.setAttribute("frameborder", 0)

    main.prepend(iframe)
}

function crtSwitch() {
    document.body.className += "crt";
}
