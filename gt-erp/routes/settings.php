<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');
    Route::put('settings/password', [PasswordController::class, 'update'])->name('password.update');

    // System Settings
    Route::prefix('dashboard/settings')->name('dashboard.settings.')->group(function () {
        Route::get('/system', [\App\Http\Controllers\Settings\SystemSettingController::class, 'index'])->name('system.index');
        Route::patch('/system', [\App\Http\Controllers\Settings\SystemSettingController::class, 'update'])->name('system.update');
    });
});
