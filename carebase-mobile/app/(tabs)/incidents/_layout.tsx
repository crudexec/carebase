import { Stack } from 'expo-router';
import { useTheme } from '../../../lib/theme';

export default function IncidentsLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.backgroundSecondary },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="new"
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
