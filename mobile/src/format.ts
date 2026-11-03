const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
});

export function formatCurrency(amount: string | number): string {
    const numericAmount = typeof amount === 'number' ? amount : Number(amount);

    return currencyFormatter.format(Number.isFinite(numericAmount) ? numericAmount : 0);
}

export function formatDate(date: string): string {
    const parsedDate = new Date(`${date}T12:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
        return date;
    }

    return new Intl.DateTimeFormat('pt-BR').format(parsedDate);
}

export function currentMonth(): string {
    const date = new Date();

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function currentDate(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export function amountForApi(amount: string): string {
    return amount.trim().replace(/\s/g, '').replace(',', '.');
}
