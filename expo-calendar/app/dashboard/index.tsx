import { addMonths, format, isSameDay, parseISO, subMonths } from 'date-fns';
import { router } from 'expo-router';
import * as React from 'react';
import { Alert, Platform, View } from 'react-native';

import { MonthCalendar } from '@/components/calendar/MonthCalendar';
import { Button } from '@/components/nativewindui/Button';
import { Icon } from '@/components/nativewindui/Icon';
import { Text } from '@/components/nativewindui/Text';
import { selectCalendars } from '@/store/calendarsSlice';
import { selectEvents } from '@/store/eventsSlice';
import { useAppSelector } from '@/store/hooks';

export default function DashboardScreen() {
  const [currentMonth, setCurrentMonth] = React.useState(() => new Date());
  const events = useAppSelector(selectEvents);
  const calendars = useAppSelector(selectCalendars);
  const hiddenCalendarIds = useAppSelector((state) => state.ui.hiddenCalendarIds);

  const visibleEvents = React.useMemo(
    () => events.filter((event) => !hiddenCalendarIds.includes(event.calendar)),
    [events, hiddenCalendarIds]
  );

  console.log("OUR CALENDARS", calendars)

  // Prompt once per visit to the dashboard if nothing is scheduled for today.
  const hasPromptedRef = React.useRef(false);
  React.useEffect(() => {
    if (hasPromptedRef.current) return;
    hasPromptedRef.current = true;

    const today = new Date();
    const hasEventToday = events.some((event) => isSameDay(parseISO(event.dtstart), today));
    if (hasEventToday) return;

    const goToNewEvent = () =>
      router.push({ pathname: '/event/new', params: { date: format(today, 'yyyy-MM-dd') } });
    const message = 'You have no events today. Would you like to add one?';

    // Alert.alert is a no-op on react-native-web, so fall back to the browser dialog.
    if (Platform.OS === 'web') {
      if (window.confirm(message)) goToNewEvent();
      return;
    }
    Alert.alert('No events today', message, [
      { text: 'Not now', style: 'cancel' },
      { text: 'Add event', onPress: goToNewEvent },
    ]);
  }, []);


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
