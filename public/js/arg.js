'use strict';

var theFuture = 'Geological Unmanned Terraforming System';
var audio = new Audio('/assets/audio/megaman-royaltyfree.mp3');
audio.volume = 0.1;
audio.loop = true;

var argEnabled = false;

function initARG() {
    document.addEventListener('selectionchange', function () {
        var sel = document.getSelection();
        if (sel && sel.toString() === theFuture && !argEnabled) {
            argEnabled = true;
            crtSwitch();
            audio.play();
            startMegamanRunner();
        }
    });
}

function crtSwitch() {
    document.body.classList.add('crt');
}

// ── Megaman Canvas Runner ─────────────────────────────────────────────────────
//
// Sprite sheet coords [sx, sy, sw, sh] — extracted from mm-sprites.png
// Assembled (run) sprites: sy=21, sh=24
// Shooting sprites:        sy=78, sh=25
//
// [sx, sy, sw, sh, yOff]
// yOff: canvas px offset so feet stay at ground regardless of sprite height
// Jump frames use the full sprite band — extra rows sit above the body
var SP = {
    run0:      [55,  21, 24, 24,   0],
    run1:      [87,  21, 32, 24,   0],
    run2:      [120, 21, 24, 24,   0],
    run3:      [145, 21, 24, 24,   0],
    jump:      [174, 13, 32, 32, -24],  // sy=13: full band incl. raised arms
    shoot0:    [38,  78, 32, 25,   0],
    shoot1:    [71,  78, 32, 25,   0],
    shoot2:    [104, 78, 32, 25,   0],
    shoot3:    [141, 70, 32, 33, -24],  // sy=70: full band incl. raised arms
    shootJump: [283, 70, 32, 33, -24],  // sy=70: full band incl. raised arms
};

var RUN_CYCLE   = ['run0',   'run1',   'run2',   'run3'];
var SHOOT_CYCLE = ['shoot0', 'shoot1', 'shoot2', 'shoot3'];
var SC = 3;  // scale: 1 sprite pixel → 3×3 canvas pixels

function startMegamanRunner() {
    var sheet = new Image();
    sheet.onload = function () { launchRunner(sheet); };
    sheet.src = '/assets/images/mm-sprites.png';
}

function launchRunner(sheet) {
    var canvas = document.createElement('canvas');
    canvas.id = 'arg-canvas';
    canvas.style.cssText =
        'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:100';
    document.body.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;  // keep pixels crisp

    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    var ground = function () { return canvas.height - 24 * SC - 12; };

    var mm = {
        x:          -40,
        y:          ground(),
        vy:         0,
        dir:        1,      // 1 = right, -1 = left
        jumping:    false,
        shooting:   false,
        frameIdx:   0,      // 0..3, indexes into RUN/SHOOT_CYCLE
        fTimer:     0,
        jumpTimer:  60  + Math.floor(Math.random() * 90),
        shootTimer: 150 + Math.floor(Math.random() * 150),
        shootDur:   0,
    };

    var projectiles = [];

    function fireShot() {
        var key = mm.shooting ? SHOOT_CYCLE[mm.frameIdx] : RUN_CYCLE[mm.frameIdx];
        var spW = SP[key][2] * SC;
        // Sprites face left by default — right-facing (dir=1) is flipped
        // so buster tip is at right edge when dir=1, left edge when dir=-1
        var tipX = mm.dir > 0 ? mm.x + spW + 2 : mm.x - 10;
        var tipY = mm.y + 8 * SC;
        projectiles.push({ x: tipX, y: tipY, vx: 8 * mm.dir });
    }

    function drawSprite(key, x, y, dir) {
        var s = SP[key];
        var dw = s[2] * SC, dh = s[3] * SC;
        var ry = y + (s[4] || 0);  // apply vertical offset
        ctx.save();
        // Sprites in the sheet face LEFT; flip horizontally for right-facing
        if (dir > 0) {
            ctx.translate(x + dw, ry);
            ctx.scale(-1, 1);
            ctx.drawImage(sheet, s[0], s[1], s[2], s[3], 0, 0, dw, dh);
        } else {
            ctx.drawImage(sheet, s[0], s[1], s[2], s[3], x, ry, dw, dh);
        }
        ctx.restore();
    }

    function tick() {
        if (canvas.width  !== window.innerWidth)  canvas.width  = window.innerWidth;
        if (canvas.height !== window.innerHeight)  canvas.height = window.innerHeight;

        var g = ground();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        var active = !audio.paused;

        if (active) {
            var curKey = mm.shooting ? SHOOT_CYCLE[mm.frameIdx] : RUN_CYCLE[mm.frameIdx];
            var spW = SP[curKey][2] * SC;

            // Horizontal movement
            mm.x += 2.5 * mm.dir;
            if (mm.x + spW > canvas.width && mm.dir > 0) mm.dir = -1;
            if (mm.x < 0              && mm.dir < 0) mm.dir =  1;

            // Gravity
            mm.vy += 0.55;
            mm.y  += mm.vy;
            if (mm.y >= g) {
                mm.y     = g;
                mm.vy    = 0;
                mm.jumping = false;
            }

            // Jump
            if (!mm.jumping && --mm.jumpTimer <= 0) {
                mm.vy      = -11;
                mm.jumping = true;
                mm.jumpTimer = 90 + Math.floor(Math.random() * 90);
            }

            // Shoot
            if (!mm.shooting) {
                if (--mm.shootTimer <= 0) {
                    mm.shooting = true;
                    mm.shootDur = 50;
                    fireShot();
                }
            } else {
                if (--mm.shootDur <= 0) {
                    mm.shooting   = false;
                    mm.shootTimer = 180 + Math.floor(Math.random() * 180);
                }
            }

            // Advance run frame (only on ground)
            if (!mm.jumping && ++mm.fTimer >= 8) {
                mm.fTimer  = 0;
                mm.frameIdx = (mm.frameIdx + 1) % 4;
            }
        }

        // Resolve frame key
        var frameKey;
        if (mm.jumping) {
            frameKey = mm.shooting ? 'shootJump' : 'jump';
        } else {
            frameKey = mm.shooting ? SHOOT_CYCLE[mm.frameIdx] : RUN_CYCLE[mm.frameIdx];
        }

        drawSprite(frameKey, Math.round(mm.x), Math.round(mm.y), mm.dir);

        // Buster projectiles — white core, cyan glow
        projectiles = projectiles.filter(function (p) {
            p.x += p.vx;
            if (p.x < -20 || p.x > canvas.width + 20) return false;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#00E8D8';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();
            return true;
        });

        requestAnimationFrame(tick);
    }

    tick();
}

initARG();
