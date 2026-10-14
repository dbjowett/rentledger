import { router } from 'expo-router';
import { Building2 } from 'lucide-react-native';

import { Button, Card, EmptyState } from '@/components/ui';

/** Empty state shown until the first property exists: starts the add-property flow. */
function AddFirstPropertyCard() {
  return (
    <Card>
      <EmptyState className="p-2">
        <EmptyState.Header>
          <EmptyState.Media variant="icon" icon={Building2} />
          <EmptyState.Title>Add your first property</EmptyState.Title>
          <EmptyState.Description>
            A house, a duplex or a 4-plex. Takes about a minute.
          </EmptyState.Description>
        </EmptyState.Header>
        <Button
          fullWidth
          size="lg"
          label="Add property"
          onPress={() => router.push('/properties/new')}
        />
      </EmptyState>
    </Card>
  );
}

export { AddFirstPropertyCard };
