import type { User } from '@supabase/supabase-js';

type Profile = {
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
};

const GOOGLE_PHOTO_SIZE = /=s\d+-c$/;

function stringField(metadata: User['user_metadata'], key: string): string | null {
  const value: unknown = metadata[key];
  return typeof value === 'string' && value.trim() !== '' ? value : null;
}

function largerGooglePhoto(url: string | null): string | null {
  return url === null ? null : url.replace(GOOGLE_PHOTO_SIZE, '=s256-c');
}

function getProfile({ email, user_metadata: metadata }: User): Profile {
  const name = stringField(metadata, 'full_name') ?? stringField(metadata, 'name');
  const avatarUrl = largerGooglePhoto(
    stringField(metadata, 'avatar_url') ?? stringField(metadata, 'picture'),
  );

  return { name, email: email ?? null, avatarUrl };
}

function firstName(name: string | null): string | null {
  return name?.split(/\s+/)[0] ?? null;
}

export { type Profile, firstName, getProfile };
