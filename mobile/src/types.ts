export type User = {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
};

export type Session = {
    accessToken: string;
    apiUrl: string;
    expiresAt: string;
    isDemo: boolean;
    user: User;
};

export type Category = {
    id: number;
    name: string;
    type: 'income' | 'expense';
    transactions_count?: number;
};

export type Transaction = {
    id: number;
    description: string;
    amount: string;
    type: 'income' | 'expense';
    date: string;
    category: { id: number; name: string };
};

export type Budget = {
    id: number;
    category_id: number;
    category_name: string;
    amount: string;
    spent: string;
    percentage: number;
    status: 'ok' | 'warning' | 'exceeded';
};

export type RecurringTransaction = {
    id: number;
    description: string;
    amount: string;
    type: 'income' | 'expense';
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    start_date: string;
    end_date: string | null;
    next_occurrence_date: string | null;
    category: { id: number; name: string };
};

export type Dashboard = {
    filters: { month: string };
    monthNavigation: { label: string };
    summary: {
        overallBalance: string;
        monthlyIncome: string;
        monthlyExpense: string;
        monthlyBalance: string;
    };
    expensesByCategory: { id: number; name: string; total: string }[];
    monthlyTrend: { month: string; label: string; income: string; expense: string }[];
    recentTransactions: {
        id: number;
        description: string;
        amount: string;
        type: 'income' | 'expense';
        date: string;
        formattedDate: string;
        category: string;
    }[];
    budgetAlerts: { category_name: string; percentage: number; status: string }[];
    hasTransactionsInMonth: boolean;
    hasTransactionsInChartRange: boolean;
    hasBudgets: boolean;
};

export type ApiErrorPayload = {
    error?: {
        code?: string;
        message?: string;
        details?: Record<string, string[]>;
    };
};
