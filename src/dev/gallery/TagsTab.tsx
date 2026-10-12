import { AlertTriangle, Check, Clock, Pencil, Sparkles } from 'lucide-react-native';
import { View } from 'react-native';

import { CountBadge, Tag, type TagTone, type TagVariant } from '@/components/ui';

import { Label, Row, Section } from './parts';

const tones: TagTone[] = ['neutral', 'success', 'warning', 'danger', 'accent', 'violet'];
const variants: TagVariant[] = ['soft', 'solid', 'outline'];

export function TagsTab() {
  return (
    <>
      <Section title="Tag · tone × variant">
        {variants.map((v) => (
          <View key={v}>
            <Label>{v}</Label>
            <Row>
              {tones.map((t) => (
                <Tag key={t} tone={t} variant={v} label={t} />
              ))}
            </Row>
          </View>
        ))}
      </Section>

      <Section title="Tag · size">
        <Label>sm</Label>
        <Row>
          <Tag tone="success" label="Paid" />
          <Tag tone="success" icon={Check} label="Paid" />
          <Tag tone="danger" variant="solid" label="Late" />
        </Row>
        <Label>md</Label>
        <Row>
          <Tag size="md" tone="success" label="Paid" />
          <Tag size="md" tone="success" icon={Check} label="Paid" />
          <Tag size="md" tone="danger" variant="solid" label="Late" />
        </Row>
      </Section>

      <Section title="Tag · in use">
        <Row>
          <Tag tone="success" label="Paid" />
          <Tag tone="warning" label="Due" />
          <Tag tone="neutral" label="Vacant" />
          <Tag tone="danger" icon={Clock} label="Late" />
          <Tag tone="neutral" variant="outline" label="Estimated" />
          <Tag tone="accent" icon={Pencil} label="Edited" />
          <Tag tone="warning" icon={AlertTriangle} variant="outline" label="No receipt" />
          <Tag tone="violet" icon={Sparkles} label="Best match" />
          <Tag tone="accent" variant="outline" label="Capital" />
          <Tag tone="neutral" label="Split" />
        </Row>
      </Section>

      <Section title="CountBadge">
        <Row>
          <CountBadge count={1} />
          <CountBadge count={3} />
          <CountBadge count={12} />
          <CountBadge count={99} />
          <CountBadge count={120} />
        </Row>
      </Section>
    </>
  );
}
