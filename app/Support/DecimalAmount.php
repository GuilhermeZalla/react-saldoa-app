<?php

namespace App\Support;

use InvalidArgumentException;

class DecimalAmount
{
    public static function format(mixed $amount): string
    {
        $value = trim((string) $amount);

        if (preg_match('/^(-?)(\d+)(?:\.(\d+))?$/', $value, $matches) !== 1) {
            throw new InvalidArgumentException('The amount must be a decimal numeric value.');
        }

        $whole = ltrim($matches[2], '0');
        $whole = $whole === '' ? '0' : $whole;
        $fraction = str_pad($matches[3] ?? '', 3, '0');
        $minorUnits = ((int) $whole * 100) + (int) substr($fraction, 0, 2);

        if ((int) $fraction[2] >= 5) {
            $minorUnits++;
        }

        $formatted = intdiv($minorUnits, 100).'.'.str_pad((string) ($minorUnits % 100), 2, '0', STR_PAD_LEFT);

        return $matches[1] === '-' && $minorUnits !== 0 ? '-'.$formatted : $formatted;
    }

    public static function minorUnits(mixed $amount): int
    {
        $formattedAmount = self::format($amount);
        $digits = (int) str_replace('.', '', ltrim($formattedAmount, '-'));

        return str_starts_with($formattedAmount, '-') ? -$digits : $digits;
    }
}
