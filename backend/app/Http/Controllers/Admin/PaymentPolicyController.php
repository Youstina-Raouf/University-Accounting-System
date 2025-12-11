<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentPolicy;
use Illuminate\Http\Request;

class PaymentPolicyController extends Controller
{
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => PaymentPolicy::all(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'policy_type' => 'required|in:deadline,penalty,installment,refund',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'value' => 'required|numeric|min:0',
            'is_active' => 'sometimes|boolean',
        ]);

        $policy = PaymentPolicy::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Payment policy created successfully',
            'data' => $policy,
        ], 201);
    }

    public function show(PaymentPolicy $paymentPolicy)
    {
        return response()->json([
            'success' => true,
            'data' => $paymentPolicy,
        ]);
    }

    public function update(Request $request, PaymentPolicy $paymentPolicy)
    {
        $data = $request->validate([
            'policy_type' => 'sometimes|in:deadline,penalty,installment,refund',
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'value' => 'sometimes|numeric|min:0',
            'is_active' => 'sometimes|boolean',
        ]);

        $paymentPolicy->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Payment policy updated successfully',
            'data' => $paymentPolicy,
        ]);
    }

    public function destroy(PaymentPolicy $paymentPolicy)
    {
        $paymentPolicy->delete();

        return response()->json([
            'success' => true,
            'message' => 'Payment policy deleted successfully',
        ], 204);
    }
}
