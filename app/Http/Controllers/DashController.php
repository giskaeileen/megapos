<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Order;
use App\Models\Store;
use App\Models\StoreRegistration;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DashController extends Controller
{
    /**
     * Dashboard untuk pemilik toko
     */
    public function onwerDash(Request $request)
    {
        // Ambil user yang sedang login
        $user = $request->user();

        // Ambil semua ID toko yang dimiliki oleh user
        $storeIds = $user->stores->pluck('id');

        // Hitung total karyawan dari semua toko
        $totalEmployees = Employee::whereIn('store_id', $storeIds)->count();

        // Hitung total pesanan dari semua toko
        $totalOrder = Order::whereIn('store_id', $storeIds)->count();

        // Hitung total pembayaran dari semua toko
        $totalPayment = Order::whereIn('store_id', $storeIds)->sum('total');

        // Return data dashboard
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'multi_store' => $user->multi_store,
            'roles' => $user->getRoleNames(),
            'permissions' => $user->getAllPermissions()->pluck('name'),
            'stores' => $user->stores,
            'total_stores' => $user->stores->count(),
            'total_employees' => $totalEmployees,
            'total_orders' => $totalOrder,
            'total_payment' => $totalPayment,
        ]);
    }

    /**
     * Menampilkan daftar pesanan yang sudah selesai
     */
    public function orders(Request $request)
    {
        // Ambil jumlah baris per halaman
        $row = (int) $request->input('row', 10);

        // Validasi jumlah row
        if ($row < 1 || $row > 100) {
            abort(400, 'The per-page parameter must be an integer between 1 and 100.');
        }

        // Ambil user dan ID tokonya
        $user = $request->user();
        $storeIds = $user->stores->pluck('id');

        // Ambil pesanan selesai dari toko yang dimiliki user
        $orders = Order::whereIn('store_id', $storeIds)
            ->where('order_status', 'complete')
            ->paginate($row);

        return response()->json($orders);
    }

    /**
     * Menampilkan produk terlaris
     */
    public function topProducts(Request $request)
    {
        $row = (int) request('row', 10);

        if ($row < 1 || $row > 100) {
            abort(400, 'The per-page parameter must be an integer between 1 and 100.');
        }

        $user = $request->user();
        $storeIds = $user->stores->pluck('id');

        // Ambil pesanan yang sudah lengkap, termasuk produk dan relasi lainnya
        $orders = Order::with([
                'products.product.category',
                'products.product.supplier'
            ])
            ->where('order_status', 'complete')
            ->whereIn('store_id', $storeIds)
            ->get();

        // Hitung total produk terjual
        $products = [];

        foreach ($orders as $order) {
            foreach ($order->products as $orderProduct) {
                $productId = $orderProduct->product_id;
                $product = $orderProduct->product;

                if (!isset($products[$productId])) {
                    $products[$productId] = [
                        'id' => $productId,
                        'product_name' => $product->product_name,
                        'upc_barcode' => $product->upc_barcode,
                        'category' => $product->category ? $product->category->name : null,
                        'supplier' => $product->supplier ? $product->supplier->name : null,
                        'unit' => $product->unit,
                        'product_image' => $product->product_image,
                        'description' => $product->description,
                        'discount_normal' => $product->discount_normal,
                        'discount_member' => $product->discount_member,
                        'total_sold' => 0
                    ];
                }

                // Tambahkan jumlah terjual
                $products[$productId]['total_sold'] += $orderProduct->quantity;
            }
        }

        // Ubah menjadi collection
        $sortedProducts = collect($products);

        // Sorting berdasarkan parameter `sort_by` dan `order`
        $sortBy = request('sort_by', 'total_sold'); // Default sort: total_sold
        $sortOrder = request('order', 'desc');      // Default order: descending

        if (in_array($sortBy, ['product_name', 'total_sold'])) {
            $sortedProducts = $sortOrder === 'desc'
                ? $sortedProducts->sortByDesc($sortBy)
                : $sortedProducts->sortBy($sortBy);
        }

        // Paginasi manual
        $perPage = (int) request('per_page', 10);
        $page = (int) request('page', 1);
        $paginatedProducts = $sortedProducts->forPage($page, $perPage)->values();

        return response()->json([
            'data' => $paginatedProducts,
            'total' => $sortedProducts->count(),
            'per_page' => $perPage,
            'current_page' => $page,
            'last_page' => ceil($sortedProducts->count() / $perPage)
        ]);
    }

    /**
     * Dashboard untuk admin
     */
    public function adminDash()
    {
        $row = (int) request('row', 10);

        if ($row < 1 || $row > 100) {
            abort(400, 'The per-page parameter must be an integer between 1 and 100.');
        }

        // Ambil pendaftaran toko dengan sortable dan pagination
        $store_registration = StoreRegistration::sortable()
            ->paginate($row)
            ->appends(request()->query());

        // Hitung semua total yang dibutuhkan
        $store_registration_total = StoreRegistration::count();
        $store_registration_pending = StoreRegistration::where('status', 'pending')->count();
        $store_registration_approved = StoreRegistration::where('status', 'approved')->count();
        $store_total = Store::count();

        return response()->json([
            'store_registration' => $store_registration,
            'store_registration_total' => $store_registration_total,
            'store_registration_pending_total' => $store_registration_pending,
            'store_registration_approved_total' => $store_registration_approved,
            'store_total' => $store_total,
        ]);
    }
}
