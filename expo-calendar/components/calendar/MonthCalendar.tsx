import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import * as React from 'react';
import { Platform, Pressable, View } from 'react-native';

import { Text } from '@/components/nativewindui/Text';
import { cn } from '@/lib/cn';
import { useColorScheme } from '@/lib/useColorScheme';
import type { Calendar, Event } from '@/store/api';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface MonthCalendarProps {
  month: Date;
  events: Event[];
  calendars: Calendar[];
  onSelectEvent: (event: Event) => void;
  onSelectEmptySlot: (date: Date) => void;
}

export function MonthCalendar({
  month,
  events,
  calendars,
  onSelectEvent,
  onSelectEmptySlot,
}: MonthCalendarProps) {
  const days = React.useMemo(() => {
    const start = startOfWeek(startOfMonth(month));
    const end = endOfWeek(endOfMonth(month));
    return eachDayOfInterval({ start, end });
  }, [month]);

  const colorByCalendarId = React.useMemo(() => {
    const map = new Map<number, string>();
    calendars.forEach((calendar) => map.set(calendar.id, calendar.color || '#8E8E93'));
    return map;
  }, [calendars]);

  // bg-primary/text-primary-foreground render transparent/inherited on web
  // (see components/nativewindui/Button.tsx), so color the "today" badge
  // explicitly instead of relying on those classes.
  const { colors } = useColorScheme();
  const todayBadgeStyle = Platform.OS === 'web' ? { backgroundColor: colors.primary } : undefined;
  const todayTextStyle =
    Platform.OS === 'web' ? { color: colors.primaryForeground } : undefined;

  return (
    <View className="flex-1">
      <View className="flex-row border-b border-border">
        {WEEKDAY_LABELS.map((label) => (
          <View key={label} className="flex-1 items-center py-2">
            <Text variant="caption1" color="tertiary">
              {label}
            </Text>
          </View>
        ))}
      </View>
      <View className="flex-1 flex-row flex-wrap">
        {days.map((day) => {
          const dayEvents = events
            .filter((event) => isSameDay(new Date(event.dtstart), day))
            .sort((a, b) => a.dtstart.localeCompare(b.dtstart));

          return (
            <Pressable
              key={day.toISOString()}
              onPress={() => onSelectEmptySlot(day)}
              className={cn(
                'w-[14.2857%] min-h-[110px] gap-1 border-b border-r border-border p-1.5',
                !isSameMonth(day, month) && 'opacity-40'
              )}>
              <View
                className={cn(
                  'h-6 w-6 items-center justify-center rounded-full',
                  isToday(day) && 'bg-primary'
                )}
                style={isToday(day) ? todayBadgeStyle : undefined}>
                <Text
                  variant="footnote"
                  className={cn(isToday(day) && 'font-semibold text-primary-foreground')}
                  style={isToday(day) ? todayTextStyle : undefined}>
                  {format(day, 'd')}
                </Text>
              </View>
              <View className="gap-1">
                {dayEvents.map((event) => (
                  <Pressable
                    key={event.id}
                    onPress={(nativeEvent) => {
                      // Nested Pressables bubble on web (react-native-web uses
                      // real DOM events), so stop the day cell's own onPress
                      // from also firing.
                      (nativeEvent as unknown as { stopPropagation?: () => void }).stopPropagation?.();
                      onSelectEvent(event);
                    }}
                    className="rounded px-1 py-0.5"
                    style={{ backgroundColor: colorByCalendarId.get(event.calendar) ?? '#8E8E93' }}>
                    <Text variant="caption2" className="text-white" numberOfLines={1}>
                      {event.summary}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
