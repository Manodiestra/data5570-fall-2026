import { Drawer } from 'expo-router/drawer';
import { Link } from 'expo-router';
import { Pressable } from 'react-native';

import { CalendarDrawerContent } from '@/components/calendar/CalendarDrawerContent';
import { Icon } from '@/components/nativewindui/Icon';
import { Text } from '@/components/nativewindui/Text';
import { useColorScheme } from '@/lib/useColorScheme';

export default function DashboardLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CalendarDrawerContent {...props} />}
      screenOptions={{ headerShown: true }}>
      <Drawer.Screen
        name="index"
        options={{ title: 'Calendar', headerRight: () => <NewEventButton /> }}
      />
    </Drawer>
  );
}

function NewEventButton() {
  // See the comment in components/nativewindui/Button.tsx: bg-primary/
  // text-primary render transparent/inherited on web, so color explicitly.
  const { colors } = useColorScheme();
  return (
    <Link href="/event/new" asChild>
      <Pressable className="flex-row items-center gap-1 px-3 py-1.5 active:opacity-60">
        <Icon name="plus" size={18} color={colors.primary} />
        <Text className="font-medium" style={{ color: colors.primary }}>
          New Event
        </Text>
      </Pressable>
    </Link>
  );
}
