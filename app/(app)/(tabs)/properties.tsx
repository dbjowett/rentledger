import { View } from 'react-native';
import { Building2 } from 'lucide-react-native';

import { EmptyState } from '@/components/ui';

export default function PropertiesScreen() {
  return (
    <View className="flex-1 justify-center bg-surface px-screen">
      <EmptyState>
        <EmptyState.Header>
          <EmptyState.Media variant="icon" icon={Building2} />
          <EmptyState.Title>No properties yet</EmptyState.Title>
          <EmptyState.Description>
            Your properties and their units will show up here.
          </EmptyState.Description>
        </EmptyState.Header>
      </EmptyState>
    </View>
  );
}
