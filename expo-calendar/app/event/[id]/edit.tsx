import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { EventForm, type EventFormValues } from '@/components/calendar/EventForm';
import { Text } from '@/components/nativewindui/Text';
import { selectEventById, updateEvent } from '@/store/eventsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

export default function EditEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const eventId = Number(id);
  const event = useAppSelector(selectEventById(eventId));
  const dispatch = useAppDispatch();

  function handleSubmit(values: EventFormValues) {
    dispatch(
      updateEvent({
        id: eventId,
        changes: {
          calendar: values.calendar as number,
          summary: values.summary,
          location: values.location || undefined,
          description: values.description || undefined,
          status: values.status,
          is_all_day: values.is_all_day,
          dtstart: values.dtstart.toISOString(),
          dtend: values.dtend.toISOString(),
        },
      })
    );
    router.back();
  }

  if (!event) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text color="tertiary">Event not found.</Text>
      </View>
    );
  }

  return (
    <EventForm
      submitLabel="Save Changes"
      defaultValues={{
        summary: event.summary,
        location: event.location ?? '',
        description: event.description ?? '',
        calendar: event.calendar,
        status: event.status,
        is_all_day: event.is_all_day,
        dtstart: new Date(event.dtstart),
        dtend: event.dtend
          ? new Date(event.dtend)
          : new Date(new Date(event.dtstart).getTime() + 60 * 60 * 1000),
      }}
      onSubmit={handleSubmit}
    />
  );
}
