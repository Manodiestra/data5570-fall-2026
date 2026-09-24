import { DrawerContentScrollView, type DrawerContentComponentProps } from 'expo-router/drawer';
import { router } from 'expo-router';
import * as React from 'react';
import { Pressable, View } from 'react-native';

import { Icon } from '@/components/nativewindui/Icon';
import { Text } from '@/components/nativewindui/Text';
import { Toggle } from '@/components/nativewindui/Toggle';
import { useColorScheme } from '@/lib/useColorScheme';
import { useGetCalendarsQuery } from '@/store/api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { initializeSelectedCalendars, toggleCalendarSelected } from '@/store/uiSlice';

export function CalendarDrawerContent(props: DrawerContentComponentProps) {
  const { data: calendars = [], isLoading } = useGetCalendarsQuery();
  const { colors } = useColorScheme();
  const dispatch = useAppDispatch();
  const selectedCalendarIds = useAppSelector((state) => state.ui.selectedCalendarIds);
  const initialized = useAppSelector((state) => state.ui.initialized);

  React.useEffect(() => {
    if (!initialized && calendars.length > 0) {
      dispatch(initializeSelectedCalendars(calendars.map((calendar) => calendar.id)));
    }
  }, [initialized, calendars, dispatch]);

  return (
    <View className="flex-1 bg-background">
      <DrawerContentScrollView {...props} contentContainerClassName="flex-grow">
        <View className="px-4 pb-2 pt-4">
          <Text variant="title3" className="font-semibold">
            My Calendars
          </Text>
        </View>

        {isLoading && (
          <Text color="tertiary" className="px-4">
            Loading…
          </Text>
        )}
        {!isLoading && calendars.length === 0 && (
          <Text color="tertiary" className="px-4">
            No calendars yet.
          </Text>
        )}

        {calendars.map((calendar) => (
          <Pressable
            key={calendar.id}
            onPress={() => dispatch(toggleCalendarSelected(calendar.id))}
            className="flex-row items-center justify-between px-4 py-3 active:opacity-70">
            <View className="flex-1 flex-row items-center gap-3">
              <View
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: calendar.color || '#8E8E93' }}
              />
              <Text className="flex-1" numberOfLines={1}>
                {calendar.name}
              </Text>
            </View>
            <Toggle
              value={selectedCalendarIds.includes(calendar.id)}
              onValueChange={() => {
                dispatch(toggleCalendarSelected(calendar.id));
              }}
            />
          </Pressable>
        ))}
      </DrawerContentScrollView>

      <View className="border-t border-border p-3">
        <Pressable
          onPress={() => router.push('/calendar/new')}
          className="flex-row items-center justify-center gap-2 rounded-lg py-2.5 active:opacity-70">
          <Icon name="plus" size={18} color={colors.primary} />
          <Text className="font-medium" style={{ color: colors.primary }}>
            New Calendar
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
