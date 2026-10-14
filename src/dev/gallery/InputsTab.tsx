import { useState } from 'react';
import { View } from 'react-native';

import {
  Card,
  Amount,
  Chip,
  ChipGroup,
  Field,
  MoneyInput,
  Radio,
  RadioGroup,
  SegmentedControl,
  NumberStepper,
  Switch,
  Text,
  TextInput,
  type ChipOption,
  type RadioOption,
  type SegmentOption,
} from '@/components/ui';

import { Label, Row, Section } from './parts';

type ExpenseLine = 'repairs' | 'insurance' | 'interest' | 'taxes' | 'utilities' | 'management';

const expenseLines: Array<ChipOption<ExpenseLine>> = [
  { value: 'repairs', label: 'Repairs', sublabel: 'Line 8960' },
  { value: 'insurance', label: 'Insurance', sublabel: 'Line 8690' },
  { value: 'interest', label: 'Interest', sublabel: 'Line 8710' },
  { value: 'taxes', label: 'Property tax', sublabel: 'Line 9180' },
  { value: 'utilities', label: 'Utilities', sublabel: 'Line 9220' },
  { value: 'management', label: 'Management', sublabel: 'Line 8871', disabled: true },
];

type Unit = 'u1' | 'u2' | 'u3' | 'u4';

const units: Array<ChipOption<Unit>> = [
  { value: 'u1', label: 'Unit 1' },
  { value: 'u2', label: 'Unit 2' },
  { value: 'u3', label: 'Unit 3' },
  { value: 'u4', label: 'Basement' },
];

type Period = 'month' | 'quarter' | 'ytd' | 'last-year' | 'all' | 'custom';

const periods: Array<ChipOption<Period>> = [
  { value: 'month', label: 'This month' },
  { value: 'quarter', label: 'This quarter' },
  { value: 'ytd', label: 'Year to date' },
  { value: 'last-year', label: '2025' },
  { value: 'all', label: 'All time' },
  { value: 'custom', label: 'Custom range' },
];

type EntryKind = 'income' | 'expense';
type Range = 'month' | 'year' | 'all';

const entryKinds: Array<SegmentOption<EntryKind>> = [
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
];

const ranges: Array<SegmentOption<Range>> = [
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
  { value: 'all', label: 'All time' },
];

type Ownership = 'personal' | 'joint' | 'corporation';

const ownershipOptions: Array<RadioOption<Ownership>> = [
  { value: 'personal', label: 'Just me', sublabel: 'Report 100% on your T776' },
  { value: 'joint', label: 'Co-owned', sublabel: 'Split income and expenses by share' },
  {
    value: 'corporation',
    label: 'Through a corporation',
    sublabel: 'Not supported yet',
    disabled: true,
  },
];

function SwitchDemo() {
  const [reminders, setReminders] = useState(true);
  const [estimates, setEstimates] = useState(false);
  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text>Rent due reminders</Text>
        <Switch
          accessibilityLabel="Rent due reminders"
          value={reminders}
          onValueChange={setReminders}
        />
      </View>
      <View className="flex-row items-center justify-between">
        <Text>Estimate mortgage interest</Text>
        <Switch
          accessibilityLabel="Estimate mortgage interest"
          value={estimates}
          onValueChange={setEstimates}
        />
      </View>
      <View className="flex-row items-center justify-between">
        <Text tone="grey">Disabled (on)</Text>
        <Switch accessibilityLabel="Disabled on" value disabled onValueChange={() => undefined} />
      </View>
    </View>
  );
}

function NumberStepperDemo() {
  const [unitCount, setUnitCount] = useState(2);
  const [share, setShare] = useState(50);
  return (
    <View className="gap-4">
      <View className="flex-row items-center justify-between">
        <Text>Units</Text>
        <NumberStepper
          accessibilityLabel="Units"
          value={unitCount}
          onChange={setUnitCount}
          min={1}
          max={6}
        />
      </View>
      <View className="flex-row items-center justify-between">
        <Text>Ownership share</Text>
        <NumberStepper
          accessibilityLabel="Ownership share"
          value={share}
          onChange={setShare}
          min={0}
          max={100}
          step={25}
          formatValue={(v) => `${v}%`}
        />
      </View>
      <Field label="How many rental units?">
        <NumberStepper
          accessibilityLabel="Rental units"
          value={unitCount}
          onChange={setUnitCount}
          min={1}
          max={20}
          title={unitCount === 1 ? '1 unit' : `${unitCount} units`}
          description="A house or condo is 1"
        />
      </Field>
    </View>
  );
}

function RadioDemo() {
  const [value, setValue] = useState<Ownership | null>('personal');
  return <RadioGroup options={ownershipOptions} value={value} onChange={setValue} />;
}

function NameDemo() {
  const [name, setName] = useState('');
  const error =
    name.length > 0 && name.trim().length < 2 ? 'Enter at least 2 characters' : undefined;
  return (
    <Field label="Tenant name" hint="As it appears on the lease" error={error} required>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="e.g. Jordan Lee"
        autoCapitalize="words"
      />
    </Field>
  );
}

function MoneyDemo() {
  const [cents, setCents] = useState<number | null>(180_000);
  return (
    <View className="gap-2">
      <Field label="Monthly rent" hint="Type dollars; stored as cents" required>
        <MoneyInput cents={cents} onChangeCents={setCents} />
      </Field>
      <View className="flex-row items-center gap-2">
        <Text size="sm" tone="grey">
          {`stored: ${cents === null ? 'null' : String(cents)} ·`}
        </Text>
        {cents === null ? null : <Amount size="sm" cents={cents} />}
      </View>
    </View>
  );
}

function SegmentDemo({ size }: { size: 'sm' | 'md' }) {
  const [kind, setKind] = useState<EntryKind>('expense');
  const [range, setRange] = useState<Range>('year');
  return (
    <View className="gap-3">
      <SegmentedControl size={size} options={entryKinds} value={kind} onChange={setKind} />
      <SegmentedControl size={size} options={ranges} value={range} onChange={setRange} />
    </View>
  );
}

function SingleDemo() {
  const [value, setValue] = useState<ExpenseLine | null>('repairs');
  return <ChipGroup options={expenseLines} value={value} onChange={setValue} />;
}

function MultiDemo() {
  const [value, setValue] = useState<Unit[]>(['u1', 'u3']);
  return <ChipGroup multiple options={units} value={value} onChange={setValue} />;
}

function ScrollDemo() {
  const [value, setValue] = useState<Period | null>('ytd');
  return (
    <ChipGroup
      scrollable
      options={periods}
      value={value}
      onChange={setValue}
      className="-mx-screen"
      contentContainerClassName="px-screen"
    />
  );
}

export function InputsTab() {
  return (
    <>
      <Section title="Chip">
        <Label>states</Label>
        <Row>
          <Chip label="Unselected" />
          <Chip selected label="Selected" />
          <Chip disabled label="Disabled" />
        </Row>
        <Label>with sublabel</Label>
        <Row>
          <Chip label="Repairs" sublabel="Line 8960" />
          <Chip selected label="Insurance" sublabel="Line 8690" />
        </Row>
      </Section>

      <Section title="Field + TextInput">
        <View className="gap-5">
          <NameDemo />
          <Field label="Property address" hint="Street, city and postal code">
            <TextInput placeholder="123 Maple St, Ottawa ON" />
          </Field>
          <Field label="Unit" error="This unit already exists">
            <TextInput defaultValue="Unit 2" />
          </Field>
          <Field label="Province">
            <TextInput defaultValue="Ontario" editable={false} />
          </Field>
          <Field label="Notes">
            <TextInput multiline placeholder="Anything worth remembering at tax time" />
          </Field>
          <View>
            <Label>without a Field (invalid prop)</Label>
            <TextInput invalid placeholder="Standalone error state" />
          </View>
        </View>
      </Section>

      <Section title="MoneyInput">
        <View className="gap-5">
          <MoneyDemo />
          <Field label="Monthly rent" hint="Small size with a suffix, as in the unit cards">
            <MoneyInput size="sm" suffix="/mo" cents={145_000} onChangeCents={() => undefined} />
          </Field>
          <Field label="Repair cost" error="Amount is required" required>
            <MoneyInput cents={null} onChangeCents={() => undefined} />
          </Field>
          <Field label="Deposit held">
            <MoneyInput cents={250_000} onChangeCents={() => undefined} editable={false} />
          </Field>
        </View>
      </Section>

      <Section title="Switch">
        <Card>
          <SwitchDemo />
        </Card>
      </Section>

      <Section title="NumberStepper">
        <Card>
          <NumberStepperDemo />
        </Card>
      </Section>

      <Section title="Radio">
        <Card>
          <RadioDemo />
        </Card>
        <View className="mt-3">
          <Label>single Radio, unselected</Label>
          <Radio label="Standalone option" selected={false} />
        </View>
      </Section>

      <Section title="SegmentedControl">
        <View className="gap-4">
          <View>
            <Label>md, on a card</Label>
            <Card>
              <SegmentDemo size="md" />
            </Card>
          </View>
          <View>
            <Label>sm, on a card</Label>
            <Card>
              <SegmentDemo size="sm" />
            </Card>
          </View>
        </View>
      </Section>

      <Section title="ChipGroup">
        <View className="gap-4">
          <View>
            <Label>single select (T776 line, one disabled)</Label>
            <SingleDemo />
          </View>
          <View>
            <Label>multi select (units)</Label>
            <MultiDemo />
          </View>
          <View>
            <Label>scrollable row (period)</Label>
            <ScrollDemo />
          </View>
        </View>
      </Section>
    </>
  );
}
