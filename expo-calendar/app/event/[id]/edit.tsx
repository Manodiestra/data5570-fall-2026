import { router, useLocalSearchParams } from 'expo-router';
import { Alert, View } from 'react-native';

import { EventForm, type EventFormValues } from '@/components/calendar/EventForm';
import { Text } from '@/components/nativewindui/Text';
import { useGetEventQuery, useUpdateEventMutation } from '@/store/api';

export default function EditEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const eventId = Number(id);
  const { data: event, isLoading } = useGetEventQuery(eventId);
  const [updateEvent, { isLoading: isSaving }] = useUpdateEventMutation();

  async function handleSubmit(values: EventFormValues) {
    try {
      await updateEvent({
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
      }).unwrap();
      router.back();
    } catch (error) {
      Alert.alert('Could not save event', String(error));
    }
  }

  if (isLoading || !event) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text color="tertiary">Loading…</Text>
      </View>
    );
  }

  return (
    <EventForm
      submitLabel="Save Changes"
      isSubmitting={isSaving}
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
