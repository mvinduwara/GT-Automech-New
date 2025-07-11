<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    Route::get('products', function () {
        return Inertia::render('products');
    })->name('products');
    Route::get('users', function () {
        return Inertia::render('users');
    })->name('users');
    Route::get('pasindu', function () {
        return Inertia::render('pasindu');
    })->name('pasindu');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
