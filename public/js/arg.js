'use strict';

var theFuture = 'Geological Unmanned Terraforming System';
var audio = new Audio('/assets/audio/megaman-royaltyfree.mp3');
audio.volume = 0.1;
audio.loop = true;

var argEnabled = false;

function initARG() {
    document.addEventListener('selectionchange', function () {
        var sel = document.getSelection();
        var text = sel ? sel.toString() : '';
        if (text === theFuture && !argEnabled) {
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

// ── Canvas Megaman ────────────────────────────────────────────────────────────

var SC = 3;  // 1 sprite pixel → 3×3 canvas pixels
var SW = 12; // sprite width (pixels)
var SH = 13; // sprite height (pixels)

var C = {
    b: '#4e9bde', // blue  (helmet, body)
    l: '#74c0f0', // light blue (highlights, buster)
    d: '#1a5ca8', // dark blue  (legs, shadows)
    f: '#f5dcb0', // face / skin
};

// Shared head + torso — rows 0–8, facing right
var HEAD = [
    // helmet
    [2,0,'b'],[3,0,'b'],[4,0,'b'],[5,0,'b'],[6,0,'b'],[7,0,'b'],
    [1,1,'b'],[2,1,'b'],[3,1,'b'],[4,1,'b'],[5,1,'b'],[6,1,'b'],[7,1,'b'],[8,1,'b'],
    // visor + face
    [2,2,'l'],[3,2,'l'],[4,2,'f'],[5,2,'f'],[6,2,'l'],[7,2,'b'],
    [2,3,'l'],[3,3,'f'],[4,3,'f'],[5,3,'f'],[6,3,'l'],[7,3,'b'],
    [3,4,'f'],[4,4,'f'],[5,4,'f'],[6,4,'f'],
    // neck
    [3,5,'f'],[4,5,'f'],
    // torso
    [1,6,'b'],[2,6,'b'],[3,6,'b'],[4,6,'b'],[5,6,'b'],[6,6,'b'],[7,6,'b'],[8,6,'b'],
    [1,7,'b'],[2,7,'l'],[3,7,'b'],[4,7,'b'],[5,7,'b'],[6,7,'b'],[7,7,'l'],[8,7,'b'],
    [2,8,'b'],[3,8,'b'],[4,8,'b'],[5,8,'b'],[6,8,'b'],[7,8,'b'],
];

// Buster arm — extends right side of torso when shooting (cols 8–11)
var BUSTER = [
    [8,6,'b'],[9,6,'b'],
    [8,7,'b'],[9,7,'b'],[10,7,'l'],[11,7,'l'],
    [9,8,'b'],[10,8,'b'],
];

var LEGS = {
    // right foot forward, left foot trailing
    run0: [
        [2,9,'d'],[3,9,'d'],
        [1,10,'d'],[2,10,'d'],
        [0,11,'d'],[1,11,'d'],[2,11,'d'],
        [6,9,'d'],[7,9,'d'],
        [6,10,'d'],[7,10,'d'],
        [6,11,'d'],[7,11,'d'],[8,11,'d'],
    ],
    // left foot forward, right foot trailing
    run1: [
        [3,9,'d'],[4,9,'d'],
        [3,10,'d'],[4,10,'d'],
        [2,11,'d'],[3,11,'d'],[4,11,'d'],
        [6,9,'d'],[7,9,'d'],
        [7,10,'d'],[8,10,'d'],
        [7,11,'d'],[8,11,'d'],[9,11,'d'],
    ],
    // legs together and slightly drawn up
    jump: [
        [2,9,'d'],[3,9,'d'],[4,9,'d'],[5,9,'d'],[6,9,'d'],[7,9,'d'],
        [3,10,'d'],[4,10,'d'],[5,10,'d'],[6,10,'d'],
        [3,11,'d'],[4,11,'d'],[5,11,'d'],[6,11,'d'],
    ],
};

function buildFrame(legs, shoot) {
    return HEAD.concat(shoot ? BUSTER : []).concat(legs);
}

var FRAMES = {
    run0:  buildFrame(LEGS.run0, false),
    run1:  buildFrame(LEGS.run1, false),
    jump:  buildFrame(LEGS.jump, false),
    run0s: buildFrame(LEGS.run0, true),
    run1s: buildFrame(LEGS.run1, true),
    jumps: buildFrame(LEGS.jump, true),
};

function drawSprite(ctx, pixels, x, y, dir) {
    ctx.save();
    ctx.translate(x, y);
    if (dir < 0) {
        // mirror horizontally around sprite centre
        ctx.translate(SW * SC, 0);
        ctx.scale(-1, 1);
    }
    for (var i = 0; i < pixels.length; i++) {
        var p = pixels[i];
        ctx.fillStyle = C[p[2]];
        ctx.fillRect(p[0] * SC, p[1] * SC, SC, SC);
    }
    ctx.restore();
}

function startMegamanRunner() {
    var canvas = document.createElement('canvas');
    canvas.id = 'arg-canvas';
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:100';
    document.body.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    var CW = SW * SC; // character width  = 36px
    var CH = SH * SC; // character height = 39px

    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    var ground = function () { return canvas.height - CH - 8; };

    var mm = {
        x:          -CW,
        y:          ground(),
        vy:         0,
        dir:        1,
        state:      'run',  // 'run' | 'jump'
        shooting:   false,
        fIdx:       0,
        fTimer:     0,
        jumpTimer:  60  + Math.floor(Math.random() * 90),
        shootTimer: 150 + Math.floor(Math.random() * 150),
        shootDur:   0,
    };

    var projectiles = [];

    function fireShot() {
        var busterTipX = mm.dir > 0 ? mm.x + CW + 2 : mm.x - 10;
        var busterTipY = mm.y + 7 * SC;
        projectiles.push({ x: busterTipX, y: busterTipY, vx: 7 * mm.dir });
    }

    function tick() {
        var g = ground();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        var active = !audio.paused;

        if (active) {
            // Horizontal movement
            mm.x += 2.5 * mm.dir;

            // Bounce at edges
            if (mm.x + CW > canvas.width && mm.dir > 0) mm.dir = -1;
            if (mm.x < 0              && mm.dir < 0) mm.dir =  1;

            // Gravity + ground collision
            mm.vy += 0.55;
            mm.y  += mm.vy;
            if (mm.y >= g) {
                mm.y  = g;
                mm.vy = 0;
                if (mm.state === 'jump') mm.state = 'run';
            }

            // Jump timer
            if (mm.state === 'run' && --mm.jumpTimer <= 0) {
                mm.vy        = -11;
                mm.state     = 'jump';
                mm.jumpTimer = 90 + Math.floor(Math.random() * 90);
            }

            // Shoot timer
            if (!mm.shooting) {
                if (--mm.shootTimer <= 0) {
                    mm.shooting   = true;
                    mm.shootDur   = 50;
                    fireShot();
                }
            } else {
                if (--mm.shootDur <= 0) {
                    mm.shooting   = false;
                    mm.shootTimer = 180 + Math.floor(Math.random() * 180);
                }
            }

            // Animate legs
            if (++mm.fTimer >= 8) {
                mm.fTimer = 0;
                mm.fIdx   = 1 - mm.fIdx;
            }
        }

        // Resolve frame key
        var fKey;
        if (mm.state === 'jump') {
            fKey = mm.shooting ? 'jumps' : 'jump';
        } else {
            fKey = (mm.fIdx === 0 ? 'run0' : 'run1') + (mm.shooting ? 's' : '');
        }

        drawSprite(ctx, FRAMES[fKey], Math.round(mm.x), Math.round(mm.y), mm.dir);

        // Projectiles
        ctx.fillStyle = '#a0d8ff';
        projectiles = projectiles.filter(function (p) {
            p.x += p.vx;
            if (p.x < -16 || p.x > canvas.width + 16) return false;
            ctx.fillRect(Math.round(p.x), Math.round(p.y), 8, 4);
            return true;
        });

        requestAnimationFrame(tick);
    }

    tick();
}

initARG();
