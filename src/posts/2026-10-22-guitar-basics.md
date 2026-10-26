---
layout: post
title: "An Illustrated Guide to Music Theory Basics on Guitar"
date: 2026-10-22
tags: 
comments: false
category: 
---

# Notes
Each string on the guitar corresponds to a specific note. For this post we're going to assume _standard tuning_ which means that the strings are tuned in this order:

E(thickest string)
A
D
G
B
E(thinest string)

There is a good pneumonic device to help remember this order: *E*ddie *A*te *D*ynamite *G*ood *B*ye *E*ddie. Playing any string open plays that strings note.  In order to play different notes you can press down the string in the gaps on the guitar neck. These are called _frets_.  As you move up the neck of the guitar, holding down each fret, the notes you play when strumming the string follow a specific pattern:

A, A#, B, C, C#, D, D#, E, F, F#, G, G#, back to A

It doesn't matter what note you start on, you just follow the pattern from the point.  The pattern is circular when you reach the starting point, you just keep going around.

<iframe
  id="notes-loop"
  src="/media/assets/note-circle.html"
  title="Basic Guitar"
  loading="lazy"
  style="width:100%; aspect-ratio:2/1; border:0; display:block; margin:1.0em auto;">
</iframe>


Notice the "gaps" between B and C, E and F.  There are no #'s between them.  This will become important later.

<iframe
  id="notes-loop"
  src="/media/assets/guitar-notes.html"
  title="Basic Guitar"
  loading="lazy"
  style="width:100%; aspect-ratio:2/1; border:0; display:block; margin:1.0em auto;">
</iframe>

# Scales

There are a multitude of different scales but when we talk about basic major and minor scales we're really referring to the [diatonic scale](https://en.wikipedia.org/wiki/Heptatonic_scale#Diatonic_scale) which is what we're going to talk about here. 

Scales are made up of whole and half tones (also referred to as _steps_).  On a guitar, each fret is a half tone.  So, 2 frets for a whole tone. If we use the letter "W" to represent a _whole_ step and "H" to represent a _half_ step, we can describe the major and minor diatonic scales as:

Major: W-W-H-W-W-W-H

Minor: W-H-W-W-H-W-W

A scale is named by its root note.  So, a G Major scale starts on G and follows the major scale pattern from there.  A G Minor scale starts on G and follows the minor scale pattern.

Here's what each G scale looks like on the low E string

<iframe
  id="notes-loop"
  src="/media/assets/g-major-scale.html"
  title="Basic Guitar"
  loading="lazy"
  style="width:100%; aspect-ratio:2/2.5; border:0; display:block; margin:1.0em auto;">
</iframe>

What do you notice?  

Let's write out the notes:

G Major: G A B  C D E  F#
G Minor: G A A# C D D# F

*** Do i comment on the overlap here?  Does that matter? ***

# Intervals

The gaps between notes are called _intervals_ and they are built from a _quality_ and a _number_. 

<table>
<tr>
<th>Interval</th>
<th>No. of Semiphones</th>
<th>Root of G</th>
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


This takes us to:

# Chords

They are built using _triads_.

A _triad_ is a three note combination that makes up chords.  They are based on the root note and then stacked 3rds.

- *Major Chords*: Root Note + Major 3rd + Perfect 5th (Frets: 0, 4, 7)
- *Minor Chords*: Root Note + Minor 3rd + Perfect 5th (Frets: 0, 3, 7)
- *Sus2 Chords*: Root Note + Major 2nd + Perfect 5th (Frets: 0, 2, 7)
- *Sus4 Chords*: Root Note + Perfect 4th + Perfect 5th (Frets: 0, 5, 7)
- *Diminished Chords*: Root Note + Minor 3rd + Lowered 5th (Frets: 0, 3, 6)
- *Augmented Chords*: Root Note + Major 3rd + Raised 5th (Frets: 0, 4, 8)

If you had really long fingers you could play chords on a single string by playing the root note and then stretching your exceptional fingers to reach down the fretboard based on the list above.  Of course, we don't play chords that way so let's explore some real chords and the notes that make them.

We'll start with an easy one: E Major

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

if we look at each string, these are the notes:

E(open), B(2nd fret), E(2nd fret), G#(1st fret), B(open), E(open)

Now, let's compare that to the notes in the E major scale.  Remember, we can build a major diatonic scale with the pattern: W-W-H-W-W-W-H.  So, for E major that would look like this:

_E_, F#, _G#_, A, _B_, C#, D#

You can see that all the notes of the chord exist in the major scale.

The same is true of E Minor:

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

E, F#, G, A, B, C, D

As with the major chord, the notes of the minor chord all exist in the E minor scale.

A few things to notice here.

1. The only difference between the E major and E minor chords is that E major has a G# and E minor has a G.  Everything else is the same.

2. In both chords, there are repeated notes (the E and B in both cases).  This is called _doubling_ and you can have either an octave doubling which is when the same note is played at different octaves or unison doubling when it's the same note at the same octave.

_[My original understanding](link to week 1) was that chords are built from notes of a scale.  But that's not necessarily true.  It can be true when you're talking about the diatonic scales in that a G major chord will only contain notes in teh G Major scale and a G minor chord will only contain notes in the G minor scale but that is sort of just a coincidence, not a rule._

## Roman Numeral Notation

If you’re looking at any given scale, a chord can be made by using each note in the scale as the root.  These are usually notated with roman numerals like this:

I, II, III, IV, V, VII, VIII

For a given scale you would use uppercase and lowercase to indicate whether it’s a major or minor chord.

This happens because you build each chord by taking the root + 3rd + 5th.  Depending on where those notes land it could be a major or a minor chord.  This is due to the fact that the fretboard on a guitar is not uniform as we talked about [a couple of weeks ago](/posts/2026-10-04-what-i-learned-this-week.html).  

As an example let’s stay in the G Major Key.  That scale is: G-A-B-C-D-E-F#

So, the chord for A is: A(root), C(3rd), E(5th)

Now, if we look at what we learned [last week](.posts/2026-10-11-what-i-learned-this-week.html):

- *Major Chords*: Root Note + Major 3rd + Perfect 5th (Frets: 0, 4, 7)
- *Minor Chords*: Root Note + Minor 3rd + Perfect 5th (Frets: 0, 3, 7)

if we start at A on the fretboard and move to the next note in the chord (C) that is only 3 frets away so it’s a MINOR 3rd instead of a major so the chord is minor which is why for G Major Key the notation is:

I, ii, iii, IV, V, vi, vii°

- I (G major): G – B – D (Major)
- ii (A minor): A – C – E (Minor)
- iii (B minor): B – D – F♯ (Minor)
- IV (C major): C – E – G (Major)
- V (D major): D – F♯ – A (Major)
- vi (E minor): E – G – B (Minor)
- vii° (F♯ diminished): F♯ – A – C (Diminished)

# Next Time
- Chord Progressions
- Borrowed Chords


