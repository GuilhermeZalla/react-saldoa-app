import { usePreferences, useThemeStyles } from './PreferencesContext';
import { useSegments } from 'expo-router';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import type { PropsWithChildren, ReactElement, ReactNode, Ref } from 'react';
import {
    ActivityIndicator,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    type TextInputProps,
    type TextInputInstance,
    type StyleProp,
    type ViewStyle,
} from 'react-native';
import { spacing, type ThemeColors } from './theme';
import { AppIcon, type IconName } from './icons';

export function LoadingState({ label }: { label: string }) {
    const { colors, styles } = useThemeStyles(createStyles);
    return (
        <View
            accessibilityRole="progressbar"
            accessibilityLabel={label}
            accessibilityState={{ busy: true }}
            style={{ alignItems: 'center', gap: 12, paddingVertical: 24 }}
        >
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.subtitle}>{label}</Text>
        </View>
    );
}

export function Page({
    children,
    scroll = true,
    refreshControl,
    contentStyle,
}: PropsWithChildren<{
    scroll?: boolean;
    refreshControl?: ReactElement;
    contentStyle?: StyleProp<ViewStyle>;
}>) {
    const { styles } = useThemeStyles(createStyles);
    const segments = useSegments();
    const edges: Edge[] =
        segments[0] === '(app)'
            ? ['top', 'left', 'right']
            : ['top', 'left', 'right', 'bottom'];
    if (!scroll) {
        return (
            <SafeAreaView edges={edges} style={styles.page}>
                {children}
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView edges={edges} style={styles.page}>
            <ScrollView
                style={styles.page}
                contentContainerStyle={[styles.pageContent, contentStyle]}
                keyboardShouldPersistTaps="handled"
                automaticallyAdjustKeyboardInsets
                refreshControl={refreshControl}
            >
                {children}
            </ScrollView>
        </SafeAreaView>
    );
}

export function PageTitle({
    title,
    subtitle,
}: {
    title: string;
    subtitle: string;
}) {
    const { styles } = useThemeStyles(createStyles);
    return (
        <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
    );
}

export function Card({
    children,
    style,
}: PropsWithChildren<{ style?: object }>) {
    const { styles } = useThemeStyles(createStyles);
    return <View style={[styles.card, style]}>{children}</View>;
}

export function IconButton({
    icon,
    label,
    onPress,
    variant = 'default',
}: {
    icon: IconName;
    label: string;
    onPress: () => void;
    variant?: 'default' | 'ghost';
}) {
    const { colors, styles } = useThemeStyles(createStyles);
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={label}
            onPress={onPress}
            hitSlop={variant === 'ghost' ? 4 : undefined}
            style={({ pressed }) => [
                styles.iconButton,
                variant === 'ghost' && styles.ghostIconButton,
                pressed && styles.buttonPressed,
            ]}
        >
            <AppIcon
                name={icon}
                color={colors.text}
                size={variant === 'ghost' ? 18 : 22}
            />
        </Pressable>
    );
}

export function SettingsRow({
    icon,
    title,
    subtitle,
    onPress,
    disabled = false,
    loading = false,
}: {
    icon: IconName;
    title: string;
    subtitle?: string;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean;
}) {
    const { colors, styles } = useThemeStyles(createStyles);
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityState={{
                disabled: disabled || loading,
                busy: loading,
            }}
            disabled={disabled || loading}
            onPress={onPress}
            style={({ pressed }) => [
                styles.settingsRow,
                (disabled || loading) && styles.buttonDisabled,
                pressed && styles.buttonPressed,
            ]}
        >
            <View style={styles.rowIcon}>
                <AppIcon name={icon} size={21} color={colors.text} />
            </View>
            <View style={styles.rowCopy}>
                <Text style={styles.rowTitle}>{title}</Text>
                {subtitle ? (
                    <Text style={styles.rowSubtitle}>{subtitle}</Text>
                ) : null}
            </View>
            {loading ? (
                <ActivityIndicator color={colors.primary} />
            ) : (
                <AppIcon name="chevron" color={colors.muted} size={17} />
            )}
        </Pressable>
    );
}

export function UserAvatar({
    name,
    small = false,
}: {
    name: string;
    small?: boolean;
}) {
    const { styles } = useThemeStyles(createStyles);
    const initials = name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toLocaleUpperCase();
    return (
        <View
            style={[styles.avatar, small && styles.avatarSmall]}
            accessible={false}
        >
            <Text style={[styles.avatarText, small && styles.avatarTextSmall]}>
                {initials || 'S'}
            </Text>
        </View>
    );
}

export function ProgressBar({
    value,
    label,
    color,
}: {
    value: number;
    label: string;
    color?: string;
}) {
    const { colors, styles } = useThemeStyles(createStyles);
    const percentage = Number.isFinite(value)
        ? Math.min(100, Math.max(0, value))
        : 0;
    return (
        <View
            accessibilityRole="progressbar"
            accessibilityLabel={label}
            accessibilityValue={{ min: 0, max: 100, now: percentage }}
            style={styles.progressTrack}
        >
            <View
                style={[
                    styles.progressFill,
                    {
                        width: `${percentage}%`,
                        backgroundColor: color ?? colors.primary,
                    },
                ]}
            />
        </View>
    );
}

export function PreferencesSheet({
    visible,
    onClose,
}: {
    visible: boolean;
    onClose: () => void;
}) {
    const { t } = usePreferences();
    const { styles } = useThemeStyles(createStyles);
    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.modalArea}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('Fechar preferências')}
                    style={StyleSheet.absoluteFill}
                    onPress={onClose}
                />
                <View
                    style={styles.sheet}
                    accessibilityViewIsModal
                    onAccessibilityEscape={onClose}
                >
                    <View style={styles.sheetHeading}>
                        <Text
                            accessibilityRole="header"
                            style={styles.sectionTitle}
                        >
                            {t('Preferências')}
                        </Text>
                        <IconButton
                            icon="close"
                            label={t('Fechar preferências')}
                            onPress={onClose}
                        />
                    </View>
                    <ScrollView
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={styles.sheetContent}
                    >
                        <PreferencesPanel embedded />
                    </ScrollView>
                </View>
            </SafeAreaView>
        </Modal>
    );
}

export function ActionButton({
    children,
    onPress,
    variant = 'primary',
    disabled = false,
    loading = false,
    compact = false,
}: PropsWithChildren<{
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'quiet';
    disabled?: boolean;
    loading?: boolean;
    compact?: boolean;
}>) {
    const { colors, styles } = useThemeStyles(createStyles);
    const variantStyle = {
        primary: styles.buttonPrimary,
        secondary: styles.buttonSecondary,
        danger: styles.buttonDanger,
        quiet: styles.buttonQuiet,
    }[variant];
    const textStyle = {
        primary: styles.buttonPrimaryText,
        secondary: styles.buttonSecondaryText,
        danger: styles.buttonDangerText,
        quiet: styles.buttonQuietText,
    }[variant];

    return (
        <Pressable
            accessibilityRole="button"
            disabled={disabled || loading}
            onPress={onPress}
            style={({ pressed }) => [
                styles.button,
                variantStyle,
                compact && styles.buttonCompact,
                (disabled || loading) && styles.buttonDisabled,
                pressed && !disabled && styles.buttonPressed,
            ]}
        >
            {loading ? (
                <ActivityIndicator
                    color={
                        variant === 'primary'
                            ? colors.primaryForeground
                            : colors.primary
                    }
                />
            ) : (
                <Text style={[styles.buttonText, textStyle]}>{children}</Text>
            )}
        </Pressable>
    );
}

export function TextField({
    label,
    error,
    style,
    inputRef,
    ...inputProps
}: TextInputProps & {
    label: string;
    error?: string;
    inputRef?: Ref<TextInputInstance>;
}) {
    const { colors, styles } = useThemeStyles(createStyles);
    return (
        <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <TextInput
                {...inputProps}
                ref={inputRef}
                accessibilityLabel={inputProps.accessibilityLabel ?? label}
                placeholderTextColor={colors.muted}
                selectionColor={colors.primary}
                cursorColor={colors.primary}
                style={[styles.input, style]}
            />
            {error ? <Text style={styles.fieldError}>{error}</Text> : null}
        </View>
    );
}

export function ChoiceChips({
    options,
    selected,
    onSelect,
}: {
    options: { value: string; label: string }[];
    selected: string;
    onSelect: (value: string) => void;
}) {
    const { styles } = useThemeStyles(createStyles);
    return (
        <View style={styles.chips}>
            {options.map((option) => {
                const isSelected = selected === option.value;

                return (
                    <Pressable
                        key={option.value}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isSelected }}
                        onPress={() => onSelect(option.value)}
                        style={[styles.chip, isSelected && styles.chipSelected]}
                    >
                        <Text
                            style={[
                                styles.chipText,
                                isSelected && styles.chipTextSelected,
                            ]}
                        >
                            {option.label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

export function SectionTitle({
    title,
    action,
}: {
    title: string;
    action?: ReactNode;
}) {
    const { styles } = useThemeStyles(createStyles);
    return (
        <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {action}
        </View>
    );
}

const createCommonStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        muted: {
            fontFamily: 'DMSans',
            color: colors.muted,
            fontSize: 14,
            lineHeight: 20,
        },
        row: {
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        separator: {
            backgroundColor: colors.border,
            height: 1,
            marginVertical: 12,
        },
    });

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        page: {
            backgroundColor: colors.background,
            flex: 1,
        },
        pageContent: {
            gap: 20,
            padding: spacing.page,
            paddingBottom: 32,
            width: '100%',
            maxWidth: 760,
            alignSelf: 'center',
        },
        titleContainer: {
            gap: 6,
            paddingVertical: 6,
        },
        title: {
            fontFamily: 'SpaceGrotesk',
            color: colors.text,
            fontSize: 28,
            fontWeight: '700',
            letterSpacing: -0.5,
        },
        subtitle: {
            fontFamily: 'DMSans',
            color: colors.muted,
            fontSize: 14,
            lineHeight: 20,
        },
        card: {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: 24,
            borderWidth: 1,
            gap: 16,
            padding: spacing.card,
            elevation: 1,
        },
        button: {
            alignItems: 'center',
            borderRadius: 16,
            flexDirection: 'row',
            justifyContent: 'center',
            minHeight: 52,
            paddingHorizontal: 16,
        },
        buttonCompact: {
            minHeight: 44,
            paddingHorizontal: 12,
        },
        buttonPrimary: { backgroundColor: colors.primary },
        buttonSecondary: {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
        },
        buttonDanger: { backgroundColor: colors.expenseSoft },
        buttonQuiet: { backgroundColor: 'transparent' },
        buttonDisabled: { opacity: 0.6 },
        buttonPressed: { opacity: 0.82 },
        buttonText: {
            fontFamily: 'DMSans',
            fontSize: 14,
            fontWeight: '700',
            textAlign: 'center',
            flexShrink: 1,
            paddingVertical: 10,
        },
        buttonPrimaryText: { color: colors.primaryForeground },
        buttonSecondaryText: { color: colors.text },
        buttonDangerText: { color: colors.danger },
        buttonQuietText: { color: colors.primary },
        fieldContainer: { gap: 7 },
        fieldLabel: {
            fontFamily: 'DMSans',
            color: colors.text,
            fontSize: 14,
            fontWeight: '600',
        },
        input: {
            fontFamily: 'DMSans',
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: 14,
            borderWidth: 1,
            color: colors.text,
            fontSize: 16,
            minHeight: 52,
            paddingHorizontal: 13,
        },
        fieldError: {
            fontFamily: 'DMSans',
            color: colors.expense,
            fontSize: 14,
        },
        chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
        chip: {
            backgroundColor: colors.surfaceMuted,
            borderColor: colors.border,
            borderRadius: 999,
            borderWidth: 1,
            paddingHorizontal: 13,
            paddingVertical: 9,
            minHeight: 44,
            justifyContent: 'center',
        },
        chipSelected: {
            backgroundColor: colors.primarySoft,
            borderColor: colors.primary,
        },
        chipText: {
            fontFamily: 'DMSans',
            color: colors.muted,
            fontSize: 14,
            fontWeight: '600',
        },
        chipTextSelected: { color: colors.primary },
        sectionTitleRow: {
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
        },
        sectionTitle: {
            fontFamily: 'SpaceGrotesk',
            color: colors.text,
            fontSize: 18,
            fontWeight: '700',
        },
        iconButton: {
            width: 44,
            height: 44,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.surfaceMuted,
        },
        ghostIconButton: {
            width: 36,
            height: 36,
            backgroundColor: 'transparent',
        },
        settingsRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingVertical: 12,
            minHeight: 64,
        },
        rowIcon: {
            width: 42,
            height: 42,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.surfaceMuted,
        },
        rowCopy: { flex: 1, gap: 3 },
        rowTitle: {
            fontFamily: 'DMSans',
            color: colors.text,
            fontSize: 14,
            fontWeight: '600',
        },
        rowSubtitle: {
            fontFamily: 'DMSans',
            color: colors.muted,
            fontSize: 14,
            lineHeight: 20,
        },
        avatar: {
            width: 68,
            height: 68,
            borderRadius: 24,
            backgroundColor: colors.primarySoft,
            alignItems: 'center',
            justifyContent: 'center',
        },
        avatarSmall: { width: 44, height: 44, borderRadius: 16 },
        avatarText: {
            fontFamily: 'SpaceGrotesk',
            fontSize: 24,
            fontWeight: '700',
            color: colors.primary,
        },
        avatarTextSmall: { fontSize: 17 },
        progressTrack: {
            backgroundColor: colors.surfaceMuted,
            height: 8,
            borderRadius: 999,
            overflow: 'hidden',
        },
        progressFill: { height: '100%', borderRadius: 999 },
        modalArea: {
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: colors.backdrop,
        },
        sheet: {
            backgroundColor: colors.surface,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            padding: 24,
            maxHeight: '90%',
            maxWidth: 520,
            width: '100%',
            alignSelf: 'center',
        },
        sheetHeading: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
        },
        sheetContent: { paddingBottom: 12 },
        preferencesContent: { gap: 16 },
    });

export function useCommonStyles() {
    return useThemeStyles(createCommonStyles).styles;
}

export function PreferencesPanel({ embedded = false }: { embedded?: boolean }) {
    const { language, theme, setLanguage, setTheme, saveError, t } =
        usePreferences();
    const { styles } = useThemeStyles(createStyles);
    const content = (
        <View style={styles.preferencesContent}>
            <Text style={styles.fieldLabel}>{t('Idioma')}</Text>
            <ChoiceChips
                selected={language}
                onSelect={(value) =>
                    setLanguage(value === 'en' ? 'en' : 'pt-BR')
                }
                options={[
                    { value: 'pt-BR', label: 'Português' },
                    { value: 'en', label: 'English' },
                ]}
            />
            <Text style={styles.fieldLabel}>{t('Aparência')}</Text>
            <ChoiceChips
                selected={theme}
                onSelect={(value) =>
                    setTheme(
                        value === 'light' || value === 'dark'
                            ? value
                            : 'system',
                    )
                }
                options={[
                    { value: 'light', label: t('Claro') },
                    { value: 'dark', label: t('Escuro') },
                    { value: 'system', label: t('Sistema') },
                ]}
            />
            <Text
                accessibilityRole={saveError ? 'alert' : undefined}
                style={styles.subtitle}
            >
                {t(
                    saveError
                        ? 'Não foi possível salvar as preferências. Elas serão mantidas apenas nesta sessão.'
                        : 'As preferências são salvas neste aparelho.',
                )}
            </Text>
        </View>
    );
    return embedded ? (
        content
    ) : (
        <Card>
            <SectionTitle title={t('Preferências')} />
            {content}
        </Card>
    );
}
