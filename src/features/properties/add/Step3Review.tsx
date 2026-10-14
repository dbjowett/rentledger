import { View } from 'react-native';

import { Banner, Button, Card, ListRow, Tag, Text } from '@/components/ui';
import { formatCentsCompact } from '@/shared/money';

import { DEFAULT_OWNERSHIP_PCT } from '../lib/property';
import { formatRentDue, summarizeUnits, UNIT_STATUS_TAGS, type UnitFormValues } from '../lib/units';
import type { Step } from './formSchema';
import type { AddPropertyForm } from './useAddPropertyForm';

type Step3ReviewProps = {
  form: AddPropertyForm;
  onEdit: (step: Step) => void;
  /** Shown above the cards when saving failed. */
  saveError?: string;
  /** Hides the Edit links while saving. */
  saving: boolean;
};

function unitMeta(unit: UnitFormValues): string {
  if (unit.status === 'owner_occupied') return 'Not rented';
  if (unit.status === 'vacant') {
    return unit.rentCents === null ? 'No tenant' : `Asking ${formatCentsCompact(unit.rentCents)}`;
  }
  const rent = `${formatCentsCompact(unit.rentCents ?? 0)} · due ${formatRentDue(unit.rentDue)}`;
  const tenant = unit.tenantName.trim();
  return tenant === '' ? rent : `${rent} · ${tenant}`;
}

function EditLink({ onPress, hidden }: { onPress: () => void; hidden: boolean }) {
  if (hidden) return null;
  return <Button variant="link" size="sm" label="Edit" onPress={onPress} />;
}

/** Step 3 of 3: read-only summary with Edit links back to each step. */
function Step3Review({ form, onEdit, saveError, saving }: Step3ReviewProps) {
  const { values } = form;
  const single = values.units.length === 1;
  const totals = summarizeUnits(values.units);
  const ownership = values.ownershipPct ?? DEFAULT_OWNERSHIP_PCT;

  return (
    <View className="gap-4">
      {saveError === undefined ? null : <Banner message={saveError} />}

      <Card>
        <Card.Header
          title="Property"
          action={<EditLink hidden={saving} onPress={() => onEdit('property')} />}
        />
        <Card.Body>
          <Text weight="semibold" size="lg">
            {values.name.trim()}
          </Text>
          <Text size="base" tone="grey">
            {values.address.trim()}
          </Text>
          <Text size="base" tone="grey">
            {`${single ? 'House' : `${values.units.length} units`} · You own ${ownership}%`}
          </Text>
        </Card.Body>
      </Card>

      <Card padding="none">
        <Card.Header
          title={single ? 'Rent' : 'Units'}
          className="mb-0 px-4 pt-4"
          action={<EditLink hidden={saving} onPress={() => onEdit('units')} />}
        />
        {values.units.map((unit, index) => {
          const tag = UNIT_STATUS_TAGS[unit.status];
          return (
            <ListRow
              key={index}
              title={single ? 'Monthly rent' : unit.label.trim()}
              meta={unitMeta(unit)}
              trailing={single ? undefined : <Tag label={tag.label} tone={tag.tone} />}
              divider={index < values.units.length - 1}
            />
          );
        })}
      </Card>

      <Text size="md" weight="semibold" className="text-center">
        {`Expected rent: ${formatCentsCompact(totals.monthlyRentCents)} / month`}
      </Text>
    </View>
  );
}

export { Step3Review };
