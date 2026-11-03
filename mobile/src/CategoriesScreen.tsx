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
    commonStyles,
} from './components';
import { colors } from './theme';
import type { Category, Session } from './types';

type Props = { session: Session };
type Collection<T> = { data: T[] };

export default function CategoriesScreen({ session }: Props) {
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
            setErrorMessage('Informe o nome da categoria.');
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
            'Excluir categoria?',
            category.transactions_count
                ? 'A categoria está em uso. Primeiro remova ou mova os lançamentos e recorrências associados.'
                : `A categoria “${category.name}” será excluída.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
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
                title="Categorias"
                subtitle="Organize receitas e despesas por tipo."
            />
            {errorMessage ? (
                <Text accessibilityRole="alert" style={styles.error}>
                    {errorMessage}
                </Text>
            ) : null}

            {!session.isDemo ? (
                <Card>
                    <SectionTitle title="Nova categoria" />
                    <TextField
                        label="Nome"
                        value={name}
                        onChangeText={setName}
                        maxLength={255}
                        placeholder="Ex.: Moradia"
                    />
                    <ChoiceChips
                        selected={type}
                        onSelect={(value) => setType(value as 'income' | 'expense')}
                        options={[
                            { value: 'expense', label: 'Despesa' },
                            { value: 'income', label: 'Receita' },
                        ]}
                    />
                    <ActionButton
                        onPress={() => void createCategory()}
                        loading={saving}
                        disabled={saving || !name.trim()}
                    >
                        Adicionar categoria
                    </ActionButton>
                </Card>
            ) : null}

            <Card>
                <SectionTitle title="Suas categorias" />
                {loading ? (
                    <Text style={commonStyles.muted}>Carregando categorias…</Text>
                ) : categories.length ? (
                    categories.map((category) => (
                        <View key={category.id} style={styles.row}>
                            <View style={styles.categoryInfo}>
                                <Text style={styles.name}>{category.name}</Text>
                                <Text style={styles.meta}>
                                    {category.type === 'income' ? 'Receita' : 'Despesa'}
                                    {category.transactions_count === undefined
                                        ? ''
                                        : ` · ${category.transactions_count} lançamentos`}
                                </Text>
                            </View>
                            {!session.isDemo ? (
                                <ActionButton
                                    onPress={() => askToDelete(category)}
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
                        Nenhuma categoria cadastrada.
                    </Text>
                )}
            </Card>
        </Page>
    );
}

function errorMessageFor(error: unknown): string {
    if (error instanceof ApiError && error.status === 409) {
        return 'Não é possível excluir uma categoria que ainda possui lançamentos ou recorrências.';
    }

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
    row: {
        alignItems: 'center',
        borderTopColor: colors.border,
        borderTopWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 10,
    },
    categoryInfo: { flex: 1, gap: 3 },
    name: { color: colors.text, fontSize: 14, fontWeight: '600' },
    meta: { color: colors.muted, fontSize: 11 },
});
