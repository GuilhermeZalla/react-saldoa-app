import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SessionProvider } from '../SessionContext';
import { colors } from '../theme';

export default function RootLayout() {
    return (
        <SessionProvider>
            <SafeAreaProvider>
                <StatusBar style="dark" />
                <Stack
                    screenOptions={{
                        contentStyle: { backgroundColor: colors.background },
                        headerShown: false,
                    }}
                >
                    <Stack.Screen name="index" />
                    <Stack.Screen name="login" />
                    <Stack.Screen name="(app)" />
                </Stack>
            </SafeAreaProvider>
        </SessionProvider>
    );
}
