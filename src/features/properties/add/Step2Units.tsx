import { View, type LayoutChangeEvent } from 'react-native';

import { Banner, Text } from '@/components/ui';

import { UnitCard } from './UnitCard';
import type { AddPropertyForm } from './useAddPropertyForm';

type Step2UnitsProps = {
  form: AddPropertyForm;
  trackPosition: (key: string) => (event: LayoutChangeEvent) => void;
};

/** Step 2 of 3: one card per unit, or a single card without unit wording for a house. */
function Step2Units({ form, trackPosition }: Step2UnitsProps) {
  const { values, errors } = form;
  const unitErrors = errors.units;
  const listError = unitErrors?.root?.message ?? unitErrors?.message;
  const single = values.units.length === 1;
  const errorsFor = (index: number) => {
    const error = unitErrors?.[index];
    return {
      label: error?.label?.message,
      rentCents: error?.rentCents?.message,
      rentStartDate: error?.rentStartDate?.message,
    };
  };

  if (single) {
    const unit = values.units[0];
    if (unit === undefined) return null;
    return (
      <View onLayout={trackPosition('unit-0')}>
        <UnitCard
          variant="single"
          title={values.name}
          value={unit}
          onChange={(patch) => form.updateUnit(0, patch)}
          errors={errorsFor(0)}
          maxMonth={form.maxMonth}
        />
      </View>
    );
  }

  return (
    <View className="gap-4">
      <Text size="base" tone="grey">
        Rent for each unit. Mark a unit vacant if nobody rents it, or "I live here" if it's yours.
      </Text>

      {listError === undefined ? null : (
        <View onLayout={trackPosition('units')}>
          <Banner message={listError} />
        </View>
      )}

      {values.units.map((unit, index) => (
        // Units have no id until saved; their position is their identity in this form.
        <View key={index} onLayout={trackPosition(`unit-${index}`)}>
          <UnitCard
            value={unit}
            onChange={(patch) => form.updateUnit(index, patch)}
            errors={errorsFor(index)}
            maxMonth={form.maxMonth}
            onApplyRentDueToAll={index === 0 ? () => form.applyToAll('rentDue') : undefined}
            onApplyRentStartToAll={index === 0 ? () => form.applyToAll('rentStartDate') : undefined}
          />
        </View>
      ))}
    </View>
  );
}

export { Step2Units };
