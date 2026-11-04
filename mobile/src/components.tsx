import type { PropsWithChildren, ReactElement, ReactNode } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    type TextInputProps,
} from 'react-native';
import { colors, spacing } from './theme';

export function Page({
    children,
    scroll = true,
    refreshControl,
}: PropsWithChildren<{
    scroll?: boolean;
    refreshControl?: ReactElement;
}>) {
    if (!scroll) {
        return <View style={styles.page}>{children}</View>;
    }

    return (
        <ScrollView
            style={styles.page}
            contentContainerStyle={styles.pageContent}
            keyboardShouldPersistTaps="handled"
            refreshControl={refreshControl}
        >
            {children}
        </ScrollView>
    );
}

export function PageTitle({
    title,
    subtitle,
}: {
    title: string;
    subtitle: string;
}) {
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
    return <View style={[styles.card, style]}>{children}</View>;
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
                        variant === 'primary' ? colors.surface : colors.primary
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
    ...inputProps
}: TextInputProps & { label: string; error?: string }) {
    return (
        <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <TextInput
                {...inputProps}
                placeholderTextColor={colors.muted}
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
    return (
        <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {action}
        </View>
    );
}

export const commonStyles = StyleSheet.create({
    muted: { color: colors.muted, fontSize: 13, lineHeight: 19 },
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

const styles = StyleSheet.create({
    page: {
        backgroundColor: colors.background,
        flex: 1,
    },
    pageContent: {
        gap: 18,
        padding: spacing.page,
        paddingBottom: 36,
    },
    titleContainer: {
        gap: 4,
        marginBottom: 2,
    },
    title: {
        color: colors.text,
        fontSize: 26,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    subtitle: {
        color: colors.muted,
        fontSize: 14,
        lineHeight: 20,
    },
    card: {
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderRadius: 18,
        borderWidth: 1,
        gap: 12,
        padding: spacing.card,
    },
    button: {
        alignItems: 'center',
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        minHeight: 48,
        paddingHorizontal: 16,
    },
    buttonCompact: {
        minHeight: 38,
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
    buttonText: { fontSize: 14, fontWeight: '700' },
    buttonPrimaryText: { color: colors.surface },
    buttonSecondaryText: { color: colors.text },
    buttonDangerText: { color: colors.danger },
    buttonQuietText: { color: colors.primary },
    fieldContainer: { gap: 7 },
    fieldLabel: { color: colors.text, fontSize: 13, fontWeight: '600' },
    input: {
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderRadius: 11,
        borderWidth: 1,
        color: colors.text,
        fontSize: 15,
        minHeight: 46,
        paddingHorizontal: 13,
    },
    fieldError: { color: colors.expense, fontSize: 12 },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
        backgroundColor: colors.surfaceMuted,
        borderColor: colors.border,
        borderRadius: 999,
        borderWidth: 1,
        paddingHorizontal: 13,
        paddingVertical: 9,
    },
    chipSelected: {
        backgroundColor: colors.primarySoft,
        borderColor: colors.primary,
    },
    chipText: { color: colors.muted, fontSize: 13, fontWeight: '600' },
    chipTextSelected: { color: colors.primary },
    sectionTitleRow: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
});
