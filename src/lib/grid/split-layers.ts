const OPEN = '[<({';
const CLOSE = ']>)}';

/** Split mini-notation into its top-level comma layers ("a, b" -> ["a", "b"]). */
export function splitLayers(src: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of src) {
    if (OPEN.includes(ch)) depth++;
    else if (CLOSE.includes(ch)) depth = Math.max(0, depth - 1);
    if (ch === ',' && depth === 0) {
      parts.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  parts.push(current);
  return parts.map((p) => p.trim()).filter((p) => p.length > 0);
}
