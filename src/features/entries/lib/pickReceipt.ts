import { getDocumentAsync } from 'expo-document-picker';
import {
  launchCameraAsync,
  launchImageLibraryAsync,
  requestCameraPermissionsAsync,
  type ImagePickerResult,
} from 'expo-image-picker';

import type { PickedReceipt } from './prepareReceipt';

type ReceiptSource = 'camera' | 'library' | 'pdf';

type PickReceiptResult =
  | { status: 'picked'; receipt: PickedReceipt }
  | { status: 'cancelled' }
  /** Camera permission was refused. */
  | { status: 'denied' };

function fromImageResult(result: ImagePickerResult): PickReceiptResult {
  const asset = result.canceled ? undefined : result.assets[0];
  if (asset === undefined) return { status: 'cancelled' };
  return {
    status: 'picked',
    receipt: {
      kind: 'image',
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
      fileName: asset.fileName ?? undefined,
    },
  };
}

/**
 * Lets the user take a photo, choose one, or choose a PDF. The Android photo picker needs no
 * permission; the camera asks the first time.
 */
async function pickReceipt(source: ReceiptSource): Promise<PickReceiptResult> {
  if (source === 'camera') {
    const permission = await requestCameraPermissionsAsync();
    if (!permission.granted) return { status: 'denied' };
    return fromImageResult(await launchCameraAsync({ mediaTypes: ['images'], quality: 1 }));
  }

  if (source === 'library') {
    return fromImageResult(await launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 }));
  }

  const result = await getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true });
  const asset = result.canceled ? undefined : result.assets[0];
  if (asset === undefined) return { status: 'cancelled' };
  return { status: 'picked', receipt: { kind: 'pdf', uri: asset.uri, fileName: asset.name } };
}

export { type PickReceiptResult, pickReceipt, type ReceiptSource };
