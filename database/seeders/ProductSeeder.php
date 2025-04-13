<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ProductAttribute;
use App\Models\AttributeValue;
use App\Models\Store;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;

class ProductSeeder extends Seeder
{
    // API endpoints untuk data real
    private $clothingApi = 'https://fakestoreapi.com/products/category/women\'s clothing?limit=100';
    private $electronicsApi = 'https://fakestoreapi.com/products/category/electronics?limit=100';
    private $foodApi = 'https://www.themealdb.com/api/json/v1/1/search.php?s=';
    private $fashionApi = 'https://api.escuelajs.co/api/v1/products/?categoryId=1&limit=100';
    private $groceryApi = 'https://api.escuelajs.co/api/v1/products/?categoryId=2&limit=100';

    // Koleksi gambar untuk variant (dapat disesuaikan)
    private $variantImages = [
        'clothing' => [
            'https://img.freepik.com/free-photo/white-t-shirt_125540-1.jpg',
            'https://img.freepik.com/free-photo/shirt_1203-8093.jpg',
            'https://img.freepik.com/free-photo/black-t-shirt_125540-2.jpg',
            'https://img.freepik.com/free-photo/blue-t-shirt_125540-3.jpg',
            'https://img.freepik.com/free-photo/red-t-shirt_125540-4.jpg'
        ],
        'electronics' => [
            'https://img.freepik.com/free-photo/new-smartphone-balancing-with-pink-background_23-2150296471.jpg',
            'https://img.freepik.com/free-photo/digital-tablet_1203-2179.jpg',
            'https://img.freepik.com/free-photo/laptop-with-colorful-screen_1203-2586.jpg',
            'https://img.freepik.com/free-photo/headphones-wireless-digital-device_53876-96805.jpg',
            'https://img.freepik.com/free-photo/smartwatch-balancing-with-yellow-background_23-2150296469.jpg'
        ],
        'food' => [
            'https://img.freepik.com/free-photo/top-view-table-full-delicious-food-composition_23-2149141352.jpg',
            'https://img.freepik.com/free-photo/flat-lay-table-full-delicious-food_23-2149141306.jpg',
            'https://img.freepik.com/free-photo/top-view-fast-food-mix-hamburger-doner-sandwich-chicken-nuggets-rice-vegetable-salad-chicken-sticks-caesar-salad-mushrooms-pizza-chicken-ragout-french-fries-mayo_141793-3998.jpg',
            'https://img.freepik.com/free-photo/assortment-vegetables-healthy-food_23-2149147046.jpg',
            'https://img.freepik.com/free-photo/healthy-vegetables-wooden-table_1150-38014.jpg'
        ]
    ];

    public function run()
    {
        // Ambil semua toko
        $stores = Store::all();
        
        foreach ($stores as $store) {
            // Tentukan jenis produk berdasarkan nama toko
            switch (strtolower($store->name)) {
                case 'toko a':
                case 'toko pakaian':
                    $this->seedClothingProducts($store);
                    break;
                
                case 'toko b':
                case 'toko elektronik':
                    $this->seedElectronicsProducts($store);
                    break;
                
                case 'toko c':
                case 'toko makanan':
                    $this->seedFoodProducts($store);
                    break;
                
                default:
                    // $this->seedGenericProducts($store);
                    break;
            }
        }
    }

    protected function seedClothingProducts($store)
    {
        $response1 = Http::get($this->clothingApi);
        // $response2 = Http::get($this->fashionApi);
        $products1 = $response1->json();
        // $products2 = $response2->json();
        
        $products = array_merge(
            is_array($products1) ? $products1 : [],
            // is_array($products2) ? $products2 : []
        );

        $attributeCombinations = [
            [
                'warna' => ['Merah', 'Biru', 'Hitam', 'Putih', 'Hijau', 'Abu-abu'],
                'ukuran' => ['S', 'M', 'L', 'XL', 'XXL'],
                'bahan' => ['Katun', 'Polyester', 'Sutra', 'Wol', 'Denim']
            ],
            [
                'warna' => ['Hitam', 'Putih', 'Biru'],
                'ukuran' => ['M', 'L', 'XL']
            ]
        ];

        for ($i = 0; $i < 100; $i++) {
            $apiProduct = $products[$i % count($products)] ?? [];
            
            $product = Product::create([
                'product_name' => $apiProduct['title'] ?? $apiProduct['name'] ?? 'Pakaian ' . Str::random(5),
                'category_id' => null,
                'supplier_id' => null,
                'unit' => 'pcs',
                'product_image' => $apiProduct['image'] ?? $apiProduct['images'][0] ?? null,
                'discount_normal' => rand(0, 20),
                'discount_member' => rand(10, 30),
                'description' => $apiProduct['description'] ?? 'Deskripsi pakaian ' . Str::random(10),
                'store_id' => $store->id,
            ]);

            $selectedCombination = $attributeCombinations[array_rand($attributeCombinations)];
            $variantCombinations = $this->generateCombinations($selectedCombination);
            
            foreach ($variantCombinations as $variantData) {
                // $price = $apiProduct['price'] ?? rand(50000, 500000);
                // $price = rand(50000, 500000);
                $price = rand(50, 500) * 1000;
                $variantImage = $this->getVariantImage('clothing', $variantData);
                $this->createVariant($product, $variantData, $price, $variantImage);
            }
        }
    }

    protected function seedElectronicsProducts($store)
    {
        $response = Http::get($this->electronicsApi);
        $products = $response->json();

        $attributeCombinations = [
            [
                'warna' => ['Hitam', 'Putih', 'Silver', 'Gold', 'Space Gray'],
                'garansi' => ['1 Tahun', '2 Tahun', 'Garansi Toko', 'Garansi Internasional']
            ],
            [
                'kapasitas' => ['64GB', '128GB', '256GB', '512GB', '1TB'],
                'warna' => ['Hitam', 'Silver', 'Gold']
            ],
            [
                'model' => ['Pro', 'Max', 'Lite', 'Plus', 'Standard'],
                'tahun' => ['2022', '2023', '2024']
            ]
        ];

        for ($i = 0; $i < 100; $i++) {
            $apiProduct = $products[$i % count($products)] ?? [];
            
            $product = Product::create([
                'product_name' => $apiProduct['title'] ?? 'Elektronik ' . Str::random(5),
                'category_id' => null,
                'supplier_id' => null,
                'unit' => 'unit',
                'product_image' => $apiProduct['image'] ?? null,
                'discount_normal' => rand(0, 15),
                'discount_member' => rand(5, 25),
                'description' => $apiProduct['description'] ?? 'Deskripsi elektronik ' . Str::random(10),
                'store_id' => $store->id,
            ]);

            $selectedCombination = $attributeCombinations[array_rand($attributeCombinations)];
            $variantCombinations = $this->generateCombinations($selectedCombination);
            
            foreach ($variantCombinations as $variantData) {
                // $price = $apiProduct['price'] ?? rand(500000, 20000000);
                // $price = rand(500000, 20000000);
                $price = rand(500, 2000) * 1000;
                $variantImage = $this->getVariantImage('electronics', $variantData);
                $this->createVariant($product, $variantData, $price, $variantImage);
            }
        }
    }

    protected function seedFoodProducts($store)
    {
        $foods = ['pizza', 'burger', 'pasta', 'salad', 'sushi', 'cake', 'ice cream', 'chicken', 'steak', 'seafood'];
        $responseGrocery = Http::get($this->groceryApi);
        $groceryProducts = $responseGrocery->json();

        $attributeCombinations = [
            [
                'rasa' => ['Original', 'Pedas', 'Manis', 'Asin', 'Gurih', 'Spesial'],
                'ukuran' => ['Kecil', 'Sedang', 'Besar', 'Family']
            ],
            [
                'kemasan' => ['Plastik', 'Kertas', 'Box', 'Mika', 'Kaleng'],
                'jumlah' => ['1', '3', '6', '12', '24']
            ],
            [
                'varian' => ['Rendah Gula', 'Rendah Lemak', 'Organik', 'Gluten Free', 'Vegan'],
                'berat' => ['250g', '500g', '1kg', '2kg']
            ]
        ];

        for ($i = 0; $i < 100; $i++) {
            // if ($i % 2 == 0) {
                $food = $foods[$i % count($foods)];
                $response = Http::get($this->foodApi . $food);
                $meal = $response->json()['meals'][0] ?? null;
                
                $product = Product::create([
                    'product_name' => $meal['strMeal'] ?? 'Makanan ' . ucfirst($food),
                    'category_id' => null,
                    'supplier_id' => null,
                    'unit' => 'porsi',
                    'product_image' => $meal['strMealThumb'] ?? null,
                    'discount_normal' => rand(0, 10),
                    'discount_member' => rand(5, 15),
                    'description' => $meal['strInstructions'] ?? 'Deskripsi makanan ' . $food,
                    'store_id' => $store->id,
                ]);
            // } else {
            //     $grocery = $groceryProducts[$i % count($groceryProducts)] ?? [];
                
            //     $product = Product::create([
            //         'product_name' => $grocery['title'] ?? 'Produk Makanan ' . Str::random(5),
            //         'category_id' => null,
            //         'supplier_id' => null,
            //         'unit' => 'pcs',
            //         'product_image' => $grocery['images'][0] ?? null,
            //         'discount_normal' => rand(0, 15),
            //         'discount_member' => rand(5, 20),
            //         'description' => $grocery['description'] ?? 'Deskripsi produk makanan ' . Str::random(10),
            //         'store_id' => $store->id,
            //     ]);
            // }

            $selectedCombination = $attributeCombinations[array_rand($attributeCombinations)];
            $variantCombinations = $this->generateCombinations($selectedCombination);
            
            foreach ($variantCombinations as $variantData) {
                // $price = rand(20000, 300000);
                $price = rand(20, 300) * 1000;
                $variantImage = $this->getVariantImage('food', $variantData);
                $this->createVariant($product, $variantData, $price, $variantImage);
            }
        }
    }

    // protected function generateCombinations($attributes)
    // {
    //     $result = [[]];
        
    //     foreach ($attributes as $attribute => $values) {
    //         $temp = [];
    //         foreach ($result as $item) {
    //             foreach ($values as $value) {
    //                 $temp[] = array_merge($item, [$attribute => $value]);
    //             }
    //         }
    //         $result = $temp;
    //     }
        
    //     shuffle($result);
    //     return array_slice($result, 0, min(5, count($result)));
    // }

    protected function generateCombinations($attributes)
    {
        $result = [[]];

        foreach ($attributes as $attribute => $values) {
            $temp = [];
            foreach ($result as $item) {
                foreach ($values as $value) {
                    $temp[] = array_merge($item, [$attribute => $value]);
                }
            }
            $result = $temp;
        }

        shuffle($result);
        return $result; // Kembalikan semua kombinasi tanpa dibatasi
    }

    protected function createVariant($product, $variantData, $basePrice = null, $imageUrl = null)
    {
        // $price = $basePrice ? $basePrice * (0.9 + (rand(0, 20) / 100)) : rand(50000, 200000);
        $price = $basePrice;
        
        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'SKU-' . Str::random(8),
            'price' => $price,
            'sale_price' => $price * (0.8 + (rand(0, 20) / 100)),
            'quantity' => rand(10, 200),
            'product_image' => $imageUrl, // Menggunakan gambar yang ditentukan
        ]);
        
        foreach ($variantData as $attributeType => $value) {
            $attributeValue = AttributeValue::firstOrCreate([
                'value' => $value
            ], [
                'attribute_id' => $this->getAttributeId($attributeType)
            ]);
            
            ProductAttribute::create([
                'product_variant_id' => $variant->id,
                'attribute_value_id' => $attributeValue->id,
            ]);
        }
    }

    protected function getAttributeId($attributeType)
    {
        $attributeMapping = [
            'warna' => 1,
            'ukuran' => 2,
            'bahan' => 3,
            'garansi' => 4,
            'kapasitas' => 5,
            'rasa' => 6,
            'kemasan' => 7,
            'jumlah' => 8,
            'model' => 9,
            'tahun' => 10,
            'varian' => 11,
            'berat' => 12
        ];
        
        return $attributeMapping[$attributeType] ?? 1;
    }

    protected function getVariantImage($category, $variantData)
    {
        // Pilih gambar berdasarkan warna jika tersedia
        if (isset($variantData['warna'])) {
            $color = strtolower($variantData['warna']);
            $colorImages = [
                'merah' => 'https://img.freepik.com/free-photo/red-t-shirt_125540-4.jpg',
                'biru' => 'https://img.freepik.com/free-photo/blue-t-shirt_125540-3.jpg',
                'hitam' => 'https://img.freepik.com/free-photo/black-t-shirt_125540-2.jpg',
                'putih' => 'https://img.freepik.com/free-photo/white-t-shirt_125540-1.jpg',
                'hijau' => 'https://img.freepik.com/free-photo/green-t-shirt_125540-5.jpg',
                'abu-abu' => 'https://img.freepik.com/free-photo/grey-t-shirt_125540-6.jpg',
                'silver' => 'https://img.freepik.com/free-photo/silver-electronics_1203-2178.jpg',
                'gold' => 'https://img.freepik.com/free-photo/gold-electronics_1203-2177.jpg',
            ];
            
            if (isset($colorImages[$color])) {
                return $colorImages[$color];
            }
        }
        
        // Default: pilih gambar acak dari koleksi kategori
        $images = $this->variantImages[$category] ?? $this->variantImages['clothing'];
        return $images[array_rand($images)];
    }
}