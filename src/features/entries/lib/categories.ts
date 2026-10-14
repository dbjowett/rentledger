import type { Category } from '@/shared/types';

/** How many categories show as chips before "More". */
const CATEGORY_CHIP_COUNT = 6;

type OrderedCategories<T> = {
  /** Shown as chips. */
  top: T[];
  /** Behind "More". */
  rest: T[];
};

type OrderableCategory = Pick<Category, 'key' | 'name' | 'sortOrder' | 'useCount'>;

/** System categories in their default order come before the user's own. */
function defaultRank(category: OrderableCategory): number {
  return category.key === null ? Number.MAX_SAFE_INTEGER : category.sortOrder;
}

function compareCategories(a: OrderableCategory, b: OrderableCategory): number {
  if (a.useCount !== b.useCount) return b.useCount - a.useCount;
  const rank = defaultRank(a) - defaultRank(b);
  if (rank !== 0) return rank;
  return a.name.localeCompare(b.name);
}

/**
 * Orders categories for the picker: most used in the last 90 days first, then the default
 * order, then by name. Before there's any history, the defaults lead.
 */
function orderCategories<T extends OrderableCategory>(
  categories: readonly T[],
  chipCount = CATEGORY_CHIP_COUNT,
): OrderedCategories<T> {
  const ordered = categories.toSorted(compareCategories);
  return { top: ordered.slice(0, chipCount), rest: ordered.slice(chipCount) };
}

/**
 * The tax line under a category chip.
 * @example taxLineLabel({ code: '8960', label: 'Repairs and maintenance' }) // 'Line 8960'
 */
function taxLineLabel(taxLine: Category['taxLine']): string | undefined {
  return taxLine === null ? undefined : `Line ${taxLine.code}`;
}

export { CATEGORY_CHIP_COUNT, type OrderedCategories, orderCategories, taxLineLabel };
