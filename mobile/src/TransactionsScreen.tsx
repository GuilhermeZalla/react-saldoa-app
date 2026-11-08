import { decimalToMoneyInput, formatMoneyInput } from './money';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { ApiError, apiTextRequest, sessionRequest } from './api';
import { useThemeStyles } from './PreferencesContext';
import {
    LoadingState,
    ActionButton,
    ChoiceChips,
    Page,
    TextField,
} from './components';
import {
    EmptyFinance,
    FinanceError,
    FinanceHeader,
    FinanceSheet,
    InlineAction,
    MonthPicker,
    FinanceCard as Card,
} from './finance-components';
import { AppIcon } from './icons';
import {
    amountForApi,
    currentDate,
    currentMonth,
    dateForApi,
    formatCurrency,
    formatDate,
    formatDateForInput,
} from './format';
import { t } from './i18n';
import type { ThemeColors } from './theme';
import type { Category, Session, Transaction } from './types';

type Collection<T> = {
    data: T[];
    meta?: { current_page: number; last_page: number; total: number };
};
export default function TransactionsScreen({ session }: { session: Session }) {
    const { colors, styles } = useThemeStyles(createStyles);
    const [month, setMonth] = useState(currentMonth());
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [pageNumber, setPageNumber] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [error, setError] = useState('');
    const [manualFormOpen, setFormOpen] = useState(false);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [date, setDate] = useState(currentDate());
    const [editingId, setEditingId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const requestSequence = useRef(0);
    const parameters = useLocalSearchParams<{ create?: string }>();
    const formOpen =
        manualFormOpen || (parameters.create === '1' && !session.isDemo);
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
        return () => clearTimeout(timer);
    }, [search]);
    const availableCategories = useMemo(
        () => categories.filter((category) => category.type === type),
        [categories, type],
    );
    const selectedCategoryId = availableCategories.some(
        (category) => category.id === categoryId,
    )
        ? categoryId
        : (availableCategories[0]?.id ?? null);
    const query = useMemo(
        () =>
            new URLSearchParams({
                month,
                type: filter,
                search: debouncedSearch,
            }).toString(),
        [month, filter, debouncedSearch],
    );
    const loadData = useCallback(
        async (nextPage = 1) => {
            const sequence = ++requestSequence.current;
            if (nextPage === 1) {
                setLoading(true);
                setTransactions([]);
            } else setLoadingMore(true);
            setError('');
            try {
                const [response, categoryResponse] = await Promise.all([
                    sessionRequest<Collection<Transaction>>(
                        session,
                        `/transactions?${query}&page=${nextPage}`,
                    ),
                    nextPage === 1
                        ? sessionRequest<Collection<Category>>(
                              session,
                              '/categories',
                          )
                        : Promise.resolve(null),
                ]);
                if (sequence !== requestSequence.current) return;
                setTransactions((current) =>
                    nextPage === 1
                        ? response.data
                        : [...current, ...response.data],
                );
                setPageNumber(response.meta?.current_page ?? nextPage);
                setLastPage(response.meta?.last_page ?? 1);
                setTotal(response.meta?.total ?? response.data.length);
                if (categoryResponse) setCategories(categoryResponse.data);
            } catch (reason) {
                if (sequence === requestSequence.current)
                    setError(
                        reason instanceof ApiError
                            ? reason.message
                            : t('Não foi possível carregar os lançamentos.'),
                    );
            } finally {
                if (sequence === requestSequence.current) {
                    setLoading(false);
                    setLoadingMore(false);
                }
            }
        },
        [session, query],
    );
    useFocusEffect(
        useCallback(() => {
            void loadData();
            return () => {
                requestSequence.current++;
            };
        }, [loadData]),
    );
    function newTransaction() {
        if (session.isDemo) return;
        setEditingId(null);
        setDescription('');
        setAmount('');
        setType('expense');
        setDate(month === currentMonth() ? currentDate() : `${month}-01`);
        setError('');
        setFormOpen(true);
    }
    function editTransaction(transaction: Transaction) {
        if (session.isDemo) return;
        setEditingId(transaction.id);
        setDescription(transaction.description);
        setAmount(decimalToMoneyInput(transaction.amount));
        setType(transaction.type);
        setCategoryId(transaction.category.id);
        setDate(transaction.date);
        setError('');
        setFormOpen(true);
    }
    function resetForm() {
        setFormOpen(false);
        setEditingId(null);
        setDescription('');
        setAmount('');
        setType('expense');
        setCategoryId(null);
        setDate(currentDate());
        router.setParams({ create: undefined });
    }
    function closeForm() {
        if (saving) return;
        resetForm();
        setError('');
    }
    async function saveTransaction() {
        if (session.isDemo || saving) return;
        if (
            !description.trim() ||
            !amount.trim() ||
            selectedCategoryId === null
        ) {
            setError(t('Preencha a descrição, o valor e a categoria.'));
            return;
        }
        const apiDate = dateForApi(date);
        if (apiDate === null) {
            setError(t('Informe uma data válida no formato DD/MM/AAAA.'));
            return;
        }
        const parsedAmount = amountForApi(amount);
        if (
            !Number.isFinite(Number(parsedAmount)) ||
            Number(parsedAmount) <= 0
        ) {
            setError(t('Informe um valor maior que zero.'));
            return;
        }
        setSaving(true);
        setError('');
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
                        amount: parsedAmount,
                        type,
                        category_id: selectedCategoryId,
                        date: apiDate,
                    },
                },
            );
            resetForm();
            if (apiDate.slice(0, 7) !== month) setMonth(apiDate.slice(0, 7));
            else await loadData();
        } catch (reason) {
            setError(
                reason instanceof ApiError
                    ? reason.message
                    : t('Não foi possível salvar o lançamento.'),
            );
        } finally {
            setSaving(false);
        }
    }
    async function removeTransaction(transaction: Transaction) {
        if (session.isDemo) return;
        try {
            await sessionRequest(session, `/transactions/${transaction.id}`, {
                method: 'DELETE',
            });
            await loadData();
        } catch (reason) {
            setError(
                reason instanceof ApiError
                    ? reason.message
                    : t('Não foi possível excluir o lançamento.'),
            );
        }
    }
    function confirmDelete(transaction: Transaction) {
        Alert.alert(
            t('Excluir lançamento?'),
            t('“{description}” será movido para a lixeira.', {
                description: transaction.description,
            }),
            [
                { text: t('Cancelar'), style: 'cancel' },
                {
                    text: t('Excluir'),
                    style: 'destructive',
                    onPress: () => void removeTransaction(transaction),
                },
            ],
        );
    }
    async function exportTransactions() {
        setExporting(true);
        setError('');
        try {
            const csv = await apiTextRequest(
                session,
                `/transactions/export?${query}`,
            );
            await Share.share({ message: csv, title: t('Lançamentos Saldoa') });
        } catch (reason) {
            setError(
                reason instanceof ApiError
                    ? reason.message
                    : t('Não foi possível exportar os dados.'),
            );
        } finally {
            setExporting(false);
        }
    }
    const groups = transactions.reduce<Record<string, Transaction[]>>(
        (all, transaction) => {
            (all[transaction.date] ??= []).push(transaction);
            return all;
        },
        {},
    );
    return (
        <Page contentStyle={styles.page}>
            <FinanceHeader
                title={t('Lançamentos')}
                subtitle={t('Cada movimentação, no seu lugar.')}
                name={session.user.name}
                eyebrow={t('Seu dia a dia')}
            />
            <View style={styles.toolbar}>
                <MonthPicker month={month} onChange={setMonth} />
                <InlineAction
                    label={t('Novo')}
                    onPress={newTransaction}
                    disabled={session.isDemo}
                />
            </View>
            <TextField
                label={t('Buscar lançamentos')}
                value={search}
                onChangeText={setSearch}
                placeholder={t('Buscar descrição')}
                maxLength={255}
                autoCapitalize="none"
            />
            <View style={styles.filterRow}>
                <View style={styles.filters}>
                    <ChoiceChips
                        selected={filter}
                        onSelect={setFilter}
                        options={[
                            { value: 'all', label: t('Todos') },
                            { value: 'income', label: t('Receitas') },
                            { value: 'expense', label: t('Despesas') },
                        ]}
                    />
                </View>
                <ActionButton
                    variant="secondary"
                    compact
                    loading={exporting}
                    disabled={exporting || loading}
                    onPress={() => void exportTransactions()}
                >
                    {t('Exportar')}
                </ActionButton>
            </View>
            {!formOpen && <FinanceError message={error} />}
            {loading ? (
                <LoadingState label={t('Carregando lançamentos…')} />
            ) : (
                <>
                    <View style={styles.toolbar}>
                        <Text style={styles.meta}>{t('Histórico do mês')}</Text>
                        <Text style={styles.meta}>
                            {t('{count} lançamentos', { count: total })}
                        </Text>
                    </View>
                    {transactions.length ? (
                        Object.entries(groups).map(([day, items]) => (
                            <View key={day}>
                                <Text style={styles.groupLabel}>
                                    {formatDate(day)}
                                </Text>
                                {items.map((transaction) => (
                                    <View
                                        key={transaction.id}
                                        style={styles.transaction}
                                    >
                                        <Pressable
                                            accessibilityRole="button"
                                            accessibilityLabel={t(
                                                'Editar lançamento',
                                            )}
                                            disabled={session.isDemo}
                                            onPress={() =>
                                                editTransaction(transaction)
                                            }
                                            style={styles.transactionMain}
                                        >
                                            <View style={styles.categoryIcon}>
                                                <AppIcon
                                                    name={
                                                        transaction.type ===
                                                        'income'
                                                            ? 'arrow-down'
                                                            : 'arrow-up'
                                                    }
                                                    color={colors.muted}
                                                    size={19}
                                                />
                                            </View>
                                            <View style={styles.copy}>
                                                <Text
                                                    style={styles.description}
                                                >
                                                    {transaction.description}
                                                </Text>
                                                <Text style={styles.meta}>
                                                    {transaction.category.name}
                                                </Text>
                                            </View>
                                            <Text
                                                style={[
                                                    styles.amount,
                                                    {
                                                        color:
                                                            transaction.type ===
                                                            'income'
                                                                ? colors.income
                                                                : colors.expense,
                                                    },
                                                ]}
                                            >
                                                {transaction.type === 'income'
                                                    ? '+'
                                                    : '−'}{' '}
                                                {formatCurrency(
                                                    transaction.amount,
                                                )}
                                            </Text>
                                        </Pressable>
                                        {!session.isDemo && (
                                            <Pressable
                                                accessibilityRole="button"
                                                accessibilityLabel={t(
                                                    'Excluir lançamento',
                                                )}
                                                onPress={() =>
                                                    confirmDelete(transaction)
                                                }
                                                style={styles.delete}
                                            >
                                                <AppIcon
                                                    name="trash"
                                                    size={17}
                                                    color={colors.muted}
                                                />
                                            </Pressable>
                                        )}
                                    </View>
                                ))}
                            </View>
                        ))
                    ) : (
                        <Card>
                            <EmptyFinance>
                                {error
                                    ? t('Tente novamente mais tarde.')
                                    : t(
                                          'Nenhum lançamento encontrado. Experimente outro mês ou filtro.',
                                      )}
                            </EmptyFinance>
                            {!error && !session.isDemo && (
                                <ActionButton
                                    variant="secondary"
                                    onPress={newTransaction}
                                >
                                    {t('Registrar movimentação')}
                                </ActionButton>
                            )}
                            {!error && (
                                <ActionButton
                                    variant="quiet"
                                    compact
                                    onPress={() => {
                                        setSearch('');
                                        setFilter('all');
                                    }}
                                >
                                    {t('Limpar filtros')}
                                </ActionButton>
                            )}
                            {!!error && (
                                <ActionButton
                                    variant="secondary"
                                    onPress={() => void loadData()}
                                >
                                    {t('Tentar novamente')}
                                </ActionButton>
                            )}
                        </Card>
                    )}
                    {pageNumber < lastPage && (
                        <ActionButton
                            variant="secondary"
                            loading={loadingMore}
                            disabled={loadingMore}
                            onPress={() => void loadData(pageNumber + 1)}
                        >
                            {t('Carregar mais')}
                        </ActionButton>
                    )}
                </>
            )}
            <FinanceSheet
                visible={formOpen && !session.isDemo}
                title={
                    editingId === null
                        ? t('Novo lançamento')
                        : t('Editar lançamento')
                }
                onClose={closeForm}
                busy={saving}
            >
                <FinanceError message={error} />
                <ChoiceChips
                    selected={type}
                    onSelect={(value) => {
                        setType(value as 'income' | 'expense');
                        setCategoryId(null);
                    }}
                    options={[
                        { value: 'expense', label: t('Despesa') },
                        { value: 'income', label: t('Receita') },
                    ]}
                />
                <TextField
                    label={t('Valor (R$)')}
                    value={amount}
                    onChangeText={(value) => setAmount(formatMoneyInput(value))}
                    keyboardType="number-pad"
                    placeholder="0,00"
                />
                <TextField
                    label={t('Descrição')}
                    value={description}
                    onChangeText={setDescription}
                    placeholder={t('Ex.: compra no mercado')}
                    maxLength={255}
                />
                <Text style={styles.fieldLabel}>{t('Categoria')}</Text>
                {availableCategories.length ? (
                    <ChoiceChips
                        selected={selectedCategoryId?.toString() ?? ''}
                        onSelect={(value) => setCategoryId(Number(value))}
                        options={availableCategories.map((category) => ({
                            value: String(category.id),
                            label: category.name,
                        }))}
                    />
                ) : (
                    <Text style={styles.meta}>
                        {t(
                            'Crie uma categoria desse tipo antes de adicionar um lançamento.',
                        )}
                    </Text>
                )}
                <TextField
                    label={t('Data (DD/MM/AAAA)')}
                    value={formatDateForInput(date)}
                    onChangeText={setDate}
                    placeholder={t('DD/MM/AAAA')}
                    maxLength={10}
                />
                <ActionButton
                    loading={saving}
                    disabled={saving || !availableCategories.length}
                    onPress={() => void saveTransaction()}
                >
                    {editingId === null
                        ? t('Adicionar lançamento')
                        : t('Salvar alterações')}
                </ActionButton>
                <ActionButton
                    variant="quiet"
                    disabled={saving}
                    onPress={closeForm}
                >
                    {t('Cancelar')}
                </ActionButton>
            </FinanceSheet>
        </Page>
    );
}
const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        page: { padding: 18, gap: 16 },
        toolbar: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            flexWrap: 'wrap',
        },
        filterRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
        },
        filters: { flex: 1, minWidth: 220 },
        meta: {
            fontFamily: 'DMSans',
            fontSize: 14,
            lineHeight: 20,
            color: colors.muted,
        },
        groupLabel: {
            fontFamily: 'DMSans',
            fontSize: 14,
            color: colors.muted,
            marginTop: 10,
            marginBottom: 5,
        },
        transaction: {
            flexDirection: 'row',
            alignItems: 'center',
            borderTopWidth: 1,
            borderTopColor: colors.border,
        },
        transactionMain: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 9,
            paddingVertical: 16,
        },
        categoryIcon: {
            width: 34,
            height: 34,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
        },
        copy: { flex: 1, gap: 3 },
        description: {
            fontFamily: 'DMSans',
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
        },
        amount: {
            fontFamily: 'SpaceGrotesk',
            fontSize: 14,
            fontWeight: '600',
            flexShrink: 0,
        },
        delete: {
            width: 30,
            minHeight: 44,
            justifyContent: 'center',
            alignItems: 'center',
        },
        fieldLabel: {
            fontFamily: 'DMSans',
            fontSize: 14,
            color: colors.text,
            fontWeight: '600',
        },
    });
