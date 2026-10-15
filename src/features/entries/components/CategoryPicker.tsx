import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Check } from 'lucide-react-native';

import { Chip, Sheet, Text, TextInput } from '@/components/ui';
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue';
import type { Category } from '@/shared/types';
import { toneColor } from '@/theme/tokens';

import { categoryChipLabel, orderCategories, taxLineLabel } from '../lib/categories';

type CategoryPickerProps = {
  /** Categories of the current kind (expense or income). */
  categories: readonly Category[];
  value: string | null;
  onChange: (categoryId: string) => void;
};

function matches(category: Category, query: string) {
  const q = query.toLowerCase();
  return (
    category.name.toLowerCase().includes(q) ||
    (category.taxLine?.code.includes(q) ?? false) ||
    (category.taxLine?.label.toLowerCase().includes(q) ?? false)
  );
}

function CategoryRow({
  category,
  selected,
  onPress,
}: {
  category: Category;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      className="min-h-14 flex-row items-center gap-3 border-b border-line active:bg-surface"
    >
      <View className="flex-1">
        <Text weight={selected ? 'semibold' : 'regular'}>{category.name}</Text>
        <Text size="sm" tone="grey">
          {category.taxLine === null
            ? 'Not on the tax form'
            : `Line ${category.taxLine.code} · ${category.taxLine.label}`}
        </Text>
      </View>
      <View className="w-5">
        {selected ? <Check size={18} color={toneColor('ink')} strokeWidth={2.5} /> : null}
      </View>
    </Pressable>
  );
}

/**
 * Category chips with their T776 line, most used first. "More" opens the full list with search.
 * A category picked from the full list joins the chips so the choice stays visible.
 */
function CategoryPicker({ categories, value, onChange }: CategoryPickerProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const [query, setQuery] = useState('');
  const search = useDebouncedValue(query.trim(), 150);

  const { top, rest } = useMemo(() => orderCategories(categories), [categories]);
  const pickedFromRest = rest.find((category) => category.id === value);
  const chips = pickedFromRest === undefined ? top : [...top, pickedFromRest];
  const all = [...top, ...rest];
  const listed = search === '' ? all : all.filter((category) => matches(category, search));

  const closeMore = () => {
    setMoreOpen(false);
    setQuery('');
  };

  return (
    <View accessibilityRole="radiogroup" className="flex-row flex-wrap gap-2">
      {chips.map((category) => (
        <Chip
          key={category.id}
          label={categoryChipLabel(category)}
          sublabel={taxLineLabel(category.taxLine) ?? 'No tax line'}
          selected={category.id === value}
          accessibilityRole="radio"
          accessibilityState={{ checked: category.id === value }}
          onPress={() => onChange(category.id)}
        />
      ))}
      {rest.length > 0 ? (
        <Chip
          label="More"
          sublabel={`${rest.length} others`}
          accessibilityHint="Shows every category"
          onPress={() => setMoreOpen(true)}
        />
      ) : null}

      <Sheet
        open={moreOpen}
        onClose={closeMore}
        title="Category"
        size="full"
        toolbar={
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search category or tax line"
            autoCorrect={false}
          />
        }
      >
        <View accessibilityRole="radiogroup">
          {listed.map((category) => (
            <CategoryRow
              key={category.id}
              category={category}
              selected={category.id === value}
              onPress={() => {
                onChange(category.id);
                closeMore();
              }}
            />
          ))}
          {listed.length === 0 ? (
            <Text tone="grey" className="mt-6 text-center">
              {`No categories match “${search}”`}
            </Text>
          ) : null}
        </View>
      </Sheet>
    </View>
  );
}

export { type CategoryPickerProps, CategoryPicker };
