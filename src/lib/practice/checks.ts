import { parseMeta } from '../remark/parse-meta';

/** The ids of every ```check id="…" block in a lesson's markdown, in order. */
export function checkIdsIn(markdown: string): string[] {
  const ids: string[] = [];
  for (const m of markdown.matchAll(/^\s*```check\b([^\n]*)$/gm)) {
    ids.push(parseMeta(m[1].trim()).id ?? '');
  }
  return ids;
}

/** Check ids used in the lesson but missing from its practice data. */
export function missingChecks(markdown: string, checks: Record<string, unknown> | undefined): string[] {
  return checkIdsIn(markdown).filter((id) => !checks || !(id in checks));
}
