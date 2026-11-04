import { getLocales } from 'expo-localization';
import * as SecureStore from 'expo-secure-store';
import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    type PropsWithChildren,
} from 'react';
import {
    Platform,
    useColorScheme,
    type ImageStyle,
    type TextStyle,
    type ViewStyle,
} from 'react-native';
import { darkColors, lightColors, type ThemeColors } from './theme';
import { setLocale, t, type Locale } from './i18n';

type ThemePreference = 'light' | 'dark' | 'system';
type Preferences = { language: Locale; theme: ThemePreference };
type PreferencesValue = Preferences & {
    colors: ThemeColors;
    isDark: boolean;
    ready: boolean;
    saveError: boolean;
    setLanguage: (language: Locale) => void;
    setTheme: (theme: ThemePreference) => void;
    t: typeof t;
};

const storageKey = 'saldoa.preferences';
const PreferencesContext = createContext<PreferencesValue | null>(null);
let persistenceQueue = Promise.resolve();

function readWebPreferences(): string | null {
    try {
        return globalThis.localStorage?.getItem(storageKey) ?? null;
    } catch {
        return null;
    }
}

export function PreferencesProvider({ children }: PropsWithChildren) {
    const systemTheme = useColorScheme();
    const [preferences, setPreferences] = useState<Preferences>({
        language: getLocales()[0]?.languageCode === 'en' ? 'en' : 'pt-BR',
        theme: 'system',
    });
    const [ready, setReady] = useState(false);
    const [saveError, setSaveError] = useState(false);

    useEffect(() => {
        let mounted = true;
        async function restore(): Promise<void> {
            try {
                const stored =
                    Platform.OS === 'web'
                        ? readWebPreferences()
                        : await SecureStore.getItemAsync(storageKey);
                const value: unknown = stored ? JSON.parse(stored) : null;
                if (
                    mounted &&
                    value &&
                    typeof value === 'object' &&
                    'language' in value &&
                    'theme' in value
                ) {
                    setPreferences({
                        language: value.language === 'en' ? 'en' : 'pt-BR',
                        theme:
                            value.theme === 'light' || value.theme === 'dark'
                                ? value.theme
                                : 'system',
                    });
                }
            } catch {
                // Unavailable storage falls back to the device preferences.
            } finally {
                if (mounted) {
                    setReady(true);
                }
            }
        }
        void restore();
        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        if (!ready) {
            return;
        }
        const serialized = JSON.stringify(preferences);
        persistenceQueue = persistenceQueue.then(async () => {
            try {
                if (Platform.OS === 'web') {
                    globalThis.localStorage.setItem(storageKey, serialized);
                } else {
                    await SecureStore.setItemAsync(storageKey, serialized);
                }
                setSaveError(false);
            } catch {
                setSaveError(true);
            }
        });
    }, [preferences, ready]);

    setLocale(preferences.language);
    const isDark =
        preferences.theme === 'dark' ||
        (preferences.theme === 'system' && systemTheme === 'dark');
    const value: PreferencesValue = {
        ...preferences,
        ready,
        saveError,
        isDark,
        colors: isDark ? darkColors : lightColors,
        t,
        setLanguage: (language) =>
            setPreferences((current) => ({ ...current, language })),
        setTheme: (theme) =>
            setPreferences((current) => ({ ...current, theme })),
    };

    return (
        <PreferencesContext.Provider value={value}>
            {children}
        </PreferencesContext.Provider>
    );
}

export function usePreferences(): PreferencesValue {
    const context = useContext(PreferencesContext);
    if (!context) {
        throw new Error(
            'usePreferences must be used within PreferencesProvider.',
        );
    }
    return context;
}

type StyleMap = Record<string, ViewStyle | TextStyle | ImageStyle>;

export function useThemeStyles<T extends StyleMap>(
    factory: (colors: ThemeColors) => T,
) {
    const { colors } = usePreferences();
    const styles = useMemo(() => factory(colors), [colors, factory]);
    return { colors, styles };
}
