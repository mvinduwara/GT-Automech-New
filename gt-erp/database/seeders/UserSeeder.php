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
            'name' => 'C.D Kuruppu',
            'email' => 'cdkuruppu78@gmail.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'mobile' => '0774098580',
            'role' => 'admin',
            'status' => 'active',
        ]);
        User::create([
            'name' => 'Kumudu Kariyapperuma',
            'email' => 'kumuisha7@gmail.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'mobile' => '0742120450',
            'role' => 'service-manager',
            'status' => 'active',
        ]);
    }
}
