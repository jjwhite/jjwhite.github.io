/******* engine.js *******/

var g       = 4.9;
var counter = 0;
var delta   = 0;

// ---------------------------------------------------------------------------
// Word lists by length
// ---------------------------------------------------------------------------
var wordLists = {
    2: ['at','be','do','go','hi','if','in','is','it','me','my','no','of','oh',
        'on','or','so','to','up','us','we','an','by','he','ox','as','ax','am',
        'ah','ay','id','ok'],
    3: ['ace','act','age','ago','air','all','ant','ape','arm','art','ask','axe',
        'bag','ban','bar','bat','bay','bed','big','bit','box','boy','bug','bus',
        'buy','can','cap','car','cat','cow','cup','cut','day','dig','dog','dot',
        'dye','ear','eat','egg','end','fan','far','fat','few','fit','fly','fog',
        'fox','fun','fur','gap','gas','get','god','got','gun','gut','had','ham',
        'hat','hay','her','hit','hop','hot','how','hug','jam','jar','jaw','jet',
        'joy','jug','key','kid','kit','lag','lap','law','lay','led','leg','let',
        'lid','lip','log','lot','low','mad','man','map','mat','mob','mop','mud',
        'mug','nap','nod','not','now','nut','oak','odd','off','oil','old','one',
        'our','out','own','pad','pan','pat','pay','peg','pen','pet','pig','pin',
        'pit','pod','pop','pot','pub','put','rag','ran','rat','raw','ray','red',
        'rip','rob','rod','rot','row','run','sad','sat','saw','say','set','sin',
        'sip','sit','six','sky','sob','son','sun','tan','tap','tax','tea','ten',
        'tie','tin','tip','toe','top','toy','tug','two','use','van','war','was',
        'web','win','wit','won','yam','yen','yet','you','zip','zoo'],
    4: ['able','acid','aged','also','arch','area','army','away','baby','back',
        'bake','ball','band','bank','bare','bark','base','bath','bead','beam',
        'bean','bear','beat','beef','beer','bell','belt','bend','bite','blob',
        'blue','blur','boat','body','bold','bolt','bond','bone','book','boom',
        'bore','born','buck','bull','burn','buzz','cake','call','came','camp',
        'care','cart','case','cash','cave','cell','chat','chip','city','clam',
        'clap','clay','clip','club','clue','coal','coat','coin','cold','come',
        'cook','cool','copy','cord','corn','cost','crab','cube','cure','curl',
        'dame','damp','dare','dark','data','date','dead','deal','dear','debt',
        'deed','deep','deny','desk','dice','diet','dirt','disk','dome','door',
        'dose','drag','draw','drip','drop','drum','dull','dump','dusk','dust',
        'duty','earn','ease','edge','emit','even','evil','exam','exit','face',
        'fact','fail','fair','fall','fame','farm','fast','fate','feel','fill',
        'film','find','fire','firm','fish','fist','five','flag','flat','flaw',
        'flea','flip','flow','fold','food','fool','foot','fork','form','fort',
        'foul','four','free','frog','fuel','full','fume','gain','game','gang',
        'gate','gaze','gill','give','glee','glow','goal','gold','golf','good',
        'gore','hack','hail','hair','half','halt','hand','hang','hard','hare',
        'harm','have','head','heal','heap','heat','heel','helm','hero','hike',
        'hill','hint','hire','hive','hold','hole','holy','home','hook','hope',
        'horn','host','howl','huge','hunt','husk','icon','inch','iron','jolt',
        'jump','junk','just','keep','kill','kind','king','knot','know','lack',
        'lake','lamb','land','lane','last','late','lawn','lazy','lead','leaf',
        'lean','leap','left','lend','lens','lick','life','lift','like','lime',
        'limp','line','link','lion','list','live','load','loan','lock','lone',
        'long','look','loop','lore','lose','loss','love','luck','lump','lung',
        'made','mail','main','male','mall','many','mark','mast','maze','meal',
        'meet','melt','mend','mess','mild','mile','milk','mill','mind','mine',
        'mint','miss','mist','mode','mole','moon','more','most','much','must',
        'nail','name','near','neck','need','nest','next','nice','node','norm',
        'nose','note','noun','oath','once','open','oven','over','page','pain',
        'pale','palm','park','part','pass','past','path','peak','peel','pick',
        'pine','pink','pipe','plan','play','plot','plow','plus','poem','poet',
        'pole','pond','pore','port','pose','post','pour','prey','pull','pure',
        'push','rack','rage','rail','rain','rank','read','real','reed','reef',
        'reel','rely','rent','rest','rich','ride','ring','riot','road','roam',
        'roar','robe','rock','role','roll','roof','rope','rose','rude','rule',
        'rush','rust','safe','sail','sale','salt','same','sand','save','seal',
        'seat','seed','seek','self','sell','shed','ship','shoe','shop','shot',
        'show','sick','side','sign','silk','sing','sink','skin','slow','snap',
        'snow','sock','soft','soil','some','song','soon','sort','soul','soup',
        'sour','span','spot','star','stay','stem','step','stew','stop','such',
        'suit','swim','tail','take','tall','tame','tape','task','teal','team',
        'tell','tend','tent','text','than','that','them','then','thin','tide',
        'tile','till','time','tire','toad','toll','tomb','tone','took','tool',
        'tore','toss','town','tree','trim','trip','true','tuck','tune','turn',
        'twin','type','upon','vain','vale','vane','veil','vein','vest','view',
        'vine','void','wade','wage','wake','walk','wall','ward','warm','wave',
        'weld','went','west','wide','wife','wild','will','wind','wine','wing',
        'wiry','wish','wolf','wood','wool','word','work','worm','wrap','year',
        'yell','your','zeal','zero','zone','zoom'],
    5: ['abbey','about','above','abuse','adapt','after','again','agree','ahead',
        'alarm','alert','alike','alley','allow','alone','along','aloof','alpha',
        'alter','angel','angle','angry','apart','apple','apply','arena','arose',
        'array','atlas','atone','avoid','basic','basin','beach','began','begin',
        'being','below','bench','berry','blend','bless','blind','block','blood',
        'bloom','board','boost','booth','bound','brace','brain','brake','brand',
        'brave','bread','break','breed','brief','bring','brisk','brook','broth',
        'brown','build','built','bunch','burst','chill','civic','civil','claim',
        'clash','class','clean','clear','climb','cling','clock','clone','close',
        'cloud','comet','comma','could','count','cover','crack','crane','crash',
        'crazy','creek','crime','crisp','cross','crowd','crown','cruel','crush',
        'cycle','daily','dance','datum','decay','delay','dense','depth','devil',
        'dodge','draft','drain','drama','dread','dream','dress','drink','drive',
        'drown','eagle','early','earth','eight','elect','elite','ember','empty',
        'enemy','enjoy','enter','entry','equal','erupt','essay','event','every',
        'exact','extra','fable','faint','faith','feast','fence','fever','field',
        'fifth','fifty','fight','final','first','flame','flash','flesh','float',
        'flock','floor','flour','fluid','flush','focus','force','forge','forth',
        'forty','found','frame','fraud','fresh','front','froze','fruit','funny',
        'ghost','given','glass','gloss','glove','going','grace','grade','grain',
        'grand','grant','graph','grasp','grass','grave','greed','green','greet',
        'groan','groom','grove','growl','grown','guard','gusto','habit','happy',
        'hardy','haven','heart','heavy','hinge','horse','hotel','hover','human',
        'humor','hurry','ideal','image','index','inner','input','issue','judge',
        'juice','juicy','karma','kneel','knife','knock','known','large','laser',
        'later','layer','learn','lease','legal','level','light','limit','local',
        'lodge','logic','loose','lover','lower','lucky','lunch','magic','major',
        'manor','maple','march','match','mayor','meant','medal','media','mercy',
        'metal','might','minor','mixed','model','money','motor','mount','mouth',
        'music','nerve','never','night','noble','noise','north','nudge','ocean',
        'offer','often','olive','opera','orbit','order','other','outer','owner',
        'paint','panel','panic','paper','party','pasta','patch','pause','peace',
        'pearl','pedal','penny','piece','pilot','place','plain','plane','plant',
        'plate','plaza','point','polar','porch','pound','power','press','price',
        'pride','prime','print','prior','prize','probe','proof','prose','prove',
        'pulse','punch','pupil','purse','queen','quest','quick','quiet','quote',
        'radar','radio','raise','rally','ranch','range','rapid','reach','ready',
        'realm','rebel','reign','relax','repay','retro','revel','ridge','right',
        'rigid','river','robot','rough','round','route','royal','ruler','rural',
        'salad','scale','scene','scent','score','scout','screw','sense','serve',
        'seven','shade','shaft','shake','shame','shape','share','shark','sharp',
        'shout','shine','shirt','shock','shore','short','sight','since','sixth',
        'sixty','skill','skull','slash','sleep','slice','slide','slope','smart',
        'smell','smile','smoke','snake','solar','solid','solve','speak','speed',
        'spell','spend','spine','sport','stack','stage','stain','stair','stall',
        'stamp','stand','stare','stark','start','state','steak','steam','steel',
        'steep','stick','still','sting','stock','stone','storm','stove','study',
        'stuff','stump','style','sugar','surge','swamp','swear','sweat','sweep',
        'sweet','swift','swipe','sword','syrup','table','taste','teach','teeth',
        'tempo','tense','their','there','these','thick','thing','think','third',
        'those','three','thumb','tiger','tight','tired','title','today','token',
        'total','touch','tough','tower','toxic','track','trade','trail','train',
        'trait','trend','trial','tribe','trick','tried','troop','trout','truly',
        'truce','truck','trust','truth','tulip','tumor','twirl','twist','under',
        'unify','unity','until','upper','upset','usage','valid','value','vapor',
        'vault','video','vigor','viral','virus','visit','vital','vocal','voice',
        'voter','weary','wedge','wheat','wheel','where','which','while','witch',
        'worry','worse','worth','would','wrath','write','wrote','yacht','yield',
        'young','youth','zebra']
};

// ---------------------------------------------------------------------------
// Level definitions
// ---------------------------------------------------------------------------
// bubbleFreq : spawn one bubble every N frames  (lower = more frequent)
// speedMult  : multiplier on bubble rise speed
// bubblesNeeded : pops required to clear the level
// maxWordLen : for 'word' mode, max word length to pull from wordLists
// ---------------------------------------------------------------------------
var levels = [
    { level:1, label:'Level 1', subtitle:'Letters',        mode:'letter', bubbleFreq:100, speedMult:0.75, bubblesNeeded:10 },
    { level:2, label:'Level 2', subtitle:'Faster Letters', mode:'letter', bubbleFreq:70,  speedMult:1.0,  bubblesNeeded:15 },
    { level:3, label:'Level 3', subtitle:'Short Words',    mode:'word',   bubbleFreq:120, speedMult:0.7,  bubblesNeeded:8,  maxWordLen:2 },
    { level:4, label:'Level 4', subtitle:'3-Letter Words', mode:'word',   bubbleFreq:100, speedMult:0.85, bubblesNeeded:10, maxWordLen:3 },
    { level:5, label:'Level 5', subtitle:'Words',          mode:'word',   bubbleFreq:90,  speedMult:1.0,  bubblesNeeded:12, maxWordLen:3 },
    { level:6, label:'Level 6', subtitle:'4-Letter Words', mode:'word',   bubbleFreq:80,  speedMult:1.1,  bubblesNeeded:12, maxWordLen:4 },
    { level:7, label:'Level 7', subtitle:'Speeding Up',    mode:'word',   bubbleFreq:70,  speedMult:1.25, bubblesNeeded:15, maxWordLen:4 },
    { level:8, label:'Level 8', subtitle:'5-Letter Words', mode:'word',   bubbleFreq:65,  speedMult:1.4,  bubblesNeeded:15, maxWordLen:5 },
    { level:9, label:'Level 9', subtitle:'FINAL LEVEL',    mode:'word',   bubbleFreq:50,  speedMult:1.6,  bubblesNeeded:20, maxWordLen:5 }
];

var letters = 'abcdefghijklmnopqrstuvwxyz'.split('');

// ---------------------------------------------------------------------------
// Game state
// ---------------------------------------------------------------------------
var game = {
    levelIndex:        0,
    strikes:           0,
    maxStrikes:        3,
    score:             0,
    bubblesPopped:     0,
    isOver:            false,
    // 'menu' | 'playing' | 'levelComplete' | 'gameOver' | 'won'
    state:             'menu',
    targetBubble:      null,   // the word-bubble currently being typed
    transitionFrames:  0,
    strikeFlashFrames: 0,
    get currentLevel() { return levels[this.levelIndex]; }
};

// ---------------------------------------------------------------------------
// Global arrays (shared with ball.js / explosion.js)
// ---------------------------------------------------------------------------
var bubbles = [];
var keys    = [];
var pops    = [];

// ---------------------------------------------------------------------------
// Audio
// ---------------------------------------------------------------------------
var popSound = new Audio('POP.wav');
popSound.volume = 0.4;
var bgSound  = new Audio('Theme.mp3');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getWord(maxLen) {
    var available = Object.keys(wordLists)
        .map(Number)
        .filter(function(l) { return l <= maxLen; });
    if (!available.length) available = [2];
    var len  = available[Math.floor(Math.random() * available.length)];
    var list = wordLists[len];
    return list[Math.floor(Math.random() * list.length)];
}

// Called directly from keydown — one character at a time
function handleCharacterInput(ch) {
    if (game.state !== 'playing') return;
    var lvl = game.currentLevel;

    if (lvl.mode === 'letter') {
        // Pop the first bubble whose single letter matches
        for (var i = bubbles.length - 1; i >= 0; i--) {
            if (bubbles[i].word === ch) {
                explode(bubbles[i].x, bubbles[i].y);
                bubbles.splice(i, 1);
                game.bubblesPopped++;
                game.score++;
                return;
            }
        }
    } else {
        // --- Word mode ---
        if (game.targetBubble) {
            var tb    = game.targetBubble;
            var tbIdx = bubbles.indexOf(tb);
            if (tbIdx === -1) { game.targetBubble = null; return; }

            if (tb.word[tb.typedIndex] === ch) {
                tb.typedIndex++;
                soundFX.type();
                if (tb.typedIndex >= tb.word.length) {
                    // Word complete!
                    explode(tb.x, tb.y);
                    bubbles.splice(tbIdx, 1);
                    game.targetBubble = null;
                    game.bubblesPopped++;
                    game.score += tb.word.length; // longer words = more points
                }
            } else {
                tb.shakeFrames = 8; // wrong key: visual shake
            }
        } else {
            // No target yet — find a bubble whose first letter matches
            for (var i = 0; i < bubbles.length; i++) {
                if (bubbles[i].word[0] === ch) {
                    game.targetBubble      = bubbles[i];
                    bubbles[i].targeted    = true;
                    bubbles[i].typedIndex  = 1;
                    soundFX.type();
                    break;
                }
            }
        }
    }
}

function addStrike() {
    game.strikes++;
    game.strikeFlashFrames = 35;
    soundFX.strike();
    if (game.strikes >= game.maxStrikes) {
        endGame();
    }
}

function endGame() {
    soundFX.gameOver();
    game.state  = 'gameOver';
    game.isOver = true;
    var hs = parseInt(getCookie('bubbleScore') || '0');
    if (game.score > hs) { setCookie('bubbleScore', game.score); }
}

function advanceLevel() {
    soundFX.levelUp();
    game.targetBubble = null;
    bubbles = [];
    // Leave pops[] alone so particles finish animating

    game.levelIndex++;
    if (game.levelIndex >= levels.length) {
        game.state  = 'won';
        game.isOver = true;
        var hs = parseInt(getCookie('bubbleScore') || '0');
        if (game.score > hs) { setCookie('bubbleScore', game.score); }
        return;
    }
    game.bubblesPopped    = 0;
    game.state            = 'levelComplete';
    game.transitionFrames = 200; // ~3.3 s at 60 fps
}

function resetGame() {
    game.levelIndex        = 0;
    game.strikes           = 0;
    game.score             = 0;
    game.bubblesPopped     = 0;
    game.isOver            = false;
    game.state             = 'playing';
    game.targetBubble      = null;
    game.transitionFrames  = 0;
    game.strikeFlashFrames = 0;
    bubbles = [];
    keys    = [];
    pops    = [];
    counter = 0;
}

// ---------------------------------------------------------------------------
// requestAnimFrame shim
// ---------------------------------------------------------------------------
window.requestAnimFrame = (function() {
    return window.requestAnimationFrame       ||
           window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame    ||
           window.oRequestAnimationFrame      ||
           window.msRequestAnimationFrame     ||
           function(cb) { window.setTimeout(cb, 1000 / 60); };
})();

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------
$(function() {
    canvas  = document.getElementById('canvas');
    context = canvas.getContext('2d');
    var c   = new cvs();

    var lastTime = new Date().getTime();

    function main() {
        counter++;
        var now  = new Date().getTime();
        delta    = (now - lastTime) / 1000;
        lastTime = now;
        c.fps    = Math.round(1 / delta);

        c.cycle(); // clear canvas

        switch (game.state) {

            case 'playing':
                var lvl = game.currentLevel;

                // Spawn a new bubble on schedule
                if (counter % lvl.bubbleFreq === 0) {
                    bubbles.push(new bubble(
                        getRandomNum(80, canvasWidth - 80),
                        canvasHeight + 80
                    ));
                }

                // Draw + update all bubbles (iterate backwards — splice-safe)
                for (var bs = bubbles.length - 1; bs >= 0; bs--) {
                    bubbles[bs].draw();
                    bubbles[bs].update(bs);
                }

                // Pop particles
                for (var a = pops.length - 1; a >= 0; a--) {
                    pops[a].draw();
                    pops[a].update(a);
                }

                // Red-flash overlay on a strike
                if (game.strikeFlashFrames > 0) {
                    var flashAlpha = (game.strikeFlashFrames / 35) * 0.38;
                    context.fillStyle = 'rgba(255,0,0,' + flashAlpha + ')';
                    context.fillRect(0, 0, canvasWidth, canvasHeight);
                    game.strikeFlashFrames--;
                }

                // HUD on top
                c.drawHUD();

                // Level cleared?
                if (!game.isOver && game.bubblesPopped >= lvl.bubblesNeeded) {
                    advanceLevel();
                }
                break;

            case 'levelComplete':
                // Let particles finish
                for (var a = pops.length - 1; a >= 0; a--) {
                    pops[a].draw();
                    pops[a].update(a);
                }
                c.drawLevelComplete();
                game.transitionFrames--;
                if (game.transitionFrames <= 0) {
                    game.state = 'playing';
                    counter    = 0; // avoid immediate spawn burst
                }
                break;

            case 'gameOver':
                c.drawGameOver();
                break;

            case 'won':
                c.drawWon();
                break;
        }

        requestAnimFrame(main);
    }

    // ---- Start button (first play only) ----
    $('.start-button').on('click', function() {
        $(this).hide();
        getAudioContext(); // unlock Web Audio on user gesture
        bgSound.loop = true;
        try { bgSound.play(); } catch(e) {}
        resetGame();
        lastTime = new Date().getTime();
        main();
    });

    // ---- Click-to-restart after game over / win ----
    $('#canvasWrapper').on('click', function() {
        $(this).focus();
        if (game.state === 'gameOver' || game.state === 'won') {
            resetGame();
            lastTime = new Date().getTime();
        }
    });

    // ---- Keyboard input — typed one char at a time ----
    $('#canvasWrapper').on('keydown', function(event) {
        var kc = event.which;
        if (kc >= 65 && kc <= 90) {
            handleCharacterInput(String.fromCharCode(kc).toLowerCase());
        }
        event.preventDefault(); // prevent page scroll on spacebar, etc.
    });
});
