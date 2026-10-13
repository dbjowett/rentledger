import { cva } from 'class-variance-authority';
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';

import { cn } from '@/lib/cn';

import { Text } from '../Text/Text';

type FieldContextValue = {
  label?: string;
  required: boolean;
  invalid: boolean;
  description?: string;
};

const FieldContext = createContext<FieldContextValue>({ required: false, invalid: false });

/** Lets inputs pick up their Field's label, required flag and error state. */
const useField = () => useContext(FieldContext);

const fieldVariants = cva('gap-1.5');
const fieldLabelTextVariants = cva('font-semibold text-base text-ink');
const fieldMessageTextVariants = cva('font-sans text-sm', {
  variants: {
    tone: { hint: 'text-grey', error: 'text-danger' },
  },
  defaultVariants: { tone: 'hint' },
});

type FieldProps = ViewProps & {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
};

function Field({ label, hint, error, required = false, className, children, ...rest }: FieldProps) {
  const invalid = error !== undefined && error !== '';
  const message = invalid ? error : hint;

  const context = useMemo(
    () => ({ label, required, invalid, description: message }),
    [label, required, invalid, message],
  );

  return (
    <FieldContext.Provider value={context}>
      <View className={cn(fieldVariants(), className)} {...rest}>
        <Text importantForAccessibility="no" className={fieldLabelTextVariants()}>
          {label}
          {required && <Text className="text-danger"> *</Text>}
        </Text>
        {children}
        {message !== undefined && message !== '' && (
          <Text
            accessibilityLiveRegion={invalid ? 'polite' : 'none'}
            className={fieldMessageTextVariants({ tone: invalid ? 'error' : 'hint' })}
          >
            {message}
          </Text>
        )}
      </View>
    </FieldContext.Provider>
  );
}

export {
  useField,
  fieldVariants,
  fieldLabelTextVariants,
  fieldMessageTextVariants,
  type FieldProps,
  Field,
};
