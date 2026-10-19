import { router, useLocalSearchParams } from 'expo-router';
import * as React from 'react';

import { EventForm, type EventFormValues } from '@/components/calendar/EventForm';
import { createEvent } from '@/store/eventsSlice';
import { useAppDispatch } from '@/store/hooks';

export default function NewEventScreen() {
  const { date } = useLocalSearchParams<{ date?: string }>();
  const dispatch = useAppDispatch();

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

  function handleSubmit(values: EventFormValues) {
    dispatch(
      createEvent({
        calendar: values.calendar as number,
        summary: values.summary,
        location: values.location || undefined,
        description: values.description || undefined,
        status: values.status,
        is_all_day: values.is_all_day,
        dtstart: values.dtstart.toISOString(),
        dtend: values.dtend.toISOString(),
      })
    );
    router.back();
  }

  return (
    <EventForm
      submitLabel="Create Event"
      defaultValues={{ dtstart: defaultDtstart, dtend: defaultDtend }}
      onSubmit={handleSubmit}
    />
  );
}
