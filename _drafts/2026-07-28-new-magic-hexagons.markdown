---
layout: post
title: "There Are, Indeed, Magic Hexagons Of All Orders"
date: 2026-07-28 00:00:00 +0200
categories: math
comments: "yes"
d3: "no"
mathjax: "yes"
---

What is so special about the number 19?

This question came up in the conversation of YSDA alumni last month on the occasion of the school turning 19 years old.
Someone pointed out that 19 is a twin prime. Someone else replied that 19 is the number of cells in the only non-trivial magic hexagon.

Wait, what is a "magic hexagon"? Let's find out, shall we?

> Recently, we hear a lot about AI miraculously proving and disproving long-standing conjectures, without much explanation of how it was done.
>
> This story gives insight into the process of making such a mathematical discovery.

## Magic Squares and Magic Hexagons

You probably know about the magic squares.
A magic square is a square grid of numbers where every row, column, and main diagonal adds up to the exact same total, known as the magic constant. It's also typical to assume the numbers should be consecutive (i.e. from 1 to n^2) - otherwise we'd put the same number into all cells, which is a very boring way to fill it.

<object
  type="image/svg+xml"
  data="/assets/svg/magic-hexagons/magic-square-order5-interactive.svg"
  style="display:block; width:50%; max-width:620px; height:auto; margin:auto;"
  aria-label="Interactive order-5 magic square">
</object>

Magic squares were known for millennia and are very well-studied. By now, we have algorithms to construct normal magic squares of every order n > 2.

A **magic hexagon** applies the same idea to a hexagonal grid. Its cells form straight lines in three directions, and every such line must have the same sum. Like with the squares, the hexagon is called normal if it contains consecutive numbers between 1 and 3n2 − 3n + 1 (this expression is the number of cells in the hexagonal grid).

<object
  type="image/svg+xml"
  data="/assets/svg/magic-hexagons/Order3-interactive.svg"
  style="display:block; width:50%; max-width:620px; height:auto; margin:auto;"
  aria-label="Interactive order-3 magic hexagon">
</object>

On the example above you can see only normal magic hexagon in existence - well, apart from its rotations and reflections. The proof is straightforward - for any order n>3, the numbers (1..3n2 − 3n + 1) can't be partitioned into 2n-1 rows with equal sums because 2n-1 simply doesn't divide the sum of these numbers.

Well, ending the story here is no fun. To make things more interesting, let's look at the so called **abnormal magic hexagons**. Here we relax one of the constraints - we still require that the numbers on the grid are consecutive, but now they don't have to start at 1.

This relaxation suddenly allows new solutions to appear!

But finding these solutions is not an easy feat. Unlike with magic squares, there is no formulaic approach or deterministic algorithm, and the only known way to find them is wandering through a brutally large search space. The largest known solution as of July 2026 was a hexagon of order n=9 found by Klaus Meffert in 2024.

So... What makes these solutions truly so hard to find? How about we try?

## Chapter 1: Making Observations, First Without AI

There is a clear tension between the two independent constraints:

1. The numbers are consecutive
2. The line sums are equal (and lines have different lengths!)

The prior art solutions that I found showed that people tried out different search algorithms and likely optimized them well.
This made me think that if I'm looking to advance the field, I should instead focus on optimizing the search space.

### Observation 1: Antisymmetric hexagons have much simpler constraints

First, let's restrict all numbers on the grid are be in the symmetric interval (-K...K) for some K.
Notice that this is equivalent to lines sums being 0.

Second, put the 0 in the middle of the grid, and require that the cells opposite each other under a 180-degree rotation contain opposite values. So if one cell contains (x), its antipodal cell contains (-x).

<object
  type="image/svg+xml"
  data="/assets/svg/magic-hexagons/antisymmetry-hexagon-interactive.svg"
  style="display:block; width:50%; max-width:620px; height:auto; margin:auto;"
  aria-label="Interactive antisymmetric order-3 magic hexagon">
</object>

Notice how this makes many constraints disappear. The lines crossing the center sum to 0 automatically because all numbers cancel out. The other lines are the opposites of their mirrored lines, so if one sums to 0, the other sums to 0 automatically too.

It's important to notice that while simplifying the constraints, we also introduce the risk that no solutions satisfy them.
It was simply a plausible place to search.

But once I started thinking about the zero-sum hexagons, another structure appeared.

### Observation 2: Every zero-sum hexagon is a repetition of the same 6-point ring

Consider any hexagon, zero-sum or not. Take the six cells surrounding any interior point and add the alternating pattern $$[-1,+1,-1,+1,-1,+1]$$. Leave the central cell unchanged.

Notice that every straight line that intersects this ring pattern receives either no contribution or two opposite contributions: 1 and -1. Its total therefore remains unchanged. Thus you can add any multiple of this pattern without affecting any line sum.

These local alternating rings form a basis - you can build any zero-sum hexagon as a linear combination of these rings. I will omit the proof for brevity, but it is fairly straightforward - go by induction and "peel" these rings from the hexagon, starting from outer layer.

[**Visualization 3 — The alternating-ring move**

An order-(n) zero-sum hexagon therefore has two equivalent representations:

* its visible cell values;
* an order-((n-1)) potential field describing how much of each local ring it contains.

This second representation solves all line-sum constraints by construction.
But it does not guarantee that the visible values will be distinct or consecutive. Those remain difficult global conditions.

Instead of searching among arbitrary arrangements and repeatedly repairing broken lines, we can search entirely inside the space where every line already sums to zero.

## Chapter 2: Finding New Hexagons, With Some AI

Around the same time, I had been helping to presolve problems for the [Midnight Code Cup 2026](https://midnightcodecup.org/), a programming competition in which using LLMs is explicitly encouraged. Many of the tasks in this competition are optimization problems. My main takeaway from that LLMs can be unusually effective at helping develop **domain-specific** solvers, blowing the general-purpose solvers (z3, OR-Tools) out of the water.

So instead of employing a generic constraint solver, I went to GPT-5.6 Sol, and gave it more freedom with the problem. I did pint out the antisymmetry restriction, and the potential-field representation. The model searched for the related concepts on the Internet and followed up by additionally connecting the structure to **Heffter arrays**: combinatorial arrangements of signed integers with prescribed zero-sum conditions. The problems are not identical, but the connection suggested better ways to organize values and exchange them while controlling the affected sums.

The resulting program abandoned the generic constraint-solver approach in favor of custom simulated annealing.
I've done some due diligence with several optimization rounds: asked to use numba for the hot loops, identified memory allocation/randomization bottlenecks with `perf`, and soon we squeezed another 50% of performance from the program.

Then I left it run on my home server for a few days across ~24 CPU cores.

As I hoped, this combination of the optimized search algorithm and the reduced search space worked very well, and soon I discovered the magic hexagons of orders up to n=21. Here they are:

<section class="hexagon-viewer" data-hexagon-viewer>
  <div class="hexagon-viewer__stage">
    <figure class="hexagon-viewer__panel hexagon-viewer__panel--solution">
      <figcaption class="hexagon-viewer__title">
        Magic hexagon
      </figcaption>

      <a
        class="hexagon-viewer__image-link"
        data-solution-link
        href="/assets/svg/magic-hexagons/MagicHexagon-Order21-sum_zero.svg"
        target="_blank"
        rel="noopener"
      >
        <div
          class="hexagon-viewer__image-stack"
          data-solution-stack
        >
          <canvas
            class="hexagon-viewer__canvas"
            data-solution-canvas
            aria-hidden="true"
          ></canvas>

          <img
            class="hexagon-viewer__vector"
            data-solution-vector
            src="/assets/svg/magic-hexagons/MagicHexagon-Order21-sum_zero.svg"
            alt="Abnormal zero-sum magic hexagon of order 21"
            decoding="async"
          />
        </div>
      </a>
    </figure>

    <figure class="hexagon-viewer__panel hexagon-viewer__panel--potential">
      <figcaption class="hexagon-viewer__title">
        Potential field
      </figcaption>

      <a
        class="hexagon-viewer__image-link"
        data-potential-link
        href="/assets/svg/magic-hexagons/potential_MagicHexagon-Order21-sum_zero.svg"
        target="_blank"
        rel="noopener"
      >
        <div
          class="hexagon-viewer__image-stack"
          data-potential-stack
        >
          <canvas
            class="hexagon-viewer__canvas"
            data-potential-canvas
            aria-hidden="true"
          ></canvas>

          <img
            class="hexagon-viewer__vector"
            data-potential-vector
            src="/assets/svg/magic-hexagons/potential_MagicHexagon-Order21-sum_zero.svg"
            alt="Potential field of the order 21 magic hexagon"
            decoding="async"
          />
        </div>
      </a>
    </figure>
  </div>

  <div class="hexagon-viewer__controls">
    <label class="hexagon-viewer__order" for="hexagon-order">
      Order
      <output data-order-output for="hexagon-order">21</output>
    </label>

    <div class="hexagon-viewer__slider-shell">
      <div
        class="hexagon-viewer__slider-rail"
        aria-hidden="true"
      ></div>

      <div
        class="hexagon-viewer__ticks"
        data-slider-ticks
        aria-hidden="true"
      ></div>

      <input
        id="hexagon-order"
        class="hexagon-viewer__slider"
        data-order-slider
        type="range"
        min="3"
        max="21"
        value="21"
        step="1"
        disabled
        aria-label="Magic hexagon order"
      />
    </div>

    <span
      class="hexagon-viewer__loading"
      data-loading-status
      aria-live="polite"
    >
      Loading…
    </span>
  </div>

  <noscript>
    <div class="hexagon-viewer__noscript">
      <figure>
        <figcaption>Magic hexagon</figcaption>

        <img
          src="/assets/svg/magic-hexagons/MagicHexagon-Order21-sum_zero.svg"
          alt="Abnormal zero-sum magic hexagon of order 21"
        />
      </figure>

      <figure>
        <figcaption>Potential field</figcaption>

        <img
          src="/assets/svg/magic-hexagons/potential_MagicHexagon-Order21-sum_zero.svg"
          alt="Potential field of the order 21 magic hexagon"
        />
      </figure>
    </div>
  </noscript>
</section>

I found it very intriguing how the solution fields look chaotic and noisy, while. The potentials resemble terrain maps with broad slopes, ridges, and smooth transitions.

## Chapter 3: Expanding to all orders, with AI

Repeatedly finding solutions for larger and larger orders naturally raised a conjecture that:

> Abnormal asymmetric consecutive magic hexagons exist for all orders n>3

This is a very strong conjecture, given that ony a handful of abnormal hexagons were known before this project, and the additional antisymmetry restriction I imposed.

But inspired by the recent success of AI in mathematics, I was very curious to see how it would approach the problem. Could AI prove if from the get go?

I decided to try two AI solutions:

- GPT-5.6 Sol, which is the strongest model I have available through the personal subscription;
- Aristotle, a Lean-oriented theorem-proving agent.

First, I fed GPT-5.6 Sol (high) the problem statement, the known solutions, and some additional intuitions I had. GPT-5.6 Sol proposed more hypotheses and potential constructions, and started chopping away, reducing the problem.
The work took traction, and I felt very much in the driver seat, learning new mathematical constructs and guiding the process I could understand.

Then a few days passed on iterations. The problem was reduced to a few key lemmas, and at this point I also involved Aristotle to pick up the proof and try to advance it in parallel. And after a while, the process stalled. Both agents were optimistic, but clearly stuck, rehashing the same ideas and making no meaningful progress.

I tried weakening the conjecture to a more modest claim that "there are infinitely many abnormal magic hexagons", pursuing new hypotheses and non-constructive proofs. But to no avail, we hit the wall.

I employed GPT-5.6 Sol (max), which after many hours of reasoning... also couldn't find a proof. But it did produce new ideas before running out of credits. Fortunately, these ideas became part of project's "memory", available in all other conversations.

In a different conversation, I was pushing GPT-5.6 Sol (high) for the proof. At some point it picked up the ideas from GPT-5.6 Sol (max), and declared a breakthrough - there was a **constructive proof** of the conjecture, allowing to build magic hexagons of orders n > 800, where 16 | n.

Once this result was established, the process REALLY took traction. Iteratively, I pushed GPT-5.6 Sol (high) to generalize the construction for the values of n divisible by 8, 4, 2, and eventually get rid of the divisibility constraint. The theoretical lower bound was also reduced from 800 to 114, but practically this method produced solutions for all orders n > 3.

Then I pushed more - now for simplicity and determinism of the algorithm. Sure enough, GPT-5.6 Sol (high) did find redundancies in the construction, and produced a simpler deterministic algorithm.

After days of reasoning, the conjecture was solved, and the constructive proof was found. The proof is not formalized in Lean at the time of writing, but it is a constructive proof that allows to build abnormal magic hexagons of all orders n > 3, and you can generate hexagons of any desirable order yourself. 

## Chapter 4: Reflections

I started working with AI as a co-pilot, and I was very much in the driver seat.
At the end of the process, I was just a passenger, letting the AI do the creative work, and nudging it in the direction that felt right.
Now I'm glad that some of the ideas born in my human brain were instrumental, and antisymmetry did play a major role in the discovered construction.

The specific model I worked with, GPT-5.6 Sol, is a very capable mathematical reasoner. I found it has a double-edged quality of tunnel visioning on the approach it is considering and can go very deep in any given direction. If the direction is right, it is incredibly powerful. Otherwise, you better have an arbiter in the loop - another model, or, in my case, a human - to remind it of the bigger picture and detect when it's getting stuck.

In software engineering, code review became a bottleneck once code generation became cheap with LLMs.
Suddenly, static analysis and testing became more important than ever, taking part of the increased burden of correctness verification from humans.
Mathematicians face the same problem now - anyone can produce new mathematical theory with AI, faster than humans can verify it.
Lean, enabling machine-verifiable proofs, must be an enormous boon to the community.



<style>
  .hexagon-viewer {
    /*
     * Main configurable dimensions.
     */
    --viewer-width: 75vw;
    --viewer-max-width: 1500px;
    --slider-width: 24rem;

    /*
     * This must match the thumb dimensions below so that every tick
     * aligns with an exact thumb-center position.
     */
    --slider-thumb-size: 18px;
    --slider-track-height: 4px;
    --slider-tick-height: 11px;

    --viewer-gap: clamp(0.5rem, 1vw, 1rem);
    --viewer-padding: clamp(0.65rem, 1.3vw, 1.25rem);

    --viewer-background-fallback: rgb(127 127 127 / 6%);
    --viewer-background:
      color-mix(in srgb, currentColor 5%, transparent);

    --viewer-border:
      color-mix(in srgb, currentColor 10%, transparent);

    --viewer-muted:
      color-mix(in srgb, currentColor 62%, transparent);

    --slider-track:
      color-mix(in srgb, currentColor 25%, transparent);

    --slider-tick:
      color-mix(in srgb, currentColor 48%, transparent);

    --slider-tick-passed:
      color-mix(in srgb, currentColor 76%, transparent);

    --slider-thumb: currentColor;

    container-type: inline-size;

    position: relative;
    left: 50%;

    width: min(
      var(--viewer-width),
      var(--viewer-max-width),
      calc(100vw - 1rem)
    );

    max-width: none;
    box-sizing: border-box;

    margin: 1.5rem 0;
    padding: var(--viewer-padding);

    transform: translateX(-50%);

    border: 1px solid var(--viewer-border);
    border-radius: 0.9rem;

    background: var(--viewer-background-fallback);
    background: var(--viewer-background);
  }

  .hexagon-viewer *,
  .hexagon-viewer *::before,
  .hexagon-viewer *::after {
    box-sizing: border-box;
  }

  .hexagon-viewer__stage {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--viewer-gap);
    align-items: start;
  }

  .hexagon-viewer__panel {
    min-width: 0;
    margin: 0;
  }

  .hexagon-viewer__title {
    margin: 0 0 0.25rem;
    padding: 0 0.25rem;

    background: none;

    font-size: 0.95rem;
    font-weight: 600;
    line-height: 1.35;
  }

  .hexagon-viewer__panel--solution
    .hexagon-viewer__title {
    text-align: right;
  }

  .hexagon-viewer__panel--potential
    .hexagon-viewer__title {
    text-align: left;
  }

  .hexagon-viewer__image-link {
    display: block;
    color: inherit;
    text-decoration: none;
  }

  .hexagon-viewer__image-link:focus-visible {
    border-radius: 0.35rem;
    outline: 3px solid currentColor;
    outline-offset: 3px;
  }

  .hexagon-viewer__image-stack {
    position: relative;

    width: 100%;
    height: min(
      47cqw,
      calc(100svh - 10rem),
      720px
    );

    contain: layout paint style;
  }

  .hexagon-viewer__canvas,
  .hexagon-viewer__vector {
    position: absolute;
    inset: 0;

    display: block;
    width: 100%;
    height: 100%;
  }

  .hexagon-viewer__canvas {
    z-index: 1;

    /*
     * Pixel dimensions are assigned by JavaScript. CSS dimensions
     * remain responsive.
     */
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
  }

  .hexagon-viewer__vector {
    z-index: 2;
    object-fit: contain;
    opacity: 1;
    visibility: visible;
  }

  /*
   * While dragging, show the pre-rendered high-DPI canvas. There are
   * deliberately no opacity transitions because they slow rapid input.
   */
  .hexagon-viewer.is-raster-mode
    .hexagon-viewer__canvas {
    opacity: 1;
    visibility: visible;
  }

  .hexagon-viewer.is-raster-mode
    .hexagon-viewer__vector {
    opacity: 0;
    visibility: hidden;
  }

  .hexagon-viewer__controls {
    display: grid;
    grid-template-columns:
      5rem
      minmax(10rem, var(--slider-width))
      7rem;

    gap: 0.65rem;
    align-items: center;
    justify-content: center;

    margin-top: 0.4rem;
    padding: 0 0.25rem;
  }

  .hexagon-viewer__order {
    display: flex;
    gap: 0.35rem;
    align-items: baseline;
    justify-content: flex-end;

    width: 5rem;

    white-space: nowrap;
    font-size: 0.9rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  /*
   * Prevent layout movement when 9 becomes 10.
   */
  .hexagon-viewer__order output {
    display: inline-block;

    width: 2ch;
    min-width: 2ch;

    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  .hexagon-viewer__slider-shell {
    position: relative;

    width: 100%;
    height: 28px;
    min-width: 0;
  }

  /*
   * The thumb center travels between these exact inset endpoints.
   */
  .hexagon-viewer__slider-rail,
  .hexagon-viewer__ticks {
    position: absolute;

    left: calc(var(--slider-thumb-size) / 2);
    right: calc(var(--slider-thumb-size) / 2);

    pointer-events: none;
  }

  .hexagon-viewer__slider-rail {
    top: 50%;
    z-index: 0;

    height: var(--slider-track-height);

    transform: translateY(-50%);

    border-radius: 999px;
    background: var(--slider-track);
  }

  .hexagon-viewer__ticks {
    top: 0;
    bottom: 0;
    z-index: 1;
  }

  .hexagon-viewer__tick {
    position: absolute;
    top: 50%;
    left: var(--tick-position);

    width: 1px;
    height: var(--slider-tick-height);

    transform: translate(-50%, -50%);

    border-radius: 1px;
    background: var(--slider-tick);
  }

  .hexagon-viewer__tick.is-passed {
    background: var(--slider-tick-passed);
  }

  .hexagon-viewer__tick:first-child,
  .hexagon-viewer__tick:last-child {
    width: 2px;
    height: calc(var(--slider-tick-height) + 2px);
  }

  .hexagon-viewer__slider {
    position: absolute;
    inset: 0;
    z-index: 2;

    width: 100%;
    height: 28px;
    min-width: 0;

    margin: 0;
    padding: 0;

    cursor: pointer;

    appearance: none;
    -webkit-appearance: none;

    border: 0;
    outline-offset: 3px;
    background: transparent;
  }

  .hexagon-viewer__slider::-webkit-slider-runnable-track {
    width: 100%;
    height: var(--slider-track-height);

    border: 0;
    background: transparent;
  }

  .hexagon-viewer__slider::-webkit-slider-thumb {
    width: var(--slider-thumb-size);
    height: var(--slider-thumb-size);

    margin-top: calc(
      (
        var(--slider-track-height) -
        var(--slider-thumb-size)
      ) / 2
    );

    appearance: none;
    -webkit-appearance: none;

    border: 2px solid Canvas;
    border-radius: 50%;

    background: var(--slider-thumb);
    box-shadow: 0 0 0 1px rgb(0 0 0 / 18%);
  }

  .hexagon-viewer__slider::-moz-range-track {
    width: 100%;
    height: var(--slider-track-height);

    border: 0;
    background: transparent;
  }

  .hexagon-viewer__slider::-moz-range-progress {
    height: var(--slider-track-height);

    border: 0;
    background: transparent;
  }

  .hexagon-viewer__slider::-moz-range-thumb {
    width: var(--slider-thumb-size);
    height: var(--slider-thumb-size);

    border: 2px solid Canvas;
    border-radius: 50%;

    background: var(--slider-thumb);
    box-shadow: 0 0 0 1px rgb(0 0 0 / 18%);
  }

  .hexagon-viewer__slider:disabled {
    cursor: progress;
    opacity: 0.55;
  }

  .hexagon-viewer__loading {
    display: block;

    width: 7rem;

    color: var(--viewer-muted);

    font-size: 0.75rem;
    text-align: left;
    white-space: nowrap;
  }

  .hexagon-viewer__loading.is-finished {
    visibility: hidden;
  }

  .hexagon-viewer__noscript {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--viewer-gap);
  }

  .hexagon-viewer__noscript figure {
    margin: 0;
  }

  .hexagon-viewer__noscript figure:first-child figcaption {
    text-align: right;
  }

  .hexagon-viewer__noscript img {
    display: block;
    width: 100%;
    height: auto;
  }

  @media (max-width: 680px) {
    .hexagon-viewer {
      --viewer-width: calc(100vw - 0.75rem);
      --slider-width: 100%;

      margin: 1rem 0;
      padding: 0.65rem;

      border-radius: 0.7rem;
    }

    .hexagon-viewer__stage,
    .hexagon-viewer__noscript {
      grid-template-columns: 1fr;
    }

    .hexagon-viewer__title,
    .hexagon-viewer__panel--solution
      .hexagon-viewer__title,
    .hexagon-viewer__panel--potential
      .hexagon-viewer__title {
      text-align: center;
    }

    .hexagon-viewer__image-stack {
      height: min(92cqw, 70svh);
    }

    .hexagon-viewer__panel + .hexagon-viewer__panel {
      margin-top: 0.35rem;
    }

    .hexagon-viewer__controls {
      grid-template-columns:
        4.5rem
        minmax(0, 1fr);

      gap: 0.5rem;
      justify-content: stretch;

      margin-top: 0.5rem;
    }

    .hexagon-viewer__order {
      width: 4.5rem;
    }

    .hexagon-viewer__loading {
      grid-column: 1 / -1;

      width: auto;
      min-height: 1em;

      text-align: center;
    }
  }

  @media (max-height: 520px) and (orientation: landscape) {
    .hexagon-viewer__stage {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .hexagon-viewer__panel--solution
      .hexagon-viewer__title {
      text-align: right;
    }

    .hexagon-viewer__panel--potential
      .hexagon-viewer__title {
      text-align: left;
    }

    .hexagon-viewer__panel + .hexagon-viewer__panel {
      margin-top: 0;
    }

    .hexagon-viewer__image-stack {
      height: calc(100svh - 6rem);
    }
  }
</style>

<script>
  (() => {
    const viewer = document.querySelector(
      "[data-hexagon-viewer]"
    );

    if (!viewer) {
      return;
    }

    const minimumOrder = 3;
    const maximumOrder = 21;
    const defaultOrder = 21;

    /*
     * Performance and quality controls.
     *
     * MAX_RASTER_DPR:
     *   Maximum pixel density used while dragging. A value of 2 is
     *   generally indistinguishable from SVG at ordinary viewing sizes.
     *
     * RASTER_MEMORY_MB:
     *   Approximate memory budget for all 38 cached raster surfaces.
     *   The actual DPR is reduced automatically if necessary.
     */
    const MAX_RASTER_DPR = 2;
    const RASTER_MEMORY_MB = 192;

    /*
     * How long after the last input event to restore full vector SVGs.
     * The native "change" event also restores them immediately on release.
     */
    const VECTOR_SETTLE_DELAY_MS = 90;

    /*
     * Rebuild cached rasters only when the viewer changes size enough
     * that the old cache may look soft.
     */
    const RESIZE_REBUILD_THRESHOLD = 0.12;
    const RESIZE_DEBOUNCE_MS = 250;

    const orders = Array.from(
      {
        length:
          maximumOrder - minimumOrder + 1
      },
      (_, index) => minimumOrder + index
    );

    const numberOfRasterSurfaces =
      orders.length * 2;

    const stepCount =
      maximumOrder - minimumOrder;

    const solutionStack = viewer.querySelector(
      "[data-solution-stack]"
    );

    const potentialStack = viewer.querySelector(
      "[data-potential-stack]"
    );

    const solutionCanvas = viewer.querySelector(
      "[data-solution-canvas]"
    );

    const potentialCanvas = viewer.querySelector(
      "[data-potential-canvas]"
    );

    const solutionVector = viewer.querySelector(
      "[data-solution-vector]"
    );

    const potentialVector = viewer.querySelector(
      "[data-potential-vector]"
    );

    const solutionLink = viewer.querySelector(
      "[data-solution-link]"
    );

    const potentialLink = viewer.querySelector(
      "[data-potential-link]"
    );

    const slider = viewer.querySelector(
      "[data-order-slider]"
    );

    const sliderTicks = viewer.querySelector(
      "[data-slider-ticks]"
    );

    const output = viewer.querySelector(
      "[data-order-output]"
    );

    const loadingStatus = viewer.querySelector(
      "[data-loading-status]"
    );

    const tickElements = [];
    const sourceImages = new Map();

    let rasterCache = new Map();

    let currentOrder = defaultOrder;
    let pendingRasterOrder = defaultOrder;

    let rasterFrame = 0;
    let settleTimer = 0;
    let resizeTimer = 0;

    let interactionToken = 0;
    let cacheGeneration = 0;
    let cacheReady = false;

    let cachedSolutionWidth = 0;
    let cachedSolutionHeight = 0;
    let cachedPotentialWidth = 0;
    let cachedPotentialHeight = 0;

    function solutionPath(order) {
      return (
        "/assets/svg/magic-hexagons/" +
        `MagicHexagon-Order${order}-sum_zero.svg`
      );
    }

    function potentialPath(order) {
      return (
        "/assets/svg/magic-hexagons/" +
        `potential_MagicHexagon-Order${order}-sum_zero.svg`
      );
    }

    function imageKey(type, order) {
      return `${type}:${order}`;
    }

    function normalizeOrder(value) {
      const parsed = Number.parseInt(value, 10);

      if (!Number.isFinite(parsed)) {
        return defaultOrder;
      }

      return Math.min(
        maximumOrder,
        Math.max(minimumOrder, parsed)
      );
    }

    function getInitialOrder() {
      const url = new URL(window.location.href);

      return normalizeOrder(
        url.searchParams.get("order") ??
          defaultOrder
      );
    }

    function nextFrame() {
      return new Promise((resolve) => {
        requestAnimationFrame(resolve);
      });
    }

    function buildTicks() {
      for (const order of orders) {
        const tick = document.createElement("span");

        const position =
          ((order - minimumOrder) / stepCount) *
          100;

        tick.className = "hexagon-viewer__tick";
        tick.dataset.order = String(order);

        tick.style.setProperty(
          "--tick-position",
          `${position}%`
        );

        sliderTicks.appendChild(tick);
        tickElements.push(tick);
      }
    }

    function updateTicks(selectedOrder) {
      for (const tick of tickElements) {
        const tickOrder = Number.parseInt(
          tick.dataset.order,
          10
        );

        tick.classList.toggle(
          "is-passed",
          tickOrder <= selectedOrder
        );
      }
    }

    function updateOrderDisplay(order) {
      slider.value = String(order);
      output.value = String(order);
      output.textContent = String(order);

      updateTicks(order);
    }

    function setLoadingStatus(message) {
      loadingStatus.classList.remove(
        "is-finished"
      );

      loadingStatus.textContent = message;
    }

    function finishLoadingStatus(message) {
      loadingStatus.textContent = message;

      window.setTimeout(() => {
        loadingStatus.classList.add(
          "is-finished"
        );
      }, 900);
    }

    function createSourceImage(
      type,
      order,
      priority
    ) {
      const url =
        type === "solution"
          ? solutionPath(order)
          : potentialPath(order);

      const image = new Image();

      image.decoding = "async";
      image.loading = "eager";

      if ("fetchPriority" in image) {
        image.fetchPriority = priority;
      }

      const promise = new Promise(
        (resolve, reject) => {
          image.addEventListener(
            "load",
            async () => {
              /*
               * decode() prepares as much of the source as the browser
               * supports before raster-cache construction.
               */
              try {
                await image.decode();
              } catch {
                /*
                 * Some browsers reject decode() for an SVG that is
                 * already ready to draw.
                 */
              }

              resolve(image);
            },
            { once: true }
          );

          image.addEventListener(
            "error",
            () => {
              reject(
                new Error(`Could not load ${url}`)
              );
            },
            { once: true }
          );
        }
      );

      image.src = url;

      sourceImages.set(
        imageKey(type, order),
        {
          image,
          promise,
          url
        }
      );
    }

    async function preloadAllSources(
      startingOrder
    ) {
      let completed = 0;
      let failed = 0;

      setLoadingStatus(
        `Loading 0/${numberOfRasterSurfaces}`
      );

      for (const order of orders) {
        createSourceImage(
          "solution",
          order,
          order === startingOrder
            ? "high"
            : "auto"
        );

        createSourceImage(
          "potential",
          order,
          order === startingOrder
            ? "high"
            : "auto"
        );
      }

      await Promise.allSettled(
        [...sourceImages.values()].map(
          async (record) => {
            try {
              await record.promise;
            } catch {
              failed += 1;
            } finally {
              completed += 1;

              setLoadingStatus(
                `Loading ${completed}/${numberOfRasterSurfaces}`
              );
            }
          }
        )
      );

      return failed;
    }

    function getImageDimensions(image) {
      const width =
        image.naturalWidth ||
        image.width ||
        1000;

      const height =
        image.naturalHeight ||
        image.height ||
        1000;

      return { width, height };
    }

    function calculateRasterDpr(
      solutionRect,
      potentialRect
    ) {
      const cssPixelsPerOrder =
        solutionRect.width *
          solutionRect.height +
        potentialRect.width *
          potentialRect.height;

      const totalCssPixels =
        cssPixelsPerOrder * orders.length;

      const availableRasterPixels =
        (
          RASTER_MEMORY_MB *
          1024 *
          1024
        ) / 4;

      const budgetDpr =
        Math.sqrt(
          availableRasterPixels /
          Math.max(totalCssPixels, 1)
        );

      return Math.max(
        1,
        Math.min(
          window.devicePixelRatio || 1,
          MAX_RASTER_DPR,
          budgetDpr
        )
      );
    }

    function createRasterSurface(
      cssWidth,
      cssHeight,
      dpr
    ) {
      const surface =
        document.createElement("canvas");

      surface.width = Math.max(
        1,
        Math.round(cssWidth * dpr)
      );

      surface.height = Math.max(
        1,
        Math.round(cssHeight * dpr)
      );

      return surface;
    }

    function drawContained(
      context,
      image,
      targetWidth,
      targetHeight
    ) {
      const {
        width: sourceWidth,
        height: sourceHeight
      } = getImageDimensions(image);

      const scale = Math.min(
        targetWidth / sourceWidth,
        targetHeight / sourceHeight
      );

      const drawWidth =
        sourceWidth * scale;

      const drawHeight =
        sourceHeight * scale;

      const drawX =
        (targetWidth - drawWidth) / 2;

      const drawY =
        (targetHeight - drawHeight) / 2;

      context.clearRect(
        0,
        0,
        targetWidth,
        targetHeight
      );

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";

      context.drawImage(
        image,
        drawX,
        drawY,
        drawWidth,
        drawHeight
      );
    }

    function clearRasterCache() {
      rasterCache.clear();
      rasterCache = new Map();
    }

    async function buildRasterCache() {
      const generation =
        ++cacheGeneration;

      cacheReady = false;
      slider.disabled = true;

      viewer.classList.remove(
        "is-raster-mode"
      );

      await nextFrame();

      const solutionRect =
        solutionStack.getBoundingClientRect();

      const potentialRect =
        potentialStack.getBoundingClientRect();

      const dpr = calculateRasterDpr(
        solutionRect,
        potentialRect
      );

      const newCache = new Map();
      let completed = 0;

      setLoadingStatus(
        `Preparing 0/${numberOfRasterSurfaces}`
      );

      for (const order of orders) {
        for (const type of [
          "solution",
          "potential"
        ]) {
          if (generation !== cacheGeneration) {
            return;
          }

          const record = sourceImages.get(
            imageKey(type, order)
          );

          if (!record) {
            completed += 1;
            continue;
          }

          let image;

          try {
            image = await record.promise;
          } catch {
            completed += 1;
            continue;
          }

          const rect =
            type === "solution"
              ? solutionRect
              : potentialRect;

          const surface =
            createRasterSurface(
              rect.width,
              rect.height,
              dpr
            );

          const context =
            surface.getContext(
              "2d",
              {
                alpha: true,
                desynchronized: true
              }
            );

          if (context) {
            drawContained(
              context,
              image,
              surface.width,
              surface.height
            );

            newCache.set(
              imageKey(type, order),
              surface
            );
          }

          completed += 1;

          setLoadingStatus(
            `Preparing ${completed}/${numberOfRasterSurfaces}`
          );

          /*
           * Yield periodically so initial page rendering and scrolling
           * remain responsive while the cache is built.
           */
          if (completed % 3 === 0) {
            await nextFrame();
          }
        }
      }

      if (generation !== cacheGeneration) {
        return;
      }

      clearRasterCache();
      rasterCache = newCache;

      cachedSolutionWidth =
        solutionRect.width;

      cachedSolutionHeight =
        solutionRect.height;

      cachedPotentialWidth =
        potentialRect.width;

      cachedPotentialHeight =
        potentialRect.height;

      cacheReady = true;
      slider.disabled = false;

      renderRasterImmediately(currentOrder);

      finishLoadingStatus(
        `Ready · ${dpr.toFixed(1)}×`
      );
    }

    function drawCachedSurface(
      type,
      order,
      visibleCanvas
    ) {
      const surface = rasterCache.get(
        imageKey(type, order)
      );

      if (!surface) {
        return false;
      }

      if (
        visibleCanvas.width !==
          surface.width ||
        visibleCanvas.height !==
          surface.height
      ) {
        visibleCanvas.width =
          surface.width;

        visibleCanvas.height =
          surface.height;
      }

      const context =
        visibleCanvas.getContext(
          "2d",
          {
            alpha: true,
            desynchronized: true
          }
        );

      if (!context) {
        return false;
      }

      context.clearRect(
        0,
        0,
        visibleCanvas.width,
        visibleCanvas.height
      );

      /*
       * This copies an already-rendered bitmap. It does not ask the
       * browser to parse or repaint the SVG.
       */
      context.drawImage(surface, 0, 0);

      return true;
    }

    function renderRasterImmediately(order) {
      if (!cacheReady) {
        return;
      }

      const solutionDrawn =
        drawCachedSurface(
          "solution",
          order,
          solutionCanvas
        );

      const potentialDrawn =
        drawCachedSurface(
          "potential",
          order,
          potentialCanvas
        );

      if (
        solutionDrawn &&
        potentialDrawn
      ) {
        viewer.classList.add(
          "is-raster-mode"
        );
      }
    }

    function queueRasterRender(order) {
      pendingRasterOrder = order;

      if (rasterFrame) {
        return;
      }

      /*
       * At most one paint is performed per display frame. When many
       * input events arrive between frames, only the newest order is
       * rendered.
       */
      rasterFrame =
        requestAnimationFrame(() => {
          rasterFrame = 0;

          renderRasterImmediately(
            pendingRasterOrder
          );
        });
    }

    async function prepareVectorImage(
      image,
      url,
      alt
    ) {
      image.alt = alt;

      if (
        image.getAttribute("src") !== url
      ) {
        image.src = url;
      }

      try {
        await image.decode();
      } catch {
        /*
         * The canvas remains visible if a vector image cannot decode.
         */
      }
    }

    function updateLinks(order) {
      solutionLink.href =
        solutionPath(order);

      potentialLink.href =
        potentialPath(order);

      solutionLink.setAttribute(
        "aria-label",
        `Open the order ${order} ` +
          "magic hexagon as a full-size SVG"
      );

      potentialLink.setAttribute(
        "aria-label",
        `Open the order ${order} ` +
          "potential field as a full-size SVG"
      );
    }

    function updateUrl(order) {
      const url =
        new URL(window.location.href);

      url.searchParams.set(
        "order",
        String(order)
      );

      /*
       * Updating only after dragging settles avoids unnecessary history
       * work inside the hot input path.
       */
      window.history.replaceState(
        {},
        "",
        url
      );
    }

    async function restoreVector(
      order,
      token
    ) {
      updateLinks(order);

      await Promise.allSettled([
        prepareVectorImage(
          solutionVector,
          solutionPath(order),
          "Abnormal zero-sum magic " +
            `hexagon of order ${order}`
        ),

        prepareVectorImage(
          potentialVector,
          potentialPath(order),
          "Potential field of the " +
            "abnormal zero-sum magic " +
            `hexagon of order ${order}`
        )
      ]);

      /*
       * Ignore stale vector swaps when the user has already moved on.
       */
      if (
        token !== interactionToken ||
        order !== currentOrder
      ) {
        return;
      }

      updateUrl(order);

      /*
       * Keep the canvas visible until the browser has had a chance to
       * paint the newly decoded vector.
       */
      await nextFrame();
      await nextFrame();

      if (
        token === interactionToken &&
        order === currentOrder
      ) {
        viewer.classList.remove(
          "is-raster-mode"
        );
      }
    }

    function scheduleVectorRestore(order) {
      window.clearTimeout(settleTimer);

      const token = interactionToken;

      settleTimer = window.setTimeout(
        () => {
          restoreVector(order, token);
        },
        VECTOR_SETTLE_DELAY_MS
      );
    }

    function selectOrder(order) {
      currentOrder =
        normalizeOrder(order);

      interactionToken += 1;

      updateOrderDisplay(currentOrder);

      /*
       * Canvas mode enters immediately; drawing is coalesced to the
       * next animation frame.
       */
      viewer.classList.add(
        "is-raster-mode"
      );

      queueRasterRender(currentOrder);
      scheduleVectorRestore(currentOrder);
    }

    function commitCurrentOrder() {
      window.clearTimeout(settleTimer);

      interactionToken += 1;

      const token = interactionToken;

      /*
       * Ensure the latest raster is visible while the vector is being
       * restored.
       */
      renderRasterImmediately(currentOrder);
      restoreVector(currentOrder, token);
    }

    function cacheDimensionsChanged() {
      const solutionRect =
        solutionStack.getBoundingClientRect();

      const potentialRect =
        potentialStack.getBoundingClientRect();

      function relativeDifference(
        current,
        cached
      ) {
        if (!cached) {
          return 1;
        }

        return Math.abs(
          current - cached
        ) / cached;
      }

      return (
        relativeDifference(
          solutionRect.width,
          cachedSolutionWidth
        ) >
          RESIZE_REBUILD_THRESHOLD ||
        relativeDifference(
          solutionRect.height,
          cachedSolutionHeight
        ) >
          RESIZE_REBUILD_THRESHOLD ||
        relativeDifference(
          potentialRect.width,
          cachedPotentialWidth
        ) >
          RESIZE_REBUILD_THRESHOLD ||
        relativeDifference(
          potentialRect.height,
          cachedPotentialHeight
        ) >
          RESIZE_REBUILD_THRESHOLD
      );
    }

    function scheduleCacheRebuild() {
      window.clearTimeout(resizeTimer);

      resizeTimer = window.setTimeout(
        () => {
          if (
            cacheReady &&
            cacheDimensionsChanged()
          ) {
            buildRasterCache();
          }
        },
        RESIZE_DEBOUNCE_MS
      );
    }

    async function initialize() {
      buildTicks();

      currentOrder = getInitialOrder();

      updateOrderDisplay(currentOrder);
      updateLinks(currentOrder);

      /*
       * Keep the initial vector images synchronized with ?order=.
       */
      await Promise.allSettled([
        prepareVectorImage(
          solutionVector,
          solutionPath(currentOrder),
          "Abnormal zero-sum magic " +
            `hexagon of order ${currentOrder}`
        ),

        prepareVectorImage(
          potentialVector,
          potentialPath(currentOrder),
          "Potential field of the " +
            "abnormal zero-sum magic " +
            `hexagon of order ${currentOrder}`
        )
      ]);

      const failedSources =
        await preloadAllSources(
          currentOrder
        );

      await buildRasterCache();

      if (failedSources > 0) {
        loadingStatus.classList.remove(
          "is-finished"
        );

        loadingStatus.textContent =
          `${failedSources} unavailable`;
      } else {
        /*
         * buildRasterCache leaves raster mode enabled so test it once,
         * then return to full vector quality.
         */
        interactionToken += 1;

        restoreVector(
          currentOrder,
          interactionToken
        );
      }
    }

    slider.addEventListener(
      "input",
      () => {
        selectOrder(slider.value);
      }
    );

    /*
     * Native range inputs fire "change" on pointer release, allowing
     * vector quality to return immediately rather than waiting for the
     * debounce.
     */
    slider.addEventListener(
      "change",
      commitCurrentOrder
    );

    slider.addEventListener(
      "pointerdown",
      () => {
        if (cacheReady) {
          viewer.classList.add(
            "is-raster-mode"
          );

          renderRasterImmediately(
            currentOrder
          );
        }
      }
    );

    const resizeObserver =
      new ResizeObserver(
        scheduleCacheRebuild
      );

    resizeObserver.observe(viewer);

    initialize();
  })();
</script>