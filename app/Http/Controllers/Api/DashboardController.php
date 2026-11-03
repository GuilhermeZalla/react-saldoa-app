<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Services\DashboardDataService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    use AuthorizesRequests;

    public function __invoke(Request $request, DashboardDataService $dashboardData): JsonResponse
    {
        $this->authorize('viewAny', Transaction::class);
        $month = $dashboardData->normalizeMonth($request->query('month'));

        return response()->json([
            'data' => $dashboardData->forMonth($request->user(), $month),
        ]);
    }
}
