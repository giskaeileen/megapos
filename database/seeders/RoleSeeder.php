<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Admin Role
        $adminRole = Role::create(['name' => 'Admin']);
        $adminPermissions = [
            'Create User', 'Read User', 'Update User', 'Delete User',
            'Create Permission', 'Read Permission', 'Update Permission', 'Delete Permission',
            'Create Role', 'Read Role', 'Update Role', 'Delete Role',
            'Create Role Permission', 'Read Role Permission', 'Update Role Permission', 'Delete Role Permission',
            'Read Store Registration', 'Update Store Registration',
            'Read Setting', 'Update Setting',
        ];
        $adminRole->givePermissionTo($adminPermissions);

        // Owner Role
        $ownerRole = Role::create(['name' => 'Owner']);
        $ownerPermissions = [
            'Create Store', 'Read Store', 'Update Store', 'Delete Store',
            'Create Employee', 'Read Employee', 'Update Employee', 'Delete Employee',
            'Read Setting Owner', 'Update Setting Owner',
            'Read Subscription', 'Update Subscription',
        ];
        $ownerRole->givePermissionTo($ownerPermissions);

        // Employee Role
        $employeeRole = Role::create(['name' => 'Employee']);
        $employeePermissions = [
            'Create Product', 'Read Product', 'Update Product', 'Delete Product',
            'Create Category', 'Read Category', 'Update Category', 'Delete Category',
            'Create POS', 'Read POS', 'Update POS', 'Delete POS',
            'Create Attribute', 'Read Attribute', 'Update Attribute', 'Delete Attribute',
            'Create Supplier', 'Read Supplier', 'Update Supplier', 'Delete Supplier',
            'Create Member', 'Read Member', 'Update Member', 'Delete Member',
            'Create Order', 'Read Order', 'Update Order', 'Delete Order',

            'Read Store', 'Read Employee',
        ];
        $employeeRole->givePermissionTo($employeePermissions);
    }
}