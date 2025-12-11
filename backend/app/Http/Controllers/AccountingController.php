<?php

namespace App\Http\Controllers;

use App\Models\FeeStructure;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AccountingController extends Controller
{
    /**
     * Get a list of all students with their basic info and outstanding balance.
     */
    public function listStudents(): JsonResponse
    {
        $students = User::where('role', 'student')
            ->withCount(['payments as total_payments' => function ($query) {
                $query->select(DB::raw('COALESCE(SUM(amount), 0)'));
            }])
            ->get()
            ->map(function ($student) {
                $totalFees = $this->calculateTotalFeesForStudent($student->id);
                $totalPaid = $student->total_payments;
                $outstanding = $totalFees - $totalPaid;

                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'email' => $student->email,
                    'total_fees' => $totalFees,
                    'total_paid' => $totalPaid,
                    'outstanding_balance' => $outstanding,
                    'is_active' => $student->is_active,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $students,
        ]);
    }

    /**
     * Get detailed summary for a specific student.
     */
    public function studentSummary($id): JsonResponse
    {
        $student = User::findOrFail($id);
        
        if ($student->role !== 'student') {
            return response()->json([
                'success' => false,
                'message' => 'The specified user is not a student.',
            ], 422);
        }

        // Get all fee structures with payments made by this student
        $feeStructures = FeeStructure::with(['category', 'payments' => function ($query) use ($student) {
            $query->where('user_id', $student->id);
        }])->get();

        $feeDetails = $feeStructures->map(function ($feeStructure) use ($student) {
            $paidAmount = $feeStructure->payments->sum('amount');
            $balance = $feeStructure->amount - $paidAmount;

            return [
                'fee_structure_id' => $feeStructure->id,
                'category' => $feeStructure->category->name,
                'academic_year' => $feeStructure->academic_year,
                'due_date' => $feeStructure->due_date,
                'total_amount' => $feeStructure->amount,
                'paid_amount' => $paidAmount,
                'balance' => $balance,
                'is_paid' => $balance <= 0,
            ];
        });

        $totalFees = $feeStructures->sum('amount');
        $totalPaid = $student->payments()->sum('amount');
        $outstandingBalance = $totalFees - $totalPaid;

        return response()->json([
            'success' => true,
            'data' => [
                'student' => [
                    'id' => $student->id,
                    'name' => $student->name,
                    'email' => $student->email,
                    'is_active' => $student->is_active,
                ],
                'total_fees' => $totalFees,
                'total_paid' => $totalPaid,
                'outstanding_balance' => $outstandingBalance,
                'fee_details' => $feeDetails,
                'payment_history' => $student->payments()
                    ->with('feeStructure.category')
                    ->orderBy('created_at', 'desc')
                    ->get()
                    ->map(function ($payment) {
                        return [
                            'id' => $payment->id,
                            'amount' => $payment->amount,
                            'method' => $payment->method,
                            'fee_category' => $payment->feeStructure->category->name,
                            'academic_year' => $payment->feeStructure->academic_year,
                            'paid_at' => $payment->created_at->format('Y-m-d H:i:s'),
                        ];
                    }),
            ],
        ]);
    }

    /**
     * Process a payment for a student.
     */
    public function processPayment(Request $request, $studentId): JsonResponse
    {
        $student = User::findOrFail($studentId);
        
        if ($student->role !== 'student') {
            return response()->json([
                'success' => false,
                'message' => 'The specified user is not a student.',
            ], 422);
        }

        $data = $request->validate([
            'fee_structure_id' => 'required|exists:fee_structures,id',
            'amount' => 'required|numeric|min:0.01',
            'method' => 'required|string|in:Online,Manual,Bank Transfer,Other',
            'notes' => 'nullable|string',
        ]);

        $feeStructure = FeeStructure::findOrFail($data['fee_structure_id']);
        
        // Check if payment exceeds the fee amount (optional)
        $totalPaid = $student->payments()
            ->where('fee_structure_id', $feeStructure->id)
            ->sum('amount');
            
        $remainingBalance = $feeStructure->amount - $totalPaid;
        
        if ($data['amount'] > $remainingBalance) {
            return response()->json([
                'success' => false,
                'message' => "Payment amount exceeds the remaining balance of {$remainingBalance}.",
            ], 422);
        }

        // Create the payment
        $payment = $student->payments()->create([
            'fee_structure_id' => $feeStructure->id,
            'amount' => $data['amount'],
            'method' => $data['method'],
            'notes' => $data['notes'] ?? null,
            'paid_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Payment processed successfully.',
            'data' => [
                'payment' => $payment,
                'remaining_balance' => $remainingBalance - $data['amount'],
            ],
        ], 201);
    }

    /**
     * Helper method to calculate total fees for a student.
     */
    private function calculateTotalFeesForStudent($studentId): float
    {
        return FeeStructure::where('is_active', true)
            ->sum('amount'); // This assumes all students pay the same fees
            
        // If fees vary by student (e.g., based on enrollment), adjust the query accordingly
    }
}
