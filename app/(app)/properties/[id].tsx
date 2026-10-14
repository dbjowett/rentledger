import { ActivityIndicator, ScrollView, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';

import { Banner, Card, ListRow, Tag, Text } from '@/components/ui';
import { formatRentDue, UNIT_STATUS_TAGS } from '@/features/properties/lib/units';
import { useProperty } from '@/features/properties/queries';
import { formatMonthYear } from '@/shared/dates';
import { formatCentsCompact } from '@/shared/money';
import type { Unit } from '@/shared/types';
import { toneColor } from '@/theme/tokens';

function unitMeta(unit: Unit): string {
  if (unit.status === 'owner_occupied') return 'Not rented';
  if (unit.status === 'vacant') {
    return unit.rentCents === null ? 'No tenant' : `Asking ${formatCentsCompact(unit.rentCents)}`;
  }
  const parts = [
    unit.rentCents === null ? null : formatCentsCompact(unit.rentCents),
    unit.rentDue === null ? null : `due ${formatRentDue(unit.rentDue)}`,
    unit.tenantName,
    unit.rentStartDate === null ? null : `since ${formatMonthYear(unit.rentStartDate)}`,
  ];
  return parts.filter((part) => part !== null && part !== '').join(' · ');
}

export default function PropertyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const property = useProperty(id);

  if (property.isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <Stack.Screen options={{ title: '' }} />
        <ActivityIndicator color={toneColor('accent')} />
      </View>
    );
  }

  if (property.isError) {
    return (
      <View className="flex-1 bg-surface p-5">
        <Stack.Screen options={{ title: 'Property' }} />
        <Banner message="Couldn't load this property. Pull back and try again." />
      </View>
    );
  }

  const { name, address, ownershipPct, units } = property.data;
  const single = units.length === 1;
  const summary = [
    single ? 'House' : `${units.length} units`,
    ownershipPct === 100 ? null : `You own ${ownershipPct}%`,
  ]
    .filter((part) => part !== null)
    .join(' · ');

  return (
    <ScrollView className="flex-1 bg-surface" contentContainerClassName="gap-4 px-screen py-6">
      <Stack.Screen options={{ title: name }} />

      <View className="gap-1">
        <Text size="2xl" weight="bold">
          {name}
        </Text>
        <Text size="base" tone="grey">
          {`${address} · ${summary}`}
        </Text>
      </View>

      <Card padding="none">
        <Card.Header title={single ? 'Rent' : 'Units'} className="mb-0 px-4 pt-4" />
        {units.map((unit, index) => {
          const tag = UNIT_STATUS_TAGS[unit.status];
          return (
            <ListRow
              key={unit.id}
              title={single ? 'Monthly rent' : unit.label}
              meta={unitMeta(unit)}
              trailing={<Tag label={tag.label} tone={tag.tone} />}
              divider={index < units.length - 1}
            />
          );
        })}
      </Card>
    </ScrollView>
  );
}
