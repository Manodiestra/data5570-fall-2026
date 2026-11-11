import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/nativewindui/Button';
import { Text } from '@/components/nativewindui/Text';
import { TextField } from '@/components/nativewindui/TextField';
import { supabase } from '@/lib/supabase';
import { useColorScheme } from '@/lib/useColorScheme';

// No navigation here: on success, AuthListener puts the session in Redux and
// the route guards in app/_layout.tsx redirect to the dashboard.
export default function LoginScreen() {
  const { colors } = useColorScheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState<'signIn' | 'signUp' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function submit(mode: 'signIn' | 'signUp') {
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }

    setPending(mode);
    setError(null);
    setNotice(null);

    const credentials = { email: email.trim(), password };
    const { data, error } =
      mode === 'signIn'
        ? await supabase.auth.signInWithPassword(credentials)
        : await supabase.auth.signUp(credentials);

    setPending(null);
    if (error) {
      setError(error.message);
    } else if (mode === 'signUp' && !data.session) {
      // Supabase returns no session when "Confirm email" is turned on.
      setNotice('Che@react-native-async-storage/async-storageck your email to confirm your account, then sign in.');
    }
  }

  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <View className="w-full max-w-sm gap-6">
        <View className="items-center gap-1">
          <Text variant="largeTitle" className="font-semibold">
            Calendar
          </Text>
          <Text color="tertiary" variant="subhead">
            Sign in to see your events
          </Text>
        </View>

        <View className="gap-3">
          <TextField
            label="Email"
            placeholder="you@example.com"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextField
            label="Password"
            placeholder="••••••••"
            autoComplete="password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={() => submit('signIn')}
          />
        </View>

        {error ? (
          <Text variant="footnote" style={{ color: colors.destructive }}>
            {error}
          </Text>
        ) : null}
        {notice ? (
          <Text variant="footnote" color="secondary">
            {notice}
          </Text>
        ) : null}

        <View className="gap-3">
          <Button onPress={() => submit('signIn')} disabled={pending !== null}>
            <Text>{pending === 'signIn' ? 'Signing In…' : 'Sign In'}</Text>
          </Button>
          <Button variant="secondary" onPress={() => submit('signUp')} disabled={pending !== null}>
            <Text>{pending === 'signUp' ? 'Signing Up…' : 'Sign Up'}</Text>
          </Button>
        </View>
      </View>
    </View>
  );
}
