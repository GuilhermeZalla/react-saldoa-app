<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRecurringTransactionRequest;
use App\Http\Requests\UpdateRecurringTransactionRequest;
use App\Http\Resources\Api\RecurringTransactionResource;
use App\Models\RecurringTransaction;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RecurringTransactionController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', RecurringTransaction::class);
        $recurringTransactions = $request->user()->recurringTransactions()
            ->with('category:id,name')
            ->orderByRaw('next_occurrence_date IS NULL')
            ->orderBy('next_occurrence_date')
            ->orderBy('id')
            ->paginate(20);

        return RecurringTransactionResource::collection($recurringTransactions)->response();
    }

    public function store(StoreRecurringTransactionRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $recurringTransaction = $request->user()->recurringTransactions()->create([
            ...$validated,
            'next_occurrence_date' => $validated['start_date'],
        ]);

        return (new RecurringTransactionResource($recurringTransaction->load('category:id,name')))
            ->response()
            ->setStatusCode(201);
    }

    public function show(RecurringTransaction $recurringTransaction): RecurringTransactionResource
    {
        $this->authorize('view', $recurringTransaction);

        return new RecurringTransactionResource($recurringTransaction->load('category:id,name'));
    }

    public function update(
        UpdateRecurringTransactionRequest $request,
        RecurringTransaction $recurringTransaction,
    ): RecurringTransactionResource {
        $recurringTransaction->update($request->validated());

        return new RecurringTransactionResource($recurringTransaction->load('category:id,name'));
    }

    public function destroy(RecurringTransaction $recurringTransaction): JsonResponse
    {
        $this->authorize('delete', $recurringTransaction);
        $recurringTransaction->delete();

        return response()->json(status: 204);
    }
}
