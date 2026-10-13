import { View } from 'react-native';
import { Banknote } from 'lucide-react-native';

import { EmptyState } from '@/components/ui';

export default function EntriesScreen() {
  return (
    <View className="flex-1 justify-center bg-surface px-screen">
      <EmptyState>
        <EmptyState.Header>
          <EmptyState.Media variant="icon" icon={Banknote} />
          <EmptyState.Title>No entries yet</EmptyState.Title>
          <EmptyState.Description>
            Rent, bills and other income and expenses will show up here.
          </EmptyState.Description>
        </EmptyState.Header>
      </EmptyState>
    </View>
  );
}
