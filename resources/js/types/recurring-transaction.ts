import type {
    TransactionCategoryOption,
    TransactionType,
} from '@/types/transaction';

export type RecurringTransactionFrequency =
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly';

export type RecurringTransaction = {
    id: number;
    description: string;
    amount: string;
    type: TransactionType;
    frequency: RecurringTransactionFrequency;
    startDate: string;
    endDate: string | null;
    nextOccurrenceDate: string | null;
    category: Pick<TransactionCategoryOption, 'id' | 'name'>;
};

export type EditableRecurringTransaction = Omit<
    RecurringTransaction,
    'category' | 'nextOccurrenceDate'
> & {
    categoryId: number;
};
