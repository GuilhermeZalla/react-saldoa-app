export function formatMoneyInput(value: string): string {
    const digits = value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
    if (!digits) return '';
    const padded = digits.padStart(3, '0');
    return `${padded.slice(0, -2).replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${padded.slice(-2)}`;
}

export function moneyInputToDecimal(value: string): string {
    const digits = value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
    if (!digits) return '';
    const padded = digits.padStart(3, '0');
    return `${padded.slice(0, -2)}.${padded.slice(-2)}`;
}

export function decimalToMoneyInput(value: string): string {
    const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(value);
    return match
        ? formatMoneyInput(`${match[1]}${(match[2] ?? '').padEnd(2, '0')}`)
        : '';
}
