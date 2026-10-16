import type { CategoryType } from '@/types/category';

export type TransactionType = CategoryType;

export type TransactionCategoryOption = {
    id: number;
    name: string;
    type: TransactionType;
};

export type Transaction = {
    id: number;
    description: string;
    amount: string;
    type: TransactionType;
    date: string;
    formattedDate: string;
    category: Pick<TransactionCategoryOption, 'id' | 'name'>;
};

export type EditableTransaction = {
    id: number;
    description: string;
    amount: string;
    type: TransactionType;
    categoryId: number;
    date: string;
};

export type TransactionFilterType = 'all' | TransactionType;

export type TransactionFilters = {
    month: string;
    type: TransactionFilterType;
    category_id: string;
    search: string;
};

export type TransactionMonthNavigation = {
    current: string;
    previous: string;
    next: string;
    default: string;
};

export type TransactionSummary = {
    income: string;
    expense: string;
    balance: string;
};

export type PaginatedTransactions = {
    data: Transaction[];
    current_page: number;
    last_page: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    from: number | null;
    to: number | null;
    total: number;
};
