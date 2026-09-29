import { mini, type Hap } from '@strudel/mini';
import { splitLayers } from './split-layers';

export interface GridEvent {
  begin: number;
  end: number;
  label: string;
  /** True for the tail of a note that started in an earlier cycle (e.g. bd/2). */
  held?: boolean;
}

export interface GridSegment {
  begin: number;
  end: number;
  /** null means a rest. */
  label: string | null;
  held?: boolean;
}

export interface GridCycle {
  /** "cycle 1" etc. when the pattern changes between cycles, otherwise null. */
  label: string | null;
  rows: GridSegment[][];
}

export interface GridModel {
  cycles: GridCycle[];
}

export const CYCLES_TO_CHECK = 4;
const EPS = 1e-9;

export function labelOf(value: unknown): string {
  if (Array.isArray(value)) return value.map(String).join(':');
  if (value !== null && typeof value === 'object') {
    const v = value as Record<string, unknown>;
    if (v.s !== undefined) return String(v.s);
    if (v.note !== undefined) return String(v.note);
    return JSON.stringify(value);
  }
  return String(value);
}

/** Turn Strudel haps from one cycle into events with times relative to that cycle (0..1). */
export function eventsFromHaps(haps: Hap[], cycle: number): GridEvent[] {
  return haps
    .map((h) => ({
      begin: h.part.begin.valueOf() - cycle,
      end: h.part.end.valueOf() - cycle,
      label: labelOf(h.value),
      ...(h.hasOnset() ? {} : { held: true }),
    }))
    .sort((a, b) => a.begin - b.begin || a.end - b.end);
}

export function queryCycle(src: string, cycle: number): GridEvent[] {
  return eventsFromHaps(mini(src).queryArc(cycle, cycle + 1), cycle);
}

/** Put overlapping events on separate lanes so no two boxes overlap. Input must be sorted by begin. */
export function assignLanes(events: GridEvent[]): GridEvent[][] {
  const lanes: GridEvent[][] = [];
  for (const e of events) {
    const lane = lanes.find((l) => l[l.length - 1].end <= e.begin + EPS);
    if (lane) lane.push(e);
    else lanes.push([e]);
  }
  return lanes.length > 0 ? lanes : [[]];
}

/** Fill the gaps between events (and at the ends) with rest segments. */
export function fillRests(events: GridEvent[]): GridSegment[] {
  const out: GridSegment[] = [];
  let t = 0;
  for (const e of events) {
    if (e.begin > t + EPS) out.push({ begin: t, end: e.begin, label: null });
    out.push(e);
    t = e.end;
  }
  if (t < 1 - EPS) out.push({ begin: t, end: 1, label: null });
  return out;
}

function rowsForCycle(layers: string[], cycle: number): GridSegment[][] {
  return layers.flatMap((layer) => assignLanes(queryCycle(layer, cycle)).map(fillRests));
}

function sameRows(a: GridSegment[][], b: GridSegment[][]): boolean {
  const key = (rows: GridSegment[][]) =>
    JSON.stringify(rows.map((r) => r.map((s) => [s.begin.toFixed(9), s.end.toFixed(9), s.label, s.held === true])));
  return key(a) === key(b);
}

/** Build the diagram model. Throws if the mini-notation is invalid. */
export function buildGridModel(src: string): GridModel {
  const layers = splitLayers(src);
  const perCycle = Array.from({ length: CYCLES_TO_CHECK }, (_, c) => rowsForCycle(layers, c));
  if (perCycle.every((rows) => sameRows(rows, perCycle[0]))) {
    return { cycles: [{ label: null, rows: perCycle[0] }] };
  }
  return { cycles: perCycle.map((rows, i) => ({ label: `cycle ${i + 1}`, rows })) };
}
