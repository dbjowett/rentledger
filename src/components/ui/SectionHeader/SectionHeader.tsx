import { cva } from 'class-variance-authority';
import { View, type ViewProps } from 'react-native';

import { cn } from '@/lib/cn';

import { Button } from '../Button/Button';
import { Text } from '../Text/Text';

export const sectionHeaderVariants = cva('mb-3 min-h-[28px] flex-row items-center gap-3');
export const sectionHeaderTextVariants = cva('shrink font-bold text-2xl text-ink');

export type SectionHeaderAction = {
  label: string;
  onPress: () => void;
};

export type SectionHeaderProps = ViewProps & {
  title: string;
  action?: SectionHeaderAction;
};

export function SectionHeader({ title, action, className, ...rest }: SectionHeaderProps) {
  return (
    <View className={cn(sectionHeaderVariants(), className)} {...rest}>
      <Text accessibilityRole="header" numberOfLines={1} className={sectionHeaderTextVariants()}>
        {title}
      </Text>
      {action && (
        <View className="ml-auto">
          <Button variant="link" size="sm" label={action.label} onPress={action.onPress} />
        </View>
      )}
    </View>
  );
}
