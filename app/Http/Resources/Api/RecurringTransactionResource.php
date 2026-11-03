<?php

namespace App\Http\Resources\Api;

use App\Models\RecurringTransaction;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin RecurringTransaction */
class RecurringTransactionResource extends JsonResource
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
            'frequency' => (string) $this->frequency,
            'start_date' => $this->start_date->toDateString(),
            'end_date' => $this->end_date?->toDateString(),
            'next_occurrence_date' => $this->next_occurrence_date?->toDateString(),
            'category' => [
                'id' => (int) $this->category->id,
                'name' => (string) $this->category->name,
            ],
        ];
    }
}
