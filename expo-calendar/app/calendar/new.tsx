import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView } from 'react-native';

import { Button } from '@/components/nativewindui/Button';
import { Text } from '@/components/nativewindui/Text';
import { TextField } from '@/components/nativewindui/TextField';
import { createCalendar } from '@/store/calendarsSlice';
import { useAppDispatch } from '@/store/hooks';

type CalendarFormValues = {
  name: string;
  color: string;
  description: string;
};

export default function NewCalendarScreen() {
  const dispatch = useAppDispatch();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CalendarFormValues>({
    defaultValues: { name: '', color: '', description: '' },
  });

  function handleFormSubmit(values: CalendarFormValues) {
    dispatch(
      createCalendar({
        name: values.name,
        color: values.color || undefined,
        description: values.description || undefined,
      })
    );
    router.back();
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-4 p-4">
      <Controller
        control={control}
        name="name"
        rules={{ required: 'Name is required' }}
        render={({ field }) => (
          <TextField
            label="Name"
            placeholder="e.g. Work"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errors.name?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="color"
        render={({ field }) => (
          <TextField
            label="Color"
            placeholder="#3B82F6 (optional)"
            autoCapitalize="none"
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
            numberOfLines={3}
            className="min-h-20"
          />
        )}
      />

      <Button onPress={handleSubmit(handleFormSubmit)} >
        <Text>Create Calendar</Text>
      </Button>
    </ScrollView>
  );
}
