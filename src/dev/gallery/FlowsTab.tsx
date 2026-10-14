import { useState } from 'react';
import { View } from 'react-native';

import {
  Banner,
  Button,
  ConfirmDialog,
  DueDayPicker,
  Field,
  MonthYearPicker,
  OwnershipFootnote,
  StepProgress,
  StickyFooter,
  WizardHeader,
} from '@/components/ui';
import { UnitCard } from '@/features/properties/add/UnitCard';
import { createUnitFormValues, type UnitFormValues } from '@/features/properties/lib/units';
import { addMonthsTo, type DueDay } from '@/shared/dates';

import { Label, Section } from './parts';

const MONTH = '2026-10-01';
const MAX_MONTH = addMonthsTo(MONTH, 12);
const STEPS = ['Property', 'Units', 'Review'] as const;
const noop = () => undefined;

function StepProgressDemo() {
  return (
    <View className="gap-4">
      {STEPS.map((step, index) => (
        <View key={step}>
          <Label>{`Step ${index + 1} · ${step}`}</Label>
          <StepProgress steps={STEPS} current={index} showCount />
        </View>
      ))}
    </View>
  );
}

function WizardHeaderDemo() {
  const [current, setCurrent] = useState(1);
  return (
    <View className="gap-3 overflow-hidden rounded-card">
      <WizardHeader
        title={STEPS[current] ?? ''}
        leftLabel={current === 0 ? 'Cancel' : 'Back'}
        onLeftPress={() => setCurrent((step) => Math.max(0, step - 1))}
        steps={STEPS}
        current={current}
        style={{ paddingTop: 12 }}
      />
      <Button
        variant="secondary"
        size="sm"
        label="Next step"
        onPress={() => setCurrent((step) => Math.min(STEPS.length - 1, step + 1))}
      />
    </View>
  );
}

function DueDayDemo() {
  const [value, setValue] = useState<DueDay>({ type: 'day', day: 1 });
  return (
    <View className="gap-4">
      <Field label="Rent due on the">
        <DueDayPicker value={value} onChange={setValue} />
      </Field>
      <View>
        <Label>Other: 22nd selected</Label>
        <DueDayPicker value={{ type: 'day', day: 22 }} onChange={noop} />
      </View>
      <View>
        <Label>Last day selected</Label>
        <DueDayPicker value={{ type: 'last' }} onChange={noop} />
      </View>
    </View>
  );
}

function MonthYearDemo() {
  const [month, setMonth] = useState(MONTH);
  return (
    <View className="gap-4">
      <Field label="Renting since" hint="Rent is tracked from this month">
        <MonthYearPicker value={month} onChange={setMonth} maxMonth={MAX_MONTH} />
      </Field>
      <Field label="Renting since" error="Pick a month within the next year">
        <MonthYearPicker value="2027-11-01" onChange={noop} maxMonth={MAX_MONTH} />
      </Field>
    </View>
  );
}

function OwnershipDemo() {
  const [share, setShare] = useState<number | null>(100);
  const error =
    share === null || share <= 0 || share > 100 ? 'Enter a share between 1 and 100%' : undefined;
  return <OwnershipFootnote value={share} onChange={setShare} error={error} />;
}

function UnitCardDemo({
  initial,
  ...props
}: { initial: Partial<UnitFormValues> } & Partial<Parameters<typeof UnitCard>[0]>) {
  const [unit, setUnit] = useState<UnitFormValues>({
    ...createUnitFormValues(0, 4, MONTH),
    ...initial,
  });
  return (
    <UnitCard
      value={unit}
      onChange={(patch) => setUnit((current) => ({ ...current, ...patch }))}
      maxMonth={MAX_MONTH}
      {...props}
    />
  );
}

function ConfirmDialogDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" label="Discard this property?" onPress={() => setOpen(true)} />
      <ConfirmDialog
        open={open}
        title="Discard this property?"
        message="What you've entered so far will be lost."
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        destructive
        onConfirm={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}

function FlowsTab() {
  return (
    <View>
      <Section title="StepProgress">
        <StepProgressDemo />
      </Section>

      <Section title="WizardHeader">
        <WizardHeaderDemo />
      </Section>

      <Section title="UnitCard">
        <View className="gap-4">
          <Label>Occupied, with "Use for all units"</Label>
          <UnitCardDemo
            initial={{ rentCents: 145_000, tenantName: 'Sam Lee' }}
            onApplyRentDueToAll={noop}
            onApplyRentStartToAll={noop}
          />
          <Label>Occupied with errors</Label>
          <UnitCardDemo
            initial={{ label: 'Unit 1', labelTouched: true }}
            errors={{
              label: 'Each unit needs a different name',
              rentCents: 'Enter the monthly rent',
            }}
          />
          <Label>Vacant</Label>
          <UnitCardDemo initial={{ label: 'Unit 4', status: 'vacant' }} />
          <Label>I live here</Label>
          <UnitCardDemo
            initial={{ label: 'Upstairs', labelTouched: true, status: 'owner_occupied' }}
          />
          <Label>Single (house)</Label>
          <UnitCardDemo
            initial={{ ...createUnitFormValues(0, 1, MONTH), rentCents: 180_000 }}
            variant="single"
            title="Maplewood House"
          />
        </View>
      </Section>

      <Section title="DueDayPicker">
        <DueDayDemo />
      </Section>

      <Section title="MonthYearPicker">
        <MonthYearDemo />
      </Section>

      <Section title="OwnershipFootnote">
        <OwnershipDemo />
      </Section>

      <Section title="Banner">
        <View className="gap-3">
          <Banner message="At least one unit has to be rented or vacant." />
          <Banner tone="warning" message="Couldn't save. Check your connection and try again." />
          <Banner tone="info" message="You can change any of this later." />
        </View>
      </Section>

      <Section title="ConfirmDialog">
        <ConfirmDialogDemo />
      </Section>

      <Section title="StickyFooter">
        <View className="overflow-hidden rounded-card">
          <StickyFooter summary="Total rent: $4,350/mo · 3 occupied · 1 vacant">
            <Button fullWidth size="lg" label="Next: review" onPress={noop} />
          </StickyFooter>
        </View>
      </Section>
    </View>
  );
}

export { FlowsTab };
