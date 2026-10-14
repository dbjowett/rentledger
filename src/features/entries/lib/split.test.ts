import {
  basisPointsToPercent,
  evenBasisPoints,
  evenPercents,
  percentToBasisPoints,
  splitAmounts,
  splitStatus,
} from './split';

describe('evenBasisPoints', () => {
  it('shares 100% with the remainder on the last unit', () => {
    expect(evenBasisPoints(2)).toEqual([5000, 5000]);
    expect(evenBasisPoints(3)).toEqual([3333, 3333, 3334]);
    expect(evenBasisPoints(7).reduce((a, b) => a + b, 0)).toBe(10_000);
    expect(evenBasisPoints(0)).toEqual([]);
  });
});

describe('splitAmounts', () => {
  it('splits $100 three ways as 33.33 / 33.33 / 33.34', () => {
    expect(splitAmounts(10_000, [3333, 3333, 3334])).toEqual([3333, 3333, 3334]);
  });

  it('splits a custom 25/75', () => {
    expect(splitAmounts(10_000, [2500, 7500])).toEqual([2500, 7500]);
  });

  it('always adds up to the total', () => {
    for (const amount of [1, 7, 101, 99_999, 123_457]) {
      const parts = splitAmounts(amount, evenBasisPoints(3));
      expect(parts.reduce((a, b) => a + b, 0)).toBe(amount);
    }
  });
});

describe('percent conversion', () => {
  it('parses percentages with up to 2 decimals', () => {
    expect(percentToBasisPoints('25')).toBe(2500);
    expect(percentToBasisPoints('25.5')).toBe(2550);
    expect(percentToBasisPoints(' 33.34 ')).toBe(3334);
    expect(percentToBasisPoints('100')).toBe(10_000);
  });

  it('rejects invalid percentages', () => {
    expect(percentToBasisPoints('')).toBeNull();
    expect(percentToBasisPoints('12.345')).toBeNull();
    expect(percentToBasisPoints('101')).toBeNull();
    expect(percentToBasisPoints('-5')).toBeNull();
    expect(percentToBasisPoints('abc')).toBeNull();
  });

  it('prints basis points as the shortest percentage', () => {
    expect(basisPointsToPercent(2550)).toBe('25.5');
    expect(basisPointsToPercent(3334)).toBe('33.34');
    expect(basisPointsToPercent(5000)).toBe('50');
  });
});

describe('splitStatus', () => {
  it('is ok at exactly 100%', () => {
    expect(splitStatus([2500, 7500])).toEqual({ ok: true });
  });

  it('reports how far off it is', () => {
    expect(splitStatus([2500, 7000])).toEqual({ ok: false, offByPercent: -5 });
    expect(splitStatus([6000, 6000])).toEqual({ ok: false, offByPercent: 20 });
  });
});

describe('evenPercents', () => {
  it('starts a custom split from even shares', () => {
    expect(evenPercents(['a', 'b', 'c'])).toEqual({ a: '33.33', b: '33.33', c: '33.34' });
    expect(evenPercents(['a', 'b'])).toEqual({ a: '50', b: '50' });
  });
});
