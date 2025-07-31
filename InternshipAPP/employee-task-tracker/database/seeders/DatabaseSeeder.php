<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        // Create test users
        \App\Models\User::create([
            'name' => 'Test User',
            'email' => 'deneme1@gmail.com',
            'password' => bcrypt('12345678'),
            'role' => 'employee',
        ]);

        \App\Models\User::create([
            'name' => 'Manager User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'manager',
        ]);

        \App\Models\User::create([
            'name' => 'Manager User',
            'email' => 'manager@example.com',
            'password' => bcrypt('password'),
            'role' => 'manager',
        ]);
    }
}
