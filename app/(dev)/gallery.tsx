import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Text } from '@/components/ui';
import { ButtonsTab } from '@/dev/gallery/ButtonsTab';
import { CardsTab } from '@/dev/gallery/CardsTab';
import { FoundationsTab } from '@/dev/gallery/FoundationsTab';
import { ListsTab } from '@/dev/gallery/ListsTab';
import { TagsTab } from '@/dev/gallery/TagsTab';
import { TextTab } from '@/dev/gallery/TextTab';
import { cn } from '@/lib/cn';

// Each tab is a file in src/dev/gallery. Add new components to the matching tab.
const tabs = [
  { key: 'foundations', label: 'Foundations', Content: FoundationsTab },
  { key: 'text', label: 'Text', Content: TextTab },
  { key: 'buttons', label: 'Buttons', Content: ButtonsTab },
  { key: 'tags', label: 'Tags', Content: TagsTab },
  { key: 'cards', label: 'Cards', Content: CardsTab },
  { key: 'lists', label: 'Lists', Content: ListsTab },
] as const;

type TabKey = (typeof tabs)[number]['key'];

export default function Gallery() {
  // Tab lives in the URL (/gallery?tab=buttons) so it survives reloads and can be deep-linked.
  const params = useLocalSearchParams<{ tab?: string }>();
  const active = tabs.find((t) => t.key === params.tab) ?? tabs[0];
  const select = (key: TabKey) => router.setParams({ tab: key });

  // Keep the active tab visible when it's off-screen (e.g. after a deep link).
  const barRef = useRef<ScrollView>(null);
  const tabX = useRef<Partial<Record<TabKey, number>>>({});
  const scrollToActive = () => {
    const x = tabX.current[active.key];
    if (x !== undefined) barRef.current?.scrollTo({ x: Math.max(0, x - 20), animated: true });
  };
  useEffect(scrollToActive, [active.key]);

  return (
    <View className="flex-1 bg-surface">
      <Stack.Screen options={{ title: 'Gallery' }} />

      <View className="border-b border-line bg-card">
        <ScrollView
          ref={barRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2 px-screen py-3"
        >
          {tabs.map((t) => {
            const selected = t.key === active.key;
            return (
              <Pressable
                key={t.key}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                onPress={() => select(t.key)}
                onLayout={(e) => {
                  tabX.current[t.key] = e.nativeEvent.layout.x;
                  if (selected) scrollToActive();
                }}
                hitSlop={4}
                className={cn(
                  'h-9 justify-center rounded-full px-4 active:opacity-80',
                  selected ? 'bg-ink' : 'bg-surface',
                )}
              >
                <Text weight="semibold" size="base" tone={selected ? 'white' : 'ink'}>
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView key={active.key} className="flex-1" contentContainerClassName="px-screen py-6">
        <active.Content />
      </ScrollView>
    </View>
  );
}
