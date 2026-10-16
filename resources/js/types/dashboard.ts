export type DashboardSummary = {
    overallBalance: string;
    monthlyIncome: string;
    monthlyExpense: string;
    monthlyBalance: string;
};

export type DashboardMonthNavigation = {
    current: string;
    previous: string;
    next: string;
    label: string;
};

export type DashboardExpenseCategory = {
    id: number;
    name: string;
    value: number;
    total: string;
};

export type DashboardMonthlyTotal = {
    month: string;
    label: string;
    income: number;
    expense: number;
};

export type DashboardRecentTransaction = {
    id: number;
    description: string;
    amount: string;
    type: 'income' | 'expense';
    date: string;
    formattedDate: string;
    category: string;
};
