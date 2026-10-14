import { sumBy } from 'es-toolkit';

import { FULL_SHARE_BASIS_POINTS } from '@/shared/schemas';

/**
 * Split math. Shares are basis points (1 bp = 0.01%, 10000 = 100%) so they stay integers;
 * percentages only exist as text in the inputs.
 */

type SplitStatus = { ok: true } | { ok: false; offByPercent: number };

const BASIS_POINTS_PER_PERCENT = 100;
const PERCENT_PATTERN = /^\d{1,3}(\.\d{0,2})?$/;

/**
 * 100% shared by `count` units as whole basis points; the last unit takes the remainder.
 * @example evenBasisPoints(3) // [3333, 3333, 3334]
 */
function evenBasisPoints(count: number): number[] {
  if (count <= 0) return [];
  const share = Math.floor(FULL_SHARE_BASIS_POINTS / count);
  const shares = Array.from({ length: count }, () => share);
  shares[count - 1] = FULL_SHARE_BASIS_POINTS - share * (count - 1);
  return shares;
}

/**
 * Splits an amount by basis points. Each share is rounded down and the last unit takes the
 * leftover cents, so the parts always add up to `amountCents`.
 * @example splitAmounts(10000, [3333, 3333, 3334]) // [3333, 3333, 3334]
 */
function splitAmounts(amountCents: number, basisPoints: readonly number[]): number[] {
  const shares = basisPoints.map((bp) => Math.floor((amountCents * bp) / FULL_SHARE_BASIS_POINTS));
  if (shares.length === 0) return shares;
  const last = shares.length - 1;
  shares[last] = amountCents - sumBy(shares.slice(0, last), (share) => share);
  return shares;
}

/**
 * Typed percentage to basis points, up to 2 decimals and at most 100.
 * @example percentToBasisPoints('25.5') // 2550
 * @example percentToBasisPoints('12.345') // null
 */
function percentToBasisPoints(text: string): number | null {
  const trimmed = text.trim();
  if (!PERCENT_PATTERN.test(trimmed)) return null;
  const basisPoints = Math.round(Number(trimmed) * BASIS_POINTS_PER_PERCENT);
  return basisPoints > FULL_SHARE_BASIS_POINTS ? null : basisPoints;
}

/**
 * Basis points as the shortest percentage text.
 * @example basisPointsToPercent(2550) // '25.5'
 * @example basisPointsToPercent(3334) // '33.34'
 */
function basisPointsToPercent(basisPoints: number): string {
  return String(basisPoints / BASIS_POINTS_PER_PERCENT);
}

/**
 * Whether the shares make exactly 100%. When not, how far off it is in percent (negative when
 * short).
 * @example splitStatus([2500, 7000]) // { ok: false, offByPercent: -5 }
 */
function splitStatus(basisPoints: readonly number[]): SplitStatus {
  const total = sumBy(basisPoints, (bp) => bp);
  if (total === FULL_SHARE_BASIS_POINTS) return { ok: true };
  return { ok: false, offByPercent: (total - FULL_SHARE_BASIS_POINTS) / BASIS_POINTS_PER_PERCENT };
}

export {
  basisPointsToPercent,
  evenBasisPoints,
  percentToBasisPoints,
  type SplitStatus,
  splitAmounts,
  splitStatus,
};
