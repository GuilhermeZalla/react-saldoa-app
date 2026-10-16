export type BudgetStatus = 'ok' | 'warning' | 'exceeded';

export type Budget = {
    id: number;
    category_id: number;
    category_name: string;
    amount: string;
    spent: string;
    percentage: number;
    status: BudgetStatus;
};

export type BudgetCategoryOption = {
    id: number;
    name: string;
};
