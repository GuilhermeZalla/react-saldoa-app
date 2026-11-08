import { useState, type ComponentProps } from 'react';
import { Input } from '@/components/ui/input';
import {
    decimalToMoneyInput,
    formatMoneyInput,
    moneyInputToDecimal,
} from '@/lib/money';

type Props = Omit<
    ComponentProps<typeof Input>,
    'type' | 'value' | 'defaultValue' | 'onChange'
> & {
    defaultValue?: string;
};

export function MoneyInput({
    name = 'amount',
    defaultValue = '',
    ...props
}: Props) {
    const [value, setValue] = useState(() => decimalToMoneyInput(defaultValue));
    return (
        <>
            <Input
                {...props}
                type="text"
                inputMode="numeric"
                placeholder="0,00"
                value={value}
                onChange={(event) => {
                    const formatted = formatMoneyInput(event.target.value);
                    const amount = Number(moneyInputToDecimal(formatted));
                    event.target.setCustomValidity(
                        formatted && (amount <= 0 || amount > 9999999999.99)
                            ? 'Informe um valor entre R$ 0,01 e R$ 9.999.999.999,99.'
                            : '',
                    );
                    setValue(formatted);
                }}
            />
            <input
                type="hidden"
                name={name}
                value={moneyInputToDecimal(value)}
            />
        </>
    );
}
