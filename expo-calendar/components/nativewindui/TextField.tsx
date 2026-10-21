import * as React from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';

import { Text } from '@/components/nativewindui/Text';
import { cn } from '@/lib/cn';
import { useColorScheme } from '@/lib/useColorScheme';

export type TextFieldProps = TextInputProps & {
  label?: string;
  error?: string;
  containerClassName?: string;
};

export const TextField = React.forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, error, containerClassName, className, placeholderTextColor, ...props },
  ref
) {
  const { colors } = useColorScheme();

  return (
    <View className={cn('gap-1.5', containerClassName)}>
      {label ? (
        <Text variant="subhead" color="secondary">
          {label}
        </Text>
      ) : null}
      <TextInput
        ref={ref}
        placeholderTextColor={placeholderTextColor ?? colors.grey}
        className={cn(
          'rounded-lg border border-border bg-card px-3.5 py-2.5 text-[17px] text-foreground',
          error && 'border-destructive',
          className
        )}
        // border-destructive renders as the default border color on web (see
        // components/nativewindui/Button.tsx), so color it explicitly there.
        style={error ? { borderColor: colors.destructive } : undefined}
        {...props}
      />
      {error ? (
        <Text variant="footnote" style={{ color: colors.destructive }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
});
