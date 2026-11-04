import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
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
import {
    amountForApi,
    currentDate,
    currentMonth,
    dateForApi,
    formatCurrency,
    formatDate,
    formatDateForInput,
} from './format';
import { colors } from './theme';
import type { Category, Session, Transaction } from './types';

type Props = { session: Session };
type Collection<T> = { data: T[] };

export default function TransactionsScreen({ session }: Props) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [date, setDate] = useState(currentDate());
    const [editingId, setEditingId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const availableCategories = useMemo(
        () => categories.filter((category) => category.type === type),
        [categories, type],
    );

    const fetchData = useCallback(async () => {
        const [transactionResponse, categoryResponse] = await Promise.all([
            sessionRequest<Collection<Transaction>>(
                session,
                `/transactions?month=${currentMonth()}&page=1`,
            ),
            sessionRequest<Collection<Category>>(session, '/categories'),
        ]);

        return {
            transactions: transactionResponse.data,
            categories: categoryResponse.data,
        };
    }, [session]);

    const loadData = useCallback(async () => {
        setErrorMessage('');

        try {
            const data = await fetchData();
            setTransactions(data.transactions);
            setCategories(data.categories);
        } catch (error) {
            setErrorMessage(
                messageForError(
                    error,
                    'Não foi possível carregar os lançamentos.',
                ),
            );
        } finally {
            setLoading(false);
        }
    }, [fetchData]);

    useEffect(() => {
        let isCurrent = true;

        async function loadInitialData(): Promise<void> {
            try {
                const data = await fetchData();

                if (isCurrent) {
                    setTransactions(data.transactions);
                    setCategories(data.categories);
                    setCategoryId((currentId) => {
                        if (
                            data.categories.some(
                                (category) =>
                                    category.id === currentId &&
                                    category.type === 'expense',
                            )
                        ) {
                            return currentId;
                        }

                        return (
                            data.categories.find(
                                (category) => category.type === 'expense',
                            )?.id ?? null
                        );
                    });
                    setErrorMessage('');
                }
            } catch (error) {
                if (isCurrent) {
                    setErrorMessage(
                        messageForError(
                            error,
                            'Não foi possível carregar os lançamentos.',
                        ),
                    );
                }
            } finally {
                if (isCurrent) {
                    setLoading(false);
                }
            }
        }

        void loadInitialData();

        return () => {
            isCurrent = false;
        };
    }, [fetchData]);

    function startEditing(transaction: Transaction): void {
        setEditingId(transaction.id);
        setDescription(transaction.description);
        setAmount(transaction.amount);
        setType(transaction.type);
        setCategoryId(transaction.category.id);
        setDate(transaction.date);
    }

    function resetForm(): void {
        setEditingId(null);
        setDescription('');
        setAmount('');
        setType('expense');
        setCategoryId(null);
        setDate(currentDate());
    }

    async function saveTransaction(): Promise<void> {
        if (!description.trim() || !amount.trim() || categoryId === null) {
            setErrorMessage('Preencha a descrição, o valor e a categoria.');
            return;
        }

        const apiDate = dateForApi(date);

        if (apiDate === null) {
            setErrorMessage('Informe uma data válida no formato DD/MM/AAAA.');
            return;
        }

        setSaving(true);
        setErrorMessage('');

        try {
            await sessionRequest(
                session,
                editingId === null
                    ? '/transactions'
                    : `/transactions/${editingId}`,
                {
                    method: editingId === null ? 'POST' : 'PUT',
                    body: {
                        description: description.trim(),
                        amount: amountForApi(amount),
                        type,
                        category_id: categoryId,
                        date: apiDate,
                    },
                },
            );
            resetForm();
            await loadData();
        } catch (error) {
            setErrorMessage(
                messageForError(error, 'Não foi possível salvar o lançamento.'),
            );
        } finally {
            setSaving(false);
        }
    }

    function confirmDelete(transaction: Transaction): void {
        Alert.alert(
            'Excluir lançamento?',
            `“${transaction.description}” será movido para a lixeira.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: () => void deleteTransaction(transaction.id),
                },
            ],
        );
    }

    async function deleteTransaction(transactionId: number): Promise<void> {
        try {
            await sessionRequest(session, `/transactions/${transactionId}`, {
                method: 'DELETE',
            });
            await loadData();
        } catch (error) {
            setErrorMessage(
                messageForError(
                    error,
                    'Não foi possível excluir o lançamento.',
                ),
            );
        }
    }

    return (
        <Page>
            <PageTitle
                title="Lançamentos"
                subtitle="Receitas e despesas do mês atual."
            />

            {errorMessage ? (
                <Text accessibilityRole="alert" style={styles.error}>
                    {errorMessage}
                </Text>
            ) : null}

            {!session.isDemo ? (
                <Card>
                    <SectionTitle
                        title={
                            editingId === null
                                ? 'Novo lançamento'
                                : 'Editar lançamento'
                        }
                    />
                    <TextField
                        label="Descrição"
                        value={description}
                        onChangeText={setDescription}
                        maxLength={255}
                        placeholder="Ex.: Conta de luz"
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
                            Crie uma categoria desse tipo antes de adicionar um
                            lançamento.
                        </Text>
                    )}
                    <TextField
                        label="Data (DD/MM/AAAA)"
                        value={formatDateForInput(date)}
                        onChangeText={setDate}
                        autoCapitalize="none"
                        maxLength={10}
                        placeholder="DD/MM/AAAA"
                    />
                    <ActionButton
                        onPress={() => void saveTransaction()}
                        disabled={saving}
                        loading={saving}
                    >
                        {editingId === null
                            ? 'Adicionar lançamento'
                            : 'Salvar alterações'}
                    </ActionButton>
                    {editingId !== null ? (
                        <ActionButton onPress={resetForm} variant="quiet">
                            Cancelar edição
                        </ActionButton>
                    ) : null}
                </Card>
            ) : null}

            <Card>
                <SectionTitle title="Este mês" />
                {loading ? (
                    <Text style={commonStyles.muted}>
                        Carregando lançamentos…
                    </Text>
                ) : transactions.length ? (
                    transactions.map((transaction) => (
                        <View key={transaction.id} style={styles.transaction}>
                            <Pressable
                                accessibilityRole="button"
                                disabled={session.isDemo}
                                onPress={() => startEditing(transaction)}
                                style={styles.transactionMain}
                            >
                                <Text
                                    style={styles.description}
                                    numberOfLines={1}
                                >
                                    {transaction.description}
                                </Text>
                                <Text style={styles.meta}>
                                    {transaction.category.name} ·{' '}
                                    {formatDate(transaction.date)}
                                </Text>
                                <Text
                                    style={[
                                        styles.amount,
                                        transaction.type === 'income'
                                            ? styles.income
                                            : styles.expense,
                                    ]}
                                >
                                    {transaction.type === 'income' ? '+' : '−'}
                                    {formatCurrency(transaction.amount)}
                                </Text>
                            </Pressable>
                            {!session.isDemo ? (
                                <ActionButton
                                    onPress={() => confirmDelete(transaction)}
                                    variant="quiet"
                                    compact
                                >
                                    Excluir
                                </ActionButton>
                            ) : null}
                        </View>
                    ))
                ) : (
                    <Text style={commonStyles.muted}>
                        Não há lançamentos neste período.
                    </Text>
                )}
            </Card>
        </Page>
    );
}

function messageForError(error: unknown, fallback: string): string {
    return error instanceof ApiError ? error.message : fallback;
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
    transaction: {
        alignItems: 'center',
        borderTopColor: colors.border,
        borderTopWidth: 1,
        flexDirection: 'row',
        gap: 5,
        paddingTop: 12,
    },
    transactionMain: { flex: 1, gap: 4, paddingVertical: 2 },
    description: { color: colors.text, fontSize: 14, fontWeight: '600' },
    meta: { color: colors.muted, fontSize: 11 },
    amount: { fontSize: 13, fontWeight: '700' },
    income: { color: colors.income },
    expense: { color: colors.expense },
});
