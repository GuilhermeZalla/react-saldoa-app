<?php

namespace App\Http\Resources\Api;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Transaction */
class TransactionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (int) $this->id,
            'description' => (string) $this->description,
            'amount' => (string) $this->amount,
            'type' => (string) $this->type,
            'date' => $this->date->toDateString(),
            'category' => [
                'id' => (int) $this->category->id,
                'name' => (string) $this->category->name,
            ],
            'recurring_transaction_id' => $this->recurring_transaction_id === null
                ? null
                : (int) $this->recurring_transaction_id,
        ];
    }
}
