import { Modal, Pressable, View } from 'react-native';
import { cva } from 'class-variance-authority';

import { Button } from '../Button/Button';
import { Text } from '../Text/Text';

const confirmDialogBackdropVariants = cva('flex-1 items-center justify-center bg-ink/40 px-8');
const confirmDialogCardVariants = cva('w-full max-w-sm gap-2 rounded-card bg-card p-6');
const confirmDialogTitleTextVariants = cva('font-semibold text-xl text-ink');

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** Styles the confirm button as dangerous, e.g. for "Discard". */
  destructive?: boolean;
  onConfirm: () => void;
  /** Also called by the Android back button and a tap outside the dialog. */
  onCancel: () => void;
};

/** A short yes/no question over the screen, e.g. "Discard this property?". */
function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <Pressable
        accessibilityLabel={cancelLabel}
        onPress={onCancel}
        className={confirmDialogBackdropVariants()}
      >
        <Pressable accessibilityViewIsModal className={confirmDialogCardVariants()}>
          <Text accessibilityRole="header" className={confirmDialogTitleTextVariants()}>
            {title}
          </Text>
          {message === undefined ? null : (
            <Text size="md" tone="grey">
              {message}
            </Text>
          )}
          <View className="mt-4 flex-row justify-end gap-3">
            <Button variant="secondary" label={cancelLabel} onPress={onCancel} />
            <Button
              variant={destructive ? 'danger' : 'primary'}
              label={confirmLabel}
              onPress={onConfirm}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export {
  confirmDialogBackdropVariants,
  confirmDialogCardVariants,
  confirmDialogTitleTextVariants,
  type ConfirmDialogProps,
  ConfirmDialog,
};
