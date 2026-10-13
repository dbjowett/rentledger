import { cva } from 'class-variance-authority';
import { Pressable, View, type PressableProps, type ViewProps } from 'react-native';

import { cn } from '@/lib/cn';

import { Text } from '../Text/Text';

const radioVariants = cva('min-h-11 flex-row items-center gap-3 active:opacity-80', {
  variants: {
    disabled: { true: 'opacity-50', false: '' },
  },
  defaultVariants: { disabled: false },
});

const radioCircleVariants = cva(
  'h-[22px] w-[22px] items-center justify-center rounded-full border-2',
  {
    variants: {
      selected: { true: 'border-accent', false: 'border-outline' },
    },
    defaultVariants: { selected: false },
  },
);

const radioDotVariants = cva('h-2.5 w-2.5 rounded-full bg-accent');
const radioTextVariants = cva('font-medium text-md text-ink');
const radioSublabelTextVariants = cva('font-sans text-base text-grey');

type RadioProps = Omit<PressableProps, 'children' | 'disabled'> & {
  label: string;
  sublabel?: string;
  selected: boolean;
  disabled?: boolean;
};

function Radio({ label, sublabel, selected, disabled = false, className, ...rest }: RadioProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={sublabel === undefined ? label : `${label}, ${sublabel}`}
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      className={cn(radioVariants({ disabled }), className)}
      {...rest}
    >
      <View className={radioCircleVariants({ selected })}>
        {selected && <View className={radioDotVariants()} />}
      </View>
      <View className="flex-1">
        <Text className={radioTextVariants()}>{label}</Text>
        {sublabel !== undefined && <Text className={radioSublabelTextVariants()}>{sublabel}</Text>}
      </View>
    </Pressable>
  );
}

type RadioOption<T extends string> = {
  value: T;
  label: string;
  sublabel?: string;
  disabled?: boolean;
};

type RadioGroupProps<T extends string> = ViewProps & {
  options: Array<RadioOption<T>>;
  value: T | null;
  onChange: (value: T) => void;
};

function RadioGroup<T extends string>({
  options,
  value,
  onChange,
  className,
  ...rest
}: RadioGroupProps<T>) {
  return (
    <View accessibilityRole="radiogroup" className={cn('gap-1', className)} {...rest}>
      {options.map((option) => (
        <Radio
          key={option.value}
          label={option.label}
          sublabel={option.sublabel}
          disabled={option.disabled}
          selected={option.value === value}
          onPress={() => onChange(option.value)}
        />
      ))}
    </View>
  );
}

export {
  radioVariants,
  radioCircleVariants,
  radioDotVariants,
  radioTextVariants,
  radioSublabelTextVariants,
  type RadioProps,
  Radio,
  type RadioOption,
  type RadioGroupProps,
  RadioGroup,
};
