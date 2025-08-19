<?php

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('/dashboard/clear-cache', function () {
        Artisan::call('cache:clear');
        Artisan::call('config:clear');
        Artisan::call('route:clear');
        Artisan::call('view:clear');
        Artisan::call('config:cache');
        Artisan::call('route:cache');
        Artisan::call('view:cache');

        return Inertia::render('cache-clear');
        // return Inertia::render('cache-clear');;
    });
});


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
