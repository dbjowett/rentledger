import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { deburr } from 'es-toolkit';
import { Check, CloudOff, SearchX } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, EmptyState, Sheet, SheetSectionList, Text, TextInput } from '@/components/ui';
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue';
import type { TimeZoneOption } from '@/shared/types';
import { toneColor } from '@/theme/tokens';

import { useTimeZones } from './queries';

const CANADIAN_ZONES = [
  'America/St_Johns',
  'America/Halifax',
  'America/Toronto',
  'America/Winnipeg',
  'America/Regina',
  'America/Edmonton',
  'America/Vancouver',
];

type TimeZoneSheetProps = {
  open: boolean;
  onClose: () => void;
  selected: string | null;
  deviceZone: string | null;
  onSelect: (timeZone: string) => void;
};

/** Case- and accent-insensitive, so "sao paulo" finds "São Paulo". */
function normalize(text: string) {
  return deburr(text).toLowerCase();
}

function matches(zone: TimeZoneOption, query: string) {
  const q = normalize(query);
  return [zone.id, zone.city, zone.offset].some((field) => normalize(field).includes(q));
}

type ZoneSection = { title: string; data: TimeZoneOption[] };

function ZoneRow({
  zone,
  selected,
  onPress,
}: {
  zone: TimeZoneOption;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${zone.city}, ${zone.region}, ${zone.offset}`}
      onPress={onPress}
      className="px-screen active:bg-surface"
    >
      <View className="min-h-14 flex-row items-center gap-3 border-b border-line">
        <View className="flex-1">
          <Text weight={selected ? 'semibold' : 'regular'} tone={selected ? 'accent' : 'ink'}>
            {zone.city}
          </Text>
          <Text size="sm" tone="grey">
            {zone.region}
          </Text>
        </View>
        <Text size="sm" tone="grey" className="font-mono">
          {zone.offset}
        </Text>
        <View className="w-5">
          {selected ? <Check size={18} color={toneColor('accent')} /> : null}
        </View>
      </View>
    </Pressable>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <View className="bg-card px-screen pb-1 pt-4">
      <Text size="sm" weight="semibold" tone="grey" className="uppercase">
        {title}
      </Text>
    </View>
  );
}

function ListStatus({
  isPending,
  isError,
  search,
  onRetry,
}: {
  isPending: boolean;
  isError: boolean;
  search: string;
  onRetry: () => void;
}) {
  if (isPending) return <ActivityIndicator className="mt-6" color={toneColor('accent')} />;
  if (isError) {
    return (
      <EmptyState>
        <EmptyState.Header>
          <EmptyState.Media variant="icon" icon={CloudOff} tone="danger" />
          <EmptyState.Title>Couldn't load time zones</EmptyState.Title>
          <EmptyState.Description>Check your connection and try again.</EmptyState.Description>
        </EmptyState.Header>
        <EmptyState.Content>
          <Button variant="secondary" label="Retry" onPress={onRetry} />
        </EmptyState.Content>
      </EmptyState>
    );
  }
  return (
    <EmptyState>
      <EmptyState.Header>
        <EmptyState.Media variant="icon" icon={SearchX} />
        <EmptyState.Title>No matches</EmptyState.Title>
        <EmptyState.Description>
          {`Nothing matches “${search}”. Try a nearby city or an offset like GMT-5.`}
        </EmptyState.Description>
      </EmptyState.Header>
    </EmptyState>
  );
}

function TimeZoneSheet({ open, onClose, selected, deviceZone, onSelect }: TimeZoneSheetProps) {
  const { data: zones, isPending, isError, refetch } = useTimeZones();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const search = useDebouncedValue(query.trim(), 200);

  const sections = useMemo((): ZoneSection[] => {
    const all = zones ?? [];
    if (search !== '') {
      const results = all.filter((zone) => matches(zone, search));
      return results.length === 0 ? [] : [{ title: 'Results', data: results }];
    }

    const suggestedIds = new Set([deviceZone, selected, ...CANADIAN_ZONES]);
    return [
      { title: 'Suggested', data: all.filter((zone) => suggestedIds.has(zone.id)) },
      { title: 'All time zones', data: all },
    ].filter((section) => section.data.length > 0);
  }, [zones, search, deviceZone, selected]);

  const close = () => {
    setQuery('');
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={close}
      title="Time zone"
      size="full"
      scrollable={false}
      toolbar={
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search city, region or GMT offset"
          autoCorrect={false}
          autoCapitalize="none"
        />
      }
    >
      <SheetSectionList
        sections={sections}
        keyExtractor={(zone) => zone.id}
        renderSectionHeader={({ section }) => <SectionTitle title={section.title} />}
        renderItem={({ item }) => (
          <ZoneRow zone={item} selected={item.id === selected} onPress={() => onSelect(item.id)} />
        )}
        ListEmptyComponent={
          <ListStatus
            isPending={isPending}
            isError={isError}
            search={search}
            onRetry={() => void refetch()}
          />
        }
        stickySectionHeadersEnabled
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        initialNumToRender={20}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 8 }}
      />
    </Sheet>
  );
}

export { TimeZoneSheet };
