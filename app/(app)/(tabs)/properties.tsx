import { ActivityIndicator, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';

import { Banner, Button, Card, ListRow } from '@/components/ui';
import { AddFirstPropertyCard } from '@/features/properties/AddFirstPropertyCard';
import { useProperties } from '@/features/properties/queries';
import { formatCentsCompact } from '@/shared/money';
import type { PropertySummary } from '@/shared/types';
import { toneColor } from '@/theme/tokens';

function propertyMeta(property: PropertySummary): string {
  const size = property.unitCount === 1 ? 'House' : `${property.unitCount} units`;
  return `${size} · ${formatCentsCompact(property.monthlyRentCents)}/mo`;
}

export default function PropertiesScreen() {
  const properties = useProperties();

  if (properties.isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator color={toneColor('accent')} />
      </View>
    );
  }

  if (properties.isError) {
    return (
      <View className="flex-1 bg-surface p-5">
        <Banner message="Couldn't load your properties. Check your connection and try again." />
      </View>
    );
  }

  if (properties.data.length === 0) {
    return (
      <View className="flex-1 justify-center bg-surface px-screen">
        <AddFirstPropertyCard />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-surface" contentContainerClassName="gap-4 px-screen py-6">
      <Card padding="none">
        {properties.data.map((property, index) => (
          <ListRow
            key={property.id}
            title={property.name}
            meta={propertyMeta(property)}
            chevron
            divider={index < properties.data.length - 1}
            onPress={() =>
              router.push({ pathname: '/properties/[id]', params: { id: property.id } })
            }
          />
        ))}
      </Card>
      <Button
        variant="secondary"
        fullWidth
        leftIcon={Plus}
        label="Add property"
        onPress={() => router.push('/properties/new')}
      />
    </ScrollView>
  );
}
