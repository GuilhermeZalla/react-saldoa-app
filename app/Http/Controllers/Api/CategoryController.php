<?php

namespace App\Http\Controllers\Api;

use App\Actions\DeleteCategory;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Http\Resources\Api\CategoryResource;
use App\Models\Category;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Category::class);
        $categories = $request->user()->categories()
            ->withCount('transactions')
            ->orderBy('name')
            ->get();

        return CategoryResource::collection($categories)->response();
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $category = $request->user()->categories()->create($request->validated());

        return (new CategoryResource($category))->response()->setStatusCode(201);
    }

    public function show(Category $category): CategoryResource
    {
        $this->authorize('view', $category);

        return new CategoryResource($category->loadCount('transactions'));
    }

    public function update(UpdateCategoryRequest $request, Category $category): CategoryResource
    {
        $category->update($request->validated());

        return new CategoryResource($category);
    }

    public function destroy(Category $category, DeleteCategory $deleteCategory): JsonResponse
    {
        $this->authorize('delete', $category);

        if (! $deleteCategory->execute($category)) {
            return response()->json([
                'error' => [
                    'code' => 'category_in_use',
                    'message' => 'Não é possível excluir uma categoria que possui lançamentos ativos ou recorrências.',
                    'details' => null,
                ],
            ], 409);
        }

        return response()->json(status: 204);
    }
}
