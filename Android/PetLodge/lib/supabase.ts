import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

function normalizeEnvValue(value?: string) {
  if (!value) {
    return undefined;
  }

  return value.trim().replace(/^['\"]|['\"]$/g, '');
}

export const supabaseUrl = normalizeEnvValue(process.env.EXPO_PUBLIC_SUPABASE_URL);
export const supabaseAnonKey = normalizeEnvValue(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
export const hasSupabaseEnv = Boolean(supabaseUrl && supabaseAnonKey);

const isWeb = Platform.OS === 'web';
const isBrowser = typeof window !== 'undefined';

const authStorage = isWeb ? (isBrowser ? window.localStorage : undefined) : AsyncStorage;
const canPersistSession = !isWeb || isBrowser;

export const supabase = hasSupabaseEnv
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        storage: authStorage,
        autoRefreshToken: canPersistSession,
        persistSession: canPersistSession,
        detectSessionInUrl: isWeb && isBrowser,
      },
    })
  : null;
