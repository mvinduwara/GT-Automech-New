<?php
use App\Http\Controllers\ExpenseCategoryController;
use App\Http\Controllers\ExpenseController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('dashboard/expense')->name('dashboard.expense.')->group(function () {
    Route::get('/', [ExpenseController::class, 'index'])->name('index');
    Route::get('/create', [ExpenseController::class, 'create'])->name('create');
    Route::post('/', [ExpenseController::class, 'store'])->name('store');
    Route::get('/{expense}/edit', [ExpenseController::class, 'edit'])->name('edit');
    Route::put('/{expense}', [ExpenseController::class, 'update'])->name('update');
    Route::delete('/{expense}', [ExpenseController::class, 'destroy'])->name('destroy');

    Route::get('/reports', [ExpenseController::class, 'report'])->name('reports');
    Route::get('/reports/pdf', [ExpenseController::class, 'downloadPdf'])->name('reports.pdf');

    // Expense Categories
    Route::prefix('categories')->name('categories.')->group(function () {
        Route::get('/', [ExpenseCategoryController::class, 'index'])->name('index');
        Route::post('/', [ExpenseCategoryController::class, 'store'])->name('store');
        Route::put('/{account}', [ExpenseCategoryController::class, 'update'])->name('update');
        Route::delete('/{account}', [ExpenseCategoryController::class, 'destroy'])->name('destroy');
    });
});
