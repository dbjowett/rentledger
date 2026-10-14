import { File } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import type { ReceiptMimeType } from '@/shared/schemas';

import { RECEIPT_JPEG_QUALITY, receiptResize } from './receiptSize';

/** A file the user picked: a photo (with its size) or a PDF. */
type PickedReceipt =
  | { kind: 'image'; uri: string; width: number; height: number; fileName?: string }
  | { kind: 'pdf'; uri: string; fileName?: string };

/** A file ready to upload. */
type PreparedReceipt = {
  uri: string;
  mimeType: ReceiptMimeType;
  sizeBytes: number;
  fileName?: string;
};

function fileSize(uri: string): number {
  return new File(uri).size ?? 0;
}

/**
 * Gets a picked receipt ready to upload. Photos are re-encoded as JPEG (which also converts
 * HEIC) and shrunk to at most 1600px on the long side; PDFs are sent as they are.
 */
async function prepareReceipt(picked: PickedReceipt): Promise<PreparedReceipt> {
  if (picked.kind === 'pdf') {
    return {
      uri: picked.uri,
      mimeType: 'application/pdf',
      sizeBytes: fileSize(picked.uri),
      fileName: picked.fileName,
    };
  }

  const context = ImageManipulator.manipulate(picked.uri);
  const resize = receiptResize(picked.width, picked.height);
  if (resize !== null) context.resize(resize);
  const image = await context.renderAsync();
  const saved = await image.saveAsync({ format: SaveFormat.JPEG, compress: RECEIPT_JPEG_QUALITY });

  return {
    uri: saved.uri,
    mimeType: 'image/jpeg',
    sizeBytes: fileSize(saved.uri),
    fileName: picked.fileName,
  };
}

export { type PickedReceipt, type PreparedReceipt, prepareReceipt };
