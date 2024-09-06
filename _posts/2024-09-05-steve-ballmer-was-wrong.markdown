---
layout: post
title: "Steve Ballmer was wrong"
date: 2024-09-05 22:00:00 +0200
categories: puzzles math
comments: "yes"
d3: "no"
mathjax: "yes"
---

A few days ago John Graham-Cumming posted about ["Steve Ballmer’s incorrect binary search interview question"](https://blog.jgc.org/2024/09/steve-ballmers-binary-search-interview.html) which [drew a lot of attention](https://news.ycombinator.com/item?id=41434637) on Hacker News. The Ballmer's favorite brain teaser goes like this:

>_I'm thinking of a number between 1 and 100. You can guess, after each guess I'll tell you whether you're high or low. You get it the first guess - I'll give you five bucks. Four bucks, three, two, one, zero, you pay me a buck, you pay me two, you pay me three_. 
> 
> _Should you accept to play this game?_

Steve Ballmer argues in [this YouTube interview](https://youtu.be/svCYbkS0Sjk?si=89kJu8Ukkr9QpkFX&t=34) that there are two reasons why you should not play this game:

1. There are many numbers that would result in a loss, making the expected value negative even if he randomly picks numbers between 1 and 100.
2. He can strategically pick numbers that would require the longest time for you to find using binary search.

However, John counters Ballmer's first point in his [blog post](https://blog.jgc.org/2024/09/steve-ballmers-binary-search-interview.html) by demonstrating that if Ballmer selects the number randomly, the expected value of the game is actually positive: **$0.20**.

I will refute the second point and demonstrate that the expected value of the game is positive regardless of Ballmer's strategy.

## How can Ballmer pick numbers adversarially?

Let's assume you always employ the binary search strategy to find the number. Out of the 100 numbers, there are 37 that would require you to ask 6 questions to make a guess.

If Ballmer is aware of your strategy, he can always select one of these "losing" numbers, resulting in a loss for you in every game.

This holds true for any "fixed" search pattern. There will always be at least 37 numbers that would result in a loss, and Ballmer can choose one of them.

## How can you counter?

Here we're getting into the **game theory** territory.

Instead of using a single fixed search pattern, you can prepare a set of different search patterns. Then at the beginning of the game, draw one of these patterns with some probability and stick to it during the game.

> [In game theory](https://en.wikipedia.org/wiki/Strategy_(game_theory)#Pure_and_mixed_strategies), you call it a **mixed strategy** based on the **strategy set** of multiple **pure strategies**.

Because the same number could be "winning" for one search pattern and "losing" for another, such a mixed strategy could "even out" the expected winnings for each number.

Potentially, a mixed strategy could even make every number "winning", i.e. have a positive expected value of the win for every number.

And this is exactly what we're looking for!

## How to find the winning mixed strategy?

> Note: We are looking for _any_ winning strategy, not the _best_ winning strategy that has the maximum expected value in the worst case, i.e., the [Nash equilibrium](https://en.wikipedia.org/wiki/Nash_equilibrium).
>
> If you are curious about the Nash equilibrium, Arthur O'Dwyer explored the closed solutions for the game [up to 5 numbers](https://quuxplusone.github.io/blog/2024/09/04/the-game-is-flawed/), and Bo Waggoner approximated the equilibrium value [for the game of 100 numbers](https://bowaggoner.com/blahg/2024/09-06-adversarial-binary-search/) using [no-regret online learning](https://bowaggoner.com/courses/gradalg/notes/lect14-noregret.pdf).

Finding the mixed strategy that wins on every number can be viewed as a mathematical optimization problem.

Every strategy can be described as a "win" vector $V = (v_1, .., v_{100})$, where $v_k$ is the expected win if Ballmer picks the number $k$. For example, the binary search could correspond to a vector with $v_{50} = 5$, $v_{25} = 4$, and $v_{0} = -1$.

Suppose we have a set of pure strategies $\{V_1, V_2, ..., V_n\}$, and our mixed strategy chooses the strategy $V_k$ with probability $p_k$.

Then the corresponding "win" vector for the mixed strategy is just a linear combination: $V_{mixed}=\sum_{i=1}^{n}{p_iV_i}$.

In this interpretation, finding the winning strategy means finding some linear combination of the given vectors with two constraints:

- Each element of the linear combination is positive (the strategy wins money, on average, for each number).
- The coefficients of this linear combination are non-negative (as they correspond to probabilities).

This is a typical [linear programming](https://en.wikipedia.org/wiki/Linear_programming) problem, and scipy [has an efficient solver](https://docs.scipy.org/doc/scipy/reference/generated/scipy.optimize.linprog.html) for it.

To find a mixed strategy, I thought of a set of pure strategies (various binary searches), [fed it](https://github.com/gukoff/ballmer_puzzle/blob/main/main.py#L98) into `scipy.linprog()`, and voilà - the solver came up with a winning strategy!

## Example winning strategy

> Full code is at [gukoff/ballmer_puzzle](https://github.com/gukoff/ballmer_puzzle#winning-strategy).

> Note: the initial result of $0.07 was significantly improved by Arthur O'Dwyer who [added](https://github.com/gukoff/ballmer_puzzle/pull/1) new pure strategies. 

- Average win if Ballmer chooses randomly: **$0.16**
- Worst win if Ballmer chooses adversarially: **$0.14**

The resulting mixed strategy goes like this:

```
- With probability 0.4714%: Binary search, first guess 29. On each step, guess the middle element in the interval. In case of tie, guess the left one.
- With probability 0.1691%: Binary search, first guess 33. On each step, guess the middle element in the interval. In case of tie, guess the left one.
- With probability 0.1299%: Binary search, first guess 36. On each step, guess the middle element in the interval. In case of tie, guess the right one.
- With probability 3.3341%: Binary search, first guess 37. On each step, guess the middle element in the interval. In case of tie, guess the right one.
- With probability 1.7818%: Binary search, first guess is 43. On each step, guess the rightmost element in the interval that won't increase the worst-case complexity.
- With probability 1.1608%: Binary search, first guess is 44. On each step, guess the leftmost element in the interval that won't increase the worst-case complexity.
- With probability 2.1310%: Binary search, first guess is 42. On each step, guess the endmost element in the interval that won't increase the worst-case complexity.

...
```

The complete strategy consists of 74 lines, which I have omitted for brevity. If you are interested, you can [view it on GitHub](https://github.com/gukoff/ballmer_puzzle?tab=readme-ov-file#winning-strategy).

## Conclusion

If you find winning (on average) 14 cents per game worth your time, then you should definitely play this game with Steve Ballmer the next time he offers.
