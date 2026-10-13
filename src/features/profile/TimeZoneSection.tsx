import { useState } from 'react';
import { View } from 'react-native';
import { isNil } from 'es-toolkit';

import { Button, Card, ListRow, SectionHeader, Text, toast } from '@/components/ui';
import { deviceTimeZone, timeZoneCity, timeZoneOffset } from '@/shared/timeZones';

import { useMe, useUpdateSettings } from './queries';
import { TimeZoneSheet } from './TimeZoneSheet';

function blankToNull(value: string | null | undefined): string | null {
  return isNil(value) || value.trim() === '' ? null : value;
}

function zoneMeta(zone: string | null, loading: boolean): string {
  if (zone !== null) return `${timeZoneOffset(zone)} · ${zone}`;
  if (loading) return 'Loading…';
  return 'Choose the time zone you keep your books in';
}

function TimeZoneSection() {
  const me = useMe();
  const updateSettings = useUpdateSettings();
  const [pickerOpen, setPickerOpen] = useState<boolean>(false);
  console.log(me);

  const savedZone = blankToNull(me.data?.settings?.timeZone);
  const phoneZone = deviceTimeZone();
  const showPhoneHint = me.isSuccess && phoneZone !== null && phoneZone !== savedZone;

  const saveZone = (timeZone: string) => {
    setPickerOpen(false);
    updateSettings.mutate(
      { timeZone },
      { onSuccess: () => toast.show({ message: `Time zone set to ${timeZoneCity(timeZone)}` }) },
    );
  };

  return (
    <View>
      <SectionHeader title="Time zone" />
      <Card padding="none">
        <ListRow
          chevron
          onPress={() => setPickerOpen(true)}
          title={savedZone === null ? 'Not set' : timeZoneCity(savedZone)}
          meta={zoneMeta(savedZone, me.isPending)}
        />
      </Card>
      <Text size="base" tone="grey" className="mt-3">
        Rent due dates, late notices and the tax year an income or expense belongs to are worked out
        in this time zone. It's set from your phone when you sign in, and it won't change if you
        travel.
      </Text>

      {showPhoneHint ? (
        <Card variant="muted" className="mt-4">
          <Text size="base">
            {`Your phone is set to ${timeZoneCity(phoneZone)} (${timeZoneOffset(phoneZone)}).`}
          </Text>
          <Button
            size="sm"
            variant="secondary"
            className="mt-3"
            label={`Use ${timeZoneCity(phoneZone)}`}
            loading={updateSettings.isPending}
            onPress={() => saveZone(phoneZone)}
          />
        </Card>
      ) : null}

      <TimeZoneSheet
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        selected={savedZone}
        deviceZone={phoneZone}
        onSelect={saveZone}
      />
    </View>
  );
}

export { TimeZoneSection };
