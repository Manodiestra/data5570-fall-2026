import * as React from 'react';
import { View } from 'react-native';

import { cn } from '@/lib/cn';
import { useColorScheme } from '@/lib/useColorScheme';

// @react-native-community/datetimepicker has no web implementation (it
// renders null there), so this file supplies a web-only fallback built on
// plain <input type="date"/"time"> elements. Metro picks this file over
// DatePicker.tsx automatically when bundling for web.
type DatePickerWebProps = {
  mode: 'date' | 'time' | 'datetime';
  value: Date;
  onValueChange?: (event: { type: string }, date?: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  className?: string;
};

function pad(value: number) {
  return value.toString().padStart(2, '0');
}

function toDateInputValue(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toTimeInputValue(date: Date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function DatePicker({
  mode,
  value,
  onValueChange,
  minimumDate,
  maximumDate,
  className,
}: DatePickerWebProps) {
  const { colors, isDarkColorScheme } = useColorScheme();

  const inputStyle: React.CSSProperties = {
    fontSize: 15,
    padding: '8px 10px',
    borderRadius: 8,
    border: `1px solid ${colors.grey4}`,
    backgroundColor: colors.card,
    color: colors.foreground,
    colorScheme: isDarkColorScheme ? 'dark' : 'light',
  };

  function handleDateChange(event: React.ChangeEvent<HTMLInputElement>) {
    const [year, month, day] = event.target.value.split('-').map(Number);
    if (!year || !month || !day) return;
    const next = new Date(value);
    next.setFullYear(year, month - 1, day);
    onValueChange?.({ type: 'set' }, next);
  }

  function handleTimeChange(event: React.ChangeEvent<HTMLInputElement>) {
    const [hours, minutes] = event.target.value.split(':').map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return;
    const next = new Date(value);
    next.setHours(hours, minutes, 0, 0);
    onValueChange?.({ type: 'set' }, next);
  }

  return (
    <View className={cn('flex-row gap-2.5', className)}>
      {mode !== 'time' && (
        <input
          type="date"
          value={toDateInputValue(value)}
          onChange={handleDateChange}
          min={minimumDate ? toDateInputValue(minimumDate) : undefined}
          max={maximumDate ? toDateInputValue(maximumDate) : undefined}
          style={inputStyle}
        />
      )}
      {mode !== 'date' && (
        <input
          type="time"
          value={toTimeInputValue(value)}
          onChange={handleTimeChange}
          style={inputStyle}
        />
      )}
    </View>
  );
}
