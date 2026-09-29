export function sortLessons<T extends { data: { number: number } }>(entries: T[]): T[] {
  return [...entries].sort((a, b) => a.data.number - b.data.number);
}

export function neighbors<T extends { id: string }>(sorted: T[], id: string): { prev: T | null; next: T | null } {
  const i = sorted.findIndex((x) => x.id === id);
  if (i === -1) return { prev: null, next: null };
  return { prev: sorted[i - 1] ?? null, next: sorted[i + 1] ?? null };
}
