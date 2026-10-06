import { router } from 'expo-router';
import { ScrollView } from 'react-native';

import { ButtonCard } from '@/components/ButtonCard';

export default function ButtonScreen() {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerClassName="py-4">
      {/* push (not navigate) so every press stacks another Button page */}
      <ButtonCard onPress={() => router.push('/button')} />
    </ScrollView>
  );
}
