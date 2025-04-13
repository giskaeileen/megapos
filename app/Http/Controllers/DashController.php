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
    //
    public function onwerDash(Request $request){
        $user = $request->user();

        $storeIds = $user->stores->pluck('id');

        $totalEmployees = Employee::whereIn('store_id', $storeIds)->count();
        $totalOrder= Order::whereIn('store_id', $storeIds)->count();
        $totalPayment = Order::whereIn('store_id', $storeIds)->sum('total');

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

    public function orders(Request $request)
    {
        $row = (int) $request->input('row', 10);

        if ($row < 1 || $row > 100) {
            abort(400, 'The per-page parameter must be an integer between 1 and 100.');
        }

        $user = $request->user();
        $storeIds = $user->stores->pluck('id');

        $orders = Order::whereIn('store_id', $storeIds) 
            ->where('order_status', 'complete')
            ->paginate($row);

        return response()->json($orders);
    }

    public function topProducts(Request $request)
    {
        $row = (int) request('row', 10);

        if ($row < 1 || $row > 100) {
            abort(400, 'The per-page parameter must be an integer between 1 and 100.');
        }

        $user = $request->user();
        $storeIds = $user->stores->pluck('id');

        // Ambil data pesanan dengan produk terkait
        $orders = Order::with([
                'products.product.category',
                'products.product.supplier'
            ])
            ->where('order_status', 'complete')
            ->whereIn('store_id', $storeIds)
            ->get();

        // Menghitung total quantity dari setiap produk yang terjual
        $products = [];

        foreach ($orders as $order) {
            foreach ($order->products as $orderProduct) {
                $productId = $orderProduct->product_id;
                $product = $orderProduct->product;

                // return response()->json($product);

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

        // Ubah ke collection
        $sortedProducts = collect($products);

        // **Sorting berdasarkan request**
        $sortBy = request('sort_by', 'total_sold'); // Default sorting by `total_sold`
        $sortOrder = request('order', 'desc'); // Default descending

        if (in_array($sortBy, ['product_name', 'total_sold'])) {
            $sortedProducts = $sortOrder === 'desc' 
                ? $sortedProducts->sortByDesc($sortBy) 
                : $sortedProducts->sortBy($sortBy);
        }

        // **Pagination hasil produk**
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

    public function adminDash()
    {
        $row = (int) request('row', 10);

        if ($row < 1 || $row > 100) {
            abort(400, 'The per-page parameter must be an integer between 1 and 100.');
        }

        $store_registration = StoreRegistration::sortable()
                ->paginate($row)
                ->appends(request()->query());

        $store_registration_total = StoreRegistration::count();

        $store_registration_pending = StoreRegistration::
                where('status', 'pending')
                ->count();

        $store_registration_approved = StoreRegistration::
                where('status', 'approved')
                ->count();

        $store_total = Store::count();

        return response()->json([
            'store_registration' => $store_registration,
            'store_registration_total' => $store_registration_total,
            'store_registration_pending_total' => $store_registration_pending,
            'store_registration_approved_total' => $store_registration_approved,
            'store_total' => $store_total,
            ]
        );
    }


}

