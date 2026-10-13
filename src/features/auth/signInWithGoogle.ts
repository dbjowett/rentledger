import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import { env } from '@/lib/env';
import { supabase } from '@/lib/supabase';

type SignInResult =
  | { status: 'signed_in' }
  | { status: 'cancelled' }
  | { status: 'in_progress' }
  | { status: 'error'; message: string };

GoogleSignin.configure({ webClientId: env.googleWebClientId });

function errorResult(error: unknown): SignInResult {
  if (isErrorWithCode(error)) {
    switch (error.code) {
      case statusCodes.SIGN_IN_CANCELLED: {
        return { status: 'cancelled' };
      }
      case statusCodes.IN_PROGRESS: {
        return { status: 'in_progress' };
      }
      case statusCodes.PLAY_SERVICES_NOT_AVAILABLE: {
        return {
          status: 'error',
          message: 'Google Play Services is missing or out of date on this device.',
        };
      }
      default: {
        break;
      }
    }
  }
  return { status: 'error', message: 'Sign-in failed. Please try again.' };
}

async function signInWithGoogle(): Promise<SignInResult> {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response)) return { status: 'cancelled' };

    const { idToken } = response.data;
    if (idToken === null) {
      return { status: 'error', message: 'Google did not return an ID token.' };
    }

    const { error } = await supabase.auth.signInWithIdToken({ provider: 'google', token: idToken });
    if (error) return { status: 'error', message: error.message };

    return { status: 'signed_in' };
  } catch (error) {
    return errorResult(error);
  }
}

async function signOutOfGoogle() {
  try {
    await GoogleSignin.signOut();
  } catch {
    // Not signed in to Google on this device; nothing to do.
  }
}

export { type SignInResult, signInWithGoogle, signOutOfGoogle };
