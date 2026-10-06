import * as Haptics from 'expo-haptics';
import { View } from 'react-native';

import { Card } from '@/components/Card';
import { Button } from '@/components/nativewindui/Button';
import { Icon } from '@/components/nativewindui/Icon';
import { Text } from '@/components/nativewindui/Text';

type ButtonCardProps = {
  // Called when any of the buttons is pressed.
  onPress?: () => void;
};

export function ButtonCard({ onPress }: ButtonCardProps) {
  function handlePress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  }

  return (
    <Card title="Button">
      <View className="items-center justify-center gap-4 p-4">
        <Button onPress={handlePress}>
          <Icon name="play.fill" className="ios:size-4 text-white" />
          <Text>Primary</Text>
        </Button>
        <Button onPress={handlePress} variant="secondary">
          <Text>Secondary</Text>
        </Button>
        <Button onPress={handlePress} variant="tonal">
          <Text>Tonal</Text>
        </Button>
        <Button onPress={handlePress} variant="plain">
          <Text>Plain</Text>
        </Button>
        <Button onPress={handlePress} variant="tonal" size="icon">
          <Icon name="heart.fill" className="ios:text-primary size-5 text-foreground" />
        </Button>
      </View>
    </Card>
  );
}
