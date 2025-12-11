<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FeeCategory;
use Illuminate\Http\Request;

class FeeCategoryController extends Controller
{
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => FeeCategory::all(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255|unique:fee_categories,name',
            'description' => 'nullable|string',
            'amount' => 'required|numeric|min:0',
            'is_active' => 'sometimes|boolean',
        ]);

        $feeCategory = FeeCategory::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Fee category created successfully',
            'data' => $feeCategory,
        ], 201);
    }

    public function show(FeeCategory $feeCategory)
    {
        return response()->json([
            'success' => true,
            'data' => $feeCategory,
        ]);
    }

    public function update(Request $request, FeeCategory $feeCategory)
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:255|unique:fee_categories,name,' . $feeCategory->id,
            'description' => 'nullable|string',
            'amount' => 'sometimes|numeric|min:0',
            'is_active' => 'sometimes|boolean',
        ]);

        $feeCategory->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Fee category updated successfully',
            'data' => $feeCategory,
        ]);
    }

    public function destroy(FeeCategory $feeCategory)
    {
        // Prevent deletion if there are fee structures using this category
        if ($feeCategory->feeStructures()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete fee category with associated fee structures',
            ], 422);
        }

        $feeCategory->delete();

        return response()->json([
            'success' => true,
            'message' => 'Fee category deleted successfully',
        ], 204);
    }
}
