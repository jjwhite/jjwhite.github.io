/******* canvas.js *******/
/*
  Canvas setup, per-frame clear, and all overlay drawing
  (HUD, level-complete, game-over, win screen).
  Key handling and bubble draw/update are driven by engine.js.
*/

var canvas;
var context;
var canvasHeight;
var canvasWidth;

var config = {
    showStats: false   // set true to see FPS in top-left corner
};

function cvs() {
    var self = this;
    this.$canvas = $('canvas');
    this.mousex  = 0;
    this.mousey  = 0;
    this.fps     = 0;

    canvasHeight = this.$canvas.height();
    canvasWidth  = this.$canvas.width();

    this.$canvas.mousemove(function(e) {
        var pos    = findPos(this);
        self.mousex = e.pageX - pos.x;
        self.mousey = e.pageY - pos.y;
    });
}

// Clear canvas each frame
cvs.prototype.cycle = function() {
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    if (config.showStats) {
        context.fillStyle = 'yellow';
        context.font      = '10px Arial';
        context.fillText('FPS: ' + this.fps, 5, 12);
    }
};

// -------------------------------------------------------------------------
// HUD — drawn every frame during gameplay
// -------------------------------------------------------------------------
cvs.prototype.drawHUD = function() {
    var lvl = game.currentLevel;

    // Top bar background
    context.fillStyle = 'rgba(0, 0, 30, 0.68)';
    context.fillRect(0, 0, canvasWidth, 64);

    context.save();
    context.textBaseline = 'middle';

    // ---- Center: level label + progress counter ----
    context.textAlign = 'center';
    context.fillStyle = '#FFD700';
    context.font      = 'bold 17px Arial';
    context.fillText(lvl.label + '  \u2014  ' + lvl.subtitle, canvasWidth / 2, 18);

    context.fillStyle = '#AADDFF';
    context.font      = '13px Arial';
    context.fillText(
        'Pop ' + game.bubblesPopped + ' / ' + lvl.bubblesNeeded,
        canvasWidth / 2, 38
    );

    // Progress bar
    var bx = canvasWidth / 2 - 130, by = 52, bw = 260, bh = 7;
    context.fillStyle = 'rgba(255,255,255,0.15)';
    context.fillRect(bx, by, bw, bh);
    context.fillStyle = '#00EE88';
    var pct = Math.min(game.bubblesPopped / lvl.bubblesNeeded, 1);
    context.fillRect(bx, by, bw * pct, bh);

    // ---- Left: score / high score ----
    context.textAlign = 'left';
    context.fillStyle = '#FFFFFF';
    context.font      = 'bold 15px Arial';
    context.fillText('Score: ' + game.score, 10, 18);
    context.fillStyle = '#99FFBB';
    context.font      = '11px Arial';
    context.fillText('Best: ' + (getCookie('bubbleScore') || 0), 10, 38);

    // ---- Right: strike hearts ----
    // Full red hearts = lives remaining; dark/grey hearts = strikes used
    context.textAlign = 'right';
    context.font      = '22px Arial';
    for (var s = 0; s < game.maxStrikes; s++) {
        var sx = canvasWidth - 14 - s * 30;
        context.fillStyle = (s < game.strikes) ? '#444444' : '#FF4466';
        context.fillText('\u2665', sx, 23); // ♥
    }

    // If a strike was just scored, also show a red X badge above hearts
    if (game.strikeFlashFrames > 0 && game.strikes > 0 && game.strikes <= game.maxStrikes) {
        context.font      = 'bold 16px Arial';
        context.fillStyle = '#FF0000';
        context.fillText(
            '\u274C  MISS! (' + game.strikes + '/' + game.maxStrikes + ')',
            canvasWidth - 14, 48
        );
    }

    context.restore();
};

// -------------------------------------------------------------------------
// Level-complete overlay
// -------------------------------------------------------------------------
cvs.prototype.drawLevelComplete = function() {
    // game.levelIndex was already incremented before this is called
    var nextLvl = (game.levelIndex < levels.length) ? levels[game.levelIndex] : null;

    context.save();

    context.fillStyle = 'rgba(0, 55, 20, 0.80)';
    context.fillRect(0, 0, canvasWidth, canvasHeight);

    context.textAlign    = 'center';
    context.textBaseline = 'middle';

    context.fillStyle = '#FFD700';
    context.font      = 'bold 54px Arial';
    context.fillText('LEVEL COMPLETE!', canvasWidth / 2, canvasHeight / 2 - 60);

    if (nextLvl) {
        context.fillStyle = '#FFFFFF';
        context.font      = '24px Arial';
        context.fillText(
            'Up next:  ' + nextLvl.label + '  \u2014  ' + nextLvl.subtitle,
            canvasWidth / 2, canvasHeight / 2 + 10
        );
    }

    context.fillStyle = '#AAFFAA';
    context.font      = '20px Arial';
    context.fillText('Score so far: ' + game.score, canvasWidth / 2, canvasHeight / 2 + 60);

    context.restore();
};

// -------------------------------------------------------------------------
// Game-over overlay
// -------------------------------------------------------------------------
cvs.prototype.drawGameOver = function() {
    context.save();

    context.fillStyle = 'rgba(60, 0, 0, 0.86)';
    context.fillRect(0, 0, canvasWidth, canvasHeight);

    context.textAlign    = 'center';
    context.textBaseline = 'middle';

    context.fillStyle = '#FF3333';
    context.font      = 'bold 66px Arial';
    context.fillText('GAME OVER', canvasWidth / 2, canvasHeight / 2 - 75);

    context.fillStyle = '#FFFFFF';
    context.font      = '30px Arial';
    context.fillText('Score: ' + game.score, canvasWidth / 2, canvasHeight / 2);

    var hs = parseInt(getCookie('bubbleScore') || '0');
    if (game.score > 0 && game.score >= hs) {
        context.fillStyle = '#FFD700';
        context.font      = '20px Arial';
        context.fillText('\u2605  NEW HIGH SCORE!  \u2605', canvasWidth / 2, canvasHeight / 2 + 48);
    } else {
        context.fillStyle = '#FFD700';
        context.font      = '18px Arial';
        context.fillText('Best: ' + hs, canvasWidth / 2, canvasHeight / 2 + 48);
    }

    context.fillStyle = '#AAAAFF';
    context.font      = '18px Arial';
    context.fillText('Click anywhere to play again', canvasWidth / 2, canvasHeight / 2 + 100);

    context.restore();
};

// -------------------------------------------------------------------------
// Win overlay
// -------------------------------------------------------------------------
cvs.prototype.drawWon = function() {
    context.save();

    context.fillStyle = 'rgba(0, 30, 60, 0.88)';
    context.fillRect(0, 0, canvasWidth, canvasHeight);

    context.textAlign    = 'center';
    context.textBaseline = 'middle';

    context.fillStyle = '#FFD700';
    context.font      = 'bold 54px Arial';
    context.fillText('YOU WIN!', canvasWidth / 2, canvasHeight / 2 - 85);

    context.fillStyle = '#FFFFFF';
    context.font      = '24px Arial';
    context.fillText('All ' + levels.length + ' levels complete!', canvasWidth / 2, canvasHeight / 2 - 25);

    context.fillStyle = '#AAFFAA';
    context.font      = '30px Arial';
    context.fillText('Final Score: ' + game.score, canvasWidth / 2, canvasHeight / 2 + 35);

    var hs = parseInt(getCookie('bubbleScore') || '0');
    if (game.score > 0 && game.score >= hs) {
        context.fillStyle = '#FFD700';
        context.font      = '20px Arial';
        context.fillText('\u2605  NEW HIGH SCORE!  \u2605', canvasWidth / 2, canvasHeight / 2 + 85);
    } else {
        context.fillStyle = '#FFD700';
        context.font      = '18px Arial';
        context.fillText('Best: ' + hs, canvasWidth / 2, canvasHeight / 2 + 85);
    }

    context.fillStyle = '#AAAAFF';
    context.font      = '18px Arial';
    context.fillText('Click anywhere to play again', canvasWidth / 2, canvasHeight / 2 + 135);

    context.restore();
};
