import { View } from 'react-native';
import { Link, Stack } from 'expo-router';

import { Button, Text } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';

export default function Home() {
  const { session, signOut } = useAuth();

  return (
    <View className="flex-1 gap-4 bg-surface p-5">
      <Stack.Screen options={{ title: 'Rent Ledger' }} />
      <View className="gap-1">
        <Text size="sm" tone="grey">
          Signed in as
        </Text>
        <Text weight="semibold">{session?.user.email ?? 'Unknown user'}</Text>
      </View>
      <Button variant="secondary" label="Sign out" onPress={() => void signOut()} />
      {__DEV__ && (
        <Link href="/gallery" asChild>
          <Button variant="link" label="Open component gallery" />
        </Link>
      )}
    </View>
  );
}
