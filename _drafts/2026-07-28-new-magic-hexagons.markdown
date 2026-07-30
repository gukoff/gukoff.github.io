---
layout: post
title: "New magic hexagons and their beautiful potential fields"
date: 2026-07-28 00:00:00 +0200
categories: math
comments: "yes"
d3: "no"
mathjax: "yes"
---

# New magic hexagons and their beautiful potential fields

A conversation with other alumni of the Yandex School of Data Analysis recently turned to the fact that the school was about to become 19 years old.

As tends to happen when mathematicians encounter a number, we started asking what was special about it.

Someone pointed out that 19 is a twin prime. Someone else replied that 19 is the number of cells in the only non-trivial normal magic hexagon.

I had never heard of a magic hexagon, so I opened Wikipedia.

That small act of curiosity eventually led to a custom stochastic solver, several days of computation across 32 CPU cores, and new abnormal magic hexagons of orders up to 21. Along the way, I found that the seemingly chaotic solutions have an alternative representation that looks unexpectedly smooth: a landscape of gradients, hills, and valleys.

This post is about that journey. It is also about a recurring lesson in both mathematics and software engineering: a difficult search problem can become much more tractable once you find the right representation.

## From magic squares to magic hexagons

A magic square contains distinct integers arranged so that every row, column, and main diagonal has the same sum.

A magic hexagon applies the same idea to a hexagonal grid. Its cells form straight lines in three directions, and every such line must have the same sum.

An order-(n) hexagon has side length (n) and contains

[
3n(n-1)+1
]

cells.

The familiar non-trivial example has order 3 and therefore 19 cells. If those cells must contain exactly the numbers from 1 to 19, there is only one solution, apart from rotations and reflections.

That is the normal magic hexagon.

[**Visualization 1 — The classical order-3 magic hexagon**
Show the numbered 19-cell solution. Highlight one line in each of the three lattice directions and display their common sum.]

The problem changes if we relax the interval of allowed numbers.

Instead of requiring the values to start at 1, we require only that they form some consecutive interval. Such objects are traditionally called **abnormal magic hexagons**.

The adjective sounds dramatic, but the definition is modest:

* every cell contains a distinct integer;
* the integers are consecutive;
* every line has the same sum.

This relaxation allows many more solutions. It does not make them easy to find.

## A small problem with a large search space

The definition is simple enough to encode in a constraint solver:

1. create one integer variable per cell;
2. require all values to be distinct;
3. constrain them to form a consecutive interval;
4. require every line to have the same sum.

I tried this with OR-Tools CP-SAT.

For small orders, a general-purpose constraint solver is useful. But the difficulty rises quickly. Even the next unknown orders resisted a straightforward formulation for hours.

This is not surprising when you consider the search space. An order-(n) hexagon has (3n(n-1)+1) cells, and the solver is effectively looking for a highly constrained permutation of the same number of values.

The line equations provide structure, but they overlap heavily. Moving one number changes several sums at once. Distinctness is global. Consecutiveness is global. Most partial assignments tell the solver very little about whether they can eventually be completed.

At this point, the useful question was no longer:

> How can I make the generic solver search faster?

It was:

> Can I reformulate the problem so that most constraints are satisfied automatically?

That question led to two strong assumptions.

## Zero sums and antisymmetry

I restricted the search to hexagons whose lines sum to zero.

Because the number of cells is odd, the consecutive values can then be chosen symmetrically:

[
-K,-(K-1),\ldots,-1,0,1,\ldots,K.
]

I also imposed **antisymmetry**. The center contains zero, and cells opposite each other under a 180-degree rotation contain opposite values.

So if one cell contains (x), its antipodal cell contains (-x).

[**Visualization 2 — Antisymmetry**
Show an empty hexagon with the center marked (0). Select several antipodal cell pairs and label them (x/-x), (y/-y), and (z/-z).]

These assumptions remove a great deal of freedom. They also introduce the risk that no large solutions satisfy them.

There was no theorem promising that this restricted family would continue indefinitely. It was simply a plausible place to search.

But once I looked at zero-sum hexagons, another structure appeared.

## A local move that preserves every line sum

Take the six cells surrounding any interior point and add the alternating pattern

[
-1,+1,-1,+1,-1,+1.
]

Leave the central cell unchanged.

Every straight line that intersects this pattern receives either no contribution or two opposite contributions. Its total therefore remains unchanged.

You can add any multiple of this pattern without affecting any line sum.

[**Visualization 3 — The alternating-ring move**
Show one central cell surrounded by six cells labelled (-1,+1,-1,+1,-1,+1). Draw the three line directions through the pattern, demonstrating that each receives contributions summing to zero.]

This is the hexagonal equivalent of a null operation: it changes the values but preserves the invariant we care about.

More importantly, these local alternating rings form a basis for the entire vector space of zero-line-sum hexagonal arrays. Place one ring around each cell of a hexagon one order smaller. Every zero-sum field can be produced by assigning coefficients to those rings, and those coefficients are unique.

I call the array of coefficients the **potential field**.

An order-(n) zero-sum hexagon therefore has two equivalent representations:

* its visible cell values;
* an order-((n-1)) potential field describing how much of each local ring it contains.

This representation does not guarantee that the visible values will be distinct or consecutive. Those remain difficult global conditions.

But it solves all line-sum constraints by construction.

Instead of searching among arbitrary arrangements and repeatedly repairing broken lines, we can search entirely inside the space where every line already sums to zero.

That is a substantial change.

## Searching inside the valid space

This pattern appears in many engineering problems.

A compiler transforms a program into an intermediate representation where analysis is easier. A database changes its physical layout to make the important queries cheap. An optimization algorithm uses coordinates that encode some constraints automatically.

The representation does not alter the underlying problem. It changes which parts of the problem are expensive.

Here, the potential field turns the line equations from active constraints into an invariant. The remaining task is to find coefficients whose derived cell values are precisely the consecutive integers from (-K) to (K).

That is still a formidable combinatorial problem, but it is a much better one to give to a specialized search algorithm.

## LLMs as optimization collaborators

Around the same time, I had been helping to presolve problems for the Midnight Code Cup, a programming competition in which using LLMs is explicitly encouraged.

Many of its tasks are optimization problems. My main lesson from that experience was not that LLMs replace optimization solvers. It was that they can be unusually effective at helping develop **domain-specific** solvers.

A general-purpose solver sees variables and constraints. An LLM can also reason about the geometry, invent move sets, connect the problem to related mathematical objects, and generate optimized implementation ideas.

So I gave the problem, the antisymmetry restriction, and the potential-field representation to Codex 5.3.

It proposed several search strategies and produced a solver that found solutions through order 12.

I then asked GPT-5.6 Sol to attack the same problem. It connected the structure to **Heffter arrays**: combinatorial arrangements of signed integers with prescribed zero-sum conditions. The problems are not identical, but the connection suggested better ways to organize values and exchange them while controlling the affected sums.

The resulting program abandoned the generic constraint-solver approach in favor of custom simulated annealing.

It represented a candidate as a signed permutation and repeatedly performed carefully selected exchanges. Each move changed only a small part of the state, allowing its effect on the objective to be computed incrementally.

The hot loop was compiled with Numba. We profiled it with `perf`, removed allocations, wrote cheaper random-selection code, adjusted the move distribution, and added specialized finishing phases for states that were close to a solution.

This was not a case of asking an AI for a theorem and receiving one.

It was a rapid engineering loop:

1. the models proposed abstractions, hypotheses, and algorithms;
2. I tested them;
3. profiling exposed the actual bottlenecks;
4. we revised the implementation;
5. large searches revealed which ideas survived contact with the problem.

In this setting, specialized code decisively outperformed my original OR-Tools model because it exploited details that were invisible to a general-purpose solver.

## Reaching order 21

After several rounds of optimization, I ran a multi-day search campaign across 32 CPU cores.

It found abnormal zero-sum, antisymmetric magic hexagons of orders up to 21.

The visible solutions are difficult to read as anything but permutations of numbers. Even when colored by magnitude, neighboring cells appear almost unrelated. Large positive and negative values are scattered across the grid with little obvious local structure.

Then I visualized their potential fields.

They looked completely different.

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

[**Interactive visualization — Solutions and potentials**
Place two SVGs side by side. The left side shows the abnormal magic hexagon, with cells colored by value. The right side shows its order-((n-1)) potential field using the same type of magnitude scale. Add a slider or selector for orders 3 through 21. Preserve the selected order in the URL so individual examples can be linked.]

The solution fields look noisy. The potentials resemble terrain maps.

They contain broad slopes, basins, ridges, and smooth transitions. Adjacent potential values are often much closer than distant ones. The field appears dominated by low-frequency structure, even though the derived values are a permutation of a large consecutive interval.

That contrast is the most intriguing result of the project.

## Why can a smooth potential produce a chaotic solution?

The word “potential” is more than a metaphor.

Each visible cell receives contributions from several nearby alternating-ring basis elements. The transformation from potentials to cell values therefore behaves somewhat like a discrete differential operator: local relationships between nearby coefficients determine the output.

Differential operators can turn a smooth field into a rapidly varying one. A gradual slope in the underlying potential may produce positive values in some positions and negative values in neighboring positions, depending on how the local basis contributions combine.

[**Visualization 5 — From potential to cell value**
Select one output cell and show the nearby basis coefficients that contribute to it. Animate or diagram their signed contributions being added to produce the visible number.]

This explains how smooth potentials and irregular outputs can coexist.

It does not explain why the solver finds smooth potentials in the first place.

There are at least two plausible interpretations.

The first is mathematical: perhaps consecutive zero-sum hexagons inherently require substantial low-frequency structure in this basis.

The second is algorithmic: perhaps simulated annealing has a bias toward smooth potential fields. Large-scale gradients may be easier to create and preserve through local exchanges than highly oscillatory configurations.

The current collection of solutions cannot distinguish these possibilities. Every large example was produced by related search algorithms, so the dataset reflects both the mathematics and the solver.

A useful next experiment would be to run deliberately different search procedures and compare the spectral or local-smoothness properties of their potential fields.

[**Optional visualization — Smoothness by order**
Plot a smoothness metric for each solution, such as the mean squared difference between adjacent potential cells. Compare multiple independent runs and, when available, multiple solver families.]

If smoothness remains stable across unrelated methods, it becomes evidence of an intrinsic property. If it changes substantially, it is probably a fingerprint of the search.

Either answer would be interesting.

## From computation toward proof

Finding many examples naturally raises a larger question:

> Do abnormal consecutive magic hexagons exist for infinitely many orders?

The computations do not answer it. Twenty consecutive successes are evidence that the phenomenon is not isolated, but they are not a proof.

I am now pursuing the theoretical problem with GPT-5.6 Sol and the Lean-oriented theorem-proving agent Aristotle.

This has already led into substantially deeper mathematics than I expected from a recreational puzzle: modular lifting, finite-field Fourier analysis, character sums, sparse correction systems, and arithmetic in the Eisenstein integers.

The proof is not finished. Some promising constructions can generate highly structured zero-sum hexagons, but making their entries exactly consecutive remains the hard part.

That distinction is important. A computer-discovered object is a result. An apparent pattern across many objects is a conjecture. An infinite construction needs a proof that survives every order in the claimed family.

Whether that proof will close remains to be seen. The computational results stand independently, but the potential fields now offer an additional source of clues about what a general construction might look like.

## What this project taught me

I began with a piece of trivia about the number 19.

The project that followed reinforced three lessons.

The first is that **representation often matters more than raw search power**. Moving from cell values to potential coefficients eliminated the line constraints rather than merely solving them faster.

The second is that **domain-specific optimization can outperform general tools by a wide margin**. CP-SAT was useful for expressing the problem, but the successful solver depended on understanding which moves, invariants, and incremental updates were special to this geometry.

The third is that **LLMs are especially useful in the space between a problem statement and a mature algorithm**. They can traverse mathematical terminology, algorithm design, implementation, and profiling suggestions quickly. Their ideas still need testing, and their claims still need verification, but they can greatly accelerate the exploration.

Most importantly, the project produced something I did not expect to see.

The magic hexagons themselves look like noise. Their hidden coordinates look like landscapes.

Sometimes the right representation does more than make a problem easier to solve. It reveals that the object you were studying has been beautiful all along.
