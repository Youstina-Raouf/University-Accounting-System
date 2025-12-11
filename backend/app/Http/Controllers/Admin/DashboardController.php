<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\RefundRequest;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        // Total revenue (sum of all payments)
        $totalRevenue = Payment::sum('amount');

        // Current month revenue
        $currentMonthRevenue = Payment::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('amount');

        // Total users by role
        $usersByRole = User::select('role', DB::raw('count(*) as count'))
            ->groupBy('role')
            ->pluck('count', 'role')
            ->toArray();

        // Recent payments (last 10)
        $recentPayments = Payment::with(['user', 'feeStructure.category'])
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'student_name' => $payment->user->name,
                    'amount' => $payment->amount,
                    'fee_category' => $payment->feeStructure->category->name,
                    'academic_year' => $payment->feeStructure->academic_year,
                    'paid_at' => $payment->created_at->format('Y-m-d H:i:s'),
                ];
            });

        // Pending refund requests
        $pendingRefunds = RefundRequest::with(['student', 'payment'])
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($refund) {
                return [
                    'id' => $refund->id,
                    'student_name' => $refund->student->name,
                    'amount' => $refund->amount,
                    'reason' => $refund->reason,
                    'requested_at' => $refund->created_at->format('Y-m-d H:i:s'),
                ];
            });

        // Revenue by month for the last 6 months
        $revenueByMonth = Payment::select(
                DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
                DB::raw('SUM(amount) as total')
            )
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->mapWithKeys(function ($item) {
                return [
                    Carbon::createFromFormat('Y-m', $item->month)->format('M Y') => $item->total
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'totals' => [
                    'revenue' => $totalRevenue,
                    'current_month_revenue' => $currentMonthRevenue,
                    'users' => $usersByRole,
                ],
                'recent_payments' => $recentPayments,
                'pending_refunds' => $pendingRefunds,
                'revenue_by_month' => $revenueByMonth,
            ],
        ]);
    }
}
