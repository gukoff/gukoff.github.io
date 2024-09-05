---
layout: post
title: "Steve Ballmer was wrong"
date: 2024-09-05 22:00:00 +0200
categories: puzzles math
d3: "no"
mathjax: "yes"
---

A few days ago John Graham-Cumming posted about ["Steve Ballmer’s incorrect binary search interview question"](https://blog.jgc.org/2024/09/steve-ballmers-binary-search-interview.html). The Ballmer's favorite brain teaser goes like this:

>_I'm thinking of a number between 1 and 100. You can guess, after each guess I'll tell you whether you're high or low. You get it the first guess - I'll give you five bucks. Four bucks, three, two, one, zero, you pay me a buck, you pay me two, you pay me three_. 
> 
> _Should you accept to play this game?_

Steve Ballmer [in this interview on YouTube](https://youtu.be/svCYbkS0Sjk?si=89kJu8Ukkr9QpkFX&t=34) tells that you should not play this game for 2 reasons:

1. There are a lot of numbers that would lose you money, and the expected value is negative even if he picks values between 1 and 100 at random.
2. He can also pick the number adversarially, i.e. pick the numbers that will take the longest for you to get with binary search.

In his post, John [refutes](https://blog.jgc.org/2024/09/steve-ballmers-binary-search-interview.html) the first point and shows that if Ballmer picks the number randomly, the expected
value of the game is positive: **$0.20**.

I will refute the second point and show that the expected
value of the game is positive in general.

You can win money no matter the Ballmer's strategy.

## How can Ballmer choose numbers adversarially?

Let's say you always try to find the number using the binary search.There are 32 out of the 100 numbers, that you need to ask 6 questions to guess.

Assuming Ballmer knows your strategy, he can always pick one of these "losing" numbers, and you'll lose money on every game.

This is true for any "fixed" search pattern. There will be at least 32
numbers that lose you money, and Ballmer can pick one of them.

## How can you counter?

Here we're getting into the **game theory** territory.

Instead of using a single fixed search pattern, you can prepare a set of different search patterns. Then in the beginning of the game draw one of these patterns with some probability and stick to it during the game.

> [In game theory](https://en.wikipedia.org/wiki/Strategy_(game_theory)#Pure_and_mixed_strategies), you call it a **mixed strategy** based on the **strategy set** of multiple **pure strategies**.

Because the same number could be "winning" for one search pattern and "losing" for another, such a mixed strategy could "even out" the expected winnings for each number.

Potentially, a mixed strategy could even make every number "winning", i.e. have a positive expected value of the win for every number.

And this is exactly what we're looking for!

## How to find the winning mixed strategy?

> Note: we're looking for _any_ winning strategy, not
the _best_ winning strategy that has maximum expected value in the worst case, i.e. the [Nash equilibrium](https://en.wikipedia.org/wiki/Nash_equilibrium). If you're curious about the Nash equilibrium,Arthur O'Dwyer explored it for the game [up to 5 numbers](https://quuxplusone.github.io/blog/2024/09/04/the-game-is-flawed/).

Finding the mixed strategy that wins on every number can be viewed as a mathematical optimization problem.

Every strategy can be described as a "win" vector $V = (v_1, .., v_{100})$, where $v_k$ is the expected win should Ballmer pick the number $k$. For example, the binary search could correspond to a vector with $v_{50} = 5$, $v_{25} = 4$ and $v_{0} = -1$.

Suppose we have a set of pure strategies $\{V_1, V_2, ..., V_n\}$,
and our mixed strategy chooses the strategy $V_k$ with probabiltiy $p_k$.

Then the corresponding "win" vector for the mixed strategy is
just a linear combination of these vectors: $V_{mixed}=\sum_{i=1}^{n}{p_iV_i}$.

In this interpretation, finding the winning strategy means to find some linear combination of the given vectors with 2 constraints:

- each element of the linear combination is positive (the strategy wins money, on average, for each number);
- the coefficients of this linear combination are non-negative (as they correspond to probabilities).

This is a typical [linear programming](https://en.wikipedia.org/wiki/Linear_programming) problem,
and scipy [has an efficient solver](https://docs.scipy.org/doc/scipy/reference/generated/scipy.optimize.linprog.html) for it!

To find a strategy, I thought of a strategy set (various binary searches), fed it to `scipy.linprog()`,
and voilà - the solver came up with a winning mixed strategy!

## Example winning strategy

> Full code is at [gukoff/ballmer_puzzle](https://github.com/gukoff/ballmer_puzzle#winning-strategy).

- Average win if Ballmer chooses randomly: **$0.12**
- Worst win if Ballmer chooses adversarially: **$0.07**

The resulting mixed strategy goes like this:

```
- With probability 0.2120%: Binary search, first guess is 29. On each step, guess the middle element in the interval, in case of tie guess the left one.
- With probability 0.0450%: Binary search, first guess is 33. On each step, guess the middle element in the interval, in case of tie guess the left one.
- With probability 0.9843%: Binary search, first guess is 26. On each step, guess the middle element in the interval, in case of tie guess the right one.
- With probability 0.6910%: Binary search, first guess is 28. On each step, guess the middle element in the interval, in case of tie guess the right one.
- With probability 0.9686%: Binary search, first guess is 1. On each step, guess the rightmost element in the interval that won't increase the worst-case complexity.
- With probability 0.7134%: Binary search, first guess is 18. On each step, guess the rightmost element in the interval that won't increase the worst-case complexity.
- With probability 2.7288%: Binary search, first guess is 46. On each step, guess the rightmost element in the interval that won't increase the worst-case complexity.
- With probability 2.6411%: Binary search, first guess is 36. On each step, guess the leftmost element in the interval that won't increase the worst-case complexity.
- With probability 5.2209%: Binary search, first guess is 40. On each step, guess the leftmost element in the interval that won't increase the worst-case complexity.

...
```

The full strategy has 60 lines that I omit for brevity. If you're curious, you can [view it on GitHub](https://github.com/gukoff/ballmer_puzzle?tab=readme-ov-file#winning-strategy).

## Conclusion

If you consider winning (at least) 7 cents per game a good use of your time, you should absolutely play this game with Steve Ballmer next time he offers.
