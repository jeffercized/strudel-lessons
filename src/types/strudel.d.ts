declare module '@strudel/mini' {
  interface FractionLike {
    valueOf(): number;
  }
  interface TimeSpan {
    begin: FractionLike;
    end: FractionLike;
  }
  export interface Hap {
    whole?: TimeSpan;
    part: TimeSpan;
    value: unknown;
    /** False when this is the tail of a note that started in an earlier cycle. */
    hasOnset(): boolean;
  }
  export interface Pattern {
    queryArc(begin: number, end: number): Hap[];
  }
  export function mini(src: string): Pattern;
}
