<?php

use App\Http\Controllers\Employee\EmployeeController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'is_admin'])->group(function () {
    Route::prefix('dashboard/employee')
        ->name('dashboard.employee.')
        ->group(function () {

            Route::get('/', [EmployeeController::class, 'index'])->name('index');
            Route::get('/create', [EmployeeController::class, 'create'])->name('create');
            Route::post('/store', [EmployeeController::class, 'store'])->name('store');
            Route::get('/{employee_id}/edit', [EmployeeController::class, 'edit'])->name('edit');
            Route::put('/{employee_id}', [EmployeeController::class, 'update'])->name('update'); 
        });
});