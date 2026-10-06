import * as React from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/nativewindui/Text';

const CARD_CLASS =
  'gap-4 rounded-xl border border-border bg-card p-4 pb-6 shadow-sm shadow-black/10 dark:shadow-none';

type CardProps = {
  children: React.ReactNode;
  title: string;
  // When provided, the whole card becomes pressable.
  onPress?: () => void;
};

export function Card({ children, title, onPress }: CardProps) {
  const content = (
    <>
      <Text className="text-center text-sm font-medium tracking-wider opacity-60">{title}</Text>
      {children}
    </>
  );

  return (
    <View className="px-4">
      {onPress ? (
        <Pressable onPress={onPress} className={`${CARD_CLASS} active:opacity-80`}>
          {content}
        </Pressable>
      ) : (
        <View className={CARD_CLASS}>{content}</View>
      )}
    </View>
  );
}
