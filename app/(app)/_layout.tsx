import { Stack } from 'expo-router';

import { NewEntryProvider } from '@/features/entries/NewEntryProvider';

export default function AppLayout() {
  return (
    <NewEntryProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="properties/new"
          options={{ headerShown: false, presentation: 'fullScreenModal', gestureEnabled: false }}
        />
        <Stack.Screen name="properties/[id]" options={{ title: '' }} />
      </Stack>
    </NewEntryProvider>
  );
}
