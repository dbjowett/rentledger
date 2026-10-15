import { api } from '@/lib/api';
import type { EntryKind } from '@/shared/schemas';
import type {
  CategoryResponse,
  CreateTransactionInput,
  EntryListItemResponse,
  ReceiptUploadResponse,
  TransactionResponse,
} from '@/shared/types';

type ReceiptUploadInput = {
  mimeType: 'image/jpeg' | 'application/pdf';
  sizeBytes: number;
  originalFileName?: string;
};

const entryKeys = {
  transactions: ['transactions'] as const,
  list: (propertyId?: string) => ['transactions', 'list', propertyId ?? 'all'] as const,
  categories: (kind: EntryKind) => ['categories', kind] as const,
};

const entryApi = {
  list: async (propertyId?: string) =>
    api<EntryListItemResponse[]>('/api/transactions', { query: { propertyId } }),
  categories: async (kind: EntryKind) =>
    api<CategoryResponse[]>('/api/categories', { query: { kind } }),
  create: async (input: CreateTransactionInput) =>
    api<TransactionResponse>('/api/transactions', { method: 'POST', body: input }),
  receiptUploadUrl: async (input: ReceiptUploadInput) =>
    api<ReceiptUploadResponse>('/api/receipts/upload-url', { method: 'POST', body: input }),
  deleteReceipt: async (id: string) =>
    api<null>(`/api/receipts/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};

export { entryApi, entryKeys, type ReceiptUploadInput };
