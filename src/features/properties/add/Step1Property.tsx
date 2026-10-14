import { useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';

import { ConfirmDialog, Field, NumberStepper, OwnershipFootnote, TextInput } from '@/components/ui';

import { unitHasData } from '../lib/units';
import { MAX_UNITS_IN_FORM } from './formSchema';
import type { AddPropertyForm } from './useAddPropertyForm';

type Step1PropertyProps = {
  form: AddPropertyForm;
  /** Records where a field sits so the screen can scroll to the first error. */
  trackPosition: (key: string) => (event: LayoutChangeEvent) => void;
};

function unitCountTitle(count: number) {
  return count === 1 ? '1 unit' : `${count} units`;
}

function removalTitle(labels: string[]) {
  if (labels.length === 1) return `Remove ${labels[0] ?? 'this unit'}?`;
  return `Remove ${labels.length} units?`;
}

/** Step 1 of 3: address, name, number of units and the ownership footnote. */
function Step1Property({ form, trackPosition }: Step1PropertyProps) {
  const { values, errors } = form;
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const removing = pendingCount === null ? [] : values.units.slice(pendingCount);

  const changeUnitCount = (count: number) => {
    const dropped = values.units.slice(count);
    if (dropped.some((unit) => unitHasData(unit))) {
      setPendingCount(count);
      return;
    }
    form.setUnitCount(count);
  };

  const confirmRemoval = () => {
    if (pendingCount !== null) form.setUnitCount(pendingCount);
    setPendingCount(null);
  };

  return (
    <View className="gap-5">
      <View onLayout={trackPosition('address')}>
        <Field label="Address" required error={errors.address?.message}>
          <TextInput
            value={values.address}
            onChangeText={form.setAddress}
            placeholder="123 Cedar Row, Toronto ON"
            autoFocus
            autoCapitalize="words"
            autoComplete="street-address"
            textContentType="fullStreetAddress"
            returnKeyType="next"
            maxLength={200}
          />
        </Field>
      </View>

      <View onLayout={trackPosition('name')}>
        <Field label="Name" required hint="How it's shown in the app" error={errors.name?.message}>
          <TextInput
            value={values.name}
            onChangeText={form.setName}
            placeholder="Cedar Row"
            autoCapitalize="words"
            maxLength={80}
          />
        </Field>
      </View>

      <Field label="How many rental units?">
        <NumberStepper
          accessibilityLabel="Rental units"
          value={values.units.length}
          onChange={changeUnitCount}
          min={1}
          max={MAX_UNITS_IN_FORM}
          title={unitCountTitle(values.units.length)}
          description="A house or condo is 1"
        />
      </Field>

      <View onLayout={trackPosition('ownershipPct')}>
        <OwnershipFootnote
          value={values.ownershipPct}
          onChange={form.setOwnershipPct}
          error={errors.ownershipPct?.message}
        />
      </View>

      <ConfirmDialog
        open={pendingCount !== null}
        title={removalTitle(removing.map((unit) => unit.label))}
        message={
          removing.length === 1 ? 'Its details will be cleared.' : 'Their details will be cleared.'
        }
        confirmLabel="Remove"
        cancelLabel="Keep"
        destructive
        onConfirm={confirmRemoval}
        onCancel={() => setPendingCount(null)}
      />
    </View>
  );
}

export { Step1Property };
