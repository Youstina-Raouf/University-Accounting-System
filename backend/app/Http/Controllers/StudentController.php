<?php

namespace App\Http\Controllers;

use App\Models\FeeStructure;
use App\Models\Payment;
use App\Models\RefundRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudentController extends Controller
{
    /**
     * Get the list of fees for the authenticated student.
     */
    public function fees(Request $request): JsonResponse
    {
        $student = $request->user();
        
        $feeStructures = FeeStructure::where('is_active', true)
            ->with(['category', 'payments' => function ($query) use ($student) {
                $query->where('user_id', $student->id);
            }])
            ->get()
            ->map(function ($feeStructure) use ($student) {
                $paidAmount = $feeStructure->payments->sum('amount');
                $balance = $feeStructure->amount - $paidAmount;
                
                return [
                    'id' => $feeStructure->id,
                    'category' => $feeStructure->category->name,
                    'description' => $feeStructure->category->description,
                    'academic_year' => $feeStructure->academic_year,
                    'due_date' => $feeStructure->due_date,
                    'total_amount' => $feeStructure->amount,
                    'paid_amount' => $paidAmount,
                    'balance' => $balance,
                    'is_paid' => $balance <= 0,
                    'status' => $balance <= 0 ? 'Paid' : ($paidAmount > 0 ? 'Partial' : 'Unpaid'),
                ];
            });

        $totalFees = $feeStructures->sum('total_amount');
        $totalPaid = $feeStructures->sum('paid_amount');
        $totalOutstanding = $feeStructures->sum('balance');

        return response()->json([
            'success' => true,
            'data' => [
                'fees' => $feeStructures,
                'summary' => [
                    'total_fees' => $totalFees,
                    'total_paid' => $totalPaid,
                    'total_outstanding' => $totalOutstanding,
                ],
            ],
        ]);
    }

    /**
     * Get the payment history for the authenticated student.
     */
    public function payments(Request $request): JsonResponse
    {
        $student = $request->user();
        
        $payments = $student->payments()
            ->with('feeStructure.category')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'transaction_id' => 'TXN-' . str_pad($payment->id, 6, '0', STR_PAD_LEFT),
                    'amount' => $payment->amount,
                    'fee_category' => $payment->feeStructure->category->name,
                    'academic_year' => $payment->feeStructure->academic_year,
                    'method' => $payment->method,
                    'status' => 'completed', // Assuming all recorded payments are completed
                    'paid_at' => $payment->created_at->format('Y-m-d H:i:s'),
                    'receipt_url' => route('receipt.show', $payment->id), // You'll need to implement this route
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $payments,
        ]);
    }

    /**
     * Make a payment for the authenticated student.
     */
    public function makePayment(Request $request): JsonResponse
    {
        $student = $request->user();
        
        $data = $request->validate([
            'fee_structure_id' => 'required|exists:fee_structures,id',
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|string|in:credit_card,debit_card,bank_transfer,other',
            'transaction_reference' => 'nullable|string|max:255',
        ]);

        $feeStructure = FeeStructure::findOrFail($data['fee_structure_id']);
        
        // Check if payment is needed (balance > 0)
        $totalPaid = $student->payments()
            ->where('fee_structure_id', $feeStructure->id)
            ->sum('amount');
            
        $remainingBalance = $feeStructure->amount - $totalPaid;
        
        if ($remainingBalance <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'This fee has already been fully paid.',
            ], 422);
        }
        
        if ($data['amount'] > $remainingBalance) {
            return response()->json([
                'success' => false,
                'message' => "Payment amount exceeds the remaining balance of {$remainingBalance}.",
            ], 422);
        }

        // In a real app, you would integrate with a payment gateway here
        // For now, we'll just record the payment
        
        $payment = $student->payments()->create([
            'fee_structure_id' => $feeStructure->id,
            'amount' => $data['amount'],
            'method' => $data['payment_method'],
            'transaction_reference' => $data['transaction_reference'] ?? null,
            'status' => 'completed',
            'paid_at' => now(),
        ]);

        // Update any related records or send notifications as needed
        // $this->sendPaymentConfirmation($student, $payment);

        return response()->json([
            'success' => true,
            'message' => 'Payment processed successfully.',
            'data' => [
                'payment' => $payment,
                'receipt_number' => 'RCPT-' . str_pad($payment->id, 6, '0', STR_PAD_LEFT),
                'remaining_balance' => $remainingBalance - $data['amount'],
            ],
        ], 201);
    }

    /**
     * Request a refund for a payment.
     */
    public function requestRefund(Request $request): JsonResponse
    {
        $student = $request->user();
        
        $data = $request->validate([
            'payment_id' => 'required|exists:payments,id,user_id,' . $student->id,
            'amount' => 'required|numeric|min:0.01',
            'reason' => 'required|string|max:1000',
            'bank_details' => 'required_if:refund_method,bank_transfer|array',
            'bank_details.account_holder' => 'required_if:refund_method,bank_transfer|string|max:255',
            'bank_details.account_number' => 'required_if:refund_method,bank_transfer|string|max:50',
            'bank_details.bank_name' => 'required_if:refund_method,bank_transfer|string|max:255',
            'refund_method' => 'required|in:bank_transfer,credit_original_payment,other',
        ]);

        $payment = Payment::findOrFail($data['payment_id']);
        
        // Check if refund amount is valid
        if ($data['amount'] > $payment->amount) {
            return response()->json([
                'success' => false,
                'message' => 'Refund amount cannot exceed the original payment amount.',
            ], 422);
        }
        
        // Check if there's an existing pending refund for this payment
        $existingRefund = RefundRequest::where('payment_id', $payment->id)
            ->whereIn('status', ['pending', 'approved'])
            ->exists();
            
        if ($existingRefund) {
            return response()->json([
                'success' => false,
                'message' => 'A refund request for this payment is already in progress.',
            ], 422);
        }

        // Create the refund request
        $refundRequest = RefundRequest::create([
            'payment_id' => $payment->id,
            'student_id' => $student->id,
            'amount' => $data['amount'],
            'reason' => $data['reason'],
            'status' => 'pending',
            'refund_method' => $data['refund_method'],
            'bank_details' => $data['refund_method'] === 'bank_transfer' ? $data['bank_details'] : null,
        ]);

        // Notify admin/accounting staff (you'll need to implement this)
        // $this->notifyStaffAboutRefundRequest($refundRequest);

        return response()->json([
            'success' => true,
            'message' => 'Refund request submitted successfully. You will be notified once it is processed.',
            'data' => [
                'refund_request' => $refundRequest,
                'reference_number' => 'REF-' . str_pad($refundRequest->id, 6, '0', STR_PAD_LEFT),
            ],
        ], 201);
    }
}
