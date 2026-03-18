<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Reviews\CustomerReviewController;
use App\Http\Controllers\SmsTestController;
use App\Http\Controllers\Reviews\AdminReviewController;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\PurchaseOrder\PurchaseOrderController;
use App\Http\Controllers\GRN\GrnController;

Route::get('/', function () {
    return redirect('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/dashboard', [DashboardController::class, "index"])->name('dashboard');

    Route::get('/dashboard/clear-cache', function () {
        Artisan::call('cache:clear');
        Artisan::call('config:clear');
        Artisan::call('route:clear');
        Artisan::call('view:clear');
        Artisan::call('config:cache');
        Artisan::call('route:cache');
        Artisan::call('view:cache');

        return Inertia::render('cache-clear');
    });

    Route::get('/dashboard/run-migrations', function () {
        Artisan::call('migrate', [
            '--force' => true
        ]);

        return "Migrations executed successfully!";
    });

});

Route::middleware(['auth'])->group(function () {
    Route::get('/test-sms', [SmsTestController::class, 'showTestForm'])->name('sms.test.form');
    Route::post('/test-sms', [SmsTestController::class, 'sendTest'])->name('sms.test.send');
});

Route::get('/review/{token}', [CustomerReviewController::class, 'show'])->name('review.show');
Route::post('/review/{token}', [CustomerReviewController::class, 'store'])->name('review.store');

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard/reviews', [AdminReviewController::class, 'index'])->name('dashboard.reviews.index');
    Route::get('/dashboard/reviews/export-pdf', [AdminReviewController::class, 'exportPdf'])->name('dashboard.reviews.export-pdf');
    Route::post('/dashboard/reviews/{invoice}/manual', [AdminReviewController::class, 'storeManual'])->name('dashboard.reviews.manual.store');
});

Route::get('/dashboard/purchase-order/{id}/print', [PurchaseOrderController::class, 'print'])->name('dashboard.purchase-order.print');
Route::get('/dashboard/grn/{id}/print', [GrnController::class, 'print'])->name('dashboard.grn.print');
Route::get('/dashboard/grn/{id}', [GrnController::class, 'show'])->name('dashboard.grn.show');

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/stock.php';
require __DIR__ . '/purchase-order.php';
require __DIR__ . '/customer.php';
require __DIR__ . '/grn.php';
require __DIR__ . '/invoice.php';
require __DIR__ . '/petty-cash.php';
require __DIR__ . '/job-card.php';
require __DIR__ . '/user.php';
require __DIR__ . '/employee.php';
require __DIR__ . '/vehicle.php';
require __DIR__ . '/supplier.php';
require __DIR__ . '/reports.php';
require __DIR__ . '/vehicle-services.php';
require __DIR__ . '/job-card-charges.php';
require __DIR__ . '/insurance.php';
require __DIR__ . '/attendance.php';
require __DIR__ . '/expense.php';
require __DIR__ . '/accounts.php';
