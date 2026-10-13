import type { ToCamelCaseKeys } from 'es-toolkit/types';

import type { Tables } from './database.types';
import type { UpdateSettingsBody } from './schemas';

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

type ApiErrorCode = 'unauthorized' | 'invalid_body' | 'not_found' | 'internal';

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

export type {
  ApiError,
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
