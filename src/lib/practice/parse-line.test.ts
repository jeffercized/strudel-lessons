import { describe, expect, it } from 'vitest';
import { isError, lineToCode, parseLine, type LineResult } from './parse-line';

const errorOf = (code: string) => {
  const r: LineResult = parseLine(code);
  if (!isError(r)) throw new Error(`expected an error for ${code}`);
  return r.error;
};

describe('parseLine: friendly error messages', () => {
  it('empty line', () => {
    expect(errorOf('   ')).toBe('Type a line first.');
  });
  it('capital S', () => {
    expect(errorOf('S("bd sd, hh*8")')).toMatch(/^Capital S\. Strudel is case-sensitive/);
  });
  it('not starting with s(', () => {
    expect(errorOf('bd sd')).toBe('A line starts with a function, like <code>s(…)</code>.');
  });
  it('missing quote', () => {
    expect(errorOf('s("bd sd)')).toMatch(/^A quote is missing\./);
  });
  it('missing )', () => {
    expect(errorOf('s("bd sd bd sd"')).toBe('Missing <code>)</code>. Every <code>(</code> needs a closing <code>)</code>.');
  });
  it('extra )', () => {
    expect(errorOf('s("bd sd"))')).toBe('There is an extra <code>)</code> with no <code>(</code> to match it.');
  });
  it('rhythm without quotes', () => {
    expect(errorOf('s(bd*4, ~ cp ~ cp)')).toMatch(/^The rhythm needs quotes around it/);
  });
  it('missing dot between functions', () => {
    expect(errorOf('s("bd*4, hh*8") bank("RolandTR909")')).toMatch(/^Missing dot\./);
  });
  it('comma instead of dot', () => {
    expect(errorOf('s("bd*4"), bank("RolandTR909")')).toMatch(/^That comma should be a dot\./);
  });
  it('unquoted bank name', () => {
    expect(errorOf('s("bd*4").bank(RolandTR909)')).toBe('The bank name needs quotes, like <code>.bank("RolandTR909")</code>.');
  });
  it('gain that is not a number', () => {
    expect(errorOf('s("bd*4").gain(loud)')).toBe('<code>.gain()</code> takes a number here, like <code>.gain(0.8)</code>.');
  });
  it('function the drills do not use', () => {
    expect(errorOf('s("bd*4").fast(2)')).toMatch(/^Practice lines only use/);
  });
  it('wrong shape', () => {
    expect(errorOf('s("bd") + 1')).toMatch(/^That line doesn't have the shape/);
  });
  it('unclosed bracket in the rhythm', () => {
    expect(errorOf('s("bd [sd sd bd sd")')).toBe('In the rhythm: Missing ] — a square bracket was opened but never closed');
  });
  it('closing bracket with no opener', () => {
    expect(errorOf('s("bd sd]")')).toBe('In the rhythm: Unexpected &quot;]&quot; — there&#39;s no matching opening bracket');
  });
  it('empty rhythm', () => {
    expect(errorOf('s("")')).toBe('In the rhythm: The rhythm is empty. Put some sounds between the quotes.');
  });
  it('other rhythm errors use the real parser message', () => {
    expect(errorOf('s("bd sd %")')).toMatch(/^In the rhythm: \[mini\] parse error/);
  });
});

describe('parseLine: valid lines', () => {
  it('plain s("…")', () => {
    expect(parseLine('s("bd sd")')).toEqual({ mini: 'bd sd', bank: null, gain: null, speed: null });
  });
  it('with bank, gain and speed, extra spaces and a trailing semicolon', () => {
    expect(parseLine('  s( "bd*4, ~ cp ~ cp" ) .bank("RolandTR909").gain(0.8).speed(1.5);')).toEqual({
      mini: 'bd*4, ~ cp ~ cp',
      bank: 'RolandTR909',
      gain: 0.8,
      speed: 1.5,
    });
  });
});

describe('lineToCode', () => {
  it('rebuilds clean Strudel code', () => {
    const r = parseLine('s( "bd sd" ).gain( 0.5 )');
    if (isError(r)) throw new Error(r.error);
    expect(lineToCode(r)).toBe('s("bd sd").gain(0.5)');
  });
});
