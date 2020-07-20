---
layout: post
title:  "Jane Street puzzle: Circle Time!"
date:   2020-07-18 17:00:00 +0200
categories: Jane Street puzzles
d3: "yes"
mathjax: "yes"
custom_js:
  - jane_street_june_2020/drawings.js
---

Every month Jane Street, a quantitative trading firm, posts a math puzzle on their website. 
How cool is that?

In June, they posted a 
[Circle Time](https://www.janestreet.com/puzzles/circle-time/) 
puzzle which I found quite fun to solve. This is this kind of a puzzle which looks easy at first, 
hard when you start working at it, and easy again when you finally find the solution.

There are two solutions available online: a
[closed form solution](https://medium.com/@dhrumilp15/jane-street-june-20-circle-time-107876577b09)
that uses analytic geometry and an 
[approximate solution](https://willemhoek.com/b/Solving-Jane-Street-Puzzle-June-2020). 
The former is really heavyweight, and the latter feels like cheating to me :)

Actually, this puzzle doesn't require anything other than the ___middle-school math___ to solve!

Let's get to it. The puzzle goes as follows:

> Call a “ring” of circles a collection of six circles of equal radius, say r, whose centers lie on 
> the six vertices of a regular hexagon with side length 2r. This makes each circle tangent to its 
> two neighbors, and we can call the center of the regular hexagon the “center” of the ring of 
> circles. If we are given a circle C, what is the maximum proportion of the area of that circle 
> we can cover with rings of circles entirely contained within C that all are mutually disjoint 
> and share the same center?

Let me visualize it for you. The "ring" inscribed in a circle looks like this:

<div id="drawing1"></div>

Now we want to stuff the circle with the "rings" so that they don't overlap and cover the
maximum possible area. It's fairly easy to prove that the optimal coverage looks like this:

<div id="drawing2"></div>

Indeed, if there was another optimal coverage where two consecutive rings weren't inscribed
as tightly as here, whey would touch each other in 0 or 6 points instead of 12. In case of
6 touching points you could rotate the inner ring a little so that it doesn't touch 
the outer ring at all. Then you could upscale it (and all rings inside it) until it touches the
outer ring again. This little manipulation would yield a new valid coverage of a bigger area,
which means this coverage was not optimal.

Notice that the optimal coverage is infinitely self-similar. Every ring is inscribed in another ring
in exactly the same fashion. This means, every ring's area is $X$ times smaller than the previous one.
Their areas form a geometric series, and the total area is the sum of this series. If the area of the
outermost ring is $A$, [the sum](https://en.wikipedia.org/wiki/Geometric_series#Formula) 
is $\frac{A}{1 - X}$.

Let the radius of the large circle be 1. 
It doesn’t affect the result in any way but will make the calculations more brief.

Now the area of the outermost ring is easy to find. Every circle in this ring has a radius 3 times
less than the radius of the big circle - $\large \frac{1}{3}$. This means, area of the ring is 
$6 * \pi * (\frac{1}{3})^2 = \frac{2}{3}\pi$. The area of the big circle is just $\pi$.

The answer to the problem simplifies to  $\large \frac{\frac{2}{3}\pi}{1-X} / \pi = \frac{2}{3(1-X)}$.
If we knew $X$, we would know the answer.

---

So, what is the value of $X$?

Remember how $X$ is a relation of the areas of 2 consecutive rings? Let's say the inner ring is 
built of the circles of radius $r$, and the outer ring - of radius $R$. Then $X = \large (\frac{r}{R})^2$, 
because [areas relate as squares of lengths](https://en.wikipedia.org/wiki/Square%E2%80%93cube_law).

Finding $\large \frac{r}{R}$ is the cornerstone of this puzzle. 
And all you need for it is... the Pythagorean theorem! 

Look at the top-right quadrant of the picture. 

<div id="drawing3"></div>

Notice 3 things here:

1. - $DE = EB = AB = r$;
   - $BC = r + R$;
   - $OC = 1 - R = \frac{2}{3}$.
   <br><br>

2. $\bigtriangleup OBD$ is equilateral because it's $\frac{1}{6}$ of a hexagon on a bigger picture.
   We already know that its side $DB = 2r$.
   
   This means, its height $OE = \sqrt{3}r$. 

3. $\bigtriangleup OAB = \bigtriangleup OEB$ because they have identical 2 sides and an angle. 

   This means, $OA = OE = \sqrt{3}r$. In turn, $AC = OC - OA = \frac{2}{3} - \sqrt{3}r$
   <br><br>

Voila, we know all sides of $\bigtriangleup ABC$. Now apply the Pythagorean theorem and get the answer:

$r^2 + (R - \sqrt{3}r)^2 = (r + R)^2$

$3r^2 + 3R^2 - (4\sqrt{3} + 2)rR = 0$

$3(\frac{r}{R})^2 - (4\sqrt{3} + 2)\frac{r}{R} + 3 = 0$

$\Large{\frac{r}{R} = \frac{2\sqrt{3} + 1}{3} \pm \frac{2\sqrt{1+\sqrt{3}}}{3}}$


Our quadratic equation has 2 roots. One of them is $\large\frac{r}{R}$ (the one that's less than $1$), and the other,
interestingly enough, is $\large\frac{R}{r}$!

---

Te rest is simple. We already know that the answer is $\large \frac{2}{3(1-X)}$, $\large X = (\frac{r}{R})^2$ and 
$\large \frac{r}{R} = \frac{2\sqrt{3} + 1}{3} - \frac{2\sqrt{1+\sqrt{3}}}{3}$. 

Combined, this gives us:


$\Large \frac{2}{3(1-(\frac{2\sqrt{3} + 1}{3} - \frac{2\sqrt{1+\sqrt{3}}}{3})^2)} =$

$\Large = \frac{1.5}{\sqrt{25 + 17 \sqrt{3}} - 2 \sqrt{3} - 2} \approx 0.783464$
