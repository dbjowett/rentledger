import type { ReactNode } from 'react';
import { View } from 'react-native';

import { SectionHeader, Text } from '@/components/ui';

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="mb-8">
      <SectionHeader title={title} />
      {children}
    </View>
  );
}

export function Row({ children }: { children: ReactNode }) {
  return <View className="mb-3 flex-row flex-wrap items-center gap-3">{children}</View>;
}

export function Label({ children }: { children: string }) {
  return (
    <Text size="sm" tone="grey" className="mb-1">
      {children}
    </Text>
  );
}
