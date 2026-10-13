import type { Tables } from './database.types';

type UserSettings = Tables<'user_settings'>;

type Me = {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  settings: UserSettings;
};

type UpdateSettingsResult = {
  settings: UserSettings;
  /** False when `onlyIfUnset` was set and a time zone already existed. */
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

export type { ApiError, ApiErrorCode, Me, TimeZoneOption, UpdateSettingsResult, UserSettings };
