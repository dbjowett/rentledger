import { Pressable, View } from 'react-native';
import { cva } from 'class-variance-authority';
import type { LucideIcon } from 'lucide-react-native';

import { toneColor } from '@/theme/tokens';

import { Sheet } from '../Sheet/Sheet';
import { Text } from '../Text/Text';

const actionMenuRowVariants = cva(
  'min-h-14 flex-row items-center gap-4 rounded-tile px-3 active:bg-surface',
);

type ActionMenuItem = {
  key: string;
  label: string;
  icon: LucideIcon;
  onPress: () => void;
};

type ActionMenuProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  items: readonly ActionMenuItem[];
};

/** A short sheet of choices, e.g. Take photo · Choose photo · Choose PDF. Closes on choice. */
function ActionMenu({ open, onClose, title, items }: ActionMenuProps) {
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <View accessibilityRole="menu">
        {items.map(({ key, label, icon: Icon, onPress }) => (
          <Pressable
            key={key}
            accessibilityRole="menuitem"
            onPress={() => {
              onClose();
              onPress();
            }}
            className={actionMenuRowVariants()}
          >
            <Icon size={22} color={toneColor('ink')} strokeWidth={2} />
            <Text size="md">{label}</Text>
          </Pressable>
        ))}
      </View>
    </Sheet>
  );
}

export { type ActionMenuItem, actionMenuRowVariants, type ActionMenuProps, ActionMenu };
