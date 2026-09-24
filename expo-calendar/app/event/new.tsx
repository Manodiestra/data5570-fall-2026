import { router, useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import { Alert } from 'react-native';

import { EventForm, type EventFormValues } from '@/components/calendar/EventForm';
import { useCreateEventMutation } from '@/store/api';

export default function NewEventScreen() {
  const { date } = useLocalSearchParams<{ date?: string }>();
  const [createEvent, { isLoading }] = useCreateEventMutation();

  // date comes from tapping an empty day cell (yyyy-MM-dd); default to 9am
  // on that day, or "right now" when opened from the New Event button.
  const defaultDtstart = React.useMemo(() => {
    if (!date) return new Date();
    const [year, month, day] = date.split('-').map(Number);
    return new Date(year, month - 1, day, 9, 0, 0);
  }, [date]);

  const defaultDtend = React.useMemo(
    () => new Date(defaultDtstart.getTime() + 60 * 60 * 1000),
    [defaultDtstart]
  );

  async function handleSubmit(values: EventFormValues) {
    try {
      await createEvent({
        calendar: values.calendar as number,
        summary: values.summary,
        location: values.location || undefined,
        description: values.description || undefined,
        status: values.status,
        is_all_day: values.is_all_day,
        dtstart: values.dtstart.toISOString(),
        dtend: values.dtend.toISOString(),
      }).unwrap();
      router.back();
    } catch (error) {
      Alert.alert('Could not create event', String(error));
    }
  }

  return (
    <EventForm
      submitLabel="Create Event"
      isSubmitting={isLoading}
      defaultValues={{ dtstart: defaultDtstart, dtend: defaultDtend }}
      onSubmit={handleSubmit}
    />
  );
}
