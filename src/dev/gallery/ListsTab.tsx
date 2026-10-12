import { Building2, Wrench } from 'lucide-react-native';
import { View } from 'react-native';

import {
  Amount,
  Button,
  Card,
  IconTile,
  ListRow,
  Tag,
  Text,
  type IconTileKind,
} from '@/components/ui';

import { Label, Row, Section } from './parts';

const kinds: IconTileKind[] = ['rent', 'bill', 'mortgage', 'receipt', 'match', 'done'];

export function ListsTab() {
  return (
    <>
      <Section title="IconTile · kind">
        {([44, 36] as const).map((size) => (
          <View key={size}>
            <Label>{`size ${size}`}</Label>
            <Row>
              {kinds.map((k) => (
                <View key={k} className="items-center gap-1">
                  <IconTile kind={k} size={size} />
                  <Text size="xs" tone="grey">
                    {k}
                  </Text>
                </View>
              ))}
            </Row>
          </View>
        ))}
        <Label>custom tone + icon</Label>
        <Row>
          <IconTile tone="danger" icon={Wrench} />
          <IconTile tone="slate" icon={Building2} />
        </Row>
      </Section>

      <Section title="ListRow · trailing slot">
        <Card padding="none">
          <ListRow
            divider
            leading={<IconTile kind="rent" />}
            title="Unit 2 rent"
            titleAccessory={
              <Text size="sm" weight="semibold" tone="danger">
                7d late
              </Text>
            }
            metaAmount={{ cents: 180_000, hideCents: true }}
            meta="Due Oct 1"
            trailing={<Button size="sm" label="Confirm" />}
          />
          <ListRow
            divider
            leading={<IconTile kind="bill" />}
            title="Hydro Ottawa"
            meta="Utilities · Oct 14"
            trailing={<Amount cents={14_320} kind="expense" showSign />}
          />
          <ListRow
            divider
            leading={<IconTile kind="mortgage" />}
            title="Mortgage payment"
            metaAmount={{ cents: 212_000, hideCents: true }}
            meta="Interest split estimated"
            trailing={<Button size="sm" variant="secondary" label="Review" />}
          />
          <ListRow
            divider
            leading={<IconTile kind="receipt" />}
            title="Home Depot"
            meta="Repairs · Oct 9"
            trailing={<Tag tone="warning" label="No receipt" />}
          />
          <ListRow
            leading={<IconTile kind="match" />}
            title="Receipt from Oct 3"
            meta="2 possible matches"
            trailing={<Button size="sm" variant="secondary" label="Match" />}
          />
        </Card>
      </Section>

      <Section title="ListRow · pressable + chevron">
        <Card padding="none">
          <ListRow
            divider
            onPress={() => {}}
            chevron
            leading={<IconTile kind="done" />}
            title="Confirmed"
            meta="Added to entries"
          />
          <ListRow
            divider
            onPress={() => {}}
            chevron
            leading={<View className="h-11 w-11 rounded-tile bg-line" />}
            title="Thumbnail leading slot"
            meta="Any 44px element works"
          />
          <ListRow
            onPress={() => {}}
            chevron
            title="No leading slot"
            meta="Text starts at the row padding"
            trailing={<Amount cents={2_500_000} hideCents />}
          />
        </Card>
      </Section>

      <Section title="ListRow · edge cases">
        <Card padding="none">
          <ListRow
            divider
            leading={<IconTile kind="rent" />}
            title="A very long property and unit name that should truncate"
            titleAccessory={
              <Text size="sm" weight="semibold" tone="danger">
                12d late
              </Text>
            }
            metaAmount={{ cents: 123_456_789, kind: 'income', showSign: true }}
            meta="Long meta line that also needs to truncate cleanly"
            trailing={<Button size="sm" label="Confirm" />}
          />
          <ListRow leading={<IconTile kind="bill" />} title="Title only" />
        </Card>
      </Section>
    </>
  );
}
