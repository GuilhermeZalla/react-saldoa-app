import { getLocale } from './i18n';

export function formatCurrency(amount: string | number): string {
    const numericAmount = typeof amount === 'number' ? amount : Number(amount);

    return new Intl.NumberFormat(getLocale(), {
        style: 'currency',
        currency: 'BRL',
    }).format(Number.isFinite(numericAmount) ? numericAmount : 0);
}

export function formatDate(date: string): string {
    const parsedDate = new Date(`${date}T12:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
        return date;
    }

    return new Intl.DateTimeFormat(getLocale(), {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(parsedDate);
}

export function formatDateForInput(date: string): string {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(date);

    return match ? `${match[3]}/${match[2]}/${match[1]}` : date;
}

export function dateForApi(value: string): string | null {
    const normalizedValue = value.trim();
    const brazilianDate = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(normalizedValue);
    const isoDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalizedValue);
    const year = Number(brazilianDate?.[3] ?? isoDate?.[1]);
    const month = Number(brazilianDate?.[2] ?? isoDate?.[2]);
    const day = Number(brazilianDate?.[1] ?? isoDate?.[3]);

    if (!brazilianDate && !isoDate) {
        return null;
    }

    const parsedDate = new Date(0);
    parsedDate.setUTCFullYear(year, month - 1, day);

    if (
        parsedDate.getUTCFullYear() !== year ||
        parsedDate.getUTCMonth() !== month - 1 ||
        parsedDate.getUTCDate() !== day
    ) {
        return null;
    }

    return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
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
