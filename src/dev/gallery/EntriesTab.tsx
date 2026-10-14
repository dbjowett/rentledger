import { useState } from 'react';
import { View } from 'react-native';
import { Camera, FileText, Image as ImageIcon } from 'lucide-react-native';

import {
  ActionMenu,
  Button,
  ChipGroup,
  DateField,
  Field,
  SplitBar,
  SwitchRow,
  Text,
  type ChipOption,
} from '@/components/ui';
import { CategoryPicker } from '@/features/entries/components/CategoryPicker';
import {
  ReceiptPicker,
  type ReceiptPickerState,
} from '@/features/entries/components/ReceiptPicker';
import { SplitCard, SPLIT_TONES } from '@/features/entries/components/SplitCard';
import type { SplitMode } from '@/features/entries/lib/entry';
import { pickReceipt } from '@/features/entries/lib/pickReceipt';
import { prepareReceipt } from '@/features/entries/lib/prepareReceipt';
import { basisPointsToPercent, evenBasisPoints } from '@/features/entries/lib/split';
import type { IsoDate } from '@/shared/dates';
import type { Category } from '@/shared/types';

import { Label, Section } from './parts';

const noop = () => undefined;

const units = [
  { id: 'u1', label: 'Unit 1' },
  { id: 'u2', label: 'Unit 2' },
  { id: 'u3', label: 'Unit 3' },
];

function category(key: string, name: string, code: string | null, sortOrder: number): Category {
  return {
    id: key,
    key,
    name,
    kind: 'expense',
    sortOrder,
    taxLine: code === null ? null : { code, label: name },
    useCount: 0,
  };
}

const sampleCategories: Category[] = [
  category('repairs', 'Repairs and maintenance', '8960', 1),
  category('utilities', 'Utilities', '9220', 2),
  category('insurance', 'Insurance', '8690', 3),
  category('property_taxes', 'Property taxes', '9180', 4),
  category('mortgage_interest', 'Mortgage interest', '8710', 5),
  category('other_expenses', 'Other expenses', '9270', 6),
  category('advertising', 'Advertising', '8521', 7),
  category('management_fees', 'Management and admin fees', '8871', 8),
  category('professional_fees', 'Professional fees', '8860', 9),
  category('mortgage_principal', 'Mortgage principal', null, 10),
];

const unitOptions: Array<ChipOption<string>> = [
  { value: 'building', label: 'Whole building' },
  { value: 'u1', label: 'Unit 1' },
  { value: 'u2', label: 'Unit 2' },
  { value: 'mine', label: 'My unit', tag: 'Yours' },
];

function evenPercents(ids: readonly string[]): Record<string, string> {
  const shares = evenBasisPoints(ids.length);
  return Object.fromEntries(ids.map((id, index) => [id, basisPointsToPercent(shares[index] ?? 0)]));
}

function ChipsDemo() {
  const [property, setProperty] = useState<string | null>('cedar');
  const [selected, setSelected] = useState<string[]>(['u1', 'u2']);
  return (
    <View className="gap-4">
      <View>
        <Label>Single select, scrolling (selected is solid black)</Label>
        <ChipGroup
          scrollable
          value={property}
          onChange={setProperty}
          options={[
            { value: 'cedar', label: 'Cedar Row' },
            { value: 'maple', label: 'Maplewood' },
            { value: 'willow', label: 'Willow Creek' },
          ]}
        />
      </View>
      <View>
        <Label>Multi select with a "Yours" tag</Label>
        <ChipGroup multiple value={selected} onChange={setSelected} options={unitOptions} />
      </View>
    </View>
  );
}

function SplitCardDemo({
  initialMode,
  initialPercents,
}: {
  initialMode: SplitMode;
  initialPercents?: Record<string, string>;
}) {
  const ids =
    initialPercents === undefined ? units.map((unit) => unit.id) : Object.keys(initialPercents);
  const shown = units.filter((unit) => ids.includes(unit.id));
  const [mode, setMode] = useState<SplitMode>(initialMode);
  const [percents, setPercents] = useState<Record<string, string>>(
    initialPercents ?? evenPercents(ids),
  );
  return (
    <SplitCard
      units={shown}
      amountCents={10_000}
      mode={mode}
      onModeChange={(next) => {
        if (next === 'custom') setPercents(evenPercents(ids));
        setMode(next);
      }}
      percents={percents}
      onPercentChange={(id, text) => setPercents((current) => ({ ...current, [id]: text }))}
      onResetToEven={() => setPercents(evenPercents(ids))}
    />
  );
}

function CategoryDemo() {
  const [value, setValue] = useState<string | null>('repairs');
  return <CategoryPicker categories={sampleCategories} value={value} onChange={setValue} />;
}

function DetailsDemo() {
  const [date, setDate] = useState<IsoDate>('2026-10-08');
  const [repeat, setRepeat] = useState(false);
  const [capital, setCapital] = useState(false);
  return (
    <View>
      <Field label="Date">
        <DateField value={date} onChange={setDate} maxDate="2027-10-08" />
      </Field>
      <SwitchRow
        className="mt-3 border-b border-line"
        label="Repeat monthly"
        hint="Adds this every month on the same day"
        value={repeat}
        onValueChange={setRepeat}
      />
      <SwitchRow
        label="Capital improvement"
        hint="A new roof or kitchen, not a repair. Depreciated, not expensed."
        value={capital}
        onValueChange={setCapital}
      />
    </View>
  );
}

function ActionMenuDemo() {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState('Nothing picked');
  return (
    <View className="gap-2">
      <Button variant="secondary" label="Open ActionMenu" onPress={() => setOpen(true)} />
      <Text size="sm" tone="grey">
        {picked}
      </Text>
      <ActionMenu
        open={open}
        onClose={() => setOpen(false)}
        title="Add receipt"
        items={[
          {
            key: 'camera',
            label: 'Take photo',
            icon: Camera,
            onPress: () => setPicked('Take photo'),
          },
          {
            key: 'library',
            label: 'Choose photo',
            icon: ImageIcon,
            onPress: () => setPicked('Choose photo'),
          },
          {
            key: 'pdf',
            label: 'Choose PDF',
            icon: FileText,
            onPress: () => setPicked('Choose PDF'),
          },
        ]}
      />
    </View>
  );
}

/** Picks and prepares a real file (no upload) to check resizing on the device. */
function LiveReceiptDemo() {
  const [state, setState] = useState<ReceiptPickerState>({ status: 'empty' });
  const [info, setInfo] = useState('Pick a photo to see its size after resizing.');

  const pick = async (source: 'camera' | 'library' | 'pdf') => {
    const result = await pickReceipt(source);
    if (result.status === 'denied') {
      setInfo('Camera permission was refused.');
      return;
    }
    if (result.status === 'cancelled') return;
    const { receipt } = result;
    setState({
      status: 'uploading',
      uri: receipt.uri,
      kind: receipt.kind,
      fileName: receipt.fileName,
    });
    const prepared = await prepareReceipt(receipt);
    setState({
      status: 'uploaded',
      uri: prepared.uri,
      kind: receipt.kind,
      fileName: receipt.fileName,
    });
    setInfo(`${prepared.mimeType} · ${Math.round(prepared.sizeBytes / 1024)} KB`);
  };

  return (
    <View className="gap-2">
      <ReceiptPicker
        state={state}
        onPick={(source) => void pick(source)}
        onRemove={() => setState({ status: 'empty' })}
        onRetry={noop}
      />
      <Text size="sm" tone="grey">
        {info}
      </Text>
    </View>
  );
}

function EntriesTab() {
  const pdf = 'file:///receipt.pdf';
  return (
    <View>
      <Section title="Chips">
        <ChipsDemo />
      </Section>

      <Section title="SplitBar tones">
        <SplitBar
          segments={SPLIT_TONES.map((tone) => ({ key: tone, label: tone, value: 1, tone }))}
          legend
        />
      </Section>

      <Section title="SplitCard">
        <View className="gap-4">
          <Label>Evenly across 3 units, $100</Label>
          <SplitCardDemo initialMode="even" />
          <Label>Custom 25 / 75</Label>
          <SplitCardDemo initialMode="custom" initialPercents={{ u1: '25', u2: '75' }} />
          <Label>Custom, off by 5%</Label>
          <SplitCardDemo initialMode="custom" initialPercents={{ u1: '25', u2: '70' }} />
        </View>
      </Section>

      <Section title="CategoryPicker">
        <CategoryDemo />
      </Section>

      <Section title="DateField + SwitchRow">
        <DetailsDemo />
      </Section>

      <Section title="ActionMenu">
        <ActionMenuDemo />
      </Section>

      <Section title="ReceiptPicker">
        <View className="gap-4">
          <Label>Live: pick and resize (no upload)</Label>
          <LiveReceiptDemo />
          <Label>Uploading PDF</Label>
          <ReceiptPicker
            state={{ status: 'uploading', uri: pdf, kind: 'pdf', fileName: 'hydro-oct.pdf' }}
            onPick={noop}
            onRemove={noop}
            onRetry={noop}
          />
          <Label>Failed</Label>
          <ReceiptPicker
            state={{ status: 'failed', uri: pdf, kind: 'pdf', fileName: 'hydro-oct.pdf' }}
            onPick={noop}
            onRemove={noop}
            onRetry={noop}
          />
        </View>
      </Section>
    </View>
  );
}

export { EntriesTab };
