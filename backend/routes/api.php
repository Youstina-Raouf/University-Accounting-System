<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::prefix('auth')->group(function () {
    Route::post('register', [\App\Http\Controllers\AuthController::class, 'register']);
    Route::post('login', [\App\Http\Controllers\AuthController::class, 'login']);
    Route::post('logout', [\App\Http\Controllers\AuthController::class, 'logout'])->middleware('auth');
});

Route::middleware('auth')->group(function () {
    // Profile CRUD
    Route::get('profile', [\App\Http\Controllers\ProfileController::class, 'show']);
    Route::put('profile', [\App\Http\Controllers\ProfileController::class, 'update']);
    Route::delete('profile', [\App\Http\Controllers\ProfileController::class, 'destroy']);

    // Admin
    Route::middleware('can:isAdmin')->prefix('admin')->group(function () {
        Route::apiResource('users', \App\Http\Controllers\Admin\UserController::class);
        Route::apiResource('fee-categories', \App\Http\Controllers\Admin\FeeCategoryController::class);
        Route::apiResource('fee-structures', \App\Http\Controllers\Admin\FeeStructureController::class);
        Route::apiResource('payment-policies', \App\Http\Controllers\Admin\PaymentPolicyController::class);
        Route::get('dashboard', [\App\Http\Controllers\Admin\DashboardController::class, 'index']);
    });

    // Accounting
    Route::middleware('can:isAccounting')->prefix('accounting')->group(function () {
        Route::get('students', [\App\Http\Controllers\AccountingController::class, 'listStudents']);
        Route::get('students/{id}/summary', [\App\Http\Controllers\AccountingController::class, 'studentSummary']);
        Route::post('students/{id}/payments', [\App\Http\Controllers\AccountingController::class, 'processPayment']);
    });

    // Student
    Route::middleware('can:isStudent')->prefix('student')->group(function () {
        Route::get('fees', [\App\Http\Controllers\StudentController::class, 'fees']);
        Route::get('payments', [\App\Http\Controllers\StudentController::class, 'payments']);
        Route::post('payments', [\App\Http\Controllers\StudentController::class, 'makePayment']);
        Route::post('refunds', [\App\Http\Controllers\StudentController::class, 'requestRefund']);
    });
});
