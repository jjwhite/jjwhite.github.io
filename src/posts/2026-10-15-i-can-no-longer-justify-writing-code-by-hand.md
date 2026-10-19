---
layout: post
title: "I Can No Longer Justify Writing Code By Hand"
date: 2026-10-15
tags: 
comments: false
category: 
---

Over the course of just over a year the percentage of my workday time spent hand writing code has gone from 90+ to essentially 0.  I did not change jobs.  I’m still being paid to produce the same work.  It’s just that AI does it for me now.  Leveraging AI to write my code in this way drains my soul.  It’s not fulfilling, I no longer get the pleasure of solving problems on my own, and it slowly erodes my skills.  These are all very bad things yet, despite them, I can no longer justify writing code by hand, at least when I’m being paid to produce it.

## Using AI To Write My Code Is Bad

I no longer have intimate knowledge of the code I’m committing.  I review the PRs and get a general understanding of how the code works but that’s not the same thing as writing it myself.   I can’t count how many times there has been a bug reported in production and due to my intimate knowledge of how that feature worked, I instantly thought: “Oh, I know what might be going on there.” Those days are becomming fewer and further between. I often have to turn to AI to diagnose the problem.  This creates a never-ending cycle of relying more and more on AI.   I’m slowly becoming dependent on it which feels, well, *gross*.

<iframe
  id="ai-loop"
  src="/media/assets/ai-dependency-loop_v2.html"
  title="Diagram: the loop of AI writing my code, me retaining less context, and relying on AI more"
  loading="lazy"
  style="width:100%; max-width:640px; aspect-ratio:640/560; border:0; display:block; margin:1.5rem auto;">
</iframe>

<script>
document.addEventListener("DOMContentLoaded", function () {
  var frame = document.getElementById("ai-loop");
  if (!frame) return; // page has no diagram

  var KEY = "theme"; // <- your localStorage key

  function currentTheme() {
    var v = localStorage.getItem(KEY);
    if (v === "dark" || v === "light") return v;
    // nothing stored yet: fall back to the OS setting
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function sendTheme() {
    if (frame.contentWindow) {
      frame.contentWindow.postMessage({ type: "theme", theme: currentTheme() }, "*");
    }
  }

  frame.addEventListener("load", sendTheme);
  sendTheme(); // in case it already loaded

  // same-tab changes: wrap setItem, since "storage" doesn't fire in the tab that wrote
  var origSet = Storage.prototype.setItem;
  Storage.prototype.setItem = function (k) {
    origSet.apply(this, arguments);
    if (k === KEY) sendTheme();
  };

  // changes made from other tabs
  window.addEventListener("storage", function (e) {
    if (e.key === KEY) sendTheme();
  });
});
</script>

And the problems aren’t just technical in nature. It’s also impacting my mental health.  Coding by hand is best done in a *flow state* and you’d be hard pressed to find anyone who gets into a flow state while chatting with Claude Code.  When I write my own code I feel more fulfilled and valuable.  And, frankly, it’s [just way more fun.](https://www.autodidacts.io/vibecoding-isnt-as-fun-as-writing-code-by-hand/)  A few years back I transitioned from an IC to an Engineering Manager and, despite learning a lot from the experience, I hated it and, when given the opportunity, transitioned back.  Working with AI feels a bit like being forced back into that role: orchestrating and reviewing work instead of building it.

Then there is the fact that AI makes mistakes.  We’ve all seen it hallucinate things.  Sometimes it introduces “features” I did not ask for, unintentionally breaks things, or misunderstands what I asked for.  Admittedly these concerns are becoming less of a problem as models improve to the point that I don’t see it making any more mistakes than a human engineer would make.

## Why I Use It Anyway

But let’s face facts, AI can do the coding part of my job as well as I can (often better), in a tiny fraction of the time.  It’s *way* better than me at writing tests, and I’ve even been having it use a browser extension to do some of my manual validation.  If I were to do these things by hand it would take me orders of magnitude longer and I can’t necessarily guarantee that the results would be any better. If my employer is okay with the costs associated with my token usage, choosing not to use it because I don’t like it feels selfish.   But maybe all the time I save by not writing code at work will give me more time for my hobby projects where I get to write the code I *want* to write?  Just don’t tell my boss…

### AI Disclosure
- AI was my editor on this post. All words are mine, it just helped me with structure and some grammatical errors
- AI created that pretty animated diagram (I did make a few minor tweaks _by hand!_)