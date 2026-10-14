import { countBy } from 'es-toolkit';
import { z } from 'zod';

import { requireUser } from '@/server/auth';
import { apiError, json } from '@/server/http';
import { addDaysTo, todayIn } from '@/shared/dates';
import { ENTRY_KINDS, entryKindQuery, type EntryKind } from '@/shared/schemas';
import type { CategoryResponse } from '@/shared/types';

const DEFAULT_JURISDICTION = 'CA';
const USAGE_WINDOW_DAYS = 90;

function isEntryKind(value: string): value is EntryKind {
  return ENTRY_KINDS.some((kind) => kind === value);
}

/** System and own categories of a kind, with their tax line and recent use for ordering. */
async function GET(request: Request): Promise<Response> {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;

  const kind = entryKindQuery.safeParse(new URL(request.url).searchParams.get('kind') ?? undefined);
  if (!kind.success) {
    return apiError(400, 'invalid_body', 'Unknown kind', z.flattenError(kind.error));
  }

  const { data: settings } = await auth.supabase
    .from('user_settings')
    .select('jurisdiction')
    .eq('user_id', auth.user.id)
    .maybeSingle();
  const jurisdiction = settings?.jurisdiction ?? DEFAULT_JURISDICTION;

  let query = auth.supabase
    .from('categories')
    .select(
      'id, key, name, kind, sort_order, category_tax_lines(jurisdiction, tax_lines(code, label))',
    )
    .is('archived_at', null)
    .order('sort_order');
  if (kind.data !== undefined) query = query.eq('kind', kind.data);

  const since = addDaysTo(todayIn('UTC'), -USAGE_WINDOW_DAYS);
  const [categories, usage] = await Promise.all([
    query,
    auth.supabase.from('transactions').select('category_id').gte('date', since),
  ]);
  if (categories.error !== null) return apiError(500, 'internal', categories.error.message);
  if (usage.error !== null) return apiError(500, 'internal', usage.error.message);

  const useCounts = countBy(usage.data, (row) => row.category_id);
  const result: CategoryResponse[] = categories.data
    .filter((category) => isEntryKind(category.kind))
    .map((category) => {
      const mapping = category.category_tax_lines.find(
        (line) => line.jurisdiction === jurisdiction,
      );
      const taxLine = mapping?.tax_lines ?? null;
      return {
        id: category.id,
        key: category.key,
        name: category.name,
        kind: isEntryKind(category.kind) ? category.kind : 'expense',
        sort_order: category.sort_order,
        tax_line: taxLine === null ? null : { code: taxLine.code, label: taxLine.label },
        use_count: useCounts[category.id] ?? 0,
      };
    });

  return json(result);
}

export { GET };
