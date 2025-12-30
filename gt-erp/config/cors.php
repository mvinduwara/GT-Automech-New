<?php

return [

    'paths' => [
        'api/*',
        'review/*',
        'sanctum/csrf-cookie'
    ],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'https://portal.gtdrive.lk',
        'https://gtdrive.lk',
    ],

    'allowed_headers' => [
        'Content-Type',
        'X-Requested-With',
        'Authorization',
        'Accept',
        'Origin',
        'X-XSRF-TOKEN',
        'X-Inertia',
        'X-Inertia-Version',
    ],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
