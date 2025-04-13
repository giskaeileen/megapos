<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            // Users
            'Create User', 'Read User', 'Update User', 'Delete User',
            // Customers
            'Create Customer', 'Read Customer', 'Update Customer', 'Delete Customer',
            // Suppliers
            'Create Supplier', 'Read Supplier', 'Update Supplier', 'Delete Supplier',
            // Employees
            'Create Employee', 'Read Employee', 'Update Employee', 'Delete Employee',
            // Products
            'Create Product', 'Read Product', 'Update Product', 'Delete Product',
            // Categories
            'Create Category', 'Read Category', 'Update Category', 'Delete Category',
            // Permissions
            'Create Permission', 'Read Permission', 'Update Permission', 'Delete Permission',
            // Roles
            'Create Role', 'Read Role', 'Update Role', 'Delete Role',
            // Role Permissions
            'Create Role Permission', 'Read Role Permission', 'Update Role Permission', 'Delete Role Permission',
            // Stores
            'Create Store', 'Read Store', 'Update Store', 'Delete Store',
            // POS
            'Create POS', 'Read POS', 'Update POS', 'Delete POS',
            // Store Registration
            'Read Store Registration', 'Update Store Registration',
            // Settings
            'Read Setting', 'Update Setting', 'Read Setting Owner', 'Update Setting Owner',
            // Attributes
            'Create Attribute', 'Read Attribute', 'Update Attribute', 'Delete Attribute',
            // Subscriptions
            'Create Subscription', 'Read Subscription', 'Update Subscription', 'Delete Subscription',
            // Members
            'Create Member', 'Read Member', 'Update Member', 'Delete Member',
            // Orders
            'Create Order', 'Read Order', 'Update Order', 'Delete Order',
        ];

        foreach ($permissions as $permission) {
            Permission::updateOrCreate(['name' => $permission], ['name' => $permission]);
        }
    }
}