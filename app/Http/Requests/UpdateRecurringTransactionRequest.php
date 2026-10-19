<?php

namespace App\Http\Requests;

use App\Models\RecurringTransaction;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRecurringTransactionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $recurringTransaction = $this->route('recurringTransaction');

        return $recurringTransaction instanceof RecurringTransaction
            && ($this->user()?->can('update', $recurringTransaction) ?? false);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'description' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'gt:0', 'decimal:0,2', 'max:9999999999.99'],
            'type' => ['required', 'in:income,expense'],
            'category_id' => [
                'required',
                'integer',
                Rule::exists('categories', 'id')
                    ->where('user_id', $this->user()?->getAuthIdentifier())
                    ->where('type', $this->input('type')),
            ],
            'frequency' => ['required', Rule::in(['daily', 'weekly', 'monthly', 'yearly'])],
            'end_date' => [
                'nullable',
                'date_format:Y-m-d',
                'after_or_equal:'.$this->route('recurringTransaction')->start_date->format('Y-m-d'),
            ],
        ];
    }
}
