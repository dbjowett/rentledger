import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { router } from 'expo-router';

import {
  Banner,
  Button,
  ChipGroup,
  ConfirmDialog,
  DateField,
  Field,
  MoneyInput,
  MonthYearPicker,
  SegmentedControl,
  Sheet,
  SwitchRow,
  Text,
  TextInput,
  toast,
  type ChipOption,
  type SegmentOption,
} from '@/components/ui';
import { ApiRequestError } from '@/lib/api';
import { addDaysTo, addMonthsTo, currentMonthStart, todayIn } from '@/shared/dates';
import { formatCents } from '@/shared/money';
import { MAX_MONTHS_AHEAD, type EntryKind } from '@/shared/schemas';
import { toneColor } from '@/theme/tokens';

import { useUserTimeZone } from '../profile/queries';
import { useProperties } from '../properties/queries';
import { CategoryPicker } from './components/CategoryPicker';
import { ReceiptPicker } from './components/ReceiptPicker';
import { SplitCard } from './components/SplitCard';
import { isMortgageCategory, isRentCategory } from './lib/entry';
import { useCreateTransaction } from './queries';
import {
  type NewEntryForm,
  type NewEntryOptions,
  useNewEntryForm,
  WHOLE_BUILDING,
} from './useNewEntryForm';
import { type ReceiptUpload, useReceiptUpload } from './useReceiptUpload';

const CONNECTION_ERROR = "Couldn't save. Check your connection and try again.";
const DAYS_PER_YEAR = 365;

const kindOptions: Array<SegmentOption<EntryKind>> = [
  { value: 'expense', label: 'Expense' },
  { value: 'income', label: 'Income' },
];

type NewEntryRequest = { options: NewEntryOptions; id: number };

type NewEntrySheetProps = {
  /** Set to open the drawer; a new id starts a fresh entry. Null closes it. */
  request: NewEntryRequest | null;
  onClose: () => void;
  /** Property of the last saved entry, preselected next time. */
  lastPropertyId: string | null;
  onSaved: (propertyId: string) => void;
};

/** A field label with an optional muted note on the right ("Tap 2+ to split"). */
function Section({
  label,
  note,
  error,
  children,
}: {
  label: string;
  note?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <View className="gap-2">
      <View className="flex-row items-baseline justify-between">
        <Text weight="semibold" size="base">
          {label}
        </Text>
        {note === undefined ? null : (
          <Text size="sm" tone="grey">
            {note}
          </Text>
        )}
      </View>
      {children}
      {error === undefined ? null : (
        <Text size="sm" tone="danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}
    </View>
  );
}

function PropertySection({ entry }: { entry: NewEntryForm }) {
  const properties = useProperties();
  const list = properties.data ?? [];

  if (properties.isPending) return <ActivityIndicator color={toneColor('accent')} />;
  if (list.length === 0) {
    return (
      <Section label="Property">
        <Text tone="grey">Add a property first, then log its income and expenses.</Text>
        <Button
          variant="secondary"
          label="Add property"
          onPress={() => router.push('/properties/new')}
        />
      </Section>
    );
  }

  return (
    <Section label="Property" error={entry.errors.property}>
      <ChipGroup
        scrollable
        value={entry.values.propertyId}
        onChange={entry.setProperty}
        options={list.map((property) => ({ value: property.id, label: property.name }))}
      />
    </Section>
  );
}

function UnitSection({ entry }: { entry: NewEntryForm }) {
  const { values, units } = entry;
  if (entry.unitsLoading) return <ActivityIndicator color={toneColor('accent')} />;
  if (units.length < 2) return null;

  const income = values.kind === 'income';
  const shown = income ? units.filter((unit) => unit.status !== 'owner_occupied') : units;
  const options: Array<ChipOption<string>> = [
    { value: WHOLE_BUILDING, label: 'Whole building' },
    ...shown.map((unit) => ({
      value: unit.id,
      label: unit.label,
      tag: unit.status === 'owner_occupied' ? 'Yours' : undefined,
    })),
  ];
  const selected = values.unitIds.length === 0 ? [WHOLE_BUILDING] : values.unitIds;
  const splitUnits = units.filter((unit) => values.unitIds.includes(unit.id));

  return (
    <>
      <Section
        label="Unit"
        note={income ? undefined : 'Tap 2+ to split'}
        error={entry.errors.units}
      >
        {income ? (
          <ChipGroup
            value={selected[0] ?? WHOLE_BUILDING}
            onChange={entry.toggleUnit}
            options={options}
          />
        ) : (
          <ChipGroup
            multiple
            value={selected}
            onChange={(next) => {
              const toggled =
                next.find((value) => !selected.includes(value)) ??
                selected.find((value) => !next.includes(value));
              if (toggled !== undefined) entry.toggleUnit(toggled);
            }}
            options={options}
          />
        )}
      </Section>
      {splitUnits.length >= 2 ? (
        <View className="gap-2">
          <SplitCard
            units={splitUnits.map((unit) => ({ id: unit.id, label: unit.label }))}
            amountCents={values.amountCents}
            mode={values.splitMode}
            onModeChange={entry.setSplitMode}
            percents={values.customPercents}
            onPercentChange={entry.setPercent}
            onResetToEven={entry.resetSplit}
          />
          {entry.errors.split === undefined ? null : (
            <Text size="sm" tone="danger">
              {entry.errors.split}
            </Text>
          )}
        </View>
      ) : null}
    </>
  );
}

function DetailsSection({
  entry,
  receipt,
  timeZone,
}: {
  entry: NewEntryForm;
  receipt: ReceiptUpload;
  timeZone: string;
}) {
  const { values, category } = entry;
  const rent = isRentCategory(category);

  return (
    <>
      {rent ? (
        <Field label="Rent for" hint="The month this rent is for" error={entry.errors.rentMonth}>
          <MonthYearPicker
            value={values.rentMonth}
            onChange={(month) => entry.set('rentMonth', month)}
            maxMonth={addMonthsTo(currentMonthStart(timeZone), MAX_MONTHS_AHEAD)}
          />
        </Field>
      ) : (
        <Field label="Date" error={entry.errors.date}>
          <DateField
            value={values.date}
            onChange={(date) => entry.set('date', date)}
            maxDate={addDaysTo(todayIn(timeZone), DAYS_PER_YEAR)}
          />
        </Field>
      )}

      <Section label="Receipt" note="Optional">
        <ReceiptPicker
          state={receipt.state}
          onPick={(source) => void receipt.pick(source)}
          onRemove={receipt.remove}
          onRetry={receipt.retry}
        />
      </Section>

      <Section label="Note" note="Optional">
        <TextInput
          accessibilityLabel="Note"
          value={values.note}
          onChangeText={(note) => entry.set('note', note)}
          placeholder="Leaky faucet, Unit 1 and 2 shared line"
          multiline
          maxLength={500}
          containerClassName="min-h-20"
        />
      </Section>

      <View>
        {isMortgageCategory(category) ? null : (
          <SwitchRow
            className="border-b border-line"
            label="Repeat monthly"
            hint="Adds this every month on the same day"
            value={values.repeatMonthly}
            onValueChange={(repeat) => entry.set('repeatMonthly', repeat)}
          />
        )}
        {values.kind === 'expense' ? (
          <SwitchRow
            label="Capital improvement"
            hint="A new roof or kitchen, not a repair. Depreciated, not expensed."
            value={values.isCapital}
            onValueChange={(capital) => entry.set('isCapital', capital)}
          />
        ) : null}
      </View>
    </>
  );
}

function saveErrorMessage(error: unknown): string {
  if (error instanceof ApiRequestError && error.status < 500) return error.message;
  return CONNECTION_ERROR;
}

function saveLabel(kind: EntryKind, amountCents: number | null) {
  const base = kind === 'expense' ? 'Save expense' : 'Save income';
  return amountCents === null || amountCents <= 0 ? base : `${base} · ${formatCents(amountCents)}`;
}

/** The "New entry" drawer: logs one confirmed expense or income. */
function NewEntrySheet({ request, onClose, lastPropertyId, onSaved }: NewEntrySheetProps) {
  const timeZone = useUserTimeZone();
  const entry = useNewEntryForm(timeZone);
  const receipt = useReceiptUpload();
  const properties = useProperties();
  const create = useCreateTransaction();

  const [saveError, setSaveError] = useState<string>();
  const [waiting, setWaiting] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [skipReceiptOpen, setSkipReceiptOpen] = useState(false);

  const open = request !== null;
  const saving = waiting || create.isPending;
  const dirty = entry.isDirty || receipt.state.status !== 'empty';
  const onlyPropertyId = properties.data?.length === 1 ? properties.data[0]?.id : undefined;
  const { values } = entry;

  // A new request starts a fresh entry with the best guess for the property.
  const requestId = request?.id;
  useEffect(() => {
    if (requestId === undefined || request === null) return;
    entry.reset({ ...request.options, propertyId: request.options.propertyId ?? lastPropertyId });
    receipt.release();
    setSaveError(undefined);
    // Only a new request should reset the form.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

  // With exactly one property, choose it as soon as the list arrives.
  useEffect(() => {
    if (open && values.propertyId === null && onlyPropertyId !== undefined) {
      entry.preselectProperty(onlyPropertyId);
    }
  }, [open, values.propertyId, onlyPropertyId, entry]);

  const close = () => {
    setDiscardOpen(false);
    onClose();
  };

  const requestClose = () => {
    if (saving) return;
    if (dirty) setDiscardOpen(true);
    else close();
  };

  const discard = () => {
    receipt.remove();
    close();
  };

  const submit = async (receiptId: string | null) => {
    try {
      const saved = await create.mutateAsync(entry.payload(receiptId));
      receipt.release();
      onSaved(saved.propertyId);
      toast.show({
        message: `${saved.kind === 'expense' ? 'Expense' : 'Income'} saved · ${formatCents(saved.amountCents)}`,
      });
      close();
    } catch (error) {
      setSaveError(saveErrorMessage(error));
    }
  };

  const save = async () => {
    setSaveError(undefined);
    if (!entry.check()) return;
    setWaiting(true);
    const upload = await receipt.settle();
    setWaiting(false);
    if (upload.failed) {
      setSkipReceiptOpen(true);
      return;
    }
    await submit(upload.receiptId);
  };

  return (
    <Sheet
      open={open}
      onClose={requestClose}
      title="New entry"
      size="full"
      confirmClose
      footer={
        <Button
          fullWidth
          size="lg"
          label={saveLabel(values.kind, values.amountCents)}
          loading={saving}
          onPress={() => void save()}
        />
      }
    >
      <View className="gap-5 pb-4" pointerEvents={saving ? 'none' : 'auto'}>
        {saveError === undefined ? null : <Banner message={saveError} />}

        <SegmentedControl
          accessibilityLabel="Entry type"
          options={kindOptions}
          value={values.kind}
          onChange={entry.setKind}
        />

        <Field label="Amount" error={entry.errors.amount}>
          <MoneyInput
            cents={values.amountCents}
            onChangeCents={(cents) => entry.set('amountCents', cents)}
            autoFocus
          />
        </Field>

        <PropertySection entry={entry} />
        <UnitSection entry={entry} />

        <Section label="Category" note="Tax-form line" error={entry.errors.category}>
          {entry.categoriesLoading ? (
            <ActivityIndicator color={toneColor('accent')} />
          ) : (
            <CategoryPicker
              categories={entry.categories}
              value={values.categoryId}
              onChange={entry.setCategory}
            />
          )}
        </Section>

        <DetailsSection entry={entry} receipt={receipt} timeZone={timeZone} />
      </View>

      <ConfirmDialog
        open={discardOpen}
        title="Discard this entry?"
        message="What you've entered will be lost."
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        destructive
        onConfirm={discard}
        onCancel={() => setDiscardOpen(false)}
      />
      <ConfirmDialog
        open={skipReceiptOpen}
        title="Save without the receipt?"
        message="The receipt didn't upload. You can save the entry now and add the receipt later."
        confirmLabel="Save without it"
        cancelLabel="Go back"
        onConfirm={() => {
          setSkipReceiptOpen(false);
          receipt.remove();
          void submit(null);
        }}
        onCancel={() => setSkipReceiptOpen(false)}
      />
    </Sheet>
  );
}

export { type NewEntryRequest, NewEntrySheet };
