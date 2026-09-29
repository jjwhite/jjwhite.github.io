/******* ball.js *******/

var letters = 'abcdefghijklmnopqrstuvwxyz'.split('');

function bubble(x, y) {
    this.x           = x;
    this.y           = y;
    this.floating    = true;
    this.transparency = 0.72;
    this.targeted    = false;
    this.typedIndex  = 0;
    this.shakeFrames = 0;
    this.driftOffset = Math.random() * Math.PI * 2;
    this.driftSpeed  = Math.random() * 0.25 + 0.08;

    var lvl        = game.currentLevel;
    this.speedMult = lvl.speedMult;
    this.mass      = getRandomNum(4, 8);

    // Pick the content — single letter or word
    if (lvl.mode === 'letter') {
        this.word = letters[getRandomNum(0, 25)];
    } else {
        this.word = getWord(lvl.maxWordLen);
    }

    // Visual geometry
    this.isCircle = (this.word.length === 1);
    if (this.isCircle) {
        this.halfW = getRandomNum(26, 42); // circle radius
        this.halfH = this.halfW;
    } else {
        this.halfH = 26;  // vertical half-height of pill
        // ~11 px per char at bold-20 monospace
        this.halfW = Math.max(this.halfH + 6, Math.ceil(this.word.length * 11 * 0.58) + 20);
    }
}

bubble.prototype.update = function(index) {
    var Fg = (g * 30 / 1000) * this.mass * this.speedMult;

    if (this.floating) {
        this.y -= Fg;
        // Gentle horizontal drift (unique per bubble)
        this.x += Math.sin(counter * this.driftSpeed * 0.05 + this.driftOffset) * 0.4;
    }

    if (this.shakeFrames > 0) { this.shakeFrames--; }

    // Missed — bubble floated off the top of the canvas
    if (this.y < -(this.halfH + 25)) {
        if (game.targetBubble === this) {
            game.targetBubble = null;
        }
        addStrike();
        bubbles.splice(index, 1);
    }
};

bubble.prototype.draw = function() {
    // Shake offset for wrong-key feedback
    var cx = this.x + (this.shakeFrames > 0 ? (Math.random() - 0.5) * 8 : 0);
    var cy = this.y;
    var hw = this.halfW;
    var hh = this.halfH;

    context.save();
    context.beginPath();

    if (this.isCircle) {
        context.arc(cx, cy, hw, 0, Math.PI * 2);
    } else {
        // Pill shape: rounded-rect with corner radius = halfH
        var r  = hh;
        var l  = cx - hw, ri = cx + hw, t = cy - hh, b = cy + hh;
        context.moveTo(l + r, t);
        context.arcTo(ri, t, ri, b, r);
        context.arcTo(ri, b, l,  b, r);
        context.arcTo(l,  b, l,  t, r);
        context.arcTo(l,  t, ri, t, r);
        context.closePath();
    }

    // Fill
    context.globalAlpha = this.transparency;
    context.fillStyle   = this.targeted
        ? 'rgba(255, 240, 160, 0.88)'
        : 'rgba(176, 247, 252, 0.82)';
    context.fill();

    // Outline
    context.globalAlpha = 1;
    context.lineWidth   = this.targeted ? 3.5 : 2.5;
    context.strokeStyle = this.targeted ? '#FF8800' : '#27daea';
    context.stroke();

    // ---- Draw text ----
    context.textBaseline = 'middle';

    if (this.isCircle) {
        context.textAlign = 'center';
        context.font      = 'bold 28px Consolas, monospace';
        context.fillStyle = '#002288';
        context.fillText(this.word, cx, cy);
    } else {
        // Render word character-by-character so we can color each section:
        //   typed chars   → dimmed green
        //   current char  → bright red-orange (only when targeted)
        //   remaining     → dark blue
        context.font      = 'bold 20px Consolas, monospace';
        context.textAlign = 'left';
        var totalW = context.measureText(this.word).width;
        var charX  = cx - totalW / 2; // left edge of word centered on cx

        for (var i = 0; i < this.word.length; i++) {
            var ch  = this.word[i];
            var chW = context.measureText(ch).width;

            if (i < this.typedIndex) {
                context.fillStyle = 'rgba(0, 128, 30, 0.7)';  // already typed
            } else if (i === this.typedIndex && this.targeted) {
                context.fillStyle = '#CC2200';                 // next to type
            } else {
                context.fillStyle = '#002288';                 // not yet typed
            }

            context.fillText(ch, charX, cy);
            charX += chW;
        }
    }

    context.restore();
};