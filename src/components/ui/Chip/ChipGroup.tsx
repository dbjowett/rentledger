import { ScrollView, View, type ViewProps } from 'react-native';

import { cn } from '@/lib/cn';

import { Chip } from './Chip';

type ChipOption<T extends string> = {
  value: T;
  label: string;
  sublabel?: string;
  disabled?: boolean;
};

type ChipGroupBaseProps<T extends string> = ViewProps & {
  options: Array<ChipOption<T>>;
  /** One horizontally scrolling row instead of wrapping lines. */
  scrollable?: boolean;
  contentContainerClassName?: string;
};

type SingleSelectProps<T extends string> = {
  multiple?: false;
  value: T | null;
  onChange: (value: T) => void;
};

type MultiSelectProps<T extends string> = {
  multiple: true;
  value: T[];
  onChange: (value: T[]) => void;
};

type ChipGroupProps<T extends string> = ChipGroupBaseProps<T> &
  (SingleSelectProps<T> | MultiSelectProps<T>);

function ChipGroup<T extends string>(props: ChipGroupProps<T>) {
  const { options, scrollable = false, className, contentContainerClassName, ...rest } = props;

  const isSelected = (value: T) =>
    props.multiple === true ? props.value.includes(value) : props.value === value;

  const toggle = (value: T) => {
    if (props.multiple === true) {
      const next = props.value.includes(value)
        ? props.value.filter((v) => v !== value)
        : [...props.value, value];
      props.onChange(next);
    } else {
      props.onChange(value);
    }
  };

  const chips = options.map((option) => (
    <Chip
      key={option.value}
      label={option.label}
      sublabel={option.sublabel}
      disabled={option.disabled}
      selected={isSelected(option.value)}
      accessibilityRole={props.multiple === true ? 'checkbox' : 'radio'}
      accessibilityState={{
        checked: isSelected(option.value),
        disabled: option.disabled === true,
      }}
      onPress={() => toggle(option.value)}
    />
  ));

  const { multiple: _multiple, value: _value, onChange: _onChange, ...viewProps } = rest;
  const groupRole = props.multiple === true ? undefined : 'radiogroup';

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        accessibilityRole={groupRole}
        className={className}
        contentContainerClassName={cn('items-center gap-2', contentContainerClassName)}
        {...viewProps}
      >
        {chips}
      </ScrollView>
    );
  }

  return (
    <View
      accessibilityRole={groupRole}
      className={cn('flex-row flex-wrap gap-2', className)}
      {...viewProps}
    >
      {chips}
    </View>
  );
}

export { type ChipOption, type ChipGroupProps, ChipGroup };
