<?php

namespace App\Http\Controllers\Api;

use App\Actions\ExportTransactionsCsv;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTransactionRequest;
use App\Http\Requests\UpdateTransactionRequest;
use App\Http\Resources\Api\TransactionResource;
use App\Models\Transaction;
use App\Queries\TransactionQuery;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TransactionController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request, TransactionQuery $transactionQuery): JsonResponse
    {
        $this->authorize('viewAny', Transaction::class);
        $filters = $transactionQuery->filtersFor($request, $request->user());
        $transactions = $transactionQuery->filteredTransactions($request->user(), $filters)
            ->with('category:id,name')
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->paginate(20)
            ->appends($filters);

        return TransactionResource::collection($transactions)->response();
    }

    public function store(StoreTransactionRequest $request): JsonResponse
    {
        $transaction = $request->user()->transactions()->create($request->validated());

        return (new TransactionResource($transaction->load('category:id,name')))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Transaction $transaction): TransactionResource
    {
        $this->authorize('view', $transaction);

        return new TransactionResource($transaction->load('category:id,name'));
    }

    public function update(UpdateTransactionRequest $request, Transaction $transaction): TransactionResource
    {
        $transaction->update($request->validated());

        return new TransactionResource($transaction->load('category:id,name'));
    }

    public function destroy(Transaction $transaction): JsonResponse
    {
        $this->authorize('delete', $transaction);
        $transaction->delete();

        return response()->json(status: 204);
    }

    public function restore(Transaction $transaction): TransactionResource
    {
        $this->authorize('restore', $transaction);
        $transaction->restore();

        return new TransactionResource($transaction->load('category:id,name'));
    }

    public function export(Request $request, TransactionQuery $transactionQuery, ExportTransactionsCsv $export): StreamedResponse
    {
        $this->authorize('viewAny', Transaction::class);
        $filters = $transactionQuery->filtersFor($request, $request->user());
        $transactions = $transactionQuery->filteredTransactions($request->user(), $filters)
            ->with('category:id,name')
            ->orderBy('date')
            ->orderBy('id');

        return $export->execute($transactions, 'lancamentos-'.$filters['month'].'.csv');
    }
}
