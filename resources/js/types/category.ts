export type CategoryType = 'income' | 'expense';

export type Category = {
    id: number;
    name: string;
    type: CategoryType;
    transactionsCount: number;
};

export type EditableCategory = Pick<Category, 'id' | 'name' | 'type'>;
