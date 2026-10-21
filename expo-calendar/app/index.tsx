import { router } from 'expo-router';
import { View } from 'react-native';

import { Button } from '@/components/nativewindui/Button';
import { Text } from '@/components/nativewindui/Text';
import { TextField } from '@/components/nativewindui/TextField';

// Auth isn't implemented yet — both buttons just take the user to the
// dashboard. Fields below are visual only for now.
export default function LoginScreen() {
  function continueToDashboard() {
    router.replace('/dashboard');
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
            keyboardType="email-address"
          />
          <TextField label="Password" placeholder="••••••••" secureTextEntry />
        </View>

        <View className="gap-3">
          <Button onPress={continueToDashboard}>
            <Text>Sign In</Text>
          </Button>
          <Button variant="secondary" onPress={continueToDashboard}>
            <Text>Sign Up</Text>
          </Button>
        </View>
      </View>
    </View>
  );
}
