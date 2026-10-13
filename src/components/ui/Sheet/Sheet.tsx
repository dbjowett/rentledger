import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetFooter,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetSectionList,
  type BottomSheetBackdropProps,
  type BottomSheetBackgroundProps,
  type BottomSheetFooterProps,
} from '@gorhom/bottom-sheet';
import { cva } from 'class-variance-authority';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '@/lib/cn';

import { Button } from '../Button/Button';
import { Text } from '../Text/Text';

const sheetBackgroundVariants = cva('rounded-t-sheet bg-card');
const sheetHandleVariants = cva('h-1 w-10 rounded-full bg-outline');
const sheetHeaderVariants = cva('min-h-12 flex-row items-center px-4');
const sheetTitleTextVariants = cva('text-center font-semibold text-lg text-ink');
const sheetFooterVariants = cva('border-t border-line bg-card px-screen pt-3');

type SheetAction = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

type SheetSize = 'content' | 'full';

const FULL_SNAP_POINTS = ['90%'];

type SheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  cancelLabel?: string;
  /** Optional link-style action on the right of the header, e.g. "Reset". */
  action?: SheetAction;
  /** Pinned above the safe area while the content scrolls, e.g. the primary Button. */
  footer?: ReactNode;
  /** Pinned under the header and never scrolls, e.g. a search field. */
  toolbar?: ReactNode;
  /** 'content' sizes to the content; 'full' keeps a fixed height so it never jumps as content changes. */
  size?: SheetSize;
  /** Set to false when the children bring their own SheetFlatList or SheetSectionList. */
  scrollable?: boolean;
  children: ReactNode;
  contentClassName?: string;
};

function SheetBackground({ style }: BottomSheetBackgroundProps) {
  return <View style={style} className={sheetBackgroundVariants()} />;
}

function SheetHandle() {
  return (
    <View className="items-center pb-1 pt-2.5">
      <View className={sheetHandleVariants()} />
    </View>
  );
}

function SheetBackdrop(props: BottomSheetBackdropProps) {
  return (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      pressBehavior="close"
    />
  );
}

function Sheet({
  open,
  onClose,
  title,
  cancelLabel = 'Cancel',
  action,
  footer,
  toolbar,
  size = 'content',
  scrollable = true,
  children,
  contentClassName,
}: SheetProps) {
  const ref = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();
  const [footerHeight, setFooterHeight] = useState(0);

  // Calling dismiss() on a modal that is not showing leaves it stuck, so track whether it is shown.
  const presented = useRef(false);

  const handleDismiss = () => {
    presented.current = false;
    onClose();
  };

  useEffect(() => {
    if (open) {
      presented.current = true;
      ref.current?.present();
    } else if (presented.current) {
      presented.current = false;
      ref.current?.dismiss();
    }
  }, [open]);

  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <BottomSheetFooter {...props}>
        <View
          onLayout={(event: LayoutChangeEvent) => setFooterHeight(event.nativeEvent.layout.height)}
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
          className={sheetFooterVariants()}
        >
          {footer}
        </View>
      </BottomSheetFooter>
    ),
    [footer, insets.bottom],
  );

  const hasFooter = footer != null;

  const header = (
    <View className="bg-card">
      <SheetHandle />
      <View className={sheetHeaderVariants()}>
        <View className="flex-1 flex-row justify-start">
          <Button variant="link" size="sm" label={cancelLabel} onPress={onClose} />
        </View>
        <Text accessibilityRole="header" numberOfLines={1} className={sheetTitleTextVariants()}>
          {title}
        </Text>
        <View className="flex-1 flex-row justify-end">
          {action && (
            <Button
              variant="link"
              size="sm"
              label={action.label}
              disabled={action.disabled}
              onPress={action.onPress}
            />
          )}
        </View>
      </View>
      {toolbar == null ? null : <View className="px-screen pb-2">{toolbar}</View>}
    </View>
  );

  return (
    <BottomSheetModal
      ref={ref}
      onDismiss={handleDismiss}
      topInset={insets.top}
      backgroundComponent={SheetBackground}
      handleComponent={null}
      backdropComponent={SheetBackdrop}
      footerComponent={hasFooter ? renderFooter : undefined}
      enableDynamicSizing={size === 'content'}
      snapPoints={size === 'full' ? FULL_SNAP_POINTS : undefined}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
    >
      {scrollable ? (
        <BottomSheetScrollView
          stickyHeaderIndices={[0]}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingBottom: hasFooter ? footerHeight + 16 : Math.max(insets.bottom, 16) + 8,
          }}
        >
          {header}
          <View className={cn('px-screen pt-2', contentClassName)}>{children}</View>
        </BottomSheetScrollView>
      ) : (
        <View className="flex-1">
          {header}
          <View className={cn('flex-1', contentClassName)}>{children}</View>
        </View>
      )}
    </BottomSheetModal>
  );
}

// Lists inside a sheet must be the bottom-sheet versions so scrolling and drag-to-close cooperate.
const SheetFlatList = BottomSheetFlatList;
const SheetSectionList = BottomSheetSectionList;

export {
  sheetBackgroundVariants,
  sheetHandleVariants,
  sheetHeaderVariants,
  sheetTitleTextVariants,
  sheetFooterVariants,
  type SheetAction,
  type SheetProps,
  type SheetSize,
  Sheet,
  SheetFlatList,
  SheetSectionList,
};
