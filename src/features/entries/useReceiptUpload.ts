import { useCallback, useRef, useState } from 'react';
import { File } from 'expo-file-system';

import { toast } from '@/components/ui';
import { supabase } from '@/lib/supabase';

import { entryApi } from './api';
import type { ReceiptPickerState } from './components/ReceiptPicker';
import { pickReceipt, type ReceiptSource } from './lib/pickReceipt';
import { prepareReceipt, type PickedReceipt } from './lib/prepareReceipt';

const BUCKET = 'receipts';

/** Deletes an unattached receipt in the background; a leftover row is harmless. */
function discardReceipt(id: string) {
  entryApi.deleteReceipt(id).catch(() => undefined);
}

/**
 * The drawer's receipt: pick → resize → register → upload straight to Storage. Keeps the
 * receipt id once uploaded, and makes sure a finished upload that's no longer wanted (removed,
 * replaced or discarded) is deleted again.
 */
function useReceiptUpload() {
  const [state, setState] = useState<ReceiptPickerState>({ status: 'empty' });
  const attempt = useRef(0);
  const receiptId = useRef<string | null>(null);
  const picked = useRef<PickedReceipt | null>(null);
  const pending = useRef<Promise<string | null> | null>(null);

  const upload = useCallback((receipt: PickedReceipt) => {
    attempt.current += 1;
    const current = attempt.current;
    const stillWanted = () => attempt.current === current;
    picked.current = receipt;
    setState({
      status: 'uploading',
      uri: receipt.uri,
      kind: receipt.kind,
      fileName: receipt.fileName,
    });

    const run = async (): Promise<string | null> => {
      const prepared = await prepareReceipt(receipt);
      const target = await entryApi.receiptUploadUrl({
        mimeType: prepared.mimeType,
        sizeBytes: prepared.sizeBytes,
        originalFileName: prepared.fileName,
      });
      if (!stillWanted()) {
        discardReceipt(target.receiptId);
        return null;
      }
      const bytes = await new File(prepared.uri).arrayBuffer();
      const { error } = await supabase.storage
        .from(BUCKET)
        .uploadToSignedUrl(target.path, target.token, bytes, { contentType: prepared.mimeType });
      if (error !== null) {
        discardReceipt(target.receiptId);
        throw error;
      }
      if (!stillWanted()) {
        discardReceipt(target.receiptId);
        return null;
      }
      receiptId.current = target.receiptId;
      setState({
        status: 'uploaded',
        uri: prepared.uri,
        kind: receipt.kind,
        fileName: receipt.fileName,
      });
      return target.receiptId;
    };

    pending.current = run().catch(() => {
      if (stillWanted()) {
        setState({
          status: 'failed',
          uri: receipt.uri,
          kind: receipt.kind,
          fileName: receipt.fileName,
        });
      }
      return null;
    });
  }, []);

  /** Clears the receipt. `keep` leaves the uploaded file alone (it now belongs to an entry). */
  const clear = useCallback((keep = false) => {
    attempt.current += 1;
    const id = receiptId.current;
    receiptId.current = null;
    picked.current = null;
    pending.current = null;
    setState({ status: 'empty' });
    if (id !== null && !keep) discardReceipt(id);
  }, []);

  const pick = useCallback(
    async (source: ReceiptSource) => {
      const result = await pickReceipt(source);
      if (result.status === 'denied') {
        toast.show({
          variant: 'neutral',
          message: 'Camera access is off. Turn it on in Settings to take photos.',
        });
        return;
      }
      if (result.status === 'cancelled') return;
      clear();
      upload(result.receipt);
    },
    [clear, upload],
  );

  const retry = useCallback(() => {
    const receipt = picked.current;
    if (receipt !== null) upload(receipt);
  }, [upload]);

  /**
   * Waits for an upload in progress. `failed` is true when a file was picked but didn't upload,
   * so the caller can ask before saving without it.
   */
  const settle = useCallback(async (): Promise<{ receiptId: string | null; failed: boolean }> => {
    if (pending.current !== null) await pending.current;
    return {
      receiptId: receiptId.current,
      failed: picked.current !== null && receiptId.current === null,
    };
  }, []);

  return {
    state,
    pick,
    retry,
    remove: () => clear(),
    /** After saving: forget the receipt without deleting it. */
    release: () => clear(true),
    settle,
  };
}

type ReceiptUpload = ReturnType<typeof useReceiptUpload>;

export { type ReceiptUpload, useReceiptUpload };
