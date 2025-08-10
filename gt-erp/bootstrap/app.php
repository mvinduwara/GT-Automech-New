<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

         $middleware->alias([
            'is_cashier' => \App\Http\Middleware\IsCashier::class,
            'is_admin' => \App\Http\Middleware\IsAdmin::class,
            'is_service_manager' => \App\Http\Middleware\IsServiceManager::class,
            'is_admin_or_cashier' => \App\Http\Middleware\IsAdminOrCashier::class,
            'is_service_manager_or_cashier' => \App\Http\Middleware\IsCashierOrServiceManager::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
