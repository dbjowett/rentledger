/** Longest side of a receipt photo after resizing; plenty to read small print. */
const RECEIPT_MAX_SIDE = 1600;

/** JPEG quality for resized receipts: small files with legible text. */
const RECEIPT_JPEG_QUALITY = 0.8;

type ResizeTarget = { width: number } | { height: number };

/**
 * How to shrink a photo so its longest side is at most `maxSide`, keeping its aspect ratio.
 * Null when it's already small enough.
 * @example receiptResize(4032, 3024) // { width: 1600 }
 * @example receiptResize(3024, 4032) // { height: 1600 }
 * @example receiptResize(1200, 900) // null
 */
function receiptResize(
  width: number,
  height: number,
  maxSide = RECEIPT_MAX_SIDE,
): ResizeTarget | null {
  if (Math.max(width, height) <= maxSide) return null;
  return width >= height ? { width: maxSide } : { height: maxSide };
}

export { RECEIPT_JPEG_QUALITY, RECEIPT_MAX_SIDE, type ResizeTarget, receiptResize };
