---
number: 1
title: "Cycles & mini-notation"
goal: "Write any drum rhythm in one line."
---

## The one big idea

Everything in Strudel happens inside a **cycle**. For now, treat a cycle as **one bar**.

The rule that surprises most people: **adding more things to a cycle doesn't make it longer. It squeezes them in.**

> **Piano:** It's a 4/4 measure with a fixed length. Write 4 notes in it and they're quarter notes. Write 8 and they become eighth notes. The measure doesn't grow; the notes get shorter. Strudel does the same thing automatically, based on how many things you write.

A quick word on the code itself. `s(...)` is short for **sound**. It's a *function*, which just means "an instruction that does something with whatever's inside the parentheses." Here it's saying: *play these sounds*.

Inside the parentheses, the text in quotes is the rhythm. So `s("bd sd")` reads as "play a kick, then a snare, in one cycle." You'll see a few other functions later (like `note(...)` for pitches), but they all work the same way: a name, parentheses, and what to play inside.

> **Key idea:** Every line of Strudel mixes two languages. **Outside the quotes** are *functions*: they say **what** plays and **how** it sounds. **Inside the quotes** is *mini-notation*: it says **when**. This lesson is mostly about the inside. The section "Reading a line" near the end puts the two together.

Play these two and listen to the length of the loop. It stays the same:

```strudel title="4 sounds in a cycle"
s("bd sd bd sd")
```

```strudel title="8 sounds in the same cycle"
s("bd sd bd sd bd sd bd sd")
```

Everything inside the quotes is **mini-notation**, a compact rhythm language. The rest of this lesson covers about ten symbols. Once they're familiar, you can write almost any beat.

A quick note on names: `bd` = bass drum (kick), `sd` = snare, `hh` = closed hi-hat, `cp` = clap, `oh` = open hi-hat.

```check id="big-idea"
```

---

## 1. Space: next step

Spaces split the cycle into equal steps.

```grid
bd sd bd sd
```

```check id="space"
```

---

## 2. `~` : rest

A tilde is silence that still takes up its step.

```grid
bd ~ bd ~
```

```strudel
s("bd ~ bd ~")
```

> **Try:** Four steps = four beats, so this plays the kick on beats 1 and 3. Change it so the kick plays **only on beat 4**.

```check id="rest"
```

---

## 3. `*` : repeat faster inside one step

`hh*8` means "fit 8 hi-hats in the space of one step." When it's the only step, that's 8 per bar: eighth notes.

```grid
hh*8
```

```strudel
s("hh*8")
```

> **Try:** Change `8` to `16`. Then to `3`. You just played sixteenth notes, then a slow triplet feel.

```check id="star"
```

---

## 4. `[ ]` : split one step into smaller steps

Square brackets take **one step** and divide it. This is the most important symbol in this lesson.

```grid
bd [sd sd] bd sd
```

Four steps in the bar, but step 2 is split into two sounds, like two eighth notes squeezed into one beat.

```strudel
s("bd [sd sd] bd sd")
```

> **Piano:** A bracket is "subdivide this beat." `[a b]` = two eighths, `[a b c]` = a triplet, `[a b c d]` = four sixteenths, all within a single beat.

```grid
bd [hh hh hh] bd [hh hh hh hh]
```

> **Try:** Turn beat 4 into a triplet of snares.

```check id="brackets"
```

---

## 5. `,` : play layers at the same time

A comma stacks rhythms on top of each other, like a chord, but for rhythm. Each layer divides the cycle on its own.

```grid
bd*4, ~ cp ~ cp, hh*8
```

That's a complete house/techno beat in one line: kick on every beat, clap on 2 and 4, eighth-note hats.

```strudel title="A whole beat in one line"
s("bd*4, ~ cp ~ cp, hh*8")
```

> **Piano:** Left hand plays quarter notes and right hand plays eighths at the same time. Each hand keeps its own subdivision, but they share the same bar.

```check id="layers"
```

---

## 6. `< >` : one per cycle (changes each bar)

Angle brackets play **one item per cycle**, moving to the next item each time around.

```grid
bd sd bd <sd [sd sd]>
```

Bar 1 ends with one snare, bar 2 ends with two, then it repeats. This is how you get variation without writing it out.

```strudel
s("bd sd bd <sd [sd sd]>, hh*8")
```

> **Piano:** It works like first and second endings: the same bar, with a different last beat each time through.

> **Try:** Make it a 4-bar phrase where only bar 4 gets the fill: `<sd sd sd [sd sd sd sd]>`.

```check id="angle"
```

---

## 7. `!` and `@` : repeat and stretch

- `!` repeats a step **without** squeezing it: `bd!3 sd` = `bd bd bd sd`
- `@` makes a step **longer**: `bd@3 sd` = kick lasts 3/4 of the bar, snare the last 1/4

```grid
bd!3 sd
```

```grid
bd@3 sd
```

Compare with `*`: `bd*3 sd` squeezes three kicks into the **first half** of the bar.

```grid
bd*3 sd
```

```check id="repeat-stretch"
```

---

## 8. `?` : sometimes skip

A question mark gives a step a 50% chance of not playing. On fast hi-hats it sounds like a human drummer.

```strudel
s("bd*4, hh*16?")
```

> **Try:** `hh*16?0.2` → only a 20% chance of skipping. Try `0.8` too.

---

## 9. `( , )` : Euclidean rhythms

`bd(3,8)` = "spread 3 hits as evenly as possible over 8 steps." You'll recognize the result. It's the **tresillo**, the 3-3-2 pulse under a huge amount of dance music.

```grid
bd(3,8)
```

```strudel
s("bd(3,8), hh*8")
```

> **Try:** `(5,8)`, `(7,16)`, `(3,8,2)`. The third number shifts the start point.

```check id="euclid"
```

---

## Tempo: `setcpm`

By default one cycle lasts 2 seconds (120 BPM if you count 4 beats per bar). To set tempo in BPM, use cycles per minute: **BPM ÷ 4**.

```strudel
setcpm(130/4)
s("bd*4, ~ cp ~ cp, hh*8")
```

Techno ~125–135 · Trance ~136–140 · Drum & bass ~170–175.

---

## Reading a line: two languages

Now that you know the rhythm language, here's how a full line fits together. Take this one:

```strudel title="One line, two languages"
s("bd*4, ~ cp ~ cp").bank("RolandTR909").gain(0.8)
```

Read it left to right, like a sentence:

| Part | Language | What it says |
|---|---|---|
| `s(...)` | function | play these sounds |
| `"bd*4, ~ cp ~ cp"` | mini-notation | kick on every beat, clap on 2 and 4 |
| `.bank("RolandTR909")` | function | on a TR-909 drum machine |
| `.gain(0.8)` | function | at 80% volume |

Three rules cover almost every line you'll read:

1. **A function is a name followed by parentheses.** Whatever goes inside the parentheses is what the function works with.
2. **A dot chains the next function on.** Read `.bank(...)` as "and then use this drum machine". Each dot changes the result of everything to its left.
3. **Quotes hold text.** A rhythm (`"bd sd"`) or a name (`"RolandTR909"`) goes in quotes. A plain number (`0.8`) doesn't.

> **Piano:** The mini-notation is the notes on the page. The functions are the markings around them: which instrument, how loud, how fast. Same notes, different markings, different performance.

Most errors come from these rules being broken by one character: a missing `)`, a missing quote, or a comma where a dot should be. When Strudel shows an error, check those three first.

> **Try:** Change `0.8` to `0.3`. Then delete the whole `.gain(0.8)` and play it again. The line still works, because each chained function is optional.

```check id="reading"
```

---

## Build: your first track skeleton

`$:` starts a new independent layer, like separate tracks in a DAW. `.bank(...)` picks a drum machine. `.gain(...)` is volume (you'll learn this properly in lesson 5).

```strudel title="Techno skeleton — 130 BPM"
setcpm(130/4)
$: s("bd*4").bank("RolandTR909")
$: s("~ cp ~ cp").bank("RolandTR909")
$: s("[~ oh]*4").bank("RolandTR909").gain(0.6)
$: s("hh*16?").bank("RolandTR909").gain(0.35)
```

`[~ oh]*4` puts the open hat **on the off-beat**: the "and" of every beat. That one pattern accounts for most of the techno feel.

And a teaser for drum & bass: same symbols, different placement, much faster.

```strudel title="DnB two-step — 174 BPM"
setcpm(174/4)
$: s("bd ~ ~ ~ ~ bd ~ ~")
$: s("~ ~ sd ~ ~ ~ sd ~")
$: s("hh*8").gain(0.5)
```

> **Try (final challenge):** Take the techno skeleton and add a clap fill that happens only every 4th bar, using `< >`. Then change one kick to `bd?` somewhere, and check whether you like it.

```check id="skeleton"
```

---

## Cheat cards

### Mini-notation (inside the quotes)

| Symbol | Meaning | Example |
|---|---|---|
| space | next step (equal split) | `bd sd` |
| `~` | rest | `bd ~` |
| `*n` | n times inside one step | `hh*8` |
| `[ ]` | subdivide one step | `bd [sd sd]` |
| `,` | layers at once | `bd*4, hh*8` |
| `< >` | one per cycle | `<sd cp>` |
| `!n` | repeat, no squeeze | `bd!3 sd` |
| `@n` | stretch a step | `bd@3 sd` |
| `?` | maybe skip | `hh*16?` |
| `(k,n)` | Euclidean: k hits over n steps | `bd(3,8)` |

### Functions (outside the quotes)

| Function | What it does | Example |
|---|---|---|
| `s(...)` | play sounds by name | `s("bd sd")` |
| `.bank(...)` | choose the drum machine | `.bank("RolandTR909")` |
| `.gain(...)` | volume: 1 is normal | `.gain(0.8)` |
| `setcpm(...)` | tempo, in cycles per minute (BPM ÷ 4) | `setcpm(130/4)` |
| `$:` | not a function: starts a new layer | `$: s("bd*4")` |

About 40 functions cover almost everything in trance, techno and drum & bass. Each lesson adds a few, and this card grows with you.

**Next lesson:** sounds, banks and sample variations: making the kit sound like *your* kit.
