import { View } from 'react-native';
import { Link, Stack } from 'expo-router';

import { Avatar, Button, Card, Text } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { firstName, getProfile } from '@/shared/profile';

export default function Home() {
  const { session } = useAuth();
  const profile = session === null ? null : getProfile(session.user);
  const greetingName = firstName(profile?.name ?? null);

  return (
    <View className="flex-1 gap-4 bg-surface p-5">
      <Stack.Screen options={{ title: 'Rent Ledger' }} />
      <Card>
        <View className="flex-row items-center gap-4">
          <Avatar size="lg" name={profile?.name ?? null} imageUrl={profile?.avatarUrl} />
          <View className="flex-1">
            <Text size="xl" weight="semibold" numberOfLines={1}>
              {greetingName === null ? 'Welcome back' : `Hi, ${greetingName}`}
            </Text>
            {profile?.email != null ? (
              <Text size="base" tone="grey" numberOfLines={1}>
                {profile.email}
              </Text>
            ) : null}
          </View>
        </View>
      </Card>
      {__DEV__ && (
        <Link href="/gallery" asChild>
          <Button variant="link" label="Open component gallery" />
        </Link>
      )}
    </View>
  );
}
