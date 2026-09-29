import { mini } from '@strudel/mini';
import { escapeHtml } from '../escape-html';

export interface ParsedLine {
  mini: string;
  bank: string | null;
  gain: number | null;
  speed: number | null;
}

/** Messages are HTML (they contain <code>), ready to show to the learner. */
export type LineResult = ParsedLine | { error: string };

export function isError(r: LineResult): r is { error: string } {
  return 'error' in r;
}

const PAIRS: Record<string, string> = { '[': ']', '<': '>' };
const NAMES: Record<string, string> = { '[': 'a square bracket', '<': 'an angle bracket' };

/** Friendlier words for the most common rhythm mistakes, before the real parser's message. */
function rhythmError(src: string): string | null {
  if (src.trim() === '') return 'The rhythm is empty. Put some sounds between the quotes.';
  const open: string[] = [];
  for (const ch of src) {
    if (ch in PAIRS) open.push(ch);
    else if (ch === ']' || ch === '>') {
      const last = open.pop();
      if (last === undefined || PAIRS[last] !== ch) return `Unexpected "${ch}" — there's no matching opening bracket`;
    }
  }
  const last = open.pop();
  if (last !== undefined) return `Missing ${PAIRS[last]} — ${NAMES[last]} was opened but never closed`;
  try {
    mini(src).queryArc(0, 1);
    return null;
  } catch (err) {
    return err instanceof Error ? err.message : String(err);
  }
}

/**
 * Check a practice line: s("…") with optional .bank("…"), .gain(n) and .speed(n).
 * Ported from the original practice prototype: same checks in the same order.
 */
export function parseLine(code: string): LineResult {
  const t = code.trim().replace(/;$/, '').trim();
  if (!t) return { error: 'Type a line first.' };
  if (/^S\s*\(/.test(t)) return { error: 'Capital S. Strudel is case-sensitive, so <code>S</code> and <code>s</code> are different names.' };
  if (!/^s\s*\(/.test(t)) return { error: 'A line starts with a function, like <code>s(…)</code>.' };
  const quotes = (t.match(/"/g) ?? []).length;
  if (quotes % 2) return { error: 'A quote is missing. Quotes always come in pairs: <code>"…"</code>.' };
  let depth = 0;
  let inQuotes = false;
  for (const ch of t) {
    if (ch === '"') inQuotes = !inQuotes;
    else if (!inQuotes) {
      if (ch === '(') depth++;
      if (ch === ')') depth--;
      if (depth < 0) break;
    }
  }
  if (depth > 0) return { error: 'Missing <code>)</code>. Every <code>(</code> needs a closing <code>)</code>.' };
  if (depth < 0) return { error: 'There is an extra <code>)</code> with no <code>(</code> to match it.' };
  if (/^s\s*\(\s*[^"\s)]/.test(t)) {
    return { error: 'The rhythm needs quotes around it, like <code>s("bd sd")</code>. Without quotes Strudel reads <code>bd</code> as code, not a sound.' };
  }
  if (/\)\s+[A-Za-z]+\s*\(/.test(t)) return { error: 'Missing dot. Chain the next function with a dot, like <code>.bank(…)</code>.' };
  if (/\)\s*,\s*[A-Za-z.]+\s*\(/.test(t)) return { error: 'That comma should be a dot. Functions chain with <code>.</code>, not <code>,</code>.' };
  const m = /^s\s*\(\s*"([^"]*)"\s*\)((?:\s*\.\s*[A-Za-z]+\s*\([^()]*\))*)$/.exec(t);
  if (!m) return { error: 'That line doesn\'t have the shape <code>s("…")</code> yet.' };

  const res: ParsedLine = { mini: m[1], bank: null, gain: null, speed: null };
  for (const [, fn, argRaw] of m[2].matchAll(/\.\s*([A-Za-z]+)\s*\(([^()]*)\)/g)) {
    const arg = argRaw.trim();
    if (fn === 'bank') {
      if (!/^"[^"]*"$/.test(arg)) return { error: 'The bank name needs quotes, like <code>.bank("RolandTR909")</code>.' };
      res.bank = arg.slice(1, -1);
    } else if (fn === 'gain' || fn === 'speed') {
      const n = Number(arg);
      if (arg === '' || Number.isNaN(n)) return { error: `<code>.${fn}()</code> takes a number here, like <code>.${fn}(0.8)</code>.` };
      res[fn] = n;
    } else {
      return { error: 'Practice lines only use <code>.bank</code>, <code>.gain</code> and <code>.speed</code>.' };
    }
  }
  const rhythm = rhythmError(res.mini);
  if (rhythm) return { error: `In the rhythm: ${escapeHtml(rhythm)}` };
  return res;
}

/** Strudel code for a line that passed parseLine (normalised spacing). */
export function lineToCode(line: ParsedLine): string {
  let code = `s(${JSON.stringify(line.mini)})`;
  if (line.bank !== null) code += `.bank(${JSON.stringify(line.bank)})`;
  if (line.gain !== null) code += `.gain(${line.gain})`;
  if (line.speed !== null) code += `.speed(${line.speed})`;
  return code;
}
