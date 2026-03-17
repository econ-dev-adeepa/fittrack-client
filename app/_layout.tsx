import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTintColor: '#1E293B',
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
          contentStyle: { backgroundColor: '#F8FAFC' },
        }}
      />
    </>
  );
}