import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { NewEntrySheet, type NewEntryRequest } from './NewEntrySheet';
import type { NewEntryOptions } from './useNewEntryForm';

type NewEntryApi = {
  /** Opens the drawer, optionally with a property preselected (e.g. from its page). */
  open: (options?: NewEntryOptions) => void;
  close: () => void;
};

const NewEntryContext = createContext<NewEntryApi | null>(null);

/** Mounts the "New entry" drawer once for the signed-in app and lets any screen open it. */
function NewEntryProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<NewEntryRequest | null>(null);
  const [lastPropertyId, setLastPropertyId] = useState<string | null>(null);

  const open = useCallback((options: NewEntryOptions = {}) => {
    setRequest({ options, id: Date.now() });
  }, []);
  const close = useCallback(() => setRequest(null), []);
  const api = useMemo(() => ({ open, close }), [open, close]);

  return (
    <NewEntryContext.Provider value={api}>
      {children}
      <NewEntrySheet
        request={request}
        onClose={close}
        lastPropertyId={lastPropertyId}
        onSaved={setLastPropertyId}
      />
    </NewEntryContext.Provider>
  );
}

function useNewEntry(): NewEntryApi {
  const api = useContext(NewEntryContext);
  if (api === null) throw new Error('useNewEntry must be used inside NewEntryProvider');
  return api;
}

export { NewEntryProvider, useNewEntry };
