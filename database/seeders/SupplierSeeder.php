<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Supplier;
use App\Models\Store;

class SupplierSeeder extends Seeder
{
    public function run()
    {
        // Ambil store berdasarkan slug
        $storeA = Store::where('slug', 'toko-a')->first();
        $storeB = Store::where('slug', 'toko-b')->first();
        $storeC = Store::where('slug', 'toko-c')->first();

        // Supplier untuk Toko A
        Supplier::create([
            'name' => 'Supplier A1',
            'email' => 'supplier.a1@example.com',
            'phone' => '081234567901',
            'shopname' => 'Toko Supplier A1',
            'type' => 'Grosir',
            'city' => 'Jakarta',
            'address' => 'Jl. Sudirman No. 100',
            'store_id' => $storeA->id,
        ]);

        Supplier::create([
            'name' => 'Supplier A2',
            'email' => 'supplier.a2@example.com',
            'phone' => '081234567902',
            'shopname' => 'Toko Supplier A2',
            'type' => 'Eceran',
            'city' => 'Jakarta',
            'address' => 'Jl. Thamrin No. 200',
            'store_id' => $storeA->id,
        ]);

        // Supplier untuk Toko B
        Supplier::create([
            'name' => 'Supplier B1',
            'email' => 'supplier.b1@example.com',
            'phone' => '081234567903',
            'shopname' => 'Toko Supplier B1',
            'type' => 'Grosir',
            'city' => 'Bandung',
            'address' => 'Jl. Asia Afrika No. 300',
            'store_id' => $storeB->id,
        ]);

        Supplier::create([
            'name' => 'Supplier B2',
            'email' => 'supplier.b2@example.com',
            'phone' => '081234567904',
            'shopname' => 'Toko Supplier B2',
            'type' => 'Eceran',
            'city' => 'Bandung',
            'address' => 'Jl. Braga No. 400',
            'store_id' => $storeB->id,
        ]);

        // Supplier untuk Toko C
        Supplier::create([
            'name' => 'Supplier C1',
            'email' => 'supplier.c1@example.com',
            'phone' => '081234567905',
            'shopname' => 'Toko Supplier C1',
            'type' => 'Grosir',
            'city' => 'Surabaya',
            'address' => 'Jl. Tunjungan No. 500',
            'store_id' => $storeC->id,
        ]);

        Supplier::create([
            'name' => 'Supplier C2',
            'email' => 'supplier.c2@example.com',
            'phone' => '081234567906',
            'shopname' => 'Toko Supplier C2',
            'type' => 'Eceran',
            'city' => 'Surabaya',
            'address' => 'Jl. Pemuda No. 600',
            'store_id' => $storeC->id,
        ]);
    }
}