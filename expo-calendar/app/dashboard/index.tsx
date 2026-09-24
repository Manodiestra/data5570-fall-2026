import { addMonths, format, subMonths } from 'date-fns';
import { router } from 'expo-router';
import * as React from 'react';
import { View } from 'react-native';

import { MonthCalendar } from '@/components/calendar/MonthCalendar';
import { Button } from '@/components/nativewindui/Button';
import { Icon } from '@/components/nativewindui/Icon';
import { Text } from '@/components/nativewindui/Text';
import { useGetCalendarsQuery, useGetEventsQuery } from '@/store/api';
import { useAppSelector } from '@/store/hooks';

export default function DashboardScreen() {
  const [currentMonth, setCurrentMonth] = React.useState(() => new Date());
  const { data: events = [] } = useGetEventsQuery();
  const { data: calendars = [] } = useGetCalendarsQuery();
  const selectedCalendarIds = useAppSelector((state) => state.ui.selectedCalendarIds);

  const visibleEvents = React.useMemo(
    () => events.filter((event) => selectedCalendarIds.includes(event.calendar)),
    [events, selectedCalendarIds]
  );

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-4 py-3">
        <View className="flex-row items-center gap-2">
          <Button
            variant="plain"
            size="icon"
            onPress={() => setCurrentMonth((current) => subMonths(current, 1))}>
            <Icon name="chevron.left" className="text-foreground" />
          </Button>
          <Text variant="title3" className="min-w-[160px] text-center font-semibold">
            {format(currentMonth, 'MMMM yyyy')}
          </Text>
          <Button
            variant="plain"
            size="icon"
            onPress={() => setCurrentMonth((current) => addMonths(current, 1))}>
            <Icon name="chevron.right" className="text-foreground" />
          </Button>
        </View>
        <Button variant="secondary" size="sm" onPress={() => setCurrentMonth(new Date())}>
          <Text>Today</Text>
        </Button>
      </View>

      <MonthCalendar
        month={currentMonth}
        events={visibleEvents}
        calendars={calendars}
        onSelectEvent={(event) => router.push(`/event/${event.id}`)}
        onSelectEmptySlot={(date) =>
          router.push({ pathname: '/event/new', params: { date: format(date, 'yyyy-MM-dd') } })
        }
      />
    </View>
  );
}
