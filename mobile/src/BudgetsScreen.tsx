import { useThemeStyles } from './PreferencesContext';
import { t } from './i18n';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { ApiError, sessionRequest } from './api';
import {
    ActionButton,
    Card,
    ChoiceChips,
    Page,
    PageTitle,
    ProgressBar,
    SectionTitle,
    TextField,
    useCommonStyles,
} from './components';
import { amountForApi, formatCurrency } from './format';
import type { ThemeColors } from './theme';
import type { Budget, Category, Session } from './types';

type Props = { session: Session };
type BudgetIndex = {
    data: Budget[];
    month: string;
    categories_without_budget: { id: number; name: string }[];
};
type Collection<T> = { data: T[] };

export default function BudgetsScreen({ session }: Props) {
    const { styles } = useThemeStyles(createStyles);
    const commonStyles = useCommonStyles();
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [amount, setAmount] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const availableCategories = useMemo(
        () =>
            categories.filter(
                (category) =>
                    category.type === 'expense' &&
                    !budgets.some(
                        (budget) => budget.category_id === category.id,
                    ),
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
                const { budgetResponse, categoryResponse } =
                    await fetchBudgets();

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
        setFormOpen(true);
        setEditingId(budget.id);
        setAmount(budget.amount);
    }

    function cancelEdit(): void {
        setFormOpen(false);
        setEditingId(null);
        setAmount('');
    }

    async function saveBudget(): Promise<void> {
        if (!amount.trim() || (editingId === null && categoryId === null)) {
            setErrorMessage(
                t('Informe o valor da meta e selecione uma categoria.'),
            );
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
            t('Excluir meta?'),
            t('A meta de “{name}” será removida.', {
                name: budget.category_name,
            }),
            [
                { text: t('Cancelar'), style: 'cancel' },
                {
                    text: t('Excluir'),
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
                title={t('Metas')}
                subtitle={t('Acompanhe seus limites de gastos do mês.')}
            />
            {errorMessage ? (
                <Text accessibilityRole="alert" style={styles.error}>
                    {errorMessage}
                </Text>
            ) : null}

            {!session.isDemo && availableCategories.length > 0 && !formOpen ? (
                <ActionButton
                    onPress={() => {
                        setFormOpen(true);
                        setErrorMessage('');
                    }}
                    variant="secondary"
                >
                    {t('Nova meta')}
                </ActionButton>
            ) : null}
            {!session.isDemo &&
            formOpen &&
            (editingId !== null || availableCategories.length > 0) ? (
                <Card>
                    <SectionTitle
                        title={
                            editingId === null
                                ? t('Nova meta')
                                : t('Editar meta')
                        }
                    />
                    {editingId === null ? (
                        <>
                            <Text style={styles.fieldLabel}>
                                {t('Categoria')}
                            </Text>
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
                        </>
                    ) : null}
                    <TextField
                        label={t('Limite mensal')}
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
                        {t('Salvar meta')}
                    </ActionButton>
                    <ActionButton onPress={cancelEdit} variant="quiet">
                        {t('Cancelar')}
                    </ActionButton>
                </Card>
            ) : null}

            <Card>
                <SectionTitle title={t('Metas deste mês')} />
                {loading ? (
                    <Text style={commonStyles.muted}>
                        {t('Carregando metas…')}
                    </Text>
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
                        {t('Nenhuma meta cadastrada para este mês.')}
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
    const { colors, styles } = useThemeStyles(createStyles);
    const statusColor =
        budget.status === 'exceeded'
            ? colors.expense
            : budget.status === 'warning'
              ? colors.warning
              : colors.primary;
    const remaining = Number(budget.amount) - Number(budget.spent);

    return (
        <View style={styles.budgetRow}>
            <View style={styles.budgetHeading}>
                <Text style={styles.categoryName}>{budget.category_name}</Text>
                <Text style={[styles.status, { color: statusColor }]}>
                    {Math.round(budget.percentage)}
                    {t('% utilizado')}
                </Text>
            </View>
            <Text style={styles.spent}>{formatCurrency(budget.spent)}</Text>
            <Text style={styles.budgetAmount}>
                {t('de {amount} no mês', {
                    amount: formatCurrency(budget.amount),
                })}
            </Text>
            <ProgressBar
                value={budget.percentage}
                label={budget.category_name}
                color={statusColor}
            />
            <View style={styles.budgetHeading}>
                <View style={styles.remainingCopy}>
                    <Text style={styles.remainingLabel}>
                        {remaining < 0 ? t('Acima do limite') : t('Disponível')}
                    </Text>
                    <Text
                        style={[
                            styles.remainingValue,
                            remaining < 0 && { color: statusColor },
                        ]}
                    >
                        {formatCurrency(Math.abs(remaining))}
                    </Text>
                </View>
                {!readOnly ? (
                    <View style={styles.actions}>
                        <ActionButton onPress={onEdit} variant="quiet" compact>
                            {t('Editar')}
                        </ActionButton>
                        <ActionButton
                            onPress={onDelete}
                            variant="quiet"
                            compact
                        >
                            {t('Excluir')}
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
        : t('Não foi possível concluir a solicitação.');
}

const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        error: {
            fontFamily: 'DMSans',
            backgroundColor: colors.expenseSoft,
            borderRadius: 10,
            color: colors.expense,
            fontSize: 13,
            padding: 12,
        },
        fieldLabel: {
            fontFamily: 'DMSans',
            color: colors.text,
            fontSize: 13,
            fontWeight: '600',
        },
        budgetRow: {
            backgroundColor: colors.background,
            borderRadius: 20,
            gap: 12,
            padding: 16,
        },
        budgetHeading: {
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10,
        },
        categoryName: {
            fontFamily: 'SpaceGrotesk',
            color: colors.text,
            fontSize: 17,
            fontWeight: '600',
            flexShrink: 1,
        },
        budgetAmount: {
            fontFamily: 'DMSans',
            color: colors.muted,
            fontSize: 11,
        },
        spent: {
            fontFamily: 'SpaceGrotesk',
            color: colors.text,
            fontSize: 28,
            fontWeight: '700',
        },
        remainingCopy: { gap: 4 },
        remainingLabel: {
            fontFamily: 'DMSans',
            color: colors.muted,
            fontSize: 11,
        },
        remainingValue: {
            fontFamily: 'DMSans',
            color: colors.text,
            fontSize: 14,
            fontWeight: '600',
        },
        status: { fontFamily: 'DMSans', fontSize: 11, fontWeight: '600' },
        actions: { flexDirection: 'row' },
    });
