import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Text } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';

export default function SignInScreen() {
  const { signIn } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setBusy(true);
    setError(null);
    const result = await signIn();

    if (result.status === 'error') setError(result.message);
    setBusy(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="flex-1 justify-center gap-10 px-screen">
        <View className="gap-2">
          <Text size="4xl" weight="bold">
            Rent Ledger
          </Text>
          <Text size="lg" tone="grey">
            Rental income and expenses, ready for your T776.
          </Text>
        </View>
        <View className="gap-3">
          <Button
            fullWidth
            size="lg"
            shape="rounded"
            label="Continue with Google"
            loading={busy}
            onPress={() => void handleSignIn()}
          />
          {error === null ? null : (
            <Text size="base" tone="danger" accessibilityLiveRegion="polite">
              {error}
            </Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
