import { Pressable } from 'react-native';
import { router } from 'expo-router';

import { Avatar } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { getProfile } from '@/shared/profile';

/** Self-contained so it can sit in a header, a tab bar or a screen without changes. */
function ProfileButton() {
  const { session } = useAuth();
  const profile = session === null ? null : getProfile(session.user);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Profile"
      hitSlop={8}
      onPress={() => router.push('/profile')}
      className="active:opacity-70"
    >
      <Avatar
        size="sm"
        fallback="icon"
        name={profile?.name ?? null}
        imageUrl={profile?.avatarUrl}
      />
    </Pressable>
  );
}

export { ProfileButton };
