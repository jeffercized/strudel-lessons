---
number: 2
title: "Sounds, banks & variations"
goal: "Pick a kit that sounds like the genre, and make it feel played, not programmed."
---

## The one big idea

In Lesson 1 you wrote **when** things play. This lesson is about **what** plays.

Every sound in Strudel has three parts you can change on their own:

1. **The name**: `bd`, `hh`, `cp`. What kind of drum it is.
2. **The bank**: `RolandTR909`, `RolandTR808`. Which drum machine it comes from.
3. **The variation**: `:0`, `:1`, `:2`. Which recording of that drum, within the machine.

> **Piano:** The name is the note, the bank is the instrument (a Steinway vs. a Rhodes vs. a Wurlitzer), and the variation is like choosing between two different recordings of that instrument. Same note, same rhythm, but it feels completely different.

---

## 1. The drum names worth knowing

| Name | Drum | Where it usually goes |
|---|---|---|
| `bd` | kick (bass drum) | the pulse |
| `sd` | snare | beats 2 and 4 |
| `cp` | clap | beats 2 and 4 (instead of, or with, the snare) |
| `rim` | rimshot | ghost notes, fills |
| `hh` | closed hi-hat | the steady ticking |
| `oh` | open hi-hat | off-beats |
| `rd` | ride cymbal | a brighter steady ticking |
| `cr` | crash cymbal | the first beat of a new section |
| `lt` `mt` `ht` | low / mid / high tom | fills |
| `perc` `cb` `sh` `tb` | percussion, cowbell, shaker, tambourine | extra texture |

```strudel title="Every drum, one at a time"
s("bd sd cp rim hh oh rd cr lt mt ht cb")
```

> **Try:** Replace the whole line with just the sounds you'd want in a techno track. Keep it to four or five.

---

## 2. `.bank()` : pick the drum machine

Without a bank, you get Strudel's default samples. Add `.bank(...)` and every sound in the pattern comes from that machine.

```strudel title="Same beat, no bank"
s("bd*4, ~ cp ~ cp, [~ oh]*4")
```

```strudel title="Same beat, TR-909"
s("bd*4, ~ cp ~ cp, [~ oh]*4").bank("RolandTR909")
```

```strudel title="Same beat, TR-808"
s("bd*4, ~ cp ~ cp, [~ oh]*4").bank("RolandTR808")
```

The rhythm didn't change. The genre almost did.

**Cheat sheet for your genres:**

- **Techno, trance, house** → `RolandTR909`. Punchy kick, crisp hats. This is the sound.
- **Hip-hop, trap, deep bass** → `RolandTR808`. Boomy kick that rings out.
- **80s / synth-pop flavor** → `RolandTR707`, `AkaiLinn`
- **Lo-fi, quirky** → `RolandTR505`, `RolandCompurhythm1000`

> **Heads-up:** Not every machine has every drum. If a sound goes silent after you add a bank, that machine doesn't have it. On strudel.cc, the **sounds** tab lists what each bank contains.

---

## 3. Different banks on different layers

Real tracks mix machines. Put each drum on its own `$:` line and give each line its own bank.

```strudel title="909 hats over an 808 kick"
setcpm(128/4)
$: s("bd*4").bank("RolandTR808")
$: s("~ cp ~ cp").bank("RolandTR909")
$: s("[~ oh]*4").bank("RolandTR909")
$: s("hh*16").bank("RolandTR909").gain(0.4)
```

> **Try:** Swap the kick's bank to `RolandTR909`. Which one would you put under a trance lead? Which one under a bassline?

---

## 4. `:n` : pick a variation

Most sounds come in several recordings. Add a colon and a number after the name to choose one. No number means `:0`.

```strudel title="Four different 909 hi-hats"
s("hh:0 hh:1 hh:2 hh:3").bank("RolandTR909")
```

Numbers that are too high wrap around to the start, so nothing breaks if you guess.

### The audition trick

Finding the right kick by hand is slow. Let Strudel play a different one each bar:

```strudel title="Audition: a new kick every bar"
s("bd*4").bank("RolandTR909").n("<0 1 2 3 4 5>")
```

`.n(...)` is another way to set the variation. Putting `< >` inside means "a different one every cycle". Listen, and when you hear the one you like, count which bar it was and write it in: `bd:3`.

> **Try:** Run the same trick on the clap: `s("~ cp ~ cp").bank("RolandTR909").n("<0 1 2 3>")`.

---

## 5. `.gain()` : volume, and why it makes drums feel human

`.gain(...)` is volume. `1` is normal, `0.5` is roughly half, `0` is silent. Above `1` gets loud fast, so go easy.

Where it gets musical: **gain can be a pattern too.** Each value lines up in time with the drum hits.

```strudel title="Flat hats — every hit the same"
s("bd*4, hh*8").bank("RolandTR909")
```

Put the hats on their own layer, so the gain pattern shapes only them:

```strudel title="Accented hats — strong, weak, medium, weak"
$: s("bd*4").bank("RolandTR909")
$: s("hh*16").bank("RolandTR909").gain("[0.8 0.3 0.5 0.3]*4")
```

> **Piano:** This is velocity. A pianist never plays every note at the same force, and a machine that does sounds stiff. A pattern like `0.8 0.3 0.5 0.3` is exactly how your hand accents sixteenths: strong on the beat, weak in between, medium on the "and".

> **Try:** Change the gain pattern to `[0.3 0.3 0.8 0.3]*4` so the accent lands on the off-beat. That's a different groove from the same notes.

---

## 6. `.speed()` : pitch a drum up or down

`.speed(...)` plays the sample faster or slower, which also changes its pitch. `2` = an octave up, `0.5` = an octave down, and a negative number plays it **backwards**.

```strudel title="Pitched-down, heavier kick"
s("bd*4").bank("RolandTR909").speed(0.8)
```

```strudel title="A tom fill that climbs"
s("~ ~ ~ [lt lt lt lt]").bank("RolandTR909").speed("[1 1.2 1.5 2]")
```

```strudel title="Reverse cymbal into the next bar"
s("~ ~ ~ cr").bank("RolandTR909").speed(-1)
```

---

## 7. Crash on bar 1: combining what you know

A crash on the first beat of every 4th bar tells the listener "new section". Use `< >` from Lesson 1: three empty bars, then one with a crash.

```grid
<cr ~ ~ ~>
```

Cycle 1 has the crash; cycles 2–4 are empty. Then it starts over.

```strudel title="Crash every 4 bars"
setcpm(132/4)
$: s("bd*4").bank("RolandTR909")
$: s("~ cp ~ cp").bank("RolandTR909")
$: s("[~ oh]*4").bank("RolandTR909").gain(0.6)
$: s("<cr ~ ~ ~>").bank("RolandTR909").gain(0.7)
```

---

## Build: a kit that sounds like *your* track

Start from the Lesson 1 techno skeleton and make three decisions: **which kick** (audition it), **which hats** (pick a variation), and **how they're accented** (gain pattern).

```strudel title="Techno kit — make it yours"
setcpm(130/4)
$: s("bd:1*4").bank("RolandTR909")
$: s("~ cp ~ cp").bank("RolandTR909").gain(0.9)
$: s("[~ oh:1]*4").bank("RolandTR909").gain(0.55)
$: s("hh:2*16?0.2").bank("RolandTR909").gain("[0.6 0.25 0.4 0.25]*4")
$: s("<cr ~ ~ ~>").bank("RolandTR909").gain(0.6)
$: s("~ ~ ~ <~ ~ ~ [rim rim rim]>").bank("RolandTR909").gain(0.5)
```

The last line is a rimshot fill that only happens on bar 4, right before the crash comes back. That's a phrase, not a loop.

> **Try (final challenge):**
> 1. Audition the kick with `.n("<0 1 2 3>")` and lock in your favorite.
> 2. Swap the whole kit to `RolandTR808` and listen. Then swap only the kick back to 909.
> 3. Make the rimshot fill climb in pitch with `.speed(...)`.

---

## Cheat card

| Code | What it does | Example |
|---|---|---|
| `s("…")` | play sounds by name | `s("bd sd")` |
| `.bank("…")` | choose the drum machine | `.bank("RolandTR909")` |
| `name:n` | choose a variation | `hh:2` |
| `.n("…")` | choose variations as a pattern | `.n("<0 1 2 3>")` |
| `.gain(…)` | volume, can be a pattern | `.gain("[1 0.5]*4")` |
| `.speed(…)` | pitch up/down, negative = reverse | `.speed(0.8)` |
| `$:` + own `.bank()` | mix machines per layer | 808 kick, 909 hats |

**Next lesson:** notes, scales and chords. Your piano hands finally get to do something.
