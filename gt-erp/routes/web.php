<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/css', function () {
    return Inertia::render('draft/index');
})->name('css');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
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
// require __DIR__ . '/customer.php';
