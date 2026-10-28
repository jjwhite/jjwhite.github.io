/* ---------- Music helpers ---------- */
const NOTES_SHARP = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const NOTES_FLAT  = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
const TUNING = [4, 9, 2, 7, 11, 4];   // low E, A, D, G, B, high e as semitones above C
const SCALES = {
  major:           [0, 2, 4, 5, 7, 9, 11],
  minor:           [0, 2, 3, 5, 7, 8, 10],
  majorPentatonic: [0, 2, 4, 7, 9],
  minorPentatonic: [0, 3, 5, 7, 10],
  blues:           [0, 3, 5, 6, 7, 10]
};

/* Walk up one string from the root's first fret, one step per scale note. */
function scaleSteps({ root, scale = 'major', string = 0, frets = 15, flats = false }) {
  const names = flats ? NOTES_FLAT : NOTES_SHARP;
  let r = NOTES_SHARP.indexOf(root);
  if (r < 0) r = NOTES_FLAT.indexOf(root);
  const open = TUNING[string], steps = [];
  for (let f = (r - open + 12) % 12; f <= frets; f++) {
    const n = (open + f) % 12;
    if (SCALES[scale].includes((n - r + 12) % 12)) {
      steps.push({ label: names[n], sub: f === 0 ? 'open string' : 'fret ' + f, dots: [{ string, fret: f }] });
    }
  }
  return steps;
}

/* Every note on one string, open string up to `frets` (a chromatic walk). */
function stringSteps({ string = 0, frets = 12, flats = false }) {
  const names = flats ? NOTES_FLAT : NOTES_SHARP, steps = [];
  for (let f = 0; f <= frets; f++) {
    steps.push({ label: names[(TUNING[string] + f) % 12], sub: f === 0 ? 'open string' : 'fret ' + f, dots: [{ string, fret: f }] });
  }
  return steps;
}

const STRING_NAMES = ['E', 'A', 'D', 'G', 'B', 'E'];   // low to high

/* Optional { barre: { fret, from, to } } covers strings from..to at that fret with one bar. */
const chord = (label, frets, { sub = '', barre } = {}) => ({
  label, sub, barre,
  dots:  frets.flatMap((fret, string) =>
    fret == null || (barre && fret === barre.fret && string >= barre.from && string <= barre.to) ? [] : [{ string, fret }]),
  muted: frets.flatMap((fret, string) => fret == null ? [string] : [])
});

/* ---------- The animation ----------
   A step is { label, sub?, dots: [{ string, fret }] }
   string: 0 = low E ... 5 = high e.  fret: 0 = open string.            */
function fretboard(el, opts) {
  const o = { frets: 15, strings: [0, 1, 2, 3, 4, 5], interval: 1000, ...opts };
  const rows = [...o.strings].sort((a, b) => b - a);          // high strings on top
  const GAP = 30, PAD = 26, H = (rows.length - 1) * GAP + PAD * 2;
  const max = 1 - 2 ** (-o.frets / 12);
  const pos = n => (1 - 2 ** (-n / 12)) / max * 100;           // realistic fret spacing, as %
  const mid = n => (pos(n - 1) + pos(n)) / 2;

  el.classList.add('fretboard');
  el.title = 'Click to pause / play';
  el.innerHTML = '<div class="fb-label"><strong></strong><small></small></div>' +
                 `<div class="fb-board" style="height:${H}px"></div><div class="fb-nums"></div>`;
  const label = el.querySelector('.fb-label'), big = label.querySelector('strong'),
        small = label.querySelector('small'), board = el.querySelector('.fb-board'),
        nums = el.querySelector('.fb-nums');
  const mk = (parent, cls, css = '', txt = '') => {
    const d = document.createElement('div');
    d.className = cls; d.style.cssText = css; d.textContent = txt;
    parent.appendChild(d); return d;
  };

  for (let n = 0; n <= o.frets; n++) mk(board, n ? 'fb-fret' : 'fb-fret nut', `left:${pos(n)}%`);
  rows.forEach((s, r) => mk(board, 'fb-string', `top:${PAD + r * GAP}px;height:${3 - s * 0.4}px`));
  if (o.labels !== false) rows.forEach((s, r) => mk(board, 'fb-name', `top:${PAD + r * GAP}px`, STRING_NAMES[s]));
  [3, 5, 7, 9, 12, 15, 17].filter(n => n <= o.frets).forEach(n =>
    (n === 12 ? [30, 70] : [50]).forEach(t => mk(board, 'fb-inlay', `left:${mid(n)}%;top:${t}%`)));
  for (let n = 1; n <= o.frets; n++) mk(nums, 'fb-num', `left:${mid(n)}%`, n);

  /* One "x" marker per string, faded in for muted strings. */
  const xs = {};
  rows.forEach((s, r) => { xs[s] = mk(board, 'fb-x', `top:${PAD + r * GAP}px`, '\u00d7'); });

  /* Dots are pooled and reused, so a dot glides from one position to the next. */
  const pool = []; let barreEl = null;
  function show(step) {
    rows.forEach(s => xs[s].classList.toggle('on', (step.muted || []).includes(s)));
    const ds = step.dots.filter(d => rows.includes(d.string));
    ds.forEach((d, k) => {
      const dot = pool[k] || (pool[k] = mk(board, 'fb-dot'));
      dot.style.left = d.fret ? mid(d.fret) + '%' : '-18px';
      dot.style.top = PAD + rows.indexOf(d.string) * GAP + 'px';
      dot.classList.toggle('open', !d.fret);
      void dot.offsetWidth;                                    // commit start position before fading in
      dot.classList.add('on');
    });
    const b = step.barre, span = b ? rows.filter(s => s >= b.from && s <= b.to) : [];
    if (span.length) {                                         // rows run high string -> low string
    const top = rows.indexOf(Math.max(...span)), bottom = rows.indexOf(Math.min(...span));
    barreEl = barreEl || mk(board, 'fb-barre');
    barreEl.style.left = mid(b.fret) + '%';
    barreEl.style.top = PAD + top * GAP + 'px';
    barreEl.style.height = (bottom - top) * GAP + 24 + 'px';
    void barreEl.offsetWidth;
    barreEl.classList.add('on');
    } else if (barreEl) barreEl.classList.remove('on');

    pool.slice(ds.length).forEach(dot => dot.classList.remove('on'));
    label.classList.add('swap');
    setTimeout(() => { big.textContent = step.label; small.textContent = step.sub || ''; label.classList.remove('swap'); }, 180);
  }

  let i = 0, timer = null;
  const tick = () => { show(o.steps[i]); i = (i + 1) % o.steps.length; };
  const play = () => { if (!timer) { tick(); timer = setInterval(tick, o.interval); } };
  const pause = () => { clearInterval(timer); timer = null; };

  el.addEventListener('click', () => timer ? pause() : play());
  new IntersectionObserver(e => e[0].isIntersecting ? play() : pause()).observe(el);  // only runs while visible
  return { play, pause };
}

/* ---------- The note circle ----------
   Starts on a string + fret, walks clockwise around the 12 notes, and ends
   12 semitones (one octave) later, back on the same note.
   walk: 'chromatic' (default) or any name in SCALES, e.g. 'major'.        */
function noteCircle(el, opts) {
  const o = { string: 0, fret: 0, walk: 'chromatic', interval: 700, hold: 2400, flats: false, ...opts };
  const names = o.flats ? NOTES_FLAT : NOTES_SHARP;
  const STRINGS = ['low E string', 'A string', 'D string', 'G string', 'B string', 'high E string'];
  const startPC = (TUNING[o.string] + o.fret) % 12;
  const iv = o.walk === 'chromatic' ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] : SCALES[o.walk];
  const walk = [...iv, 12];                                   // semitones from the start; 12 = back home
  const inWalk = new Set(iv.map(n => (startPC + n) % 12));
  const R = 140, C = 200;
  const pt = deg => { const a = (deg - 90) * Math.PI / 180; return [C + R * Math.cos(a), C + R * Math.sin(a)]; };

  let html = `<svg viewBox="0 0 400 400"><circle class="nc-ring" cx="${C}" cy="${C}" r="${R}"/><g class="nc-trail"></g>`;
  for (let pc = 0; pc < 12; pc++) {
    const [x, y] = pt(pc * 30);
    html += `<g class="nc-node ${inWalk.has(pc) ? 'in' : 'out'}"><circle cx="${x}" cy="${y}" r="21"/><text x="${x}" y="${y}" dy=".35em">${names[pc]}</text></g>`;
  }
  html += `<g class="nc-marker"><circle cx="${C}" cy="${C - R}" r="28"/></g></svg>` +
          '<div class="nc-center"><strong></strong><small></small></div>';
  el.classList.add('note-circle');
  el.title = 'Click to pause / play';
  el.innerHTML = html;

  const trail = el.querySelector('.nc-trail'), marker = el.querySelector('.nc-marker'),
        nodes = el.querySelectorAll('.nc-node'), big = el.querySelector('strong'), small = el.querySelector('small');
  let k = 0, timer = null, angle = 0;

  const setAngle = (deg, animate) => {
    if (!animate) marker.style.transition = 'none';
    marker.style.transform = `rotate(${deg}deg)`;
    if (!animate) { void marker.getBoundingClientRect(); marker.style.transition = ''; }
  };
  const segment = (from, to) => {                              // arc along the circle, drawn on
    const [x1, y1] = pt(startPC * 30 + from * 30), [x2, y2] = pt(startPC * 30 + to * 30);
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('class', 'nc-seg');
    p.setAttribute('d', `M${x1} ${y1}A${R} ${R} 0 0 1 ${x2} ${y2}`);
    trail.appendChild(p);
    const len = p.getTotalLength();
    p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
    void p.getBoundingClientRect();
    p.style.strokeDashoffset = 0;
  };

  function step() {
    const semis = walk[k], last = k === walk.length - 1, pc = (startPC + semis) % 12;
    if (k === 0) {
      trail.innerHTML = '';
      nodes.forEach(n => n.classList.remove('seen', 'pulse'));
      angle = startPC * 30; setAngle(angle, false);
    } else {
      angle += (semis - walk[k - 1]) * 30; setAngle(angle, true);
      segment(walk[k - 1], semis);
    }
    nodes[pc].classList.add('seen');
    if (last) nodes[pc].classList.add('pulse');
    big.textContent = names[pc];
    small.textContent = k === 0 ? `start: ${STRINGS[o.string]}, fret ${o.fret}`
      : last ? `fret ${o.fret + semis}: same note, one octave higher`
      : `fret ${o.fret + semis} (+${semis} semitone${semis > 1 ? 's' : ''})`;
    k = (k + 1) % walk.length;
    timer = setTimeout(step, last ? o.hold : o.interval);
  }
  const play = () => { if (!timer) step(); };
  const pause = () => { clearTimeout(timer); timer = null; };

  el.addEventListener('click', () => timer ? pause() : play());
  new IntersectionObserver(e => e[0].isIntersecting ? play() : pause()).observe(el);
  return { play, pause };
}