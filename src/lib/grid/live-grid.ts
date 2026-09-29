import { assignLanes, fillRests, type GridEvent, type GridModel } from './grid-model';

/** Group a whole program's events by sound name: one row (or more, if overlapping) per sound. */
export function buildLiveModel(events: GridEvent[]): GridModel {
  const bySound = new Map<string, GridEvent[]>();
  for (const e of [...events].sort((a, b) => a.begin - b.begin)) {
    const list = bySound.get(e.label) ?? [];
    list.push(e);
    bySound.set(e.label, list);
  }
  const rows = [...bySound.values()].flatMap((list) => assignLanes(list).map(fillRests));
  return { cycles: [{ label: null, rows }] };
}
