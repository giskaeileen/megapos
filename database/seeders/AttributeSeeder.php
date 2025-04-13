<?php

namespace Database\Seeders;

use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\Store;
use Illuminate\Database\Seeder;

class AttributeSeeder extends Seeder
{
    public function run()
    {
        // Ambil semua toko yang sudah ada
        $stores = Store::all();

        // Data sample untuk atribut dan nilai atribut
        $attributes = [
            [
                'name' => 'Warna',
                'values' => ['Merah', 'Biru', 'Hijau', 'Kuning'],
            ],
            [
                'name' => 'Ukuran',
                'values' => ['S', 'M', 'L', 'XL'],
            ],
            [
                'name' => 'Material',
                'values' => ['Katun', 'Polyester', 'Sutra', 'Wol'],
            ],
        ];

        // Loop melalui setiap toko
        foreach ($stores as $store) {
            // Loop melalui setiap atribut
            foreach ($attributes as $attributeData) {
                // Buat atribut
                $attribute = Attribute::create([
                    'name' => $attributeData['name'],
                    'store_id' => $store->id,
                ]);

                // Buat nilai atribut
                foreach ($attributeData['values'] as $value) {
                    AttributeValue::create([
                        'attribute_id' => $attribute->id,
                        'value' => $value,
                    ]);
                }
            }
        }
    }
}