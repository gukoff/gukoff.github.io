---
layout: post
title: "There Are Magic Hexagons of Every Order"
date: 2026-08-02 00:00:00 +0200
categories: math
comments: "yes"
d3: "no"
mathjax: "yes"
---

What is so special about the number 19?

The question came up last month in a conversation among YSDA alumni, when the school turned 19. Someone pointed out that 19 is a twin prime. Someone else replied that 19 is the number of cells in the only non-trivial normal magic hexagon.

Wait, what is a "magic hexagon"? Let us start there.

<aside class="article-disclaimer" aria-labelledby="article-disclaimer-title">
  <h2 id="article-disclaimer-title">A note on AI-assisted mathematics</h2>

  <p>
    Recently, we have heard a lot about AI miraculously proving and disproving
    long-standing conjectures, often without much explanation of how it was done.
  </p>

  <p>
    This story offers a look inside the process of making such a mathematical
    discovery.
  </p>
</aside>

## Magic Squares and Magic Hexagons

You probably know about magic squares. A magic square is a square grid of numbers in which every row, every column, and both main diagonals add up to the same total, known as the magic constant. We also usually require the numbers to be consecutive - typically from $1$ to $n^2$ - and call it a _normal_ magic square. Otherwise, we could simply put the same number into every cell, which would be a very boring way to fill a square.

<object
  type="image/svg+xml"
  data="/assets/svg/magic-hexagons/magic-square-order5-interactive.svg"
  style="display:block; width:50%; max-width:620px; height:auto; margin:auto;"
  aria-label="Interactive order-5 magic square">
</object>

Magic squares have been known for millennia and are now very well understood. We have algorithms for constructing normal magic squares of every order $n>2$.

A magic hexagon applies the same idea to a hexagonal grid. Its cells form straight lines in three directions, and every such line must have the same sum. As with squares, a magic hexagon is called _normal_ if it contains the consecutive numbers from $1$ to $3n^2-3n+1$, the total number of cells in a hexagon of order $n$.

<object
  type="image/svg+xml"
  data="/assets/svg/magic-hexagons/Order3-interactive.svg"
  style="display:block; width:50%; height:auto; margin:auto;"
  aria-label="Interactive order-3 magic hexagon">
</object>

Above you can see the only non-trivial normal magic hexagon in existence - apart from its own rotations and reflections. The proof is straightforward. In each of the three directions, the cells are partitioned into $2n-1$ lines. Therefore, the sum of all the numbers must be divisible by $2n-1$. For every order $n>3$, the sum of the numbers from $1$ to $3n^2-3n+1$ fails this divisibility test.

Well, ending the story here would be no fun. To make things more interesting, let's look at the so-called abnormal magic hexagons. Here we relax one constraint: the numbers on the grid must still be consecutive, but they no longer have to start at $1$.

This small relaxation suddenly allows new solutions to appear.

Finding them, however, is not easy. Unlike with magic squares, there was no formulaic construction or deterministic algorithm. The only known approach was to wander through a brutally large search space of possible arrangements. According to [Wikipedia](https://en.wikipedia.org/wiki/Magic_hexagon), as of July 2026, the largest known solution was a hexagon of order $n=9$, found by Klaus Meffert in 2024.

So... what makes these solutions so hard to find? And how about we try?

## Chapter 1: Making Observations (With Human Brain)

There is a clear tension between two independent constraints:

1. The numbers must be consecutive;
2. All line sums must be equal, even though the lines have different lengths.

The prior solutions I found suggested that people had already tried several search algorithms and likely optimized them well.
That made me think that, if I wanted to advance the field, I should focus not on making the search faster, but on making the search space smaller.

### Observation: Antisymmetric hexagons are much simpler

First, let's restrict the numbers on the grid to the symmetric interval $-K,\ldots,K$ for some $K$. If all line sums are equal, this is equivalent to requiring that every line sum be zero.

Second, put $0$ in the center and require that cells opposite each other under a 180-degree rotation contain opposite values. If one cell contains $x$, its antipodal cell contains $-x$.

<object
  type="image/svg+xml"
  data="/assets/svg/magic-hexagons/antisymmetry-hexagon-interactive.svg"
  style="display:block; width:50%; height:auto; margin:auto;"
  aria-label="Interactive antisymmetric order-3 magic hexagon">
</object>

Notice how many constraints disappear. Every line through the center sums to zero automatically because its values cancel in opposite pairs. Every other line has an antipodal line with the sum of antipodal opposite numbers. If one of them sums to zero, so does the other.

Of course, simplifying the constraints introduces a risk: perhaps no solutions satisfy the extra symmetry at all. At this point, antisymmetry was simply a plausible place to search, following the [drunkard's principle](https://en.wikipedia.org/wiki/Streetlight_effect).

But once I started thinking about zero-sum hexagons, another structure appeared.

### Observation: Every zero-sum hexagon is build from the same 6-point ring

Consider any hexagonal grid, zero-sum or not. Take the six cells surrounding any interior point and add the alternating pattern $$[-1,+1,-1,+1,-1,+1].$$ Leave the central cell unchanged.

Every straight line that intersects this ring receives either no contribution or two opposite contributions, $+1$ and $-1$. Its sum therefore remains unchanged. We can add any multiple of this pattern without changing a single line sum.

These local alternating rings form a basis: every zero-sum hexagon can be built as a unique linear combination of them. I will omit the proof for brevity, but the idea is fairly straightforward. Starting at the outer layer, choose ring coefficients that cancel its cells, then peel the layer away and continue inward by induction.

An order-$n$ zero-sum hexagon therefore has two equivalent representations:

- its visible cell values;
- an order-$(n-1)$ _potential field_, recording how much of each local ring it contains.

The potential field representation also satisfies every line-sum constraint by construction. It does not, however, guarantee that the visible values are distinct and consecutive. Those remain difficult global constraints.

Below you can play with the potential field of the order-3 antisymmetric hexagon. Notice that however you change the potential field, the line sums in te hexagon remain zero. However, making the hexagon magic is a very hard challenge.

<div class="wide-interactive-svg">
  <object
    type="image/svg+xml"
    data="/assets/svg/magic-hexagons/potential-field-interactive.svg"
    aria-label="Interactive potential field playground"
  >
    Interactive potential-field visualization
  </object>
</div>

This representation also plays well with antisymmetry. The potential field of an antisymmetric hexagon is itself symmetric.

The idea is that instead of searching among arbitrary arrangements and repeatedly repairing broken lines, we can now search entirely inside the space where every line already sums to zero. Which might - or might not - be a smaller search space for the solver.

## Chapter 2: Finding New Hexagons (AI Writes Code)

Around the same time, I had been helping to pre-solve problems for the [Midnight Code Cup 2026](https://midnightcodecup.org/), a programming competition in which using LLMs is explicitly encouraged. Many of its tasks are optimization problems. My main takeaway was that LLMs can be unusually effective at developing domain-specific solvers, leaving general-purpose tools such as [Z3](https://github.com/z3prover/z3) and [OR-Tools](https://github.com/google/or-tools) far behind.

So instead of reaching for another generic constraint solver, I went to GPT-5.6 Sol and gave it more freedom with the problem. I pointed out the antisymmetry restriction and the potential-field representation. The model searched for related concepts and connected the problem to Heffter arrays: combinatorial arrangements of signed integers with prescribed zero-sum conditions. The problems are not identical, but the connection suggested better ways to organize values and exchange them while controlling the affected sums.

The resulting program abandoned the generic constraint-solver approach in favor of custom simulated annealing. I then did some due diligence through several rounds of optimization: asked the model to use Numba for the hot loops, identified memory-allocation and random-number-generation bottlenecks with `perf`, and eventually squeezed another 50% of performance out of the program. Here is the [end result](https://gist.github.com/gukoff/e62a157d51c86f7f2dab4dfa04aa0f9e).

Then I left it running on my home server for a few days across roughly 24 CPU cores.

As I had hoped, the combination of a smaller search space and a specialized solver worked remarkably well. Soon I had discovered magic hexagons of every order up to $n=21$. Here they are:

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

The cell values look chaotic and noisy. Their potential fields do not. They resemble terrain maps, with broad slopes, ridges, valleys, and surprisingly smooth transitions.

I did not yet know whether this smoothness was a clue or merely an artifact of the search. Either way, it was difficult to look at those landscapes and not suspect that some larger structure was hiding underneath.

## Chapter 3: Finding All Hexagons (AI Runs The Show)

Repeatedly finding larger solutions naturally suggested a conjecture:

<aside class="article-disclaimer" aria-labelledby="article-disclaimer-title">
  <h2 id="article-disclaimer-title">Conjecture</h2>

  <p>
    Abnormal antisymmetric consecutive magic hexagons exist for every order $n>3$.
  </p>

</aside>

This was a strong claim. Before this project, only a handful of abnormal magic hexagons were known. And don't forget I had imposed the additional restriction of antisymmetry.

But inspired by the recent successes of AI in mathematics, I was curious to see how it would approach the problem. Could AI prove it from the outset?

I decided to try two AI systems:

- [GPT-5.6 Sol](https://en.wikipedia.org/wiki/GPT-5.6), the strongest general-purpose model available to me through my personal subscription;
- [Aristotle](https://aristotle.harmonic.fun/), a Lean-oriented theorem-proving agent.


I first gave GPT-5.6 Sol (high) the problem statement, the known solutions, and several additional intuitions. It proposed new hypotheses and possible constructions, then began chopping away, reducing the problem to smaller pieces. The work gained traction. At this stage, I still felt very much in the driver's seat: learning unfamiliar mathematical machinery, checking the arguments, rejecting unproductive directions, and steering a process that I could mostly follow.

Several days of iteration passed. The problem had been reduced to a few key lemmas, so I brought in Aristotle to pursue a formal proof in parallel.

Eventually, the process stalled. Both agents remained optimistic, but they were clearly stuck, rehashing the same ideas without making meaningful progress. I weakened the conjecture to the more modest claim that infinitely many abnormal magic hexagons exist. We explored new hypotheses and even non-constructive approaches

Still, we hit a wall.

I then employed GPT-5.6 Sol (max), which reasoned for many hours and... also failed to find a proof. Before running out of credits, however, it produced several new ideas. Those ideas became part of the project's shared context and remained available in later conversations.

In one such conversation, while I was once again directing GPT-5.6 Sol toward a proof, it picked up several of those earlier ideas and combined them into what looked like a breakthrough. After checking it computationally, I had a constructive argument for every order $n>800$ divisible by $16$.

Once that foothold was established, the work REALLY gained traction. Iteration by iteration, I pushed GPT-5.6 Sol (high) to generalize the construction: first to orders divisible by $8$, then by $4$, then by $2$, and finally to remove the divisibility condition altogether. The proved threshold also fell from $800$ to $114$.

The threshold of $114$ is important to interpret correctly. It is a convenient bound under which the proof's inequalities and combinatorial choices are easy to justify theoretically. It does not appear to be a fundamental limitation of the construction, because in practice, the same method succeeds well below that threshold.

Once the general construction existed, I pushed again, this time for simplicity and determinism. It was clear the initial construction contained many special cases, auxiliary choices, and pieces of machinery inherited from previous attempts. Sure enough, GPT-5.6 Sol (high) repeatedly found redundancies in the construction and replaced them with a cleaner deterministic algorithm.

<aside class="article-disclaimer" aria-labelledby="article-disclaimer-title">
  <h2 id="article-disclaimer-title">The final conversation</h2>

  <p>
    Here is the thread that led to the breakthrough and subsequent simplifications.
    It describes the solution and shows our back-and-forth with GPT-5.6 Sol if you want to peek at the process.
  </p>

  <p>
    <a href="https://chatgpt.com/share/6a6f77e9-3348-83eb-9304-31f87b24de88" target="_blank" rel="noopener">View the conversation in a new tab</a>
  </p>

</aside>

It took dozens of long conversations and days of reasoning, but the conjecture was solved. And the result is constructive: it does not merely assert that these hexagons exist, but gives an algorithm for building them, starting from relatively low orders. Combined with the finite witnesses up to $n=21$ I found with bruteforce before, it covers every order $n>3$.

It is important to note that the proof was not formalized in Lean at the time of writing this post and was not independently verified. This will be the natural next step.

<aside class="article-disclaimer" aria-labelledby="article-disclaimer-title">
  <h2 id="article-disclaimer-title">Python implementation</h2>

  <p>
    The hexagon construction kit is available in the
    <a href="https://github.com/gukoff/magic-hexagons" target="_blank" rel="noopener">gukoff/magic-hexagons</a>
    repository.
  </p>

</aside>

And here are some hexagons of much larger orders, generated by the construction. Notice the pattern?

<section
  class="large-hexagon-viewer"
  data-large-hexagon-viewer
>
  <div class="large-hexagon-viewer__stage">
    <figure
      class="
        large-hexagon-viewer__panel
        large-hexagon-viewer__panel--solution
      "
    >
      <figcaption class="large-hexagon-viewer__title">
        Magic hexagon
      </figcaption>

      <a
        class="large-hexagon-viewer__image-link"
        data-large-solution-link
        href="/assets/png/magic-hexagons/MagicHexagon-Order500-sum_zero.png"
        target="_blank"
        rel="noopener"
      >
        <div
          class="large-hexagon-viewer__image-stack"
          data-large-solution-stack
          aria-label="Large magic hexagon"
        ></div>
      </a>
    </figure>

    <figure
      class="
        large-hexagon-viewer__panel
        large-hexagon-viewer__panel--potential
      "
    >
      <figcaption class="large-hexagon-viewer__title">
        Potential field
      </figcaption>

      <a
        class="large-hexagon-viewer__image-link"
        data-large-potential-link
        href="/assets/png/magic-hexagons/potential_MagicHexagon-Order500-sum_zero.png"
        target="_blank"
        rel="noopener"
      >
        <div
          class="large-hexagon-viewer__image-stack"
          data-large-potential-stack
          aria-label="Large magic hexagon potential field"
        ></div>
      </a>
    </figure>
  </div>

  <div class="large-hexagon-viewer__controls">
    <label
      class="large-hexagon-viewer__order"
      for="large-hexagon-order"
    >
      Order
      <output
        data-large-order-output
        for="large-hexagon-order"
      >
        500
      </output>
    </label>

    <div class="large-hexagon-viewer__slider-shell">
      <div
        class="large-hexagon-viewer__slider-rail"
        aria-hidden="true"
      ></div>

      <div
        class="large-hexagon-viewer__ticks"
        data-large-slider-ticks
        aria-hidden="true"
      ></div>

      <input
        id="large-hexagon-order"
        class="large-hexagon-viewer__slider"
        data-large-order-slider
        type="range"
        min="0"
        max="5"
        value="5"
        step="1"
        disabled
        aria-label="Large magic hexagon order"
      />
    </div>

    <span
      class="large-hexagon-viewer__loading"
      data-large-loading-status
      aria-live="polite"
    >
      Loading…
    </span>
  </div>

  <noscript>
    <div class="large-hexagon-viewer__noscript">
      <figure>
        <figcaption>Magic hexagon</figcaption>

        <img
          src="/assets/png/magic-hexagons/MagicHexagon-Order500-sum_zero.png"
          alt="Abnormal zero-sum magic hexagon of order 500"
        />
      </figure>

      <figure>
        <figcaption>Potential field</figcaption>

        <img
          src="/assets/png/magic-hexagons/potential_MagicHexagon-Order500-sum_zero.png"
          alt="Potential field of the order 500 magic hexagon"
        />
      </figure>
    </div>
  </noscript>
</section>


## Chapter 4: Reflections

- I started this project with AI as a co-pilot and myself in the driver's seat. By the end, I was more of a passenger: the AI was doing much of the creative work, while I nudged it toward directions that felt promising.

  I am glad that some ideas born in my human brain turned out to be instrumental. Antisymmetry plays a major role in the final construction, and the potential fields - well, not so much. Yet their smoothness remains interesting, and perhaps there's more to discover.

- GPT-5.6 Sol is a remarkably capable mathematical reasoner, but it has a double-edged tendency toward tunnel vision. It can go very deep in a chosen direction. When that direction is right, this is incredibly powerful. When it is wrong, you had better keep an arbiter in the loop - another model or, in my case, a human - to remind it of the bigger picture and notice when meaningful progress has stopped.

- It was essential that the model had access to the internet. It found related papers and mathematical concepts that I could not have anticipated and supplied in advance.
That was one reason I used the ChatGPT web interface rather than Codex. Another was personal: I wanted this project to remain primarily a mental exercise during my time off, rather than turning into another software-engineering project that kept me in front of a computer. For a serious proof campaign, however, I would use a more systematic setup: several models working in parallel, explicit roles for proposing and criticizing arguments, persistent shared context, and access to internet search through a service such as [exa.ai](https://exa.ai/).

- In software engineering, code review became a bottleneck once LLMs made code generation cheap. Statically typed languages, static analysis and testing suddenly mattered more than ever because they could take some of the growing burden of correctness verification away from humans.

  Mathematics now faces a similar problem. AI can produce candidate theories and proofs faster than people can responsibly verify them. Lean and other machine-verifiable proof systems must be an enormous boon to the community, offering a way to scale verification along with generation.

- I wonder if the techniques discovered during this project can be applied to other combinatorial construction problems and developed into something more general than a solution to one hexagonal puzzle. Heffter arrays naturally come to mind.

- It's funny how this story began with an interest in the number 19 and ended with a construction of magic hexagons for every order greater than $3$. The remaining challenge is to make the proof machine-verifiable - now [Aristotle](https://aristotle.harmonic.fun/) and [leanprover/comparator](https://github.com/leanprover/comparator) have some work to do.

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

<style>
.article-disclaimer {
    margin: 2.5rem 0;
    padding: 1.5rem 1.75rem;
    color: #172554;
    background: #dbeafe;
    border: 2px solid #60a5fa;
    border-left-width: 8px;
    border-radius: 0.5rem;
    box-shadow: 0 4px 14px rgb(30 64 175 / 12%);
}

.article-disclaimer h2 {
    margin: 0 0 0.75rem;
    color: #1e3a8a;
    font-size: 1.15rem;
    font-weight: 700;
}

.article-disclaimer p {
    margin: 0;
}

.article-disclaimer p + p {
    margin-top: 0.75rem;
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
    const defaultOrder = 10;

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

<style>
  .large-hexagon-viewer {
    /*
     * Main configurable dimensions.
     */
    --large-viewer-width: 75vw;
    --large-viewer-max-width: 1500px;
    --large-slider-width: 30rem;

    /*
     * Keep this synchronized with the thumb dimensions below.
     */
    --large-slider-thumb-size: 18px;
    --large-slider-track-height: 4px;
    --large-slider-tick-height: 12px;

    --large-viewer-gap: clamp(0.5rem, 1vw, 1rem);
    --large-viewer-padding: clamp(0.65rem, 1.3vw, 1.25rem);

    --large-viewer-background-fallback:
      rgb(127 127 127 / 6%);

    --large-viewer-background:
      color-mix(
        in srgb,
        currentColor 5%,
        transparent
      );

    --large-viewer-border:
      color-mix(
        in srgb,
        currentColor 10%,
        transparent
      );

    --large-viewer-muted:
      color-mix(
        in srgb,
        currentColor 62%,
        transparent
      );

    --large-slider-track:
      color-mix(
        in srgb,
        currentColor 24%,
        transparent
      );

    --large-slider-tick:
      color-mix(
        in srgb,
        currentColor 52%,
        transparent
      );

    --large-slider-tick-selected:
      color-mix(
        in srgb,
        currentColor 85%,
        transparent
      );

    --large-slider-thumb: currentColor;

    container-type: inline-size;

    position: relative;
    left: 50%;

    width: min(
      var(--large-viewer-width),
      var(--large-viewer-max-width),
      calc(100vw - 1rem)
    );

    max-width: none;
    box-sizing: border-box;

    margin: 1.5rem 0;
    padding: var(--large-viewer-padding);

    transform: translateX(-50%);

    border: 1px solid var(--large-viewer-border);
    border-radius: 0.9rem;

    background: var(--large-viewer-background-fallback);
    background: var(--large-viewer-background);
  }

  .large-hexagon-viewer *,
  .large-hexagon-viewer *::before,
  .large-hexagon-viewer *::after {
    box-sizing: border-box;
  }

  .large-hexagon-viewer__stage {
    display: grid;
    grid-template-columns:
      repeat(2, minmax(0, 1fr));

    gap: var(--large-viewer-gap);
    align-items: start;
  }

  .large-hexagon-viewer__panel {
    min-width: 0;
    margin: 0;
  }

  /*
   * The captions meet symmetrically near the middle.
   */
  .large-hexagon-viewer__title {
    margin: 0 0 0.25rem;
    padding: 0 0.25rem;

    background: none;

    font-size: 0.95rem;
    font-weight: 600;
    line-height: 1.35;
  }

  .large-hexagon-viewer__panel--solution
    .large-hexagon-viewer__title {
    text-align: right;
  }

  .large-hexagon-viewer__panel--potential
    .large-hexagon-viewer__title {
    text-align: left;
  }

  .large-hexagon-viewer__image-link {
    display: block;
    color: inherit;
    text-decoration: none;
  }

  .large-hexagon-viewer__image-link:focus-visible {
    border-radius: 0.35rem;
    outline: 3px solid currentColor;
    outline-offset: 3px;
  }

  /*
   * Every PNG is placed in the same stack. Switching the order only
   * toggles visibility; no source URL changes while dragging.
   */
  .large-hexagon-viewer__image-stack {
    position: relative;

    width: 100%;
    height: min(
      47cqw,
      calc(100svh - 10rem),
      720px
    );

    contain: layout paint style;
  }

  .large-hexagon-viewer__image {
    position: absolute;
    inset: 0;

    display: block;
    width: 100%;
    height: 100%;

    object-fit: contain;

    opacity: 0;
    visibility: hidden;
    pointer-events: none;

    /*
     * Encourage the browser to keep these layers ready for fast swaps.
     */
    transform: translateZ(0);
    backface-visibility: hidden;
  }

  .large-hexagon-viewer__image.is-active {
    opacity: 1;
    visibility: visible;
  }

  .large-hexagon-viewer__controls {
    display: grid;
    grid-template-columns:
      6rem
      minmax(14rem, var(--large-slider-width))
      7rem;

    gap: 0.65rem;
    align-items: center;
    justify-content: center;

    margin-top: 0.4rem;
    padding: 0 0.25rem;
  }

  .large-hexagon-viewer__order {
    display: flex;
    gap: 0.35rem;
    align-items: baseline;
    justify-content: flex-end;

    width: 6rem;

    white-space: nowrap;
    font-size: 0.9rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  /*
   * Fixed at three characters, so 50, 100 and 500 never change the
   * slider's position.
   */
  .large-hexagon-viewer__order output {
    display: inline-block;

    width: 3ch;
    min-width: 3ch;

    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  .large-hexagon-viewer__slider-shell {
    position: relative;

    width: 100%;
    height: 46px;
    min-width: 0;
  }

  /*
   * The custom rail and scale use the native thumb's exact travel
   * endpoints: half a thumb-width from either input edge.
   */
  .large-hexagon-viewer__slider-rail,
  .large-hexagon-viewer__ticks {
    position: absolute;

    left: calc(
      var(--large-slider-thumb-size) / 2
    );

    right: calc(
      var(--large-slider-thumb-size) / 2
    );

    pointer-events: none;
  }

  .large-hexagon-viewer__slider-rail {
    top: 14px;
    z-index: 0;

    height: var(--large-slider-track-height);

    transform: translateY(-50%);

    border-radius: 999px;
    background: var(--large-slider-track);
  }

  .large-hexagon-viewer__ticks {
    top: 0;
    bottom: 0;
    z-index: 1;
  }

  .large-hexagon-viewer__tick {
    position: absolute;
    top: 14px;
    left: var(--tick-position);

    width: 1px;
    height: var(--large-slider-tick-height);

    transform: translate(-50%, -50%);

    border-radius: 1px;
    background: var(--large-slider-tick);
  }

  .large-hexagon-viewer__tick.is-selected {
    width: 2px;
    height: calc(
      var(--large-slider-tick-height) + 3px
    );

    background: var(--large-slider-tick-selected);
  }

  .large-hexagon-viewer__tick:first-child,
  .large-hexagon-viewer__tick:last-child {
    width: 2px;
  }

  .large-hexagon-viewer__tick-label {
    position: absolute;
    top: 27px;
    left: var(--tick-position);

    transform: translateX(-50%);

    color: var(--large-viewer-muted);

    font-size: 0.67rem;
    font-variant-numeric: tabular-nums;
    line-height: 1;
    white-space: nowrap;
  }

  .large-hexagon-viewer__tick-label.is-selected {
    color: inherit;
    font-weight: 600;
  }

  .large-hexagon-viewer__slider {
    position: absolute;
    top: 0;
    left: 0;
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

  /*
   * Chromium, Safari and other WebKit-based browsers.
   */
  .large-hexagon-viewer__slider::-webkit-slider-runnable-track {
    width: 100%;
    height: var(--large-slider-track-height);

    border: 0;
    background: transparent;
  }

  .large-hexagon-viewer__slider::-webkit-slider-thumb {
    width: var(--large-slider-thumb-size);
    height: var(--large-slider-thumb-size);

    margin-top: calc(
      (
        var(--large-slider-track-height) -
        var(--large-slider-thumb-size)
      ) / 2
    );

    appearance: none;
    -webkit-appearance: none;

    border: 2px solid Canvas;
    border-radius: 50%;

    background: var(--large-slider-thumb);
    box-shadow:
      0 0 0 1px rgb(0 0 0 / 18%);
  }

  /*
   * Firefox.
   */
  .large-hexagon-viewer__slider::-moz-range-track {
    width: 100%;
    height: var(--large-slider-track-height);

    border: 0;
    background: transparent;
  }

  .large-hexagon-viewer__slider::-moz-range-progress {
    height: var(--large-slider-track-height);

    border: 0;
    background: transparent;
  }

  .large-hexagon-viewer__slider::-moz-range-thumb {
    width: var(--large-slider-thumb-size);
    height: var(--large-slider-thumb-size);

    border: 2px solid Canvas;
    border-radius: 50%;

    background: var(--large-slider-thumb);
    box-shadow:
      0 0 0 1px rgb(0 0 0 / 18%);
  }

  .large-hexagon-viewer__slider:disabled {
    cursor: progress;
    opacity: 0.55;
  }

  .large-hexagon-viewer__loading {
    display: block;
    width: 7rem;

    color: var(--large-viewer-muted);

    font-size: 0.75rem;
    text-align: left;
    white-space: nowrap;
  }

  /*
   * Keep the status column allocated after loading finishes so the
   * slider never shifts.
   */
  .large-hexagon-viewer__loading.is-finished {
    visibility: hidden;
  }

  .large-hexagon-viewer__noscript {
    display: grid;
    grid-template-columns:
      repeat(2, minmax(0, 1fr));

    gap: var(--large-viewer-gap);
  }

  .large-hexagon-viewer__noscript figure {
    margin: 0;
  }

  .large-hexagon-viewer__noscript
    figure:first-child
    figcaption {
    text-align: right;
  }

  .large-hexagon-viewer__noscript img {
    display: block;
    width: 100%;
    height: auto;
  }

  @media (max-width: 680px) {
    .large-hexagon-viewer {
      --large-viewer-width:
        calc(100vw - 0.75rem);

      --large-slider-width: 100%;

      margin: 1rem 0;
      padding: 0.65rem;

      border-radius: 0.7rem;
    }

    .large-hexagon-viewer__stage,
    .large-hexagon-viewer__noscript {
      grid-template-columns: 1fr;
    }

    .large-hexagon-viewer__title,
    .large-hexagon-viewer__panel--solution
      .large-hexagon-viewer__title,
    .large-hexagon-viewer__panel--potential
      .large-hexagon-viewer__title {
      text-align: center;
    }

    .large-hexagon-viewer__image-stack {
      height: min(92cqw, 70svh);
    }

    .large-hexagon-viewer__panel
      + .large-hexagon-viewer__panel {
      margin-top: 0.35rem;
    }

    .large-hexagon-viewer__controls {
      grid-template-columns:
        5.5rem
        minmax(0, 1fr);

      gap: 0.5rem;
      justify-content: stretch;

      margin-top: 0.5rem;
    }

    .large-hexagon-viewer__order {
      width: 5.5rem;
    }

    .large-hexagon-viewer__loading {
      grid-column: 1 / -1;

      width: auto;
      min-height: 1em;

      text-align: center;
    }

    .large-hexagon-viewer__tick-label {
      font-size: 0.62rem;
    }
  }

  @media (
    max-height: 520px
  ) and (
    orientation: landscape
  ) {
    .large-hexagon-viewer__stage {
      grid-template-columns:
        repeat(2, minmax(0, 1fr));
    }

    .large-hexagon-viewer__panel--solution
      .large-hexagon-viewer__title {
      text-align: right;
    }

    .large-hexagon-viewer__panel--potential
      .large-hexagon-viewer__title {
      text-align: left;
    }

    .large-hexagon-viewer__panel
      + .large-hexagon-viewer__panel {
      margin-top: 0;
    }

    .large-hexagon-viewer__image-stack {
      height: calc(100svh - 7rem);
    }
  }
</style>

<script>
  (() => {
    const viewer = document.querySelector(
      "[data-large-hexagon-viewer]"
    );

    if (!viewer) {
      return;
    }

    /*
     * Slider positions are evenly spaced because each position
     * represents one available image pair, not a continuous numeric
     * interval.
     */
    const availableOrders = [
      50,
      75,
      100,
      150,
      200,
      500
    ];

    const defaultOrder = 50;
    const finalIndex = availableOrders.length - 1;

    const solutionStack = viewer.querySelector(
      "[data-large-solution-stack]"
    );

    const potentialStack = viewer.querySelector(
      "[data-large-potential-stack]"
    );

    const solutionLink = viewer.querySelector(
      "[data-large-solution-link]"
    );

    const potentialLink = viewer.querySelector(
      "[data-large-potential-link]"
    );

    const slider = viewer.querySelector(
      "[data-large-order-slider]"
    );

    const sliderTicks = viewer.querySelector(
      "[data-large-slider-ticks]"
    );

    const output = viewer.querySelector(
      "[data-large-order-output]"
    );

    const loadingStatus = viewer.querySelector(
      "[data-large-loading-status]"
    );

    const imageElements = [];
    const tickElements = [];
    const labelElements = [];

    let completedCount = 0;
    let failedCount = 0;
    let pendingIndex = finalIndex;
    let animationFrame = 0;

    function solutionPath(order) {
      return (
        "/assets/png/magic-hexagons/" +
        `MagicHexagon-Order${order}-sum_zero.png`
      );
    }

    function potentialPath(order) {
      return (
        "/assets/png/magic-hexagons/" +
        `potential_MagicHexagon-Order${order}-sum_zero.png`
      );
    }

    function normalizeIndex(value) {
      const parsed = Number.parseInt(value, 10);

      if (!Number.isFinite(parsed)) {
        return finalIndex;
      }

      return Math.min(
        finalIndex,
        Math.max(0, parsed)
      );
    }

    function indexForOrder(order) {
      const exactIndex =
        availableOrders.indexOf(order);

      if (exactIndex >= 0) {
        return exactIndex;
      }

      return finalIndex;
    }

    function getInitialIndex() {
      const url = new URL(window.location.href);
      const requestedOrder = Number.parseInt(
        url.searchParams.get("large-order"),
        10
      );

      if (!Number.isFinite(requestedOrder)) {
        return indexForOrder(defaultOrder);
      }

      return indexForOrder(requestedOrder);
    }

    const startingIndex = getInitialIndex();
    const startingOrder =
      availableOrders[startingIndex];

    function createImage({
      order,
      type,
      src,
      alt
    }) {
      const image = document.createElement("img");

      image.className =
        "large-hexagon-viewer__image";

      image.dataset.order = String(order);
      image.dataset.type = type;

      image.src = src;
      image.alt = alt;

      /*
       * Force every PNG to begin downloading immediately.
       */
      image.loading = "eager";
      image.decoding = "async";

      if ("fetchPriority" in image) {
        image.fetchPriority =
          order === startingOrder
            ? "high"
            : "auto";
      }

      image.setAttribute(
        "aria-hidden",
        "true"
      );

      return image;
    }

    function buildImageStacks() {
      for (const order of availableOrders) {
        const solutionImage = createImage({
          order,
          type: "solution",
          src: solutionPath(order),
          alt:
            "Abnormal zero-sum magic hexagon " +
            `of order ${order}`
        });

        const potentialImage = createImage({
          order,
          type: "potential",
          src: potentialPath(order),
          alt:
            "Potential field of the abnormal " +
            "zero-sum magic hexagon " +
            `of order ${order}`
        });

        solutionStack.appendChild(
          solutionImage
        );

        potentialStack.appendChild(
          potentialImage
        );

        imageElements.push(
          solutionImage,
          potentialImage
        );
      }
    }

    function buildTicks() {
      availableOrders.forEach(
        (order, index) => {
          const position =
            finalIndex === 0
              ? 0
              : (index / finalIndex) * 100;

          const tick =
            document.createElement("span");

          tick.className =
            "large-hexagon-viewer__tick";

          tick.dataset.index = String(index);

          tick.style.setProperty(
            "--tick-position",
            `${position}%`
          );

          const label =
            document.createElement("span");

          label.className =
            "large-hexagon-viewer__tick-label";

          label.dataset.index = String(index);
          label.textContent = String(order);

          label.style.setProperty(
            "--tick-position",
            `${position}%`
          );

          sliderTicks.appendChild(tick);
          sliderTicks.appendChild(label);

          tickElements.push(tick);
          labelElements.push(label);
        }
      );
    }

    function updateTicks(selectedIndex) {
      tickElements.forEach((tick, index) => {
        tick.classList.toggle(
          "is-selected",
          index === selectedIndex
        );
      });

      labelElements.forEach(
        (label, index) => {
          label.classList.toggle(
            "is-selected",
            index === selectedIndex
          );
        }
      );
    }

    function updateLoadingStatus() {
      loadingStatus.textContent =
        `Loading ${completedCount}/${imageElements.length}`;
    }

    function waitForImage(image) {
      return new Promise((resolve) => {
        let finished = false;

        async function complete(success) {
          if (finished) {
            return;
          }

          finished = true;
          completedCount += 1;

          if (!success) {
            failedCount += 1;
          }

          updateLoadingStatus();

          /*
           * For PNG files, decode() is useful: it asks the browser to
           * prepare the bitmap before interaction begins.
           */
          if (
            success &&
            typeof image.decode === "function"
          ) {
            try {
              await image.decode();
            } catch {
              /*
               * The image may still be ready even if decode() rejects.
               */
            }
          }

          resolve();
        }

        if (image.complete) {
          complete(image.naturalWidth > 0);
          return;
        }

        image.addEventListener(
          "load",
          () => complete(true),
          { once: true }
        );

        image.addEventListener(
          "error",
          () => complete(false),
          { once: true }
        );
      });
    }

    function setActiveImage(stack, order) {
      const previousImage =
        stack.querySelector(
          ".large-hexagon-viewer__image.is-active"
        );

      const nextImage =
        stack.querySelector(
          `.large-hexagon-viewer__image[data-order="${order}"]`
        );

      if (!nextImage || previousImage === nextImage) {
        return;
      }

      if (previousImage) {
        previousImage.classList.remove(
          "is-active"
        );

        previousImage.setAttribute(
          "aria-hidden",
          "true"
        );
      }

      nextImage.classList.add("is-active");
      nextImage.removeAttribute("aria-hidden");
    }

    function updateUrl(order) {
      const url = new URL(window.location.href);

      url.searchParams.set(
        "large-order",
        String(order)
      );

      window.history.replaceState(
        {},
        "",
        url
      );
    }

    function renderIndex(
      index,
      updateAddress = true
    ) {
      const normalizedIndex =
        normalizeIndex(index);

      const order =
        availableOrders[normalizedIndex];

      slider.value = String(normalizedIndex);

      output.value = String(order);
      output.textContent = String(order);

      updateTicks(normalizedIndex);

      setActiveImage(solutionStack, order);
      setActiveImage(potentialStack, order);

      solutionLink.href = solutionPath(order);
      potentialLink.href = potentialPath(order);

      solutionLink.setAttribute(
        "aria-label",
        `Open the order ${order} magic hexagon ` +
          "as a full-size PNG"
      );

      potentialLink.setAttribute(
        "aria-label",
        `Open the order ${order} potential field ` +
          "as a full-size PNG"
      );

      if (updateAddress) {
        updateUrl(order);
      }
    }

    function queueRender(index) {
      pendingIndex = normalizeIndex(index);

      /*
       * Many input events may arrive between display frames. Only the
       * newest requested index is rendered.
       */
      if (animationFrame) {
        return;
      }

      animationFrame =
        window.requestAnimationFrame(() => {
          animationFrame = 0;
          renderIndex(pendingIndex);
        });
    }

    async function preloadAllImages() {
      completedCount = 0;
      failedCount = 0;

      updateLoadingStatus();

      await Promise.allSettled(
        imageElements.map(waitForImage)
      );

      slider.disabled = false;

      if (failedCount > 0) {
        loadingStatus.textContent =
          `${failedCount} image` +
          `${failedCount === 1 ? "" : "s"} unavailable`;

        return;
      }

      loadingStatus.textContent =
        "All orders loaded";

      window.setTimeout(() => {
        loadingStatus.classList.add(
          "is-finished"
        );
      }, 900);
    }

    buildTicks();
    buildImageStacks();

    /*
     * Show the selected pair immediately while the other PNGs continue
     * loading and decoding.
     */
    renderIndex(startingIndex, false);

    slider.addEventListener(
      "input",
      () => {
        queueRender(slider.value);
      }
    );

    preloadAllImages();
  })();
</script>


<style>
 .wide-interactive-svg {
  --interactive-width: 50vw;
  --interactive-max-width: 1250px;

  --interactive-padding: clamp(0.65rem, 1.3vw, 1.25rem);

  --interactive-background-fallback:
    rgb(127 127 127 / 6%);

  --interactive-background:
    color-mix(in srgb, currentColor 5%, transparent);

  --interactive-border:
    color-mix(in srgb, currentColor 10%, transparent);

  position: relative;
  left: 50%;

  width: min(
    var(--interactive-width),
    var(--interactive-max-width),
    calc(100vw - 1rem)
  );

  max-width: none;
  box-sizing: border-box;

  margin: 2rem 0;
  padding: var(--interactive-padding);

  transform: translateX(-50%);

  border: 1px solid var(--interactive-border);
  border-radius: 0.9rem;

  background: var(--interactive-background-fallback);
  background: var(--interactive-background);
}

.wide-interactive-svg object {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 1250 / 860;
}

@media (max-width: 680px) {
  .wide-interactive-svg {
    --interactive-width: calc(100vw - 0.75rem);

    margin: 1.25rem 0;
    padding: 0.65rem;
    border-radius: 0.7rem;
  }
}

.hexagon-viewer,
.large-hexagon-viewer,
.wide-interactive-svg {
  min-width: 100%;
}
  </style>
