<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{

    public function run(): void
    {
        User::create([
            'name' => 'Shehan Kaushalya',
            'email' => 'shehan@gmail.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'mobile' => '0774115263',
            'role' => 'admin',
            'status' => 'active',
        ]);

        User::create([
            'name' => 'Sanula Kariyapperuma',
            'email' => 'sanula@gmail.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'mobile' => '0774115264',
            'role' => 'cashier',
            'status' => 'active',
        ]);

        User::create([
            'name' => 'Janith Nimhara',
            'email' => 'janith@gmail.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'mobile' => '0774115265',
            'role' => 'admin',
            'status' => 'active',
        ]);

        User::create([
            'name' => 'Pasidu Jayasekara',
            'email' => 'pasidu@gmail.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'mobile' => '0774115266',
            'role' => 'service-manager',
            'status' => 'active',
        ]);

        User::create([
            'name' => 'Manilka Vinduwara',
            'email' => 'manilka@gmail.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'mobile' => '0774115267',
            'role' => 'service-manager',
            'status' => 'active',
        ]);
    }
}
