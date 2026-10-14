import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Pencil } from 'lucide-react-native';

import {
  Button,
  Card,
  DueDayPicker,
  Field,
  MonthYearPicker,
  MoneyInput,
  SegmentedControl,
  Text,
  TextInput,
  type SegmentOption,
} from '@/components/ui';
import type { MonthStart } from '@/shared/dates';
import type { UnitStatus } from '@/shared/types';
import { toneColor } from '@/theme/tokens';

import type { UnitFormValues } from '../lib/units';

type UnitCardVariant = 'multi' | 'single';

type UnitCardErrors = Partial<Record<'label' | 'rentCents' | 'rentStartDate', string>>;

type UnitCardProps = {
  value: UnitFormValues;
  onChange: (patch: Partial<UnitFormValues>) => void;
  /** `single` is a house: no unit name and no "I live here". */
  variant?: UnitCardVariant;
  /** Shown instead of the unit name on a house, e.g. the property name. */
  title?: string;
  errors?: UnitCardErrors;
  /** Latest month "Renting since" can be. */
  maxMonth: MonthStart;
  /** Shows "Use for all units" under the due day; copies it to every occupied unit. */
  onApplyRentDueToAll?: () => void;
  /** Shows "Use for all units" under renting since. */
  onApplyRentStartToAll?: () => void;
};

const statusOptions: Array<SegmentOption<UnitStatus>> = [
  { value: 'occupied', label: 'Occupied' },
  { value: 'vacant', label: 'Vacant' },
  { value: 'owner_occupied', label: 'I live here' },
];

const rentedStatusOptions = statusOptions.filter((option) => option.value !== 'owner_occupied');

function UnitLabel({
  label,
  error,
  onChange,
}: {
  label: string;
  error?: string;
  onChange: (label: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const showEditor = editing || (error !== undefined && error !== '');

  if (showEditor) {
    return (
      <Field label="Unit name" error={error}>
        <TextInput
          value={label}
          onChangeText={onChange}
          onBlur={() => setEditing(false)}
          onSubmitEditing={() => setEditing(false)}
          autoFocus={editing}
          maxLength={40}
          returnKeyType="done"
          placeholder="e.g. Upstairs"
        />
      </Field>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}, rename`}
      onPress={() => setEditing(true)}
      hitSlop={8}
      className="flex-row items-center gap-2 self-start active:opacity-70"
    >
      <Text weight="semibold" size="lg">
        {label}
      </Text>
      <Pencil size={16} color={toneColor('grey')} strokeWidth={2} />
    </Pressable>
  );
}

function ApplyToAll({ onPress }: { onPress?: () => void }) {
  if (onPress === undefined) return null;
  return (
    <View className="flex-row">
      <Button variant="link" size="sm" label="Use for all units" onPress={onPress} />
    </View>
  );
}

function OccupiedFields({
  value,
  onChange,
  errors,
  maxMonth,
  onApplyRentDueToAll,
  onApplyRentStartToAll,
}: Omit<UnitCardProps, 'variant' | 'title'>) {
  return (
    <View className="gap-4">
      <View className="flex-row gap-3">
        <Field label="Monthly rent" required error={errors?.rentCents} className="flex-1">
          <MoneyInput
            size="sm"
            suffix="/mo"
            placeholder="0"
            cents={value.rentCents}
            onChangeCents={(rentCents) => onChange({ rentCents })}
          />
        </Field>
        <Field label="Tenant" hint="Optional" className="flex-1">
          <TextInput
            value={value.tenantName}
            onChangeText={(tenantName) => onChange({ tenantName })}
            placeholder="Name"
            autoCapitalize="words"
            maxLength={80}
          />
        </Field>
      </View>
      <View className="gap-1">
        <Field label="Rent due on the">
          <DueDayPicker value={value.rentDue} onChange={(rentDue) => onChange({ rentDue })} />
        </Field>
        <ApplyToAll onPress={onApplyRentDueToAll} />
      </View>
      <View className="gap-1">
        <Field
          label="Renting since"
          hint="Rent is tracked from this month"
          error={errors?.rentStartDate}
        >
          <MonthYearPicker
            value={value.rentStartDate}
            onChange={(rentStartDate) => onChange({ rentStartDate })}
            maxMonth={maxMonth}
          />
        </Field>
        <ApplyToAll onPress={onApplyRentStartToAll} />
      </View>
    </View>
  );
}

/** One unit in the add-property flow: name, status, and the fields that status needs. */
function UnitCard({ variant = 'multi', title, ...props }: UnitCardProps) {
  const { value, onChange, errors } = props;
  const multi = variant === 'multi';

  return (
    <Card className="gap-4">
      {multi ? (
        <UnitLabel
          label={value.label}
          error={errors?.label}
          onChange={(label) => onChange({ label, labelTouched: true })}
        />
      ) : (
        <Text weight="semibold" size="lg">
          {title}
        </Text>
      )}

      <SegmentedControl
        accessibilityLabel={multi ? `${value.label} status` : 'Status'}
        options={multi ? statusOptions : rentedStatusOptions}
        value={value.status}
        onChange={(status) => onChange({ status })}
      />

      {value.status === 'occupied' ? <OccupiedFields {...props} /> : null}

      {value.status === 'vacant' ? (
        <Field label="Expected rent" hint="Optional: what you'd ask for it">
          <MoneyInput
            size="sm"
            suffix="/mo"
            placeholder="0"
            cents={value.rentCents}
            onChangeCents={(rentCents) => onChange({ rentCents })}
          />
        </Field>
      ) : null}

      {value.status === 'owner_occupied' ? (
        <Text size="base" tone="grey">
          No rent is tracked for this unit.
        </Text>
      ) : null}
    </Card>
  );
}

export { type UnitCardErrors, type UnitCardProps, type UnitCardVariant, UnitCard };
