import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { NavigationBar } from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SessionProvider } from '../SessionContext';
import { PreferencesProvider, usePreferences } from '../PreferencesContext';

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <PreferencesProvider>
                <ThemedApp />
            </PreferencesProvider>
        </SafeAreaProvider>
    );
}

function ThemedApp() {
    const { colors, isDark, ready } = usePreferences();
    const [fontsLoaded, fontError] = useFonts([
        {
            fontFamily: 'DMSans',
            fontDefinitions: [
                { path: require('../../assets/fonts/DMSans.ttf') },
            ],
        },
        {
            fontFamily: 'SpaceGrotesk',
            fontDefinitions: [
                { path: require('../../assets/fonts/SpaceGrotesk.ttf') },
            ],
        },
    ]);

    useEffect(() => {
        void SystemUI.setBackgroundColorAsync(colors.background);
    }, [colors.background]);

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <StatusBar
                hidden={Platform.OS === 'android'}
                style={isDark ? 'light' : 'dark'}
            />
            {Platform.OS === 'android' && (
                <NavigationBar hidden style={isDark ? 'light' : 'dark'} />
            )}
            {!ready || (!fontsLoaded && !fontError) ? (
                <View
                    style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <ActivityIndicator color={colors.primary} />
                </View>
            ) : (
                <SessionProvider>
                    <Stack
                        screenOptions={{
                            contentStyle: {
                                backgroundColor: colors.background,
                            },
                            headerShown: false,
                        }}
                    >
                        <Stack.Screen name="index" />
                        <Stack.Screen name="login" />
                        <Stack.Screen name="(app)" />
                    </Stack>
                </SessionProvider>
            )}
        </View>
    );
}
