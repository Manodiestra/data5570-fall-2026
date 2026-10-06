import { useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import { ScrollView } from 'react-native';

import { SliderCard } from '@/components/SliderCard';

export default function SliderScreen() {
  // Route params always arrive as strings, so convert back to a number.
  const { value } = useLocalSearchParams<{ value?: string }>();
  const [sliderValue, setSliderValue] = React.useState(value ? Number(value) : 0.5);

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerClassName="py-4">
      <SliderCard value={sliderValue} onValueChange={setSliderValue} />
    </ScrollView>
  );
}
