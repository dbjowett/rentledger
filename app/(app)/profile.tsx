import { ScrollView, View } from 'react-native';

import { Avatar, Button, Card, Text } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { TimeZoneSection } from '@/features/profile/TimeZoneSection';
import { getProfile } from '@/shared/profile';

export default function ProfileScreen() {
  const { session, signOut } = useAuth();
  const profile = session === null ? null : getProfile(session.user);

  return (
    <ScrollView className="flex-1 bg-surface" contentContainerClassName="gap-8 px-screen py-6">
      <Card>
        <View className="flex-row items-center gap-4">
          <Avatar size="lg" name={profile?.name ?? null} imageUrl={profile?.avatarUrl} />
          <View className="flex-1">
            <Text size="xl" weight="semibold" numberOfLines={1}>
              {profile?.name ?? 'Your account'}
            </Text>
            {profile?.email == null ? null : (
              <Text size="base" tone="grey" numberOfLines={1}>
                {profile.email}
              </Text>
            )}
          </View>
        </View>
      </Card>

      <TimeZoneSection />

      <Button fullWidth variant="secondary" label="Sign out" onPress={() => void signOut()} />
    </ScrollView>
  );
}
