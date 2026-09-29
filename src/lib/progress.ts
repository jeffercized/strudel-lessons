export interface Heading {
  depth: number;
  slug: string;
  text: string;
}

export interface Section {
  slug: string;
  title: string;
  /** For the progress strip, e.g. "4. [ ]". */
  short: string;
}

/** Sections that are reference, not learning, and never need marking complete. */
const REFERENCE = /^cheat cards?$/i;

/** Every `##` section of a lesson that can be marked complete. */
export function lessonSections(headings: Heading[]): Section[] {
  return headings
    .filter((h) => h.depth === 2 && !REFERENCE.test(h.text.trim()))
    .map((h) => ({ slug: h.slug, title: h.text.trim(), short: shortTitle(h.text) }));
}

/** "4. [ ] : split one step" -> "4. [ ]"; "Tempo: setcpm" -> "Tempo". */
export function shortTitle(text: string): string {
  const t = text.trim();
  const m = /^(\d+\.)\s*(.*)$/.exec(t);
  const num = m ? `${m[1]} ` : '';
  const rest = (m ? m[2] : t).split(':')[0].trim();
  return `${num}${rest || t}`.trim();
}

export function countDone(sections: Section[], done: ReadonlySet<string>): number {
  return sections.filter((s) => done.has(s.slug)).length;
}

/** The first section not yet marked complete, or null when all are. */
export function firstIncomplete(sections: Section[], done: ReadonlySet<string>): Section | null {
  return sections.find((s) => !done.has(s.slug)) ?? null;
}
