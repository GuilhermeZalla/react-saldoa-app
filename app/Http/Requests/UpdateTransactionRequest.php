<?php

namespace App\Http\Requests;

use App\Models\Transaction;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTransactionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $transaction = $this->route('transaction');

        return $transaction instanceof Transaction
            && ($this->user()?->can('update', $transaction) ?? false);
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
            'date' => ['required', 'date'],
        ];
    }

    /**
     * Get the validation messages for the request.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'description.required' => 'Informe a descrição do lançamento.',
            'description.string' => 'A descrição deve ser um texto.',
            'description.max' => 'A descrição deve ter no máximo :max caracteres.',
            'amount.required' => 'Informe o valor do lançamento.',
            'amount.numeric' => 'Informe um valor numérico.',
            'amount.gt' => 'O valor deve ser maior que zero.',
            'amount.decimal' => 'Informe um valor com até duas casas decimais.',
            'amount.max' => 'O valor informado é maior do que o permitido.',
            'type.required' => 'Selecione receita ou despesa.',
            'type.in' => 'Selecione receita ou despesa.',
            'category_id.required' => 'Selecione uma categoria.',
            'category_id.integer' => 'Selecione uma categoria válida.',
            'category_id.exists' => 'Selecione uma categoria sua do mesmo tipo do lançamento.',
            'date.required' => 'Informe a data do lançamento.',
            'date.date' => 'Informe uma data válida.',
        ];
    }
}
