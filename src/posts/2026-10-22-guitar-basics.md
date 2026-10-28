---
layout: post
title: "An Illustrated Guide to Music Theory Basics on Guitar"
date: 2026-10-28
tags: 
comments: false
category: 
---

I'm currently attempting to teach myself how to play the guitar.  As part of that process I've been trying to learn about music theory.  In this article I will walk through the basics of music theory as it relates to guitar.  I will be using my own words as I understand things.  As a result, I'm not promising that this article covers _everything_.  There are likely some gaps and assumptions. I'll try to link out to additional resources when I know I'm not covering something specific. My goals are threefold:

1. By taking the time to write it out I hope to codify the knowledge in my brain
2. This article can act as a reference for me to come back to when I forget things
3. Hopefully someone else gets something else out of it


# Notes
Each string on the guitar corresponds to a specific note. For this post we're going to assume [standard tuning](https://en.wikipedia.org/wiki/Guitar_tunings#Standard) which means that the strings are tuned in this order:

E(thickest string)  
A  
D  
G  
B  
E(thinest string)

There is a good mnemonic device to help remember this order: 

**_E_**ddie **_A_**te **_D_**ynamite **_G_**ood **_B_**ye **_E_**ddie. 

Playing any string open plays that string's note.  In order to play different notes you can press down the string in the gaps on the guitar neck. These are called _frets_.  Each fret corresponds to a [semitone](https://en.wikipedia.org/wiki/Semitone) also known as a _half step._ So, moving up one fret is a half-step and 2 frets is a full-step. As you move up the neck of the guitar, holding down each fret, the notes you play when strumming the string follow a specific pattern:

A -> A# -> B -> C -> C# -> D -> D# -> E -> F -> F# -> G -> G# -> A

It doesn't matter what note you start on, you just follow the pattern from that point.  The pattern is circular, when you reach the starting point, you just keep going around. This is illustrated in the animation below. 

_Note: all animations in this article can be paused and restarted by simply clicking on them_

<figure>
<div id="circle"></div>
<figcaption>Semitones are circular</figcaption>
</figure>


Here's how that looks on the "A" string of the guitar:

<figure>
<div id="a-string"></div>
<figcaption>Playing each fret on the "A" string of the guitar</figcaption>
</figure>


# Scales

There are many different types of scales but for the purposes of this article, we'll be discussing the minor and major scales which are both [diatonic scales](https://en.wikipedia.org/wiki/Heptatonic_scale#Diatonic_scale).

Scales are made up of whole and half steps.  As discussed above, on a guitar, each fret is a half step.  So, 2 frets for a whole step. If we use the letter "W" to represent a _whole_ step and "H" to represent a _half_ step, we can describe the major and minor diatonic scales as:

Major: W-W-H-W-W-W-H

Minor: W-H-W-W-H-W-W

A scale is named by its root note.  So, a G Major scale starts on G and follows the major scale pattern from there.  A G Minor scale starts on G and follows the minor scale pattern.

Here's what each G scale looks like on the low E string

<h2>G Major</h2>
<div id="g-major"></div>

<h2>G Minor</h2>
<div id="g-minor"></div>

If we write out the notes for each scale we can see that there is quite a bit of overlap:

G Major: G A B  C D E  F#  
G Minor: G A A# C D D# F

You can see that they share many notes with the only differences being A# instead of B, D# instead of E, and F instead of F#.

# Intervals

The gaps between notes are called _intervals_ and they are built from a _quality_ and a _number_. Examples are: Major(quality) 2nd(number) and Perfect(quality) 5th(number). 

<table>
<tr>
<th>Interval</th>
<th>No. of Semitones</th>
<th>Note in Root of G</th>
</tr>
<tr>
<td>Minor 2nd</td>
<td>1</td>
<td>G#</td>
</tr>
<tr>
<td>Major 2nd</td>
<td>2</td>
<td>A</td>
</tr>
<tr>
<td>Minor 3rd</td>
<td>3</td>
<td>A#</td>
</tr>
<tr>
<td>Major 3rd</td>
<td>4</td>
<td>B</td>
</tr>
<tr>
<td>Perfect 4th</td>
<td>5</td>
<td>C</td>
</tr>
<tr>
<td>Diminished 5th</td>
<td>6</td>
<td>C#</td>
</tr>
<tr>
<td>Perfect 5th</td>
<td>7</td>
<td>D</td>
</tr>
<tr>
<td>Minor 6th</td>
<td>8</td>
<td>D#</td>
</tr>
<tr>
<td>Major 6th</td>
<td>9</td>
<td>E</td>
</tr>
<tr>
<td>Minor 7th</td>
<td>10</td>
<td>F</td>
</tr>
<tr>
<td>Major 7th</td>
<td>11</td>
<td>F#</td>
</tr>
<tr>
<td>Perfect Octave</td>
<td>12</td>
<td>G</td>
</tr>
</table>


# Chords

Now that we understand notes and intervals we can use those building blocks to start looking at _chords_. The simple beginner chords are built using note combinations called _triads_. A _triad_ is a three note combination that makes up chords.  They are based on the root note plus 2 additional notes that can be found using different intervals.

- *Major Chords*: Root Note + Major 3rd + Perfect 5th (Semitone from root: 0, 4, 7)
- *Minor Chords*: Root Note + Minor 3rd + Perfect 5th (Semitone from root: 0, 3, 7)
- *Sus2 Chords*: Root Note + Major 2nd + Perfect 5th (Semitone from root: 0, 2, 7)
- *Sus4 Chords*: Root Note + Perfect 4th + Perfect 5th (Semitone from root: 0, 5, 7)
- *Diminished Chords*: Root Note + Minor 3rd + Diminished 5th (Semitone from root: 0, 3, 6)
- *Augmented Chords*: Root Note + Major 3rd + Augmented 5th (Semitone from root: 0, 4, 8)

Now, since you can't play multiple notes on the same string, chords require us to use multiple strings to get all the necessary notes. Depending on the chord, we may have to hold down multiple strings at the same time.  Let's see what that looks like in practice. We'll start with an easy one: E Major (or just E. The _Major_ is implied)

<!-- E major: 022100 -->
<div>
  <div class="chord">
    <div class="board">
      <span class="mark open" style="--s:0"></span>
      <span class="mark open" style="--s:4"></span>
      <span class="mark open" style="--s:5"></span>
      <span class="dot" style="--s:1; --f:2">2</span>
      <span class="dot" style="--s:2; --f:2">3</span>
      <span class="dot" style="--s:3; --f:1">1</span>
    </div>
  </div>
</div>

The image above is called a _chord diagram_. If we look at each string and which frets are being held down we can see that the notes in the E chord are:

E(open), B(2nd fret), E(2nd fret), G#(1st fret), B(open), E(open)

Now, let's compare that to the notes in the E major scale.  Remember, we can build a major diatonic scale with the pattern: W-W-H-W-W-W-H.  So, for E major that would look like this:

**E**, F#, **G#**, A, **B**, C#, D#

I've bolded the notes of the E major chord and you can see they all exist in the major scale.

The same is true of E minor:

<div>
  <!-- E minor: 022000 -->
  <div class="chord">
    <div class="board">
      <span class="mark open" style="--s:0"></span>
      <span class="mark open" style="--s:3"></span>
      <span class="mark open" style="--s:4"></span>
      <span class="mark open" style="--s:5"></span>
      <span class="dot" style="--s:1; --f:2">2</span>
      <span class="dot" style="--s:2; --f:2">3</span>
    </div>
  </div>
</div>

Notes: E(open), B(2nd fret), E(2nd fret), G(open), B(open), E(open)

And now the E minor scale (W-H-W-W-H-W-W)

**E**, F#, **G**, A, **B**, C, D

As with the major chord, the notes of the minor chord all exist in the E minor scale.

A few things to notice here.

1. The only difference between the E major and E minor chords is that E major has a G# and E minor has a G.  Everything else is the same.

2. In both chords, there are repeated notes (the E and B in both cases).  This is called _doubling_ and you can have either an octave doubling which is when the same note is played at different octaves or unison doubling when it's the same note at the same octave.

## Roman Numeral Notation

If you’re looking at any given scale, a chord can be made by using each note in the scale as the root.  These are usually notated with roman numerals like this:

I, II, III, IV, V, VI, VII

For a given scale you would use uppercase and lowercase to indicate whether it’s a major or minor chord.

This happens because you build each chord by taking the root + 3rd + 5th.  Depending on where those notes land it could be a major or a minor chord.  This is due to the fact that the scale's step pattern is not uniform.

As an example let’s stay in the G Major Key.  

That scale is: G-A-B-C-D-E-F#

So, the chord for A is: A(root), C(3rd), E(5th)

As discussed above, simple chords are built with triads.  The major and minor chords are built like this:

- *Major Chords*: Root Note + Major 3rd + Perfect 5th (Frets: 0, 4, 7)
- *Minor Chords*: Root Note + Minor 3rd + Perfect 5th (Frets: 0, 3, 7)

If we start at A on the fretboard and move to the next note in the chord (C) that is only 3 frets away so it’s a MINOR 3rd instead of a major so the chord is minor which is why for G Major Key the notation is:

I, ii, iii, IV, V, vi, vii°

- I (G major): G – B – D (Major)
- ii (A minor): A – C – E (Minor)
- iii (B minor): B – D – F♯ (Minor)
- IV (C major): C – E – G (Major)
- V (D major): D – F♯ – A (Major)
- vi (E minor): E – G – B (Minor)
- vii° (F♯ diminished): F♯ – A – C (Diminished)

<figure>
<div id="chords"></div>
<figcaption>
All the chords in the key of G major
</figcaption>
</figure>

# Summary

In this article I attempted to cover some entry-level music theory as it applies to learning the guitar. We covered the basics of notes scales and simple chords which is about as far as I've gotten on my journey to date. 

# Additional Resources

- [Marty Music](https://www.youtube.com/channel/UCmnlTWVJysjWPFiZhQ5uudg) on YouTube has so many great tutorials.  He's usually my first stop when I'm looking to learn a new song
- A special Thank You to [Bartosz Ciechanowski](https://ciechanow.ski/) whose animated articles inspired the style of this article (he does it **much** better than me though!)

<div id="ai-disclosure">
  <h3>AI Disclosure</h3>
  <ul>
    <li>AI was used to build the animations used in this article</li>
    <li>I used AI as an editor and fact checker for this article</li>
  </ul>
  <a href="/pages/about.html">Read my sitewide AI disclosure</a>
</div>

<link rel="stylesheet" href="/css/guitar.css">
<script src="/js/guitar.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
            noteCircle(document.getElementById('circle'), { string: 0, fret: 3 });
            fretboard(document.getElementById('a-string'), {
              steps: stringSteps({ string: 1, frets: 12 }),   
              frets: 12,
              interval: 1200
            });
            fretboard(document.getElementById('g-major'), {
              steps: scaleSteps({ root: 'G', scale: 'major', string: 0, frets: 15 }),
              interval: 1200
            });
            fretboard(document.getElementById('g-minor'), {
              steps: scaleSteps({ root: 'G', scale: 'minor', string: 0, frets: 15 }),
              interval: 1200
            });
            fretboard(document.getElementById('chords'), {
              steps: [
                chord('G',  [3, 2, 0, 0, 0, 3]),
                chord('Am', [null, 0, 2, 2, 1, 0]),
                chord('Bm', [null, 2, 4, 4, 3, 2], { barre: { fret: 2, from: 1, to: 5 } }),
                chord('C',  [null, 3, 2, 0, 1, 0]),
                chord('D',  [null, null, 0, 2, 3, 2]),
                chord ('Em',[0, 2, 2, 0, 0, 0]),
                chord ('F# diminished', [null, null, 4, 2, 1, 2])
              ],
              frets: 5,
              interval: 2000
            });
  });
</script>