import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { ApiError, sessionRequest } from './api';
import {
    ActionButton,
    Card,
    ChoiceChips,
    Page,
    PageTitle,
    SectionTitle,
    TextField,
    commonStyles,
} from './components';
import { amountForApi, formatCurrency, formatDate } from './format';
import { colors } from './theme';
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
            setErrorMessage('Preencha a descrição, o valor e a categoria.');
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
                    start_date: startDate,
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
            'Excluir recorrência?',
            `A regra “${item.description}” será removida. Os lançamentos já criados permanecem.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
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
                title="Recorrências"
                subtitle="Acompanhe lançamentos que se repetem."
            />
            {errorMessage ? (
                <Text accessibilityRole="alert" style={styles.error}>
                    {errorMessage}
                </Text>
            ) : null}

            {!session.isDemo ? (
                <Card>
                    <SectionTitle title="Nova recorrência" />
                    <TextField
                        label="Descrição"
                        value={description}
                        onChangeText={setDescription}
                        maxLength={255}
                        placeholder="Ex.: Mensalidade"
                    />
                    <TextField
                        label="Valor"
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="decimal-pad"
                        placeholder="0,00"
                    />
                    <ChoiceChips
                        selected={type}
                        onSelect={(value) => {
                            const nextType = value as 'income' | 'expense';
                            setType(nextType);
                            setCategoryId(
                                categories.find(
                                    (category) => category.type === nextType,
                                )?.id ?? null,
                            );
                        }}
                        options={[
                            { value: 'expense', label: 'Despesa' },
                            { value: 'income', label: 'Receita' },
                        ]}
                    />
                    <Text style={styles.fieldLabel}>Categoria</Text>
                    {availableCategories.length ? (
                        <ChoiceChips
                            selected={categoryId?.toString() ?? ''}
                            onSelect={(value) => setCategoryId(Number(value))}
                            options={availableCategories.map((category) => ({
                                value: category.id.toString(),
                                label: category.name,
                            }))}
                        />
                    ) : (
                        <Text style={commonStyles.muted}>
                            Crie uma categoria desse tipo antes de continuar.
                        </Text>
                    )}
                    <Text style={styles.fieldLabel}>Frequência</Text>
                    <ChoiceChips
                        selected={frequency}
                        onSelect={(value) => setFrequency(value as Frequency)}
                        options={frequencies}
                    />
                    <TextField
                        label="Data de início (AAAA-MM-DD)"
                        value={startDate}
                        onChangeText={setStartDate}
                        autoCapitalize="none"
                    />
                    <ActionButton
                        onPress={() => void createRecurring()}
                        disabled={saving}
                        loading={saving}
                    >
                        Criar recorrência
                    </ActionButton>
                </Card>
            ) : null}

            <Card>
                <SectionTitle title="Regras cadastradas" />
                {loading ? (
                    <Text style={commonStyles.muted}>Carregando recorrências…</Text>
                ) : items.length ? (
                    items.map((item) => (
                        <View key={item.id} style={styles.row}>
                            <View style={styles.itemInfo}>
                                <Text style={styles.name}>{item.description}</Text>
                                <Text style={styles.meta}>
                                    {item.category.name} ·{' '}
                                    {frequencyLabel(item.frequency)}
                                </Text>
                                <Text style={styles.meta}>
                                    Próxima: {item.next_occurrence_date
                                        ? formatDate(item.next_occurrence_date)
                                        : 'não agendada'}
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
                                        Excluir
                                    </ActionButton>
                                ) : null}
                            </View>
                        </View>
                    ))
                ) : (
                    <Text style={commonStyles.muted}>
                        Nenhuma recorrência cadastrada.
                    </Text>
                )}
            </Card>
        </Page>
    );
}

function frequencyLabel(frequency: Frequency): string {
    return frequencies.find((item) => item.value === frequency)?.label ?? frequency;
}

function errorMessageFor(error: unknown): string {
    return error instanceof ApiError
        ? error.message
        : 'Não foi possível concluir a solicitação.';
}

const styles = StyleSheet.create({
    error: {
        backgroundColor: colors.expenseSoft,
        borderRadius: 10,
        color: colors.expense,
        fontSize: 13,
        padding: 12,
    },
    fieldLabel: { color: colors.text, fontSize: 13, fontWeight: '600' },
    row: {
        alignItems: 'center',
        borderTopColor: colors.border,
        borderTopWidth: 1,
        flexDirection: 'row',
        gap: 8,
        justifyContent: 'space-between',
        paddingTop: 11,
    },
    itemInfo: { flex: 1, gap: 3 },
    name: { color: colors.text, fontSize: 13, fontWeight: '600' },
    meta: { color: colors.muted, fontSize: 11 },
    itemActions: { alignItems: 'flex-end' },
    amount: { fontSize: 12, fontWeight: '700' },
    income: { color: colors.income },
    expense: { color: colors.expense },
});
