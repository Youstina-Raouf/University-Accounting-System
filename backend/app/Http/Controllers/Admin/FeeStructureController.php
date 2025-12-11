<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FeeCategory;
use App\Models\FeeStructure;
use Illuminate\Http\Request;

class FeeStructureController extends Controller
{
    public function index()
    {
        $feeStructures = FeeStructure::with('category')->get();
        
        return response()->json([
            'success' => true,
            'data' => $feeStructures,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'fee_category_id' => 'required|exists:fee_categories,id',
            'academic_year' => 'required|string|max:20',
            'amount' => 'required|numeric|min:0',
            'due_date' => 'required|date',
            'is_active' => 'sometimes|boolean',
        ]);

        // Check if fee structure already exists for this category and academic year
        $existing = FeeStructure::where('fee_category_id', $data['fee_category_id'])
            ->where('academic_year', $data['academic_year'])
            ->exists();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'A fee structure already exists for this category and academic year',
            ], 422);
        }

        $feeStructure = FeeStructure::create($data);
        $feeStructure->load('category');

        return response()->json([
            'success' => true,
            'message' => 'Fee structure created successfully',
            'data' => $feeStructure,
        ], 201);
    }

    public function show(FeeStructure $feeStructure)
    {
        $feeStructure->load('category');
        
        return response()->json([
            'success' => true,
            'data' => $feeStructure,
        ]);
    }

    public function update(Request $request, FeeStructure $feeStructure)
    {
        $data = $request->validate([
            'fee_category_id' => 'sometimes|exists:fee_categories,id',
            'academic_year' => 'sometimes|string|max:20',
            'amount' => 'sometimes|numeric|min:0',
            'due_date' => 'sometimes|date',
            'is_active' => 'sometimes|boolean',
        ]);

        // Check for duplicate fee structure if academic_year or category is being updated
        if (isset($data['academic_year']) || isset($data['fee_category_id'])) {
            $existing = FeeStructure::where('fee_category_id', $data['fee_category_id'] ?? $feeStructure->fee_category_id)
                ->where('academic_year', $data['academic_year'] ?? $feeStructure->academic_year)
                ->where('id', '!=', $feeStructure->id)
                ->exists();

            if ($existing) {
                return response()->json([
                    'success' => false,
                    'message' => 'A fee structure already exists for this category and academic year',
                ], 422);
            }
        }

        $feeStructure->update($data);
        $feeStructure->load('category');

        return response()->json([
            'success' => true,
            'message' => 'Fee structure updated successfully',
            'data' => $feeStructure,
        ]);
    }

    public function destroy(FeeStructure $feeStructure)
    {
        // Prevent deletion if there are payments using this fee structure
        if ($feeStructure->payments()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete fee structure with associated payments',
            ], 422);
        }

        $feeStructure->delete();

        return response()->json([
            'success' => true,
            'message' => 'Fee structure deleted successfully',
        ], 204);
    }
}
