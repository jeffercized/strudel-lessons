import { mini } from '@strudel/mini';
import { CYCLES_TO_CHECK, labelOf } from '../grid/grid-model';

export interface Onset {
  begin: number;
  end: number;
  sound: string;
}

/** Events that start inside one cycle, with times relative to that cycle (0..1). */
export function onsets(src: string, cycle = 0): Onset[] {
  return mini(src)
    .queryArc(cycle, cycle + 1)
    .filter((h) => h.hasOnset())
    .map((h) => ({ begin: h.part.begin.valueOf() - cycle, end: h.part.end.valueOf() - cycle, sound: labelOf(h.value) }))
    .sort((a, b) => a.begin - b.begin || a.sound.localeCompare(b.sound));
}

/** A fingerprint of when each sound starts over several cycles. Throws on invalid mini-notation. */
export function rhythmKey(src: string, cycles = CYCLES_TO_CHECK): string {
  const keys: string[] = [];
  for (let c = 0; c < cycles; c++) {
    for (const e of onsets(src, c)) keys.push(`${c}:${e.begin.toFixed(6)}:${e.sound}`);
  }
  return keys.sort().join('|');
}

/** Same beat, maybe written differently: the same sounds start at the same times over 4 cycles. */
export function sameRhythm(a: string, b: string): boolean {
  try {
    return rhythmKey(a) === rhythmKey(b);
  } catch {
    return false;
  }
}

/** Sounds in the order they first appear. */
function soundRows(events: Onset[]): string[] {
  const rows: string[] = [];
  for (const e of events) if (!rows.includes(e.sound)) rows.push(e.sound);
  return rows;
}

export interface PredictAnswer {
  rows: string[];
  /** "sound@step" for every step that plays. */
  cells: Set<string>;
}

/** The correct answer for the Predict drill: which steps of cycle 1 each sound plays on. */
export function predictAnswer(src: string, steps: number): PredictAnswer {
  const events = onsets(src, 0);
  return { rows: soundRows(events), cells: new Set(events.map((e) => `${e.sound}@${Math.round(e.begin * steps)}`)) };
}

/** True when every onset lands exactly on one of the steps (so the drill is answerable). */
export function fitsSteps(src: string, steps: number): boolean {
  return onsets(src, 0).every((e) => Math.abs(e.begin * steps - Math.round(e.begin * steps)) < 1e-6);
}

export interface BuildLane {
  sound: string;
  target: Onset[];
  mine: (Onset & { match: boolean })[];
}

/** Lanes for the Build drill: the target outlined, the learner's hits marked right or wrong. */
export function buildLanes(target: string, mine: string | null): BuildLane[] {
  const t = onsets(target, 0);
  let m: Onset[] = [];
  if (mine !== null) {
    try {
      m = onsets(mine, 0);
    } catch {
      m = [];
    }
  }
  const targetKeys = new Set(t.map((e) => `${e.sound}@${e.begin.toFixed(6)}`));
  return soundRows([...t, ...m]).map((sound) => ({
    sound,
    target: t.filter((e) => e.sound === sound),
    mine: m.filter((e) => e.sound === sound).map((e) => ({ ...e, match: targetKeys.has(`${sound}@${e.begin.toFixed(6)}`) })),
  }));
}
