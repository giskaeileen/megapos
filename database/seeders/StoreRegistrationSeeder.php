<?php
namespace Database\Seeders;

use App\Models\Employee;
use Illuminate\Database\Seeder;
use App\Models\StoreRegistration;
use App\Models\User;
use App\Models\Store;
use Illuminate\Support\Facades\Hash;

class StoreRegistrationSeeder extends Seeder
{
    public function run()
    {
        //===========================
        // Owner dengan 1 toko
        //===========================
        $owner1 = User::create([
            'name' => 'John Doe',
            'email' => 'john.doe@example.com',
            'password' => Hash::make('password123'),
        ]);
        $owner1->assignRole('Owner');
        $owner1->assignRole('Employee');

        $store1 = Store::create([
            'name' => 'Toko A',
            'slug' => 'toko-a',
            'country' => 'Indonesia',
            'city' => 'Jakarta',
            'state' => 'DKI Jakarta',
            'zip' => '12345',
            'address' => 'Jl. Sudirman No. 1',
            'user_id' => $owner1->id,
        ]);

        StoreRegistration::create([
            'store_name' => 'Toko A',
            'slug' => 'toko-a',
            'country' => 'Indonesia',
            'city' => 'Jakarta',
            'state' => 'DKI Jakarta',
            'zip' => '12345',
            'street_address' => 'Jl. Sudirman No. 1',
            'owner_name' => 'John Doe',
            'owner_email' => 'john.doe@example.com',
            'owner_phone' => '081234567890',
            'status' => 'approved',
        ]);

        // Employee untuk Toko A
        $employee1 = User::create([
            'name' => 'Alice Johnson',
            'email' => 'alice.johnson@example.com',
            'password' => Hash::make('password123'),
        ]);
        $employee1->assignRole('Employee');

        Employee::create([
            'user_id' => $employee1->id,
            'phone' => '081234567893',
            'experience' => '2 tahun',
            'salary' => 5000000,
            'vacation' => '12 hari',
            'city' => 'Jakarta',
            'address' => 'Jl. Sudirman No. 10',
            'store_id' => $store1->id,
        ]);

        $employee2 = User::create([
            'name' => 'Bob Smith',
            'email' => 'bob.smith@example.com',
            'password' => Hash::make('password123'),
        ]);
        $employee2->assignRole('Employee');

        Employee::create([
            'user_id' => $employee2->id,
            'phone' => '081234567894',
            'experience' => '3 tahun',
            'salary' => 6000000,
            'vacation' => '10 hari',
            'city' => 'Jakarta',
            'address' => 'Jl. Thamrin No. 20',
            'store_id' => $store1->id,
        ]);


        //===========================
        // Owner dengan lebih dari 1 toko
        //===========================
        $owner2 = User::create([
            'name' => 'Jane Smith',
            'email' => 'jane.smith@example.com',
            'password' => Hash::make('password123'),
        ]);
        $owner2->assignRole('Owner');

        $store2 = Store::create([
            'name' => 'Toko B',
            'slug' => 'toko-b',
            'country' => 'Indonesia',
            'city' => 'Bandung',
            'state' => 'Jawa Barat',
            'zip' => '67890',
            'address' => 'Jl. Asia Afrika No. 2',
            'user_id' => $owner2->id,
        ]);

        $store3 = Store::create([
            'name' => 'Toko C',
            'slug' => 'toko-c',
            'country' => 'Indonesia',
            'city' => 'Surabaya',
            'state' => 'Jawa Timur',
            'zip' => '54321',
            'address' => 'Jl. Tunjungan No. 3',
            'user_id' => $owner2->id,
        ]);

        StoreRegistration::create([
            'store_name' => 'Toko B',
            'slug' => 'toko-b',
            'country' => 'Indonesia',
            'city' => 'Bandung',
            'state' => 'Jawa Barat',
            'zip' => '67890',
            'street_address' => 'Jl. Asia Afrika No. 2',
            'owner_name' => 'Jane Smith',
            'owner_email' => 'jane.smith@example.com',
            'owner_phone' => '081234567891',
            'status' => 'approved',
        ]);

        StoreRegistration::create([
            'store_name' => 'Toko C',
            'slug' => 'toko-c',
            'country' => 'Indonesia',
            'city' => 'Surabaya',
            'state' => 'Jawa Timur',
            'zip' => '54321',
            'street_address' => 'Jl. Tunjungan No. 3',
            'owner_name' => 'Jane Smith',
            'owner_email' => 'jane.smith@example.com',
            'owner_phone' => '081234567892',
            'status' => 'approved',
        ]);

        $employee3 = User::create([
            'name' => 'Charlie Brown',
            'email' => 'charlie.brown@example.com',
            'password' => Hash::make('password123'),
        ]);
        $employee3->assignRole('Employee');

        Employee::create([
            'user_id' => $employee3->id,
            'phone' => '081234567895',
            'experience' => '1 tahun',
            'salary' => 4500000,
            'vacation' => '15 hari',
            'city' => 'Bandung',
            'address' => 'Jl. Asia Afrika No. 30',
            'store_id' => $store2->id,
        ]);

        $employee4 = User::create([
            'name' => 'Diana Evans',
            'email' => 'diana.evans@example.com',
            'password' => Hash::make('password123'),
        ]);
        $employee4->assignRole('Employee');

        Employee::create([
            'user_id' => $employee4->id,
            'phone' => '081234567896',
            'experience' => '4 tahun',
            'salary' => 7000000,
            'vacation' => '8 hari',
            'city' => 'Bandung',
            'address' => 'Jl. Braga No. 40',
            'store_id' => $store2->id,
        ]);

        // Employee untuk Toko C
        $employee5 = User::create([
            'name' => 'Edward Harris',
            'email' => 'edward.harris@example.com',
            'password' => Hash::make('password123'),
        ]);
        $employee5->assignRole('Employee');

        Employee::create([
            'user_id' => $employee5->id,
            'phone' => '081234567897',
            'experience' => '5 tahun',
            'salary' => 8000000,
            'vacation' => '10 hari',
            'city' => 'Surabaya',
            'address' => 'Jl. Tunjungan No. 50',
            'store_id' => $store3->id,
        ]);

        $employee6 = User::create([
            'name' => 'Fiona Clark',
            'email' => 'fiona.clark@example.com',
            'password' => Hash::make('password123'),
        ]);
        $employee6->assignRole('Employee');

        Employee::create([
            'user_id' => $employee6->id,
            'phone' => '081234567898',
            'experience' => '2 tahun',
            'salary' => 5500000,
            'vacation' => '12 hari',
            'city' => 'Surabaya',
            'address' => 'Jl. Pemuda No. 60',
            'store_id' => $store3->id,
        ]);
    }
}