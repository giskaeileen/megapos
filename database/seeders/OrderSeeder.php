<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderDetails;
use App\Models\Product;
use App\Models\ProductVariant;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OrderSeeder extends Seeder
{
    public function run()
    {
        $stores = \App\Models\Store::all();
        $paymentMethods = ['Cash', 'Wallet'];

        foreach ($stores as $store) {
            // Get all products for this store with their variants
            $products = Product::with('productVariants')->where('store_id', $store->id)->get();

            for ($i = 1; $i <= 100; $i++) {
                // Create order with random date in last 30 days
                $orderDate = Carbon::now()->subDays(rand(1, 7));
                $paymentMethod = $paymentMethods[array_rand($paymentMethods)];

                $order = Order::create([
                    'invoice_no' => 'INV-' . str_pad($i, 6, '0', STR_PAD_LEFT),
                    'store_id' => $store->id,
                    'order_date' => $orderDate,
                    'order_status' => 'complete',
                    'payment_status' => $paymentMethod,
                    'total_products' => 0, // Will be updated
                    'sub_total' => 0, // Will be calculated
                    'total' => 0, // Will be calculated
                    'pay' => 0, // Will be calculated
                    'created_at' => $orderDate,
                    'updated_at' => $orderDate,
                ]);

                // Select random variants (1-5 per order)
                $selectedVariants = collect();
                $productCount = rand(1, 5);

                for ($j = 0; $j < $productCount; $j++) {
                    $randomProduct = $products->random();
                    $variant = $randomProduct->productVariants->random();
                    $selectedVariants->push($variant);
                }

                // Create order details for each variant
                $subTotal = 0;
                $totalProducts = 0;

                foreach ($selectedVariants as $variant) {
                    $product = $variant->product;

                    if (!$product) continue;

                    $quantity = rand(1, 3);
                    $unitPrice = $variant->sale_price;
                    // $unitPrice = $variant->price;
                    $discount = rand(0, 1) ? $product->discount_normal : $product->discount_member;
                    $total = $quantity * ($unitPrice - ($unitPrice * $discount / 100));

                    OrderDetails::create([
                        'order_id' => $order->id,
                        'product_id' => $product->id,
                        // 'product_variant_id' => $variant->id,
                        'quantity' => $quantity,
                        'unitcost' => $unitPrice,
                        'discount_normal' => $product->discount_normal,
                        'discount_member' => $product->discount_member,
                        'total' => $total,
                        'created_at' => $orderDate,
                        'updated_at' => $orderDate,
                    ]);

                    $subTotal += $quantity * $unitPrice;
                    $totalProducts += $quantity;
                }

                // Calculate totals
                $total = $subTotal - ($subTotal * (rand(0, 15) / 100)); // Apply random discount

                // Update order with calculated values
                $order->update([
                    'total_products' => $totalProducts,
                    'sub_total' => $subTotal,
                    'total' => $total,
                    'pay' => $total,
                ]);
            }
        }
    }
}
