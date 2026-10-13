import { useEffect, useState } from 'react';

const DEFAULT_DELAY_MS = 250;

/**
 * Returns `value` once it has stopped changing for `delayMs`.
 * Use the result for filtering or as part of a React Query key so typing doesn't trigger
 * work (or a request) on every keystroke.
 */
function useDebouncedValue<T>(value: T, delayMs: number = DEFAULT_DELAY_MS): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

export { useDebouncedValue };
