import { Stack } from 'expo-router';
import { useTheme } from '../../../lib/theme';

export default function VisitNotesLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.accent,
        headerTitleStyle: { color: colors.textPrimary },
        contentStyle: { backgroundColor: colors.backgroundSecondary },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Visit Notes',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="new"
        options={{
          title: 'New Visit Note',
          headerBackTitle: 'Back',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Visit Note',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}
