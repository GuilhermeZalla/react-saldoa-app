<?php

namespace App\Enums;

enum BudgetStatus: string
{
    case Ok = 'ok';
    case Warning = 'warning';
    case Exceeded = 'exceeded';

    /**
     * Determine the budget status from a percentage value.
     *
     * The percentage is evaluated without rounding: below 80% is ok,
     * from 80% up to (but not including) 100% is warning, and 100% or
     * more is exceeded. Rounding is only for display purposes.
     *
     * @param  float  $percentage  Percentage value (0 to 100+), not rounded.
     */
    public static function fromPercentage(float $percentage): self
    {
        if ($percentage >= 100.0) {
            return self::Exceeded;
        }

        if ($percentage >= 80.0) {
            return self::Warning;
        }

        return self::Ok;
    }
}
