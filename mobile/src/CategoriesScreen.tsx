import { useThemeStyles } from './PreferencesContext';
import { t } from './i18n';
import { useCallback, useEffect, useState } from 'react';
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
    useCommonStyles,
} from './components';
import type { ThemeColors } from './theme';
import type { Category, Session } from './types';

type Props = { session: Session };
type Collection<T> = { data: T[] };

export default function CategoriesScreen({ session }: Props) {
    const { styles } = useThemeStyles(createStyles);
    const commonStyles = useCommonStyles();
    const [categories, setCategories] = useState<Category[]>([]);
    const [name, setName] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const fetchCategories = useCallback(async () => {
        const response = await sessionRequest<Collection<Category>>(
            session,
            '/categories',
        );

        return response.data;
    }, [session]);

    const loadCategories = useCallback(async () => {
        try {
            setCategories(await fetchCategories());
            setErrorMessage('');
        } catch (error) {
            setErrorMessage(errorMessageFor(error));
        } finally {
            setLoading(false);
        }
    }, [fetchCategories]);

    useEffect(() => {
        let isCurrent = true;

        async function loadInitialCategories(): Promise<void> {
            try {
                const data = await fetchCategories();

                if (isCurrent) {
                    setCategories(data);
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

        void loadInitialCategories();

        return () => {
            isCurrent = false;
        };
    }, [fetchCategories]);

    async function createCategory(): Promise<void> {
        if (!name.trim()) {
            setErrorMessage(t('Informe o nome da categoria.'));
            return;
        }

        setSaving(true);
        setErrorMessage('');

        try {
            await sessionRequest(session, '/categories', {
                method: 'POST',
                body: { name: name.trim(), type },
            });
            setName('');
            await loadCategories();
        } catch (error) {
            setErrorMessage(errorMessageFor(error));
        } finally {
            setSaving(false);
        }
    }

    function askToDelete(category: Category): void {
        Alert.alert(
            t('Excluir categoria?'),
            category.transactions_count
                ? t(
                      'A categoria está em uso. Primeiro remova ou mova os lançamentos e recorrências associados.',
                  )
                : t('A categoria “{name}” será removida.', {
                      name: category.name,
                  }),
            [
                { text: t('Cancelar'), style: 'cancel' },
                {
                    text: t('Excluir'),
                    style: 'destructive',
                    onPress: () => void deleteCategory(category.id),
                },
            ],
        );
    }

    async function deleteCategory(categoryId: number): Promise<void> {
        try {
            await sessionRequest(session, `/categories/${categoryId}`, {
                method: 'DELETE',
            });
            await loadCategories();
        } catch (error) {
            setErrorMessage(errorMessageFor(error));
        }
    }

    return (
        <Page>
            <PageTitle
                title={t('Categorias')}
                subtitle={t('Organize receitas e despesas por tipo.')}
            />
            {errorMessage ? (
                <Text accessibilityRole="alert" style={styles.error}>
                    {errorMessage}
                </Text>
            ) : null}

            {!session.isDemo ? (
                <Card>
                    <SectionTitle title={t('Nova categoria')} />
                    <TextField
                        label={t('Nome')}
                        value={name}
                        onChangeText={setName}
                        maxLength={255}
                        placeholder={t('Ex.: Moradia')}
                    />
                    <ChoiceChips
                        selected={type}
                        onSelect={(value) =>
                            setType(value as 'income' | 'expense')
                        }
                        options={[
                            { value: 'expense', label: t('Despesa') },
                            { value: 'income', label: t('Receita') },
                        ]}
                    />
                    <ActionButton
                        onPress={() => void createCategory()}
                        loading={saving}
                        disabled={saving}
                    >
                        {t('Adicionar categoria')}
                    </ActionButton>
                </Card>
            ) : null}

            <Card>
                <SectionTitle title={t('Suas categorias')} />
                {loading ? (
                    <Text style={commonStyles.muted}>
                        {t('Carregando categorias…')}
                    </Text>
                ) : categories.length ? (
                    categories.map((category) => (
                        <View key={category.id} style={styles.row}>
                            <View style={styles.categoryInfo}>
                                <Text style={styles.name}>{category.name}</Text>
                                <Text style={styles.meta}>
                                    {category.type === 'income'
                                        ? t('Receita')
                                        : t('Despesa')}
                                    {category.transactions_count === undefined
                                        ? ''
                                        : ` · ${t('{count} lançamentos', { count: category.transactions_count ?? 0 })}`}
                                </Text>
                            </View>
                            {!session.isDemo ? (
                                <ActionButton
                                    onPress={() => askToDelete(category)}
                                    variant="quiet"
                                    compact
                                >
                                    {t('Excluir')}
                                </ActionButton>
                            ) : null}
                        </View>
                    ))
                ) : (
                    <Text style={commonStyles.muted}>
                        {t('Nenhuma categoria cadastrada.')}
                    </Text>
                )}
            </Card>
        </Page>
    );
}

function errorMessageFor(error: unknown): string {
    if (error instanceof ApiError && error.status === 409) {
        return t(
            'Não é possível excluir uma categoria que ainda possui lançamentos ou recorrências.',
        );
    }

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
        row: {
            alignItems: 'center',
            borderTopColor: colors.border,
            borderTopWidth: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingTop: 16,
            gap: 12,
        },
        categoryInfo: { flex: 1, gap: 3 },
        name: {
            fontFamily: 'SpaceGrotesk',
            color: colors.text,
            fontSize: 16,
            fontWeight: '600',
        },
        meta: { fontFamily: 'DMSans', color: colors.muted, fontSize: 11 },
    });
