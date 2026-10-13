import { Stack } from 'expo-router';

import { ProfileButton } from '@/features/profile/ProfileButton';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerRight: () => <ProfileButton /> }}>
      <Stack.Screen name="profile" options={{ title: 'Profile', headerRight: () => null }} />
    </Stack>
  );
}
