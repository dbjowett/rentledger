import { receiptResize } from './receiptSize';

describe('receiptResize', () => {
  it('shrinks the longest side to 1600px', () => {
    expect(receiptResize(4032, 3024)).toEqual({ width: 1600 });
    expect(receiptResize(3024, 4032)).toEqual({ height: 1600 });
    expect(receiptResize(2000, 2000)).toEqual({ width: 1600 });
  });

  it('leaves small photos alone', () => {
    expect(receiptResize(1600, 1200)).toBeNull();
    expect(receiptResize(800, 600)).toBeNull();
  });
});
