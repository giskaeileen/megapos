<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\User;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Admin User
        $admin = User::factory()->create([
            'name' => 'Admin',
            'username' => 'admin',
            'email' => 'admin@gmail.com',
        ]);

        // Call Seeders
        $this->call([
            PermissionSeeder::class,
            RoleSeeder::class,
            PlanSeeder::class,
            StoreRegistrationSeeder::class,
            SupplierSeeder::class,
            MemberSeeder::class,
            CategorySeeder::class,
            AttributeSeeder::class,
            ProductSeeder::class,
            OrderSeeder::class,
        ]);

        // Assign Admin Role to Admin User
        $admin->assignRole('Admin');

        // Insert Settings
        DB::table('settings')->insert([
            ['key' => 'mail_mailer', 'value' => 'smtp'],
            ['key' => 'mail_host', 'value' => 'smtp.gmail.com'],
            ['key' => 'mail_port', 'value' => '465'],
            ['key' => 'mail_username', 'value' => ''],
            ['key' => 'mail_password', 'value' => ''],
            ['key' => 'mail_encryption', 'value' => 'tls'],
            ['key' => 'mail_from_address', 'value' => ''],
            ['key' => 'mail_from_name', 'value' => 'MyApp'],

            ['key' => 'quota_transactions', 'value' => 1000],
            ['key' => 'quota_products', 'value' => 500],
            ['key' => 'quota_employees', 'value' => 5000],
            ['key' => 'quota_stores', 'value' => 50000],
        ]);
    }
}