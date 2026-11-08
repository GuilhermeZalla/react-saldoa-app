import { formatMoneyInput } from './money';
import { useThemeStyles } from './PreferencesContext';
import { t } from './i18n';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { ApiError, sessionRequest } from './api';
import {
    LoadingState,
    ActionButton,
    Card,
    ChoiceChips,
    Page,
    PageTitle,
    ResponsiveGrid,
    SectionTitle,
    TextField,
    useCommonStyles,
} from './components';
import {
    amountForApi,
    dateForApi,
    formatCurrency,
    formatDate,
    formatDateForInput,
} from './format';
import type { ThemeColors } from './theme';
import type { Category, RecurringTransaction, Session } from './types';

type Props = { session: Session };
type Collection<T> = { data: T[] };
type Frequency = RecurringTransaction['frequency'];

const defaultStartDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const frequencies: { value: Frequency; label: string }[] = [
    { value: 'daily', label: 'Diária' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensal' },
    { value: 'yearly', label: 'Anual' },
];

export default function RecurringScreen({ session }: Props) {
    const { styles } = useThemeStyles(createStyles);
    const commonStyles = useCommonStyles();
    const [items, setItems] = useState<RecurringTransaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [frequency, setFrequency] = useState<Frequency>('monthly');
    const [startDate, setStartDate] = useState(defaultStartDate());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const availableCategories = useMemo(
        () => categories.filter((category) => category.type === type),
        [categories, type],
    );

    const fetchItems = useCallback(async () => {
        const [itemResponse, categoryResponse] = await Promise.all([
            sessionRequest<Collection<RecurringTransaction>>(
                session,
                '/recurring-transactions',
            ),
            sessionRequest<Collection<Category>>(session, '/categories'),
        ]);

        return {
            items: itemResponse.data,
            categories: categoryResponse.data,
        };
    }, [session]);

    const loadItems = useCallback(async () => {
        try {
            const data = await fetchItems();
            setItems(data.items);
            setCategories(data.categories);
            setErrorMessage('');
        } catch (error) {
            setErrorMessage(errorMessageFor(error));
        } finally {
            setLoading(false);
        }
    }, [fetchItems]);

    useEffect(() => {
        let isCurrent = true;

        async function loadInitialItems(): Promise<void> {
            try {
                const data = await fetchItems();

                if (isCurrent) {
                    setItems(data.items);
                    setCategories(data.categories);
                    setCategoryId(
                        data.categories.find(
                            (category) => category.type === 'expense',
                        )?.id ?? null,
                    );
                    setErrorMessage('');
                }
            } catch (error) {
                if (isCurrent) {
                    setErrorMessage(errorMessageFor(error));
                }
            } finally {
                if (isCurrent) {
                    setLoading(false);
                }
            }
        }

        void loadInitialItems();

        return () => {
            isCurrent = false;
        };
    }, [fetchItems]);

    async function createRecurring(): Promise<void> {
        if (!description.trim() || !amount.trim() || categoryId === null) {
            setErrorMessage(t('Preencha a descrição, o valor e a categoria.'));
            return;
        }

        const apiDate = dateForApi(startDate);
        if (apiDate === null) {
            setErrorMessage(
                t('Informe uma data válida no formato DD/MM/AAAA.'),
            );
            return;
        }

        setSaving(true);
        setErrorMessage('');

        try {
            await sessionRequest(session, '/recurring-transactions', {
                method: 'POST',
                body: {
                    description: description.trim(),
                    amount: amountForApi(amount),
                    type,
                    category_id: categoryId,
                    frequency,
                    start_date: apiDate,
                    end_date: null,
                },
            });
            setDescription('');
            setAmount('');
            setStartDate(defaultStartDate());
            await loadItems();
        } catch (error) {
            setErrorMessage(errorMessageFor(error));
        } finally {
            setSaving(false);
        }
    }

    function askToDelete(item: RecurringTransaction): void {
        Alert.alert(
            t('Excluir recorrência?'),
            t(
                'A regra “{description}” será removida. Os lançamentos já criados permanecem.',
                { description: item.description },
            ),
            [
                { text: t('Cancelar'), style: 'cancel' },
                {
                    text: t('Excluir'),
                    style: 'destructive',
                    onPress: () => void deleteRecurring(item.id),
                },
            ],
        );
    }

    async function deleteRecurring(itemId: number): Promise<void> {
        try {
            await sessionRequest(session, `/recurring-transactions/${itemId}`, {
                method: 'DELETE',
            });
            await loadItems();
        } catch (error) {
            setErrorMessage(errorMessageFor(error));
        }
    }

    return (
        <Page>
            <PageTitle
                title={t('Recorrências')}
                subtitle={t('Acompanhe lançamentos que se repetem.')}
            />
            <Text style={commonStyles.muted}>
                {t(
                    'A agenda mostra previsões. O valor só entra no saldo quando o lançamento da recorrência é gerado.',
                )}
            </Text>
            {errorMessage ? (
                <Text accessibilityRole="alert" style={styles.error}>
                    {errorMessage}
                </Text>
            ) : null}

            <ResponsiveGrid>
                {!session.isDemo ? (
                    <Card>
                        <SectionTitle title={t('Nova recorrência')} />
                        <TextField
                            label={t('Descrição')}
                            value={description}
                            onChangeText={setDescription}
                            maxLength={255}
                            placeholder={t('Ex.: Mensalidade')}
                        />
                        <TextField
                            label={t('Valor')}
                            value={amount}
                            onChangeText={(value) =>
                                setAmount(formatMoneyInput(value))
                            }
                            keyboardType="number-pad"
                            placeholder="0,00"
                        />
                        <ChoiceChips
                            selected={type}
                            onSelect={(value) => {
                                const nextType = value as 'income' | 'expense';
                                setType(nextType);
                                setCategoryId(
                                    categories.find(
                                        (category) =>
                                            category.type === nextType,
                                    )?.id ?? null,
                                );
                            }}
                            options={[
                                { value: 'expense', label: t('Despesa') },
                                { value: 'income', label: t('Receita') },
                            ]}
                        />
                        <Text style={styles.fieldLabel}>{t('Categoria')}</Text>
                        {availableCategories.length ? (
                            <ChoiceChips
                                selected={categoryId?.toString() ?? ''}
                                onSelect={(value) =>
                                    setCategoryId(Number(value))
                                }
                                options={availableCategories.map(
                                    (category) => ({
                                        value: category.id.toString(),
                                        label: category.name,
                                    }),
                                )}
                            />
                        ) : (
                            <Text style={commonStyles.muted}>
                                {t(
                                    'Crie uma categoria desse tipo antes de continuar.',
                                )}
                            </Text>
                        )}
                        <Text style={styles.fieldLabel}>{t('Frequência')}</Text>
                        <ChoiceChips
                            selected={frequency}
                            onSelect={(value) =>
                                setFrequency(value as Frequency)
                            }
                            options={frequencies.map((item) => ({
                                ...item,
                                label: t(item.label),
                            }))}
                        />
                        <TextField
                            label={t('Data de início (DD/MM/AAAA)')}
                            value={formatDateForInput(startDate)}
                            onChangeText={setStartDate}
                            autoCapitalize="none"
                            placeholder={t('DD/MM/AAAA')}
                            maxLength={10}
                        />
                        <ActionButton
                            onPress={() => void createRecurring()}
                            disabled={saving}
                            loading={saving}
                        >
                            {t('Criar recorrência')}
                        </ActionButton>
                    </Card>
                ) : null}

                <Card>
                    <SectionTitle title={t('Regras cadastradas')} />
                    {loading ? (
                        <LoadingState label={t('Carregando recorrências…')} />
                    ) : items.length ? (
                        items.map((item) => (
                            <View key={item.id} style={styles.row}>
                                <View style={styles.itemInfo}>
                                    <Text style={styles.name}>
                                        {item.description}
                                    </Text>
                                    <Text style={styles.meta}>
                                        {item.category.name} ·{' '}
                                        {frequencyLabel(item.frequency)}
                                    </Text>
                                    <Text style={styles.meta}>
                                        {t('Próxima:')}{' '}
                                        {item.next_occurrence_date
                                            ? formatDate(
                                                  item.next_occurrence_date,
                                              )
                                            : t('não agendada')}
                                    </Text>
                                </View>
                                <View style={styles.itemActions}>
                                    <Text
                                        style={[
                                            styles.amount,
                                            item.type === 'income'
                                                ? styles.income
                                                : styles.expense,
                                        ]}
                                    >
                                        {formatCurrency(item.amount)}
                                    </Text>
                                    {!session.isDemo ? (
                                        <ActionButton
                                            onPress={() => askToDelete(item)}
                                            variant="quiet"
                                            compact
                                        >
                                            {t('Excluir')}
                                        </ActionButton>
                                    ) : null}
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text style={commonStyles.muted}>
                            {t('Nenhuma recorrência cadastrada.')}
                        </Text>
                    )}
                </Card>
            </ResponsiveGrid>
        </Page>
    );
}

function frequencyLabel(frequency: Frequency): string {
    return t(
        frequencies.find((item) => item.value === frequency)?.label ??
            frequency,
    );
}

function errorMessageFor(error: unknown): string {
    return error instanceof ApiError
        ? error.message
        : t('Não foi possível concluir a solicitação.');
}

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        error: {
            fontFamily: 'DMSans',
            backgroundColor: colors.expenseSoft,
            borderRadius: 10,
            color: colors.expense,
            fontSize: 14,
            padding: 12,
        },
        fieldLabel: {
            fontFamily: 'DMSans',
            color: colors.text,
            fontSize: 15,
            fontWeight: '600',
        },
        row: {
            alignItems: 'center',
            borderTopColor: colors.border,
            borderTopWidth: 1,
            flexDirection: 'row',
            gap: 8,
            justifyContent: 'space-between',
            paddingTop: 16,
            flexWrap: 'wrap',
        },
        itemInfo: { flex: 1, gap: 3 },
        name: {
            fontFamily: 'SpaceGrotesk',
            color: colors.text,
            fontSize: 15,
            fontWeight: '600',
        },
        meta: { fontFamily: 'DMSans', color: colors.muted, fontSize: 14 },
        itemActions: { alignItems: 'flex-end' },
        amount: { fontFamily: 'DMSans', fontSize: 14, fontWeight: '700' },
        income: { color: colors.income },
        expense: { color: colors.expense },
    });
