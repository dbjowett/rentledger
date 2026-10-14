import type { ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';
import { cva } from 'class-variance-authority';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '@/lib/cn';

import { Text } from '../Text/Text';

const stickyFooterVariants = cva('gap-2 border-t border-line bg-card px-screen pt-3');

const MIN_BOTTOM_PADDING = 16;
const KEYBOARD_GAP = 12;

type StickyFooterProps = ViewProps & {
  /** Usually the screen's primary Button. */
  children: ReactNode;
  /** Short line above the button, e.g. "Total rent: $4,350/mo · 3 occupied". */
  summary?: string;
};

/** Bottom bar for a form screen. Rides on top of the keyboard while it's open. */
function StickyFooter({ children, summary, className, style, ...rest }: StickyFooterProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, MIN_BOTTOM_PADDING);

  return (
    <KeyboardStickyView offset={{ opened: bottomPadding - KEYBOARD_GAP }}>
      <View
        style={[{ paddingBottom: bottomPadding }, style]}
        className={cn(stickyFooterVariants(), className)}
        {...rest}
      >
        {summary === undefined ? null : (
          <Text size="sm" tone="grey" className="text-center">
            {summary}
          </Text>
        )}
        {children}
      </View>
    </KeyboardStickyView>
  );
}

export { stickyFooterVariants, type StickyFooterProps, StickyFooter };
