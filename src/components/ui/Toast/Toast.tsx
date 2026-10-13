import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AccessibilityInfo, Pressable, View } from 'react-native';
import { cva } from 'class-variance-authority';
import { Check } from 'lucide-react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { toneColor } from '@/theme/tokens';

import { Text } from '../Text/Text';

const DEFAULT_DURATION = 4000;

const toastVariants = cva(
  'min-h-12 flex-row items-center gap-3 rounded-full bg-ink py-2.5 pl-3 pr-5 shadow-lg',
);
const toastTextVariants = cva('flex-1 font-medium text-base text-white');
const toastActionTextVariants = cva('font-semibold text-base text-accent-tint');
const toastIconVariants = cva('h-6 w-6 items-center justify-center rounded-full', {
  variants: {
    variant: { success: 'bg-success', neutral: 'bg-grey' },
  },
  defaultVariants: { variant: 'success' },
});

type ToastAction = {
  label: string;
  onPress: () => void;
};

type ToastOptions = {
  message: string;
  action?: ToastAction;
  variant?: 'success' | 'neutral';
  duration?: number;
};

type ToastApi = {
  show: (options: ToastOptions) => void;
  hide: () => void;
};

type ActiveToast = ToastOptions & { id: number };

const ToastContext = createContext<ToastApi | null>(null);

let mountedApi: ToastApi | null = null;

/** Imperative API for use outside components; needs a mounted ToastProvider. */
const toast: ToastApi = {
  show: (options) => {
    if (mountedApi === null) {
      if (__DEV__) console.warn('toast.show() called without a mounted ToastProvider');
      return;
    }
    mountedApi.show(options);
  },
  hide: () => mountedApi?.hide(),
};

function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (api === null) throw new Error('useToast must be used inside a ToastProvider');
  return api;
}

function ToastProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<ActiveToast | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextId = useRef(0);
  const insets = useSafeAreaInsets();

  const clearTimer = () => {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
  };

  const hide = useCallback(() => {
    clearTimer();
    setActive(null);
  }, []);

  const show = useCallback(
    (options: ToastOptions) => {
      clearTimer();
      nextId.current += 1;
      setActive({ ...options, id: nextId.current });
      AccessibilityInfo.announceForAccessibility(options.message);
      timer.current = setTimeout(hide, options.duration ?? DEFAULT_DURATION);
    },
    [hide],
  );

  const api = useMemo(() => ({ show, hide }), [show, hide]);

  useEffect(() => {
    mountedApi = api;
    return () => {
      clearTimer();
      if (mountedApi === api) mountedApi = null;
    };
  }, [api]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: Math.max(insets.bottom, 12) + 12,
        }}
        className="items-center px-screen"
      >
        {active && (
          <Animated.View
            key={active.id}
            entering={FadeInDown.duration(220)}
            exiting={FadeOutDown.duration(180)}
            style={{ alignSelf: 'stretch' }}
          >
            <View accessibilityLiveRegion="polite" className={toastVariants()}>
              <View className={toastIconVariants({ variant: active.variant })}>
                <Check size={15} strokeWidth={3} color={toneColor('white')} />
              </View>
              <Text numberOfLines={2} className={toastTextVariants()}>
                {active.message}
              </Text>
              {active.action && (
                <Pressable
                  accessibilityRole="button"
                  hitSlop={12}
                  onPress={() => {
                    active.action?.onPress();
                    hide();
                  }}
                  className="active:opacity-70"
                >
                  <Text className={toastActionTextVariants()}>{active.action.label}</Text>
                </Pressable>
              )}
            </View>
          </Animated.View>
        )}
      </View>
    </ToastContext.Provider>
  );
}

export {
  toastVariants,
  toastTextVariants,
  toastActionTextVariants,
  toastIconVariants,
  type ToastAction,
  type ToastOptions,
  toast,
  useToast,
  ToastProvider,
};
