import { Card } from '@/components/Card';
import { Slider } from '@/components/nativewindui/Slider';

type SliderCardProps = {
  value: number;
  onValueChange: (value: number) => void;
  // When provided, pressing anywhere on the card calls it.
  onPress?: () => void;
};

export function SliderCard({ value, onValueChange, onPress }: SliderCardProps) {
  return (
    <Card title="Slider" onPress={onPress}>
      <Slider value={value} onValueChange={onValueChange} minimumValue={0} maximumValue={1} />
    </Card>
  );
}
