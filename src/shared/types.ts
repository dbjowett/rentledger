import type { ToCamelCaseKeys } from 'es-toolkit/types';

import type { Tables } from './database.types';
import type {
  CreatePropertyBody,
  CreateTransactionBody,
  EntryKind,
  RentDueBody,
  UpdateSettingsBody,
} from './schemas';

/** The app's view of a server type: api() converts keys to camelCase on the way in. */
type Camel<T> = ToCamelCaseKeys<T>;

type UserSettingsRow = Tables<'user_settings'>;

type MeResponse = {
  id: string;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
  settings: UserSettingsRow;
};

type UpdateSettingsResponse = {
  settings: UserSettingsRow;
  /** False when `only_if_unset` was set and a time zone already existed. */
  updated: boolean;
};

type TimeZoneOption = {
  id: string;
  city: string;
  region: string;
  offset: string;
};

type PropertyRow = Tables<'properties'>;
type UnitRow = Tables<'units'>;

type UnitStatus = 'occupied' | 'vacant' | 'owner_occupied';
type RentDue = RentDueBody;

type UnitResponse = {
  id: string;
  label: string;
  status: UnitStatus;
  rent_cents: number | null;
  rent_due: RentDue | null;
  rent_start_date: string | null;
  tenant_name: string | null;
  sort_order: number;
};

type PropertyResponse = Omit<PropertyRow, 'user_id'> & {
  units: UnitResponse[];
};

type PropertySummaryResponse = Omit<PropertyRow, 'user_id'> & {
  unit_count: number;
  occupied_count: number;
  vacant_count: number;
  owner_occupied_count: number;
  /** Sum of rent on occupied units, in cents. */
  monthly_rent_cents: number;
};

type CreatePropertyResponse = { id: string };

type TransactionRow = Tables<'transactions'>;
type TransactionSplitRow = Tables<'transaction_splits'>;

type TaxLineResponse = { code: string; label: string };

type CategoryResponse = {
  id: string;
  /** Stable name for system categories, e.g. 'rent'; null for the user's own. */
  key: string | null;
  name: string;
  kind: EntryKind;
  sort_order: number;
  /** The T776 line it reports to; null when it isn't reported (e.g. mortgage principal). */
  tax_line: TaxLineResponse | null;
  /** How many of the user's entries used it in the last 90 days, for ordering. */
  use_count: number;
};

type TransactionSplitResponse = Pick<
  TransactionSplitRow,
  'unit_id' | 'basis_points' | 'amount_cents'
>;

type TransactionResponse = Omit<TransactionRow, 'user_id' | 'kind'> & {
  kind: EntryKind;
  splits: TransactionSplitResponse[];
};

type ReceiptUploadResponse = {
  receipt_id: string;
  /** Storage path to upload to, `{userId}/{year}/{receiptId}.{jpg|pdf}`. */
  path: string;
  /** Token for `uploadToSignedUrl`. */
  token: string;
};

type ApiErrorCode = 'unauthorized' | 'invalid_body' | 'not_found' | 'conflict' | 'internal';

type ApiError = {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: unknown;
  };
};

type UserSettings = Camel<UserSettingsRow>;
type Me = Camel<MeResponse>;
type UpdateSettingsResult = Camel<UpdateSettingsResponse>;
type UpdateSettingsInput = Camel<UpdateSettingsBody>;
type Unit = Camel<UnitResponse>;
type Property = Camel<PropertyResponse>;
type PropertySummary = Camel<PropertySummaryResponse>;
type CreatePropertyInput = Camel<CreatePropertyBody>;
type Category = Camel<CategoryResponse>;
type Transaction = Camel<TransactionResponse>;
type TransactionSplit = Camel<TransactionSplitResponse>;
type ReceiptUpload = Camel<ReceiptUploadResponse>;
type CreateTransactionInput = Camel<CreateTransactionBody>;

export type {
  ApiError,
  Category,
  CategoryResponse,
  CreateTransactionInput,
  ReceiptUpload,
  ReceiptUploadResponse,
  TaxLineResponse,
  Transaction,
  TransactionResponse,
  TransactionRow,
  TransactionSplit,
  TransactionSplitResponse,
  TransactionSplitRow,
  CreatePropertyInput,
  CreatePropertyResponse,
  Property,
  PropertyResponse,
  PropertyRow,
  PropertySummary,
  PropertySummaryResponse,
  RentDue,
  Unit,
  UnitResponse,
  UnitRow,
  UnitStatus,
  ApiErrorCode,
  Camel,
  Me,
  MeResponse,
  TimeZoneOption,
  UpdateSettingsInput,
  UpdateSettingsResponse,
  UpdateSettingsResult,
  UserSettings,
  UserSettingsRow,
};
