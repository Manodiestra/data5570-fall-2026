import { router, useLocalSearchParams } from 'expo-router';
import { Alert, View } from 'react-native';

import { EventForm, type EventFormValues } from '@/components/calendar/EventForm';
import { ActivityIndicator } from '@/components/nativewindui/ActivityIndicator';
import { Text } from '@/components/nativewindui/Text';
import { useGetEventQuery, useUpdateEventMutation } from '@/store/api';

export default function EditEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const eventId = Number(id);
  const { data: event, isLoading } = useGetEventQuery(eventId);
  const [updateEvent, { isLoading: isSaving }] = useUpdateEventMutation();

  async function handleSubmit(values: EventFormValues) {
    if (!event) return;
    try {
      await updateEvent({
        id: eventId,
        changes: {
          calendar: values.calendar as number,
          summary: values.summary,
          // null (not undefined) so clearing a field actually clears it on
          // the server; undefined keys are dropped from the JSON body.
          location: values.location || null,
          description: values.description || null,
          status: values.status,
          is_all_day: values.is_all_day,
          dtstart: values.dtstart.toISOString(),
          dtend: values.dtend.toISOString(),
          // RFC 5545: bump SEQUENCE on each revision.
          sequence: event.sequence + 1,
        },
      }).unwrap();
      router.back();
    } catch {
      Alert.alert('Could not save event', 'Please try again.');
    }
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
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
