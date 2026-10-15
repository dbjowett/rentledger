import { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, View, type LayoutChangeEvent } from 'react-native';
import { router, useFocusEffect, useNavigation } from 'expo-router';
import {
  KeyboardAwareScrollView,
  type KeyboardAwareScrollViewRef,
} from 'react-native-keyboard-controller';

import { Button, ConfirmDialog, StickyFooter, toast, WizardHeader } from '@/components/ui';
import { useUserTimeZone } from '@/features/profile/queries';
import { STEPS, type Step } from '@/features/properties/add/formSchema';
import { Step1Property } from '@/features/properties/add/Step1Property';
import { Step2Units } from '@/features/properties/add/Step2Units';
import { Step3Review } from '@/features/properties/add/Step3Review';
import {
  useAddPropertyForm,
  type AddPropertyForm,
} from '@/features/properties/add/useAddPropertyForm';
import { toCreatePropertyPayload } from '@/features/properties/lib/property';
import { summarizeUnits } from '@/features/properties/lib/units';
import { useCreateProperty } from '@/features/properties/queries';
import { ApiRequestError } from '@/lib/api';
import { formatCentsCompact } from '@/shared/money';

const FOOTER_SPACE = 140;
const SCROLL_MARGIN = 16;

const CONNECTION_ERROR = "Couldn't save. Check your connection and try again.";

/** Order in which fields are checked when scrolling to the first error. */
const ERROR_ORDER: Record<Step, (form: AddPropertyForm) => string[]> = {
  property: () => ['address', 'name', 'ownershipPct'],
  units: (form) => ['units', ...form.values.units.map((_, index) => `unit-${index}`)],
  review: () => [],
};

function hasError(form: AddPropertyForm, key: string): boolean {
  const { errors } = form;
  if (key === 'address') return errors.address !== undefined;
  if (key === 'name') return errors.name !== undefined;
  if (key === 'ownershipPct') return errors.ownershipPct !== undefined;
  if (key === 'units') {
    return errors.units?.root !== undefined || errors.units?.message !== undefined;
  }
  const index = Number(key.replace('unit-', ''));
  return errors.units?.[index] !== undefined;
}

function stepTitle(step: Step, single: boolean) {
  if (step === 'property') return 'Add property';
  if (step === 'units') return single ? 'Rent' : 'Units';
  return 'Review';
}

function primaryLabel(step: Step, single: boolean) {
  if (step === 'property') return single ? 'Next: rent' : 'Next: units';
  if (step === 'units') return 'Next: review';
  return 'Save property';
}

function unitsSummary(form: AddPropertyForm): string | undefined {
  if (form.step !== 'units' || form.values.units.length === 1) return undefined;
  const totals = summarizeUnits(form.values.units);
  const parts = [
    `Total rent: ${formatCentsCompact(totals.monthlyRentCents)}/mo`,
    `${totals.occupied} occupied`,
    totals.vacant > 0 ? `${totals.vacant} vacant` : null,
    totals.ownerOccupied > 0 ? `${totals.ownerOccupied} yours` : null,
  ];
  return parts.filter((part) => part !== null).join(' · ');
}

function saveErrorMessage(error: unknown): string {
  if (error instanceof ApiRequestError && error.status < 500) return error.message;
  return CONNECTION_ERROR;
}

export default function AddPropertyScreen() {
  const timeZone = useUserTimeZone();
  const form = useAddPropertyForm(timeZone);
  const createProperty = useCreateProperty();
  const navigation = useNavigation();

  const scrollRef = useRef<KeyboardAwareScrollViewRef>(null);
  const positions = useRef(new Map<string, number>());
  const leaving = useRef(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [saveError, setSaveError] = useState<string>();

  const saving = createProperty.isPending;
  const single = form.values.units.length === 1;
  const stepNames = STEPS.map((step) =>
    stepTitle(step, single).replace('Add property', 'Property'),
  );

  const trackPosition = useCallback(
    (key: string) => (event: LayoutChangeEvent) => {
      positions.current.set(key, event.nativeEvent.layout.y);
    },
    [],
  );

  const scrollToFirstError = () => {
    const key = ERROR_ORDER[form.step](form).find((candidate) => hasError(form, candidate));
    const y = key === undefined ? undefined : positions.current.get(key);
    if (y !== undefined) {
      scrollRef.current?.scrollTo({ y: Math.max(0, y - SCROLL_MARGIN), animated: true });
    }
  };

  const leave = () => {
    leaving.current = true;
    router.back();
  };

  const cancel = () => {
    if (form.isDirty) setDiscardOpen(true);
    else leave();
  };

  const goBack = () => {
    if (saving) return;
    if (form.stepIndex === 0) cancel();
    else form.back();
  };

  const save = async () => {
    setSaveError(undefined);
    try {
      const values = form.form.getValues();
      const { id } = await createProperty.mutateAsync(toCreatePropertyPayload(values));
      leaving.current = true;
      router.replace({ pathname: '/properties/[id]', params: { id } });
      toast.show({ message: `${values.name.trim()} added` });
    } catch (error) {
      setSaveError(saveErrorMessage(error));
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const onPrimary = async () => {
    if (form.step === 'review') {
      await save();
      return;
    }
    const valid = await form.next();
    if (valid) scrollRef.current?.scrollTo({ y: 0, animated: false });
    else requestAnimationFrame(scrollToFirstError);
  };

  // Android back: one step back, or cancel on the first step. Ignored while saving.
  const goBackRef = useRef(goBack);
  useEffect(() => {
    goBackRef.current = goBack;
  });
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        goBackRef.current();
        return true;
      });
      return () => subscription.remove();
    }, []),
  );

  // Any other way of leaving (gestures, links) asks first when something was entered.
  useEffect(
    () =>
      navigation.addListener('beforeRemove', (event) => {
        if (leaving.current || !form.isDirty) return;
        event.preventDefault();
        setDiscardOpen(true);
      }),
    [navigation, form.isDirty],
  );

  return (
    <View className="flex-1 bg-surface">
      <WizardHeader
        title={stepTitle(form.step, single)}
        leftLabel={form.stepIndex === 0 ? 'Cancel' : 'Back'}
        onLeftPress={goBack}
        steps={stepNames}
        current={form.stepIndex}
        disabled={saving}
      />

      <KeyboardAwareScrollView
        ref={scrollRef}
        bottomOffset={FOOTER_SPACE}
        keyboardShouldPersistTaps="handled"
        className="flex-1"
        contentContainerClassName="px-screen pb-10 pt-5"
      >
        <View pointerEvents={saving ? 'none' : 'auto'}>
          {form.step === 'property' ? (
            <Step1Property form={form} trackPosition={trackPosition} />
          ) : null}
          {form.step === 'units' ? <Step2Units form={form} trackPosition={trackPosition} /> : null}
          {form.step === 'review' ? (
            <Step3Review form={form} onEdit={form.goTo} saveError={saveError} saving={saving} />
          ) : null}
        </View>
      </KeyboardAwareScrollView>

      <StickyFooter summary={unitsSummary(form)}>
        <Button
          fullWidth
          size="lg"
          label={primaryLabel(form.step, single)}
          loading={saving}
          onPress={() => void onPrimary()}
        />
      </StickyFooter>

      <ConfirmDialog
        open={discardOpen}
        title="Discard this property?"
        message="What you've entered so far will be lost."
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        destructive
        onConfirm={() => {
          setDiscardOpen(false);
          leave();
        }}
        onCancel={() => setDiscardOpen(false)}
      />
    </View>
  );
}
