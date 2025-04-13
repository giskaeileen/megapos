<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Store;

class CategorySeeder extends Seeder
{
    public function run()
    {
        // Ambil store berdasarkan slug
        $storeA = Store::where('slug', 'toko-a')->first();
        $storeB = Store::where('slug', 'toko-b')->first();
        $storeC = Store::where('slug', 'toko-c')->first();

        // Category untuk Toko A
        Category::create([
            'name' => 'Elektronik',
            'slug' => 'elektronik',
            'store_id' => $storeA->id,
        ]);

        Category::create([
            'name' => 'Pakaian',
            'slug' => 'pakaian',
            'store_id' => $storeA->id,
        ]);

        // Category untuk Toko B
        Category::create([
            'name' => 'Makanan',
            'slug' => 'makanan',
            'store_id' => $storeB->id,
        ]);

        Category::create([
            'name' => 'Minuman',
            'slug' => 'minuman',
            'store_id' => $storeB->id,
        ]);

        // Category untuk Toko C
        Category::create([
            'name' => 'Peralatan Rumah Tangga',
            'slug' => 'peralatan-rumah-tangga',
            'store_id' => $storeC->id,
        ]);

        Category::create([
            'name' => 'Mainan',
            'slug' => 'mainan',
            'store_id' => $storeC->id,
        ]);
    }
}