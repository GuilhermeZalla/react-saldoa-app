import { decimalToMoneyInput, formatMoneyInput } from './money';
import { useThemeStyles } from './PreferencesContext';
import { getLocale, t } from './i18n';
import { useCallback, useMemo, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { ApiError, sessionRequest } from './api';
import {
    LoadingState,
    ActionButton,
    ChoiceChips,
    Page,
    ProgressBar,
    ResponsiveGrid,
    SectionTitle,
    TextField,
    useCommonStyles,
} from './components';
import { amountForApi, currentMonth, formatCurrency } from './format';
import {
    EmptyFinance,
    FinanceError,
    FinanceHeader,
    FinanceSheet,
    InlineAction,
    MonthPicker,
    UpcomingList,
    FinanceCard as Card,
} from './finance-components';
import type { ThemeColors } from './theme';
import type {
    Budget,
    Category,
    Dashboard,
    Session,
    UpcomingTransaction,
} from './types';

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
    const [month, setMonth] = useState(currentMonth());
    const [upcoming, setUpcoming] = useState<UpcomingTransaction[]>([]);
    const [tab, setTab] = useState('all');
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
        const [budgetResponse, categoryResponse, dashboardResponse] =
            await Promise.all([
                sessionRequest<BudgetIndex>(session, `/budgets?month=${month}`),
                sessionRequest<Collection<Category>>(session, '/categories'),
                sessionRequest<{ data: Dashboard }>(
                    session,
                    `/dashboard?month=${month}`,
                ),
            ]);

        return { budgetResponse, categoryResponse, dashboardResponse };
    }, [session, month]);

    const loadBudgets = useCallback(async () => {
        setErrorMessage('');

        try {
            const { budgetResponse, categoryResponse, dashboardResponse } =
                await fetchBudgets();
            setBudgets(budgetResponse.data);
            setUpcoming(dashboardResponse.data.upcomingTransactions ?? []);
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

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            setBudgets([]);
            setUpcoming([]);
            setErrorMessage('');
            let isCurrent = true;

            async function loadInitialBudgets(): Promise<void> {
                try {
                    const {
                        budgetResponse,
                        categoryResponse,
                        dashboardResponse,
                    } = await fetchBudgets();

                    if (isCurrent) {
                        setBudgets(budgetResponse.data);
                        setUpcoming(
                            dashboardResponse.data.upcomingTransactions ?? [],
                        );
                        setCategories(categoryResponse.data);
                        setCategoryId(
                            (currentId) =>
                                currentId ??
                                budgetResponse.categories_without_budget[0]
                                    ?.id ??
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
        }, [fetchBudgets]),
    );

    function editBudget(budget: Budget): void {
        setFormOpen(true);
        setEditingId(budget.id);
        setAmount(decimalToMoneyInput(budget.amount));
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

    const totalLimit = budgets.reduce(
        (total, budget) => total + Number(budget.amount),
        0,
    );
    const totalSpent = budgets.reduce(
        (total, budget) => total + Number(budget.spent),
        0,
    );
    return (
        <Page contentStyle={{ padding: 18, gap: 16 }}>
            <FinanceHeader
                title={t('Planejamento')}
                subtitle={t('Organize o mês e enxergue o que vem depois.')}
                name={session.user.name}
                eyebrow={t('Seus próximos passos')}
            />
            <View style={styles.toolbar}>
                <MonthPicker month={month} onChange={setMonth} />
                <InlineAction
                    label={t('Novo limite')}
                    disabled={
                        session.isDemo || availableCategories.length === 0
                    }
                    onPress={() => {
                        setEditingId(null);
                        setCategoryId(availableCategories[0]?.id ?? null);
                        setAmount('');
                        setFormOpen(true);
                        setErrorMessage('');
                    }}
                />
            </View>
            {!formOpen && <FinanceError message={errorMessage} />}
            <View style={styles.summaryRow}>
                <Card style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>
                        {t('Orçamento do mês')}
                    </Text>
                    <Text
                        adjustsFontSizeToFit
                        numberOfLines={1}
                        style={styles.summaryAmount}
                    >
                        {loading ? '—' : formatCurrency(totalLimit)}
                    </Text>
                    <Text style={styles.summaryLabel}>
                        {t('Limites das categorias')}
                    </Text>
                </Card>
                <Card style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>
                        {t('Espaço no orçamento')}
                    </Text>
                    <Text
                        adjustsFontSizeToFit
                        numberOfLines={1}
                        style={styles.summaryAmount}
                    >
                        {loading
                            ? '—'
                            : formatCurrency(totalLimit - totalSpent)}
                    </Text>
                    <Text style={styles.summaryLabel}>
                        {t('Nas categorias com limite')}
                    </Text>
                </Card>
            </View>
            <Text style={commonStyles.muted}>
                {t(
                    'O limite continua nos próximos meses até ser alterado ou excluído. O gasto considera apenas o mês selecionado.',
                )}
            </Text>
            <ChoiceChips
                selected={tab}
                onSelect={setTab}
                options={[
                    { value: 'all', label: t('Visão geral') },
                    { value: 'limits', label: t('Limites') },
                    { value: 'upcoming', label: t('Agenda') },
                ]}
            />
            {tab !== 'upcoming' &&
                (loading ? (
                    <LoadingState label={t('Carregando metas…')} />
                ) : budgets.length ? (
                    <ResponsiveGrid gap={16}>
                        {budgets.map((budget) => (
                            <Card key={budget.id}>
                                <BudgetRow
                                    budget={budget}
                                    readOnly={session.isDemo}
                                    onEdit={() => editBudget(budget)}
                                    onDelete={() => askToDelete(budget)}
                                />
                            </Card>
                        ))}
                    </ResponsiveGrid>
                ) : (
                    <Card>
                        <EmptyFinance>
                            {t(
                                'Defina um limite mensal para acompanhar os gastos de uma categoria de despesa.',
                            )}
                        </EmptyFinance>
                        {!session.isDemo && !errorMessage && (
                            <ActionButton
                                variant="secondary"
                                onPress={() => {
                                    if (availableCategories.length) {
                                        cancelEdit();
                                        setFormOpen(true);
                                    } else router.navigate('/categories');
                                }}
                            >
                                {availableCategories.length
                                    ? t('Criar primeiro limite')
                                    : t('Criar categoria de despesa')}
                            </ActionButton>
                        )}
                    </Card>
                ))}
            {tab !== 'limits' && (
                <Card>
                    <SectionTitle title={t('Agenda do mês')} />
                    <Text style={commonStyles.muted}>
                        {t(
                            'Próxima ocorrência de cada recorrência. Valores previstos, fora do saldo realizado.',
                        )}
                    </Text>
                    {loading ? (
                        <LoadingState label={t('Carregando metas…')} />
                    ) : (
                        <UpcomingList items={upcoming} />
                    )}
                    <ActionButton
                        variant="quiet"
                        compact
                        onPress={() => router.navigate('/recurring')}
                    >
                        {t('Gerenciar recorrências')}
                    </ActionButton>
                </Card>
            )}
            <FinanceSheet
                visible={formOpen && !session.isDemo}
                title={editingId === null ? t('Novo limite') : t('Editar meta')}
                onClose={cancelEdit}
                busy={saving}
            >
                <FinanceError message={errorMessage} />
                {editingId === null ? (
                    <>
                        <Text style={styles.fieldLabel}>{t('Categoria')}</Text>
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
                    label={t('Limite mensal')}
                    value={amount}
                    onChangeText={(value) => setAmount(formatMoneyInput(value))}
                    keyboardType="number-pad"
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
            </FinanceSheet>
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
            ? colors.warning
            : budget.status === 'warning'
              ? colors.warning
              : colors.primary;
    const remaining = Number(budget.amount) - Number(budget.spent);

    return (
        <View style={styles.budgetRow}>
            <View style={styles.budgetHeading}>
                <Text style={styles.categoryName}>{budget.category_name}</Text>
                <Text style={[styles.status, { color: statusColor }]}>
                    {budget.percentage.toLocaleString(getLocale(), {
                        maximumFractionDigits: 1,
                    })}
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
        toolbar: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            flexWrap: 'wrap',
        },
        summaryRow: { flexDirection: 'row', gap: 10 },
        summaryCard: { flex: 1, padding: 14, gap: 9 },
        summaryLabel: {
            fontFamily: 'DMSans',
            fontSize: 14,
            color: colors.muted,
        },
        summaryAmount: {
            fontFamily: 'SpaceGrotesk',
            fontSize: 22,
            fontWeight: '600',
            color: colors.text,
        },
        fieldLabel: {
            fontFamily: 'DMSans',
            color: colors.text,
            fontSize: 14,
            fontWeight: '600',
        },
        budgetRow: { gap: 10 },
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
            fontSize: 14,
        },
        spent: {
            fontFamily: 'SpaceGrotesk',
            color: colors.text,
            fontSize: 24,
            fontWeight: '700',
        },
        remainingCopy: { gap: 4 },
        remainingLabel: {
            fontFamily: 'DMSans',
            color: colors.muted,
            fontSize: 14,
        },
        remainingValue: {
            fontFamily: 'DMSans',
            color: colors.text,
            fontSize: 14,
            fontWeight: '600',
        },
        status: { fontFamily: 'DMSans', fontSize: 14, fontWeight: '600' },
        actions: { flexDirection: 'row' },
    });
