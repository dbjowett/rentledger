import { useState } from 'react';
import { View } from 'react-native';
import {
  Check,
  ChevronLeft,
  Download,
  MoreHorizontal,
  Paperclip,
  Plus,
  Trash2,
  X,
} from 'lucide-react-native';

import { Button, IconButton, type ButtonProps, type IconButtonProps } from '@/components/ui';

import { Label, Row, Section } from './parts';

const buttonVariantNames: Array<NonNullable<ButtonProps['variant']>> = [
  'primary',
  'secondary',
  'ghost',
  'danger',
  'link',
];
const buttonSizes: Array<NonNullable<ButtonProps['size']>> = ['sm', 'md', 'lg'];
const iconButtonVariantNames: Array<NonNullable<IconButtonProps['variant']>> = [
  'plain',
  'outline',
  'filled',
];

function LoadingDemo() {
  const [loading, setLoading] = useState(false);
  const onPress = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };
  return <Button label="Tap to save" loading={loading} onPress={onPress} />;
}

export function ButtonsTab() {
  return (
    <>
      <Section title="Button · variant × size">
        {buttonVariantNames.map((v) => (
          <View key={v}>
            <Label>{v}</Label>
            <Row>
              {buttonSizes.map((s) => (
                <Button key={s} variant={v} size={s} label={s === 'sm' ? 'Confirm' : 'Add entry'} />
              ))}
            </Row>
          </View>
        ))}
      </Section>

      <Section title="Button · shape">
        <Label>rounded</Label>
        <Row>
          {buttonSizes.map((s) => (
            <Button key={s} shape="rounded" size={s} label="Continue" />
          ))}
        </Row>
        <Row>
          {buttonSizes.map((s) => (
            <Button key={s} shape="rounded" variant="secondary" size={s} label="Continue" />
          ))}
        </Row>
      </Section>

      <Section title="Button · icon">
        <Row>
          <Button leftIcon={Plus} label="Add entry" />
          <Button leftIcon={Paperclip} variant="secondary" label="Attach" />
          <Button leftIcon={Download} variant="ghost" label="Export" />
          <Button leftIcon={Trash2} variant="danger" label="Delete" />
          <Button leftIcon={Check} size="sm" label="Confirm" />
          <Button leftIcon={Plus} size="sm" variant="secondary" label="Add" />
        </Row>
      </Section>

      <Section title="Button · states">
        <Label>loading (keeps width)</Label>
        <Row>
          {buttonVariantNames.map((v) => (
            <Button key={v} variant={v} loading label="Confirm" />
          ))}
          <Button size="sm" loading label="Confirm" />
          <LoadingDemo />
        </Row>
        <Label>disabled</Label>
        <Row>
          {buttonVariantNames.map((v) => (
            <Button key={v} variant={v} disabled label="Confirm" />
          ))}
        </Row>
        <Label>fullWidth</Label>
        <View className="gap-3">
          <Button fullWidth size="lg" shape="rounded" label="Save entry" />
          <Button fullWidth size="lg" shape="rounded" loading label="Save entry" />
          <Button fullWidth size="lg" variant="secondary" label="Cancel" />
        </View>
      </Section>

      <Section title="IconButton">
        {iconButtonVariantNames.map((v) => (
          <View key={v}>
            <Label>{v}</Label>
            <Row>
              <IconButton variant={v} size="sm" icon={X} accessibilityLabel="Close" />
              <IconButton variant={v} size="md" icon={Plus} accessibilityLabel="Add" />
              <IconButton
                variant={v}
                size="sm"
                shape="square"
                icon={ChevronLeft}
                accessibilityLabel="Back"
              />
              <IconButton
                variant={v}
                size="md"
                shape="square"
                icon={MoreHorizontal}
                accessibilityLabel="More"
              />
              <IconButton variant={v} disabled icon={Trash2} accessibilityLabel="Delete" />
            </Row>
          </View>
        ))}
      </Section>
    </>
  );
}
