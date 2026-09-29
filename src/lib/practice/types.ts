/** Shape of src/content/practice/*.practice.json. The zod schema in src/content.config.ts must match. */
export interface ReadPart {
  text: string;
  kind: 'fn' | 'str' | 'punc';
  label: string;
  title: string;
  detail: string;
}

export interface QuizItem {
  question: string;
  correctParts: number[];
  /** HTML. */
  explanation: string;
}

export interface TypeItem {
  code: string;
  /** Same length as code; each ▢ hides one character. */
  gaps: string;
  description: string;
}

export interface PredictItem {
  pattern: string;
  steps: number;
}

export interface BuildItem {
  target: string;
  hint: string;
}

export interface EarItem {
  answer: string;
  decoys: string[];
}

export interface FixItem {
  broken: string;
  strudelSays: string;
  hint: string;
  /** null means any valid line passes. */
  sameRhythmAs: string | null;
  /** HTML. */
  explanation: string;
}

export interface ReadItem {
  line: string;
  parts: ReadPart[];
  quiz: QuizItem[];
}

export interface DrillItems {
  read: ReadItem;
  type: TypeItem;
  predict: PredictItem;
  build: BuildItem;
  ear: EarItem;
  fix: FixItem;
}

export type DrillType = keyof DrillItems;
export const DRILL_TYPES: DrillType[] = ['read', 'type', 'predict', 'build', 'ear', 'fix'];

/** One drill item and which drill shows it. */
export type DrillEntry = { [K in DrillType]: { type: K; item: DrillItems[K] } }[DrillType];

/** A check: a short drill inside one lesson section. */
export type CheckDef = { [K in DrillType]: { section: string; type: K; items: DrillItems[K][] } }[DrillType];

export interface PracticeData {
  lesson: string;
  checks: Record<string, CheckDef>;
  review: DrillEntry[];
}

export const GAP = '▢';
