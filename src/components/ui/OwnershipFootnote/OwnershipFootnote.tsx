import { useState } from 'react';
import { View, type ViewProps } from 'react-native';

import { cn } from '@/lib/cn';

import { Button } from '../Button/Button';
import { Field } from '../Field/Field';
import { Text } from '../Text/Text';
import { TextInput } from '../TextInput/TextInput';

const FULL_OWNERSHIP = 100;

type OwnershipFootnoteProps = ViewProps & {
  /** Percentage 0.01–100; null while the field is empty. */
  value: number | null;
  onChange: (value: number | null) => void;
  error?: string;
};

/** "95.5" → 95.5; keeps at most 2 decimals. Empty or invalid text is null. */
function parsePercent(text: string): number | null {
  const cleaned = text.replaceAll(/[^\d.]/g, '');
  const [whole = '', fraction] = cleaned.split('.');
  const normalized = fraction === undefined ? whole : `${whole}.${fraction.slice(0, 2)}`;
  if (normalized === '' || normalized === '.') return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatPercent(value: number | null): string {
  return value === null ? '' : String(value);
}

/**
 * A quiet line under the property fields: "You own 100% of this property · Change". Expands into
 * a percentage field for co-owned properties.
 */
function OwnershipFootnote({ value, onChange, error, className, ...rest }: OwnershipFootnoteProps) {
  const [expanded, setExpanded] = useState(value !== FULL_OWNERSHIP);
  const [draft, setDraft] = useState(() => formatPercent(value));

  const handleChange = (text: string) => {
    setDraft(text);
    onChange(parsePercent(text));
  };

  const reset = () => {
    setDraft(formatPercent(FULL_OWNERSHIP));
    onChange(FULL_OWNERSHIP);
    setExpanded(false);
  };

  if (!expanded) {
    return (
      <View className={cn('flex-row flex-wrap items-center', className)} {...rest}>
        <Text size="base" tone="grey">
          {`You own ${formatPercent(value)}% of this property · `}
        </Text>
        <Button
          variant="link"
          size="sm"
          label="Change"
          accessibilityHint="Set your share if you co-own this property"
          onPress={() => setExpanded(true)}
        />
      </View>
    );
  }

  return (
    <View className={cn('gap-1', className)} {...rest}>
      <Field label="Your ownership share" hint="Only your share counts at tax time" error={error}>
        <TextInput
          value={draft}
          onChangeText={handleChange}
          keyboardType="decimal-pad"
          inputMode="decimal"
          suffix="%"
          placeholder="100"
        />
      </Field>
      <View className="flex-row">
        <Button variant="link" size="sm" label="Reset to 100%" onPress={reset} />
      </View>
    </View>
  );
}

export { parsePercent, type OwnershipFootnoteProps, OwnershipFootnote };
