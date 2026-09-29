/** Read options from a fence info string, e.g. ```strudel title="Four on the floor" or ```check id="brackets". */
export function parseMeta(meta: string | null | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of (meta ?? '').matchAll(/(\w+)="([^"]*)"/g)) out[m[1]] = m[2];
  return out;
}
