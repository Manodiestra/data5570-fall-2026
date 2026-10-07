import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, View } from 'react-native';

import { Button } from '@/components/nativewindui/Button';
import { DatePicker } from '@/components/nativewindui/DatePicker';
import { Picker, PickerItem } from '@/components/nativewindui/Picker';
import { Text } from '@/components/nativewindui/Text';
import { TextField } from '@/components/nativewindui/TextField';
import { Toggle } from '@/components/nativewindui/Toggle';
import { useColorScheme } from '@/lib/useColorScheme';
import { useGetCalendarsQuery, type EventStatus } from '@/store/api';

export type EventFormValues = {
  summary: string;
  location: string;
  description: string;
  calendar: number | null;
  status: EventStatus;
  is_all_day: boolean;
  dtstart: Date;
  dtend: Date;
};

const STATUS_OPTIONS: EventStatus[] = ['CONFIRMED', 'TENTATIVE', 'CANCELLED'];

interface EventFormProps {
  defaultValues?: Partial<EventFormValues>;
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: (values: EventFormValues) => void | Promise<void>;
}

export function EventForm({ defaultValues, submitLabel, isSubmitting, onSubmit }: EventFormProps) {
  const { colors } = useColorScheme();
  const { data: calendars = [] } = useGetCalendarsQuery();

  const {
    control,
    handleSubmit,
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<EventFormValues>({
    defaultValues: {
      summary: '',
      location: '',
      description: '',
      calendar: calendars[0]?.id ?? null,
      status: 'CONFIRMED',
      is_all_day: false,
      dtstart: new Date(),
      dtend: new Date(Date.now() + 60 * 60 * 1000),
      ...defaultValues,
    },
  });

  // Calendars load asynchronously, so pick a default once they arrive if the
  // caller didn't already specify one (i.e. this is a fresh "new event" form).
  React.useEffect(() => {
    if (!defaultValues?.calendar && calendars.length > 0 && getValues('calendar') == null) {
      setValue('calendar', calendars[0].id);
    }
  }, [calendars, defaultValues?.calendar, getValues, setValue]);

  const isAllDay = watch('is_all_day');

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-4 p-4"
      keyboardShouldPersistTaps="handled">
      <Controller
        control={control}
        name="summary"
        rules={{ required: 'Title is required' }}
        render={({ field }) => (
          <TextField
            label="Title"
            placeholder="Event title"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errors.summary?.message}
          />
        )}
      />

      <View className="gap-1.5">
        <Text variant="subhead" color="secondary">
          Calendar
        </Text>
        <Controller
          control={control}
          name="calendar"
          rules={{ required: true }}
          render={({ field }) => (
            <Picker
              selectedValue={field.value ?? undefined}
              onValueChange={(itemValue) => field.onChange(itemValue)}>
              {calendars.map((calendar) => (
                <PickerItem
                  key={calendar.id}
                  label={calendar.name}
                  value={calendar.id}
                  color={colors.foreground}
                  style={{ backgroundColor: colors.root }}
                />
              ))}
            </Picker>
          )}
        />
        {calendars.length === 0 && (
          <Text variant="footnote" color="tertiary">
            No calendars yet — create one in the admin before adding events.
          </Text>
        )}
      </View>

      <View className="flex-row items-center justify-between">
        <Text>All day</Text>
        <Controller
          control={control}
          name="is_all_day"
          render={({ field }) => <Toggle value={field.value} onValueChange={field.onChange} />}
        />
      </View>

      <View className="gap-1.5">
        <Text variant="subhead" color="secondary">
          Starts
        </Text>
        <Controller
          control={control}
          name="dtstart"
          rules={{ required: true }}
          render={({ field }) => (
            <DatePicker
              mode={isAllDay ? 'date' : 'datetime'}
              value={field.value}
              onValueChange={(_event, date) => date && field.onChange(date)}
            />
          )}
        />
      </View>

      <View className="gap-1.5">
        <Text variant="subhead" color="secondary">
          Ends
        </Text>
        <Controller
          control={control}
          name="dtend"
          rules={{ required: true }}
          render={({ field }) => (
            <DatePicker
              mode={isAllDay ? 'date' : 'datetime'}
              value={field.value}
              onValueChange={(_event, date) => date && field.onChange(date)}
            />
          )}
        />
      </View>

      <Controller
        control={control}
        name="location"
        render={({ field }) => (
          <TextField
            label="Location"
            placeholder="Optional"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />

      <Controller
        control={control}
        name="description"
        render={({ field }) => (
          <TextField
            label="Description"
            placeholder="Optional"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            multiline
            numberOfLines={4}
            className="min-h-24"
          />
        )}
      />

      <View className="gap-1.5">
        <Text variant="subhead" color="secondary">
          Status
        </Text>
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <Picker selectedValue={field.value} onValueChange={field.onChange}>
              {STATUS_OPTIONS.map((status) => (
                <PickerItem
                  key={status}
                  label={status}
                  value={status}
                  color={colors.foreground}
                  style={{ backgroundColor: colors.root }}
                />
              ))}
            </Picker>
          )}
        />
      </View>

      <Button onPress={handleSubmit(onSubmit)} disabled={isSubmitting || calendars.length === 0}>
        <Text>{isSubmitting ? 'Saving…' : submitLabel}</Text>
      </Button>
    </ScrollView>
  );
}
