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
import { amountForApi, formatCurrency } from './format';
import { colors } from './theme';
import type { Budget, Category, Session } from './types';

type Props = { session: Session };
type BudgetIndex = {
    data: Budget[];
    month: string;
    categories_without_budget: { id: number; name: string }[];
};
type Collection<T> = { data: T[] };

export default function BudgetsScreen({ session }: Props) {
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [amount, setAmount] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const availableCategories = useMemo(
        () =>
            categories.filter(
                (category) =>
                    category.type === 'expense' &&
                    !budgets.some((budget) => budget.category_id === category.id),
            ),
        [budgets, categories],
    );

    const fetchBudgets = useCallback(async () => {
        const [budgetResponse, categoryResponse] = await Promise.all([
            sessionRequest<BudgetIndex>(session, '/budgets'),
            sessionRequest<Collection<Category>>(session, '/categories'),
        ]);

        return { budgetResponse, categoryResponse };
    }, [session]);

    const loadBudgets = useCallback(async () => {
        setErrorMessage('');

        try {
            const { budgetResponse, categoryResponse } = await fetchBudgets();
            setBudgets(budgetResponse.data);
            setCategories(categoryResponse.data);
            setCategoryId(
                (currentId) =>
                    currentId ??
                    budgetResponse.categories_without_budget[0]?.id ??
                    null,
            );
        } catch (error) {
            setErrorMessage(errorMessageFor(error));
        } finally {
            setLoading(false);
        }
    }, [fetchBudgets]);

    useEffect(() => {
        let isCurrent = true;

        async function loadInitialBudgets(): Promise<void> {
            try {
                const { budgetResponse, categoryResponse } = await fetchBudgets();

                if (isCurrent) {
                    setBudgets(budgetResponse.data);
                    setCategories(categoryResponse.data);
                    setCategoryId(
                        (currentId) =>
                            currentId ??
                            budgetResponse.categories_without_budget[0]?.id ??
                            null,
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

        void loadInitialBudgets();

        return () => {
            isCurrent = false;
        };
    }, [fetchBudgets]);

    function editBudget(budget: Budget): void {
        setEditingId(budget.id);
        setAmount(budget.amount);
    }

    function cancelEdit(): void {
        setEditingId(null);
        setAmount('');
    }

    async function saveBudget(): Promise<void> {
        if (!amount.trim() || (editingId === null && categoryId === null)) {
            setErrorMessage('Informe o valor da meta e selecione uma categoria.');
            return;
        }

        setSaving(true);
        setErrorMessage('');

        try {
            await sessionRequest(
                session,
                editingId === null ? '/budgets' : `/budgets/${editingId}`,
                {
                    method: editingId === null ? 'POST' : 'PUT',
                    body:
                        editingId === null
                            ? {
                                  category_id: categoryId,
                                  amount: amountForApi(amount),
                              }
                            : { amount: amountForApi(amount) },
                },
            );
            cancelEdit();
            await loadBudgets();
        } catch (error) {
            setErrorMessage(errorMessageFor(error));
        } finally {
            setSaving(false);
        }
    }

    function askToDelete(budget: Budget): void {
        Alert.alert(
            'Excluir meta?',
            `A meta de ${budget.category_name} será removida.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: () => void deleteBudget(budget.id),
                },
            ],
        );
    }

    async function deleteBudget(budgetId: number): Promise<void> {
        try {
            await sessionRequest(session, `/budgets/${budgetId}`, {
                method: 'DELETE',
            });
            await loadBudgets();
        } catch (error) {
            setErrorMessage(errorMessageFor(error));
        }
    }

    return (
        <Page>
            <PageTitle
                title="Metas"
                subtitle="Acompanhe seus limites de gastos do mês."
            />
            {errorMessage ? (
                <Text accessibilityRole="alert" style={styles.error}>
                    {errorMessage}
                </Text>
            ) : null}

            {!session.isDemo && (editingId !== null || availableCategories.length > 0) ? (
                <Card>
                    <SectionTitle
                        title={editingId === null ? 'Nova meta' : 'Editar meta'}
                    />
                    {editingId === null ? (
                        <>
                            <Text style={styles.fieldLabel}>Categoria</Text>
                            <ChoiceChips
                                selected={categoryId?.toString() ?? ''}
                                onSelect={(value) => setCategoryId(Number(value))}
                                options={availableCategories.map((category) => ({
                                    value: category.id.toString(),
                                    label: category.name,
                                }))}
                            />
                        </>
                    ) : null}
                    <TextField
                        label="Limite mensal"
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="decimal-pad"
                        placeholder="0,00"
                    />
                    <ActionButton
                        onPress={() => void saveBudget()}
                        disabled={saving}
                        loading={saving}
                    >
                        Salvar meta
                    </ActionButton>
                    {editingId !== null ? (
                        <ActionButton onPress={cancelEdit} variant="quiet">
                            Cancelar edição
                        </ActionButton>
                    ) : null}
                </Card>
            ) : null}

            <Card>
                <SectionTitle title="Metas deste mês" />
                {loading ? (
                    <Text style={commonStyles.muted}>Carregando metas…</Text>
                ) : budgets.length ? (
                    budgets.map((budget) => (
                        <BudgetRow
                            key={budget.id}
                            budget={budget}
                            readOnly={session.isDemo}
                            onEdit={() => editBudget(budget)}
                            onDelete={() => askToDelete(budget)}
                        />
                    ))
                ) : (
                    <Text style={commonStyles.muted}>
                        Nenhuma meta cadastrada para este mês.
                    </Text>
                )}
            </Card>
        </Page>
    );
}

function BudgetRow({
    budget,
    readOnly,
    onEdit,
    onDelete,
}: {
    budget: Budget;
    readOnly: boolean;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const statusColor =
        budget.status === 'exceeded'
            ? colors.expense
            : budget.status === 'warning'
              ? colors.warning
              : colors.primary;
    const percentage = Math.min(100, Math.max(0, budget.percentage));

    return (
        <View style={styles.budgetRow}>
            <View style={styles.budgetHeading}>
                <Text style={styles.categoryName}>{budget.category_name}</Text>
                <Text style={styles.budgetAmount}>
                    {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                </Text>
            </View>
            <View style={styles.progressTrack}>
                <View
                    style={[
                        styles.progressFill,
                        { backgroundColor: statusColor, width: `${percentage}%` },
                    ]}
                />
            </View>
            <View style={styles.budgetHeading}>
                <Text style={[styles.status, { color: statusColor }]}>
                    {Math.round(budget.percentage)}% utilizado
                </Text>
                {!readOnly ? (
                    <View style={styles.actions}>
                        <ActionButton onPress={onEdit} variant="quiet" compact>
                            Editar
                        </ActionButton>
                        <ActionButton onPress={onDelete} variant="quiet" compact>
                            Excluir
                        </ActionButton>
                    </View>
                ) : null}
            </View>
        </View>
    );
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
    budgetRow: {
        borderTopColor: colors.border,
        borderTopWidth: 1,
        gap: 8,
        paddingTop: 12,
    },
    budgetHeading: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    categoryName: { color: colors.text, fontSize: 14, fontWeight: '600' },
    budgetAmount: { color: colors.muted, fontSize: 11 },
    progressTrack: {
        backgroundColor: colors.surfaceMuted,
        borderRadius: 999,
        height: 7,
        overflow: 'hidden',
    },
    progressFill: { borderRadius: 999, height: 7 },
    status: { fontSize: 11, fontWeight: '600' },
    actions: { flexDirection: 'row' },
});
