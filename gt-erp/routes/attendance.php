<?php

use App\Http\Controllers\AttendanceController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'is_admin'])->group(function () {
    Route::prefix('dashboard/attendance')
        ->name('dashboard.attendance.')
        ->group(function () {

            Route::get('/', [AttendanceController::class, 'index'])->name('index');
              Route::get('/reports', [AttendanceController::class, 'report'])->name('reports');
            Route::post('/import', [AttendanceController::class, 'import'])->name('import');
            Route::get('/export/pdf', [AttendanceController::class, 'exportPdf'])->name('export.pdf');
            Route::get('/export/excel', [AttendanceController::class, 'exportExcel'])->name('export.excel');
            Route::get('/employee/{employee_id}', [AttendanceController::class, 'employeeHistory'])->name('employee');
        });
});
