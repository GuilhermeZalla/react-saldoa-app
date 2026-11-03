<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Services\DashboardDataService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private DashboardDataService $dashboardData) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Transaction::class);

        $month = $this->dashboardData->normalizeMonth($request->query('month'));

        return Inertia::render('dashboard', $this->dashboardData->forMonth($request->user(), $month));
    }
}
