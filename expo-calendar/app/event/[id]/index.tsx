import { format } from 'date-fns';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, ScrollView, View } from 'react-native';

import { Button } from '@/components/nativewindui/Button';
import { Text } from '@/components/nativewindui/Text';
import { useColorScheme } from '@/lib/useColorScheme';
import { useDeleteEventMutation, useGetCalendarsQuery, useGetEventQuery } from '@/store/api';

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const eventId = Number(id);
  const { data: event, isLoading } = useGetEventQuery(eventId);
  const { data: calendars = [] } = useGetCalendarsQuery();
  const [deleteEvent, { isLoading: isDeleting }] = useDeleteEventMutation();
  const { colors } = useColorScheme();

  const calendar = calendars.find((c) => c.id === event?.calendar);

  function handleDelete() {
    Alert.alert('Delete event', "This can't be undone.", [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteEvent(eventId).unwrap();
            router.back();
          } catch (error) {
            Alert.alert('Could not delete event', String(error));
          }
        },
      },
    ]);
  }

  if (isLoading || !event) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text color="tertiary">Loading…</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-4 p-4">
      <View className="gap-1">
        <Text variant="title2" className="font-semibold">
          {event.summary}
        </Text>
        {calendar && (
          <View className="flex-row items-center gap-2">
            <View
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: calendar.color || '#8E8E93' }}
            />
            <Text color="tertiary">{calendar.name}</Text>
          </View>
        )}
      </View>

      <View className="gap-1">
        <Text color="secondary" variant="subhead">
          {event.is_all_day
            ? format(new Date(event.dtstart), 'EEEE, MMMM d, yyyy')
            : format(new Date(event.dtstart), 'EEEE, MMMM d, yyyy · h:mm a')}
        </Text>
        {event.dtend && !event.is_all_day && (
          <Text color="tertiary" variant="footnote">
            until {format(new Date(event.dtend), 'h:mm a')}
          </Text>
        )}
      </View>

      {event.location ? <Text>{event.location}</Text> : null}
      {event.description ? <Text color="secondary">{event.description}</Text> : null}

      <View className="flex-row gap-3 pt-2">
        <Button
          variant="secondary"
          className="flex-1"
          onPress={() => router.push(`/event/${eventId}/edit`)}>
          <Text>Edit</Text>
        </Button>
        <Button
          variant="secondary"
          className="flex-1"
          onPress={handleDelete}
          disabled={isDeleting}>
          <Text style={{ color: colors.destructive }}>Delete</Text>
        </Button>
      </View>
    </ScrollView>
  );
}
