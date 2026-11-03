<?php

namespace App\Http\Controllers\Api;

use App\Actions\DeleteUserAccount;
use App\Actions\ExportUserData;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\DeleteAccountRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AccountController extends Controller
{
    public function export(Request $request, ExportUserData $exportUserData): JsonResponse
    {
        return response()->json([
            'data' => $exportUserData->execute($request->user()),
        ]);
    }

    public function destroy(DeleteAccountRequest $request, DeleteUserAccount $deleteUserAccount): JsonResponse
    {
        $deleteUserAccount->execute($request->user());

        return response()->json(['message' => 'A conta e os dados associados foram excluídos.']);
    }
}
