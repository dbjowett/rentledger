import { useState } from 'react';
import { View } from 'react-native';

import {
  Button,
  ChipGroup,
  Field,
  MoneyInput,
  Sheet,
  Text,
  TextInput,
  toast,
  useToast,
  type ChipOption,
} from '@/components/ui';

import { Label, Section } from './parts';

type Category = 'repairs' | 'insurance' | 'utilities' | 'taxes';

const categories: Array<ChipOption<Category>> = [
  { value: 'repairs', label: 'Repairs', sublabel: 'Line 8960' },
  { value: 'insurance', label: 'Insurance', sublabel: 'Line 8690' },
  { value: 'utilities', label: 'Utilities', sublabel: 'Line 9220' },
  { value: 'taxes', label: 'Property tax', sublabel: 'Line 9180' },
];

function FormSheetDemo() {
  const [open, setOpen] = useState(false);
  const [cents, setCents] = useState<number | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [vendor, setVendor] = useState('');
  const [saved, setSaved] = useState<string | null>(null);

  const reset = () => {
    setCents(null);
    setCategory(null);
    setVendor('');
  };

  const save = () => {
    setSaved(
      `${vendor === '' ? 'Expense' : vendor} · ${category ?? 'uncategorised'} · ${String(cents ?? 0)}¢`,
    );
    setOpen(false);
    reset();
    toast.show({ message: 'Expense saved', action: { label: 'View', onPress: () => undefined } });
  };

  return (
    <View className="gap-2">
      <Button label="Add expense" onPress={() => setOpen(true)} />
      {saved === null ? null : (
        <Text size="sm" tone="grey">
          {`last saved: ${saved}`}
        </Text>
      )}
      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="Add expense"
        action={{
          label: 'Reset',
          onPress: reset,
          disabled: cents === null && category === null && vendor === '',
        }}
        footer={
          <Button
            fullWidth
            size="lg"
            shape="rounded"
            label="Save expense"
            disabled={cents === null}
            onPress={save}
          />
        }
      >
        <View className="gap-5">
          <Field label="Amount" required>
            <MoneyInput cents={cents} onChangeCents={setCents} />
          </Field>
          <Field label="Vendor">
            <TextInput value={vendor} onChangeText={setVendor} placeholder="e.g. Home Depot" />
          </Field>
          <View className="gap-2">
            <Text weight="semibold" size="base">
              Category
            </Text>
            <ChipGroup options={categories} value={category} onChange={setCategory} />
          </View>
        </View>
      </Sheet>
    </View>
  );
}

function ConfirmSheetDemo() {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <Button variant="secondary" label="Delete entry…" onPress={() => setOpen(true)} />
      <Sheet open={open} onClose={() => setOpen(false)} title="Delete entry?">
        <View className="gap-4">
          <Text tone="grey">
            This removes the Home Depot expense from 2026. Your receipt photo is kept.
          </Text>
          <Button
            fullWidth
            variant="danger"
            size="lg"
            shape="rounded"
            label="Delete"
            onPress={() => setOpen(false)}
          />
        </View>
      </Sheet>
    </View>
  );
}

function ToastDemo() {
  const { show } = useToast();
  const [undone, setUndone] = useState(0);
  return (
    <View className="gap-3">
      <Button
        variant="secondary"
        label="Success toast"
        onPress={() => show({ message: 'Rent confirmed for Unit 2' })}
      />
      <Button
        variant="secondary"
        label="With Undo"
        onPress={() =>
          show({
            message: 'Entry deleted',
            action: { label: 'Undo', onPress: () => setUndone((n) => n + 1) },
          })
        }
      />
      <Button
        variant="secondary"
        label="Neutral, long message"
        onPress={() =>
          show({
            variant: 'neutral',
            message: 'Receipt uploaded. We will try to match it to an expense in the background.',
          })
        }
      />
      <Button
        variant="secondary"
        label="toast.show() outside hooks"
        onPress={() => toast.show({ message: 'Shown via the imperative API' })}
      />
      <Text size="sm" tone="grey">
        {`Undo pressed: ${undone}`}
      </Text>
    </View>
  );
}

export function OverlaysTab() {
  return (
    <>
      <Section title="Toast">
        <ToastDemo />
      </Section>

      <Section title="Sheet">
        <View className="gap-5">
          <View>
            <Label>form: header action + sticky footer</Label>
            <FormSheetDemo />
          </View>
          <View>
            <Label>short content, no footer or action</Label>
            <ConfirmSheetDemo />
          </View>
        </View>
      </Section>
    </>
  );
}
