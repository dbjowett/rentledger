import { Link, Stack } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';

export default function Home() {
  return (
    <View className="flex-1 bg-surface p-5">
      <Stack.Screen options={{ title: 'Rental Tracker' }} />
      <View className="bg-accent p-4">
        <Text weight="semibold" tone="white">
          Hi
        </Text>
      </View>
      {__DEV__ && (
        <Link href="/gallery" asChild>
          <Pressable className="mt-4 min-h-[44px] justify-center active:opacity-60">
            <Text weight="medium" tone="accent">
              Open component gallery
            </Text>
          </Pressable>
        </Link>
      )}
    </View>
  );
}
