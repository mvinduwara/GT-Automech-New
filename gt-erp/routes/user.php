<?php

use App\Http\Controllers\JobCard\JobCardEmployeeController;
use App\Http\Controllers\User\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'is_admin'])->group(function () {
    Route::prefix('dashboard/user')
        ->name('dashboard.user.')
        ->group(function () {

            Route::get('/', [UserController::class, 'index'])->name('index');
            Route::get('/create', [UserController::class, 'create'])->name('create');
            Route::post('/', [UserController::class, 'store'])->name('store');
            Route::get('/{user}/edit', [UserController::class, 'edit'])->name('edit');
            Route::put('/{user}', [UserController::class, 'update'])->name('update');
            Route::delete('/{user}', [UserController::class, 'destroy'])->name('destroy');
        });
});

Route::middleware(['auth'])->group(function () {

    Route::get('api/employees/search', [JobCardEmployeeController::class, 'searchEmployees'])
        ->name('api.employees.search');
});
