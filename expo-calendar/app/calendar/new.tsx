import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Alert, ScrollView, View } from 'react-native';

import { Button } from '@/components/nativewindui/Button';
import { Text } from '@/components/nativewindui/Text';
import { TextField } from '@/components/nativewindui/TextField';
import { useCreateCalendarMutation } from '@/store/api';
import { useAppDispatch } from '@/store/hooks';
import { toggleCalendarSelected } from '@/store/uiSlice';

type CalendarFormValues = {
  name: string;
  color: string;
  description: string;
};

export default function NewCalendarScreen() {
  const [createCalendar, { isLoading }] = useCreateCalendarMutation();
  const dispatch = useAppDispatch();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CalendarFormValues>({
    defaultValues: { name: '', color: '', description: '' },
  });

  async function handleFormSubmit(values: CalendarFormValues) {
    try {
      const created = await createCalendar({
        name: values.name,
        color: values.color || undefined,
        description: values.description || undefined,
      }).unwrap();
      dispatch(toggleCalendarSelected(created.id));
      router.back();
    } catch (error) {
      Alert.alert('Could not create calendar', String(error));
    }
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

      <Button onPress={handleSubmit(handleFormSubmit)} disabled={isLoading}>
        <Text>{isLoading ? 'Creating…' : 'Create Calendar'}</Text>
      </Button>
    </ScrollView>
  );
}
