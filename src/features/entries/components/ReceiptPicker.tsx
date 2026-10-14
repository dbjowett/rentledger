import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, View } from 'react-native';
import { Camera, FileText, Image as ImageIcon, Plus, TriangleAlert } from 'lucide-react-native';

import { ActionMenu, Button, Text, type ActionMenuItem } from '@/components/ui';
import { cn } from '@/lib/cn';
import { toneColor } from '@/theme/tokens';

import type { ReceiptSource } from '../lib/pickReceipt';

/** What the picker shows: nothing yet, or a file that's uploading, uploaded or failed. */
type ReceiptPickerState =
  | { status: 'empty' }
  | {
      status: 'uploading' | 'uploaded' | 'failed';
      uri: string;
      kind: 'image' | 'pdf';
      fileName?: string;
    };

type ReceiptPickerProps = {
  state: ReceiptPickerState;
  onPick: (source: ReceiptSource) => void;
  onRemove: () => void;
  onRetry: () => void;
  className?: string;
};

function Preview({ state }: { state: Exclude<ReceiptPickerState, { status: 'empty' }> }) {
  return (
    <View className="h-16 w-16 items-center justify-center overflow-hidden rounded-tile bg-surface">
      {state.kind === 'image' ? (
        <Image
          source={{ uri: state.uri }}
          accessibilityIgnoresInvertColors
          className="h-full w-full"
        />
      ) : (
        <FileText size={26} color={toneColor('grey')} strokeWidth={1.75} />
      )}
      {state.status === 'uploading' ? (
        <View className="absolute inset-0 items-center justify-center bg-ink/40">
          <ActivityIndicator color={toneColor('white')} />
        </View>
      ) : null}
    </View>
  );
}

function statusText(state: Exclude<ReceiptPickerState, { status: 'empty' }>) {
  if (state.status === 'uploading') return 'Uploading…';
  if (state.status === 'failed') return 'Upload failed';
  return state.kind === 'pdf' ? 'PDF attached' : 'Photo attached';
}

/**
 * Optional receipt for an entry: a dashed "+ Add photo or PDF" box that offers camera, photos
 * or a PDF; once picked, a thumbnail with upload status, Retry and Remove.
 */
function ReceiptPicker({ state, onPick, onRemove, onRetry, className }: ReceiptPickerProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const items: ActionMenuItem[] = [
    { key: 'camera', label: 'Take photo', icon: Camera, onPress: () => onPick('camera') },
    { key: 'library', label: 'Choose photo', icon: ImageIcon, onPress: () => onPick('library') },
    { key: 'pdf', label: 'Choose PDF', icon: FileText, onPress: () => onPick('pdf') },
  ];

  if (state.status === 'empty') {
    return (
      <>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add receipt"
          accessibilityHint="Take a photo, choose a photo or choose a PDF"
          onPress={() => setMenuOpen(true)}
          className={cn(
            'h-12 flex-row items-center justify-center gap-2 rounded-tile border border-dashed border-outline active:bg-surface',
            className,
          )}
        >
          <Plus size={16} color={toneColor('ink')} strokeWidth={2.5} />
          <Text weight="semibold" size="base">
            Add photo or PDF
          </Text>
        </Pressable>
        <ActionMenu
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          title="Add receipt"
          items={items}
        />
      </>
    );
  }

  const failed = state.status === 'failed';
  return (
    <View className={cn('flex-row items-center gap-3', className)}>
      <Preview state={state} />
      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center gap-1.5">
          {failed ? <TriangleAlert size={14} color={toneColor('danger')} strokeWidth={2} /> : null}
          <Text size="base" weight="semibold" tone={failed ? 'danger' : 'ink'}>
            {statusText(state)}
          </Text>
        </View>
        {state.fileName === undefined ? null : (
          <Text size="sm" tone="grey" numberOfLines={1}>
            {state.fileName}
          </Text>
        )}
      </View>
      {failed ? <Button variant="link" size="sm" label="Retry" onPress={onRetry} /> : null}
      <Button variant="link" size="sm" label="Remove" onPress={onRemove} />
    </View>
  );
}

export { type ReceiptPickerProps, type ReceiptPickerState, ReceiptPicker };
