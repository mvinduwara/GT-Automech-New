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
            'email' => 'shehankmusic@gmail.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'mobile' => '0701727156',
            'role' => 'admin',
            'status' => 'active',
        ]);

        User::create([
            'name' => 'Sanula Kariyapperuma',
            'email' => 'contact.sanula@gmail.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'mobile' => '0762540292',
            'role' => 'cashier',
            'status' => 'active',
        ]);

        User::create([
            'name' => 'Janith Nimhara',
            'email' => 'janith.codefiline@gmail.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'mobile' => '0774778678',
            'role' => 'admin',
            'status' => 'active',
        ]);

        User::create([
            'name' => 'Pasidu Jayasekara',
            'email' => 'pasindu.codefiline@gmail.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'mobile' => '0767037938',
            'role' => 'service-manager',
            'status' => 'active',
        ]);

        User::create([
            'name' => 'Manilka Vinduwara',
            'email' => 'manilka.codefiline@gmail.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'mobile' => '0712739342',
            'role' => 'service-manager',
            'status' => 'active',
        ]);
    }
}
