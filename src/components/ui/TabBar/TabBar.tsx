import { Pressable, View, type ViewProps } from 'react-native';
import { cva } from 'class-variance-authority';
import type { LucideIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '@/lib/cn';
import { toneColor } from '@/theme/tokens';

import { Text } from '../Text/Text';

const tabBarVariants = cva('flex-row items-center border-t border-line bg-card px-2 pt-2');
const tabBarItemVariants = cva('flex-1 items-center gap-1 py-1 active:opacity-70');
const tabBarActionVariants = cva(
  'h-12 w-12 items-center justify-center rounded-full bg-ink active:opacity-80',
);

type TabBarItem = {
  key: string;
  label: string;
  icon: LucideIcon;
};

type TabBarAction = {
  label: string;
  icon: LucideIcon;
  onPress: () => void;
};

type TabBarProps = ViewProps & {
  items: readonly TabBarItem[];
  activeKey: string | undefined;
  onSelect: (key: string) => void;
  /** Round button in the middle of the bar, e.g. "Add". */
  action?: TabBarAction;
};

function TabBarButton({
  item,
  active,
  onPress,
}: {
  item: TabBarItem;
  active: boolean;
  onPress: () => void;
}) {
  const Icon = item.icon;
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={item.label}
      onPress={onPress}
      className={tabBarItemVariants()}
    >
      <Icon
        size={22}
        color={toneColor(active ? 'accent' : 'grey')}
        strokeWidth={active ? 2.25 : 2}
      />
      <Text size="xs" weight={active ? 'semibold' : 'medium'} tone={active ? 'accent' : 'grey'}>
        {item.label}
      </Text>
    </Pressable>
  );
}

function TabBarActionButton({ action }: { action: TabBarAction }) {
  const Icon = action.icon;
  return (
    <View className="flex-1 items-center">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={action.label}
        onPress={action.onPress}
        className={tabBarActionVariants()}
      >
        <Icon size={24} color={toneColor('white')} strokeWidth={2.25} />
      </Pressable>
    </View>
  );
}

function TabBar({ items, activeKey, onSelect, action, className, style, ...rest }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const middle = Math.ceil(items.length / 2);

  const renderItem = (item: TabBarItem) => (
    <TabBarButton
      key={item.key}
      item={item}
      active={item.key === activeKey}
      onPress={() => onSelect(item.key)}
    />
  );

  return (
    <View
      accessibilityRole="tablist"
      style={[{ paddingBottom: Math.max(insets.bottom, 8) }, style]}
      className={cn(tabBarVariants(), className)}
      {...rest}
    >
      {items.slice(0, middle).map((item) => renderItem(item))}
      {action === undefined ? null : <TabBarActionButton action={action} />}
      {items.slice(middle).map((item) => renderItem(item))}
    </View>
  );
}

export {
  tabBarActionVariants,
  tabBarItemVariants,
  tabBarVariants,
  type TabBarAction,
  type TabBarItem,
  type TabBarProps,
  TabBar,
};
