<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\OrderDetails;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Store;
use App\Models\SubscriptionQuota;
use Haruncpi\LaravelIdGenerator\IdGenerator;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    public function pendingOrders()
    {
        $row = (int) request('row', 10);

        if ($row < 1 || $row > 100) {
            abort(400, 'The per-page parameter must be an integer between 1 and 100.');
        }

        $orders = Order::with('member')
            ->filter(request(['search']))
            ->where('order_status', 'pending')
            ->sortable()
            ->paginate($row);

        return response()->json($orders);
    }

    public function completeOrders($storeSlug)
    {
        $row = (int) request('row', 10);

        if ($row < 1 || $row > 100) {
            abort(400, 'The per-page parameter must be an integer between 1 and 100.');
        }

        $store_id = Store::where('slug', $storeSlug)->first()->id;

        $filters = request()->only([
            'search',
            'order_date',
            'order_status',
            'total_products',
            'sub_total',
            'vat',
            'invoice_no',
            'total',
            'payment_status',
            'pay',
            'due',
            'pay_return',
            'bank',
            'no_rekening',
            'name_rekening',

            'daily',          // Filter berdasarkan hari
            'monthly',        // Filter berdasarkan bulan
            'yearly',         // Filter berdasarkan tahun
            'order_date_min', // Filter minimal tanggal
            'order_date_max', // Filter maksimal tanggal
            'pay_min',        // Filter minimal harga
            'pay_max',        // Filter maksimal harga
        ]);

        $orders = Order::with('member')
            ->where('store_id', $store_id)
            ->filter($filters)
            ->where('order_status', 'complete')
            ->sortable()
            ->paginate($row);

        return response()->json($orders);
    }

    public function completeProductOrders($storeSlug)
    {
        $row = (int) request('row', 10);

        if ($row < 1 || $row > 100) {
            abort(400, 'The per-page parameter must be an integer between 1 and 100.');
        }

        $store_id = Store::where('slug', $storeSlug)->first()->id;

        $filters = request()->only([
            'search',
            'order_date',
            'order_status',
            'total_products',
            'sub_total',
            'vat',
            'invoice_no',
            'total',
            'payment_status',
            'pay',
            'due',
            'pay_return',
            'bank',
            'no_rekening',
            'name_rekening',

            'daily',          // Filter berdasarkan hari
            'monthly',        // Filter berdasarkan bulan
            'yearly',         // Filter berdasarkan tahun
            'order_date_min', // Filter minimal tanggal
            'order_date_max', // Filter maksimal tanggal
            'pay_min',        // Filter minimal harga
            'pay_max',        // Filter maksimal harga
        ]);

        $orders = Order::with(['products', 'member'])
            ->where('store_id', $store_id)
            ->filter($filters)
            ->where('order_status', 'complete')
            ->sortable()
            ->paginate($row);

        return response()->json($orders);
    }

    public function topProducts($storeSlug)
    {
        $store = Store::where('slug', $storeSlug)->firstOrFail();
        $row = (int) request('row', 10);

        if ($row < 1 || $row > 100) {
            abort(400, 'The per-page parameter must be an integer between 1 and 100.');
        }

        // Ambil filter dari request
        $filters = request()->only([
            'search', 'order_date', 'order_status', 'total_products', 'sub_total',
            'vat', 'invoice_no', 'total', 'payment_status', 'pay', 'due', 'pay_return',
            'bank', 'no_rekening', 'name_rekening', 'daily', 'monthly', 'yearly',
            'order_date_min', 'order_date_max', 'pay_min', 'pay_max'
        ]);

        // Ambil data pesanan dengan produk terkait
        $orders = Order::with([
                'products.product.category',
                'products.product.supplier'
            ])
            ->filter($filters) // Pastikan metode `filter` sudah dibuat di model Order
            ->where('order_status', 'complete')
            ->where('store_id', $store->id)
            ->sortable()
            ->get();
            // ->paginate($row);

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
                        // 'category' => $product->category->name,
                        // 'supplier' => $product->supplier->name,
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

    public function stockManage()
    {
        $row = (int) request('row', 10);

        if ($row < 1 || $row > 100) {
            abort(400, 'The per-page parameter must be an integer between 1 and 100.');
        }

        // return view('stock.index', [
        //     'products' => Product::with(['category', 'supplier'])
        //         ->filter(request(['search']))
        //         ->sortable()
        //         ->paginate($row)
        //         ->appends(request()->query()),
        // ]);
        return response()->json(
            Product::with(['category', 'supplier'])
                ->filter(request(['search']))
                ->sortable()
                ->paginate($row)
                ->appends(request()->query()),
        );
    }

    public function midtransToken($storeSlug, Request $request)
    {
        $validator = Validator::make($request->all(), [
            'member_id' => 'nullable|numeric',
            'payment_status' => 'required|string',
            'pay' => 'nullable|numeric',
            'pay_return' => 'numeric|nullable',
            'due' => 'nullable|numeric',
            'bank' => 'string|nullable',
            'no_rekening' => 'string|nullable',
            'name_rekening' => 'string|nullable',
            'total_products' => 'nullable|numeric',
            'sub_total' => 'nullable|numeric',
            'total' => 'nullable|numeric',
            'cart' => 'required|array',
            'cart.*.id' => 'required|numeric',
            'cart.*.name' => 'required|string',
            'cart.*.price' => 'required|numeric',
            'cart.*.qty' => 'required|numeric',
            'cart.*.discount_normal' => 'nullable|numeric',
            'cart.*.discount_member' => 'nullable|numeric',
            'cart.*.attribute' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validatedData = $validator->validated();

        // =======

        // Generate nomor invoice
        $invoice_no = IdGenerator::generate([
            'table' => 'orders',
            'field' => 'invoice_no',
            'length' => 10,
            'prefix' => 'INV-'
        ]);

        //$storeId = slug
        $store_id = Store::where('slug', $storeSlug)->first()->id;

        // Validasi data yang sudah diproses
        $validatedData = $validator->validated();
        unset($validatedData['cart']);
        $validatedData['order_date'] = Carbon::now()->format('Y-m-d');
        $validatedData['order_status'] = 'pending';
        $validatedData['invoice_no'] = $invoice_no;
        $validatedData['store_id'] = $store_id;
        $validatedData['store_id'] = $store_id;
        $validatedData['created_at'] = Carbon::now();

        $order_id = Order::insertGetId($validatedData);

        // Menyusun data untuk order_details
        $orderDetails = [];
        foreach ($request->cart as $item) {
            $orderDetails[] = [
                'order_id' => $order_id,
                'product_id' => $item['product_id'],
                'quantity' => $item['qty'],
                'unitcost' => $item['price'],
                'discount_normal' => $item['discount_normal'] ?? 0,
                'discount_member' => $item['discount_member'] ?? 0,
                'total' => $item['qty'] * $item['price'],
                'created_at' => Carbon::now(),
            ];
        }

        // Insert data order details
        OrderDetails::insert($orderDetails);

        // =====

        // Set your Merchant Server Key
        \Midtrans\Config::$serverKey = config('midtrans.serverKey');
        // Set to Development/Sandbox Environment (default). Set to true for Production Environment (accept real transaction).
        \Midtrans\Config::$isProduction = false;
        // Set sanitization on (default)
        \Midtrans\Config::$isSanitized = true;
        // Set 3DS transaction for credit card to true
        \Midtrans\Config::$is3ds = true;

        $params = array(
            'transaction_details' => array(
                'order_id' => $invoice_no,
                'gross_amount' => $validatedData['pay'],
            ),
            // 'customer_details' => array(
            //     'first_name' => "Name",
            //     'email' => "email@example.com",
            // ),
        );

        $snapToken = \Midtrans\Snap::getSnapToken($params);

        // return response()->json($snapToken);
        return response()->json([
            'snap_token' => $snapToken,
            'order_id' => $invoice_no, 
        ]);
    }

    public function storeOrder($storeSlug, Request $request)
    {
        $user = $request->user();

        $subscription = SubscriptionQuota::where('user_id', $user->id)
            ->where('end_date', '>', Carbon::now())
            ->latest()
            ->first();

        if (!$subscription) {
            return response()->json([
                'message' => 'There are no active packages.',
            ], 404);
        }

        $storeIds = $user->stores()->pluck('id');

        // Count data from all stores
        $statistics = [
            'total_stores' => $user->stores()->count(),
            'total_orders' => Order::whereIn('store_id', $storeIds)->count(),
            'total_products' => Product::whereIn('store_id', $storeIds)->count(),
            'total_employees' => Employee::whereIn('store_id', $storeIds)->count(),
            'total_sales' => Order::whereIn('store_id', $storeIds)
                ->where('payment_status', 'paid')
                ->sum('total'),
            'stores_data' => $user->stores()->withCount([
                'orders',
                'products',
                'employees'
            ])->get()
        ];

        // Check quota limits
        $quotaExceeded = [];
        
        // if ($statistics['total_stores'] >= $subscription->quota_stores) {
        //     $quotaExceeded['stores'] = 'Jumlah toko melebihi kuota';
        // }
        
        if ($statistics['total_orders'] >= $subscription->quota_transactions) {
            $quotaExceeded['transactions'] = 'Jumlah transaksi melebihi kuota';
        }
        
        // if ($statistics['total_products'] >= $subscription->quota_products) {
        //     $quotaExceeded['products'] = 'Jumlah produk melebihi kuota';
        // }
        
        // if ($statistics['total_employees'] >= $subscription->quota_employees) {
        //     $quotaExceeded['employees'] = 'Jumlah karyawan melebihi kuota';
        // }

        if (!empty($quotaExceeded)) {
            return response()->json([
                'message' => 'Quota Exceeded',
                'errors' => $quotaExceeded,
                'statistics' => $statistics,
                'quota_limits' => [
                    'transactions' => $subscription->quota_transactions,
                    'products' => $subscription->quota_products,
                    'employees' => $subscription->quota_employees,
                    'stores' => $subscription->quota_stores
                ]
            ], 422);
        }

        // Validasi input
        $validator = Validator::make($request->all(), [
            'member_id' => 'nullable|numeric',
            'payment_status' => 'required|string',
            'pay' => 'nullable|numeric',
            'pay_return' => 'numeric|nullable',
            'due' => 'nullable|numeric',
            'bank' => 'string|nullable',
            'no_rekening' => 'string|nullable',
            'name_rekening' => 'string|nullable',
            'total_products' => 'nullable|numeric',
            'sub_total' => 'nullable|numeric',
            'total' => 'nullable|numeric',
            'cart' => 'required|array',
            'cart.*.id' => 'required|numeric',
            'cart.*.name' => 'required|string',
            'cart.*.price' => 'required|numeric',
            'cart.*.qty' => 'required|numeric',
            'cart.*.discount_normal' => 'nullable|numeric',
            'cart.*.discount_member' => 'nullable|numeric',
            'cart.*.attribute' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Generate nomor invoice
        $invoice_no = IdGenerator::generate([
            'table' => 'orders',
            'field' => 'invoice_no',
            'length' => 10,
            'prefix' => 'INV-'
        ]);

        //$storeId = slug
        $store_id = Store::where('slug', $storeSlug)->first()->id;

        // Menyimpan data order ke dalam database
        $validatedData = $validator->validated();
        unset($validatedData['cart']);
        $validatedData['order_date'] = Carbon::now()->format('Y-m-d');
        $validatedData['order_status'] = 'complete';
        $validatedData['invoice_no'] = $invoice_no;
        $validatedData['store_id'] = $store_id;
        $validatedData['created_at'] = Carbon::now();

        $order_id = Order::insertGetId($validatedData);

        // Menyusun data untuk order_details
        $orderDetails = [];
        foreach ($request->cart as $item) {
            $orderDetails[] = [
                'order_id' => $order_id,
                // 'product_id' => $item['id'],
                'product_id' => $item['product_id'],
                'quantity' => $item['qty'],
                'unitcost' => $item['price'],
                'discount_normal' => $item['discount_normal'] ?? 0,
                'discount_member' => $item['discount_member'] ?? 0,
                'total' => $item['qty'] * $item['price'],
                'created_at' => Carbon::now(),
            ];
        }

        // Insert data ke tabel order_details
        OrderDetails::insert($orderDetails);

        return response()->json([
            'message' => 'Order has been created successfully!',
            'order_id' => $order_id,
            'invoice_no' => $invoice_no,
        ]);
    }

    public function updateStatus($storeSlug, Request $request)
    {
        $order_id = $request->id;

        // // Reduce the stock
        // $products = OrderDetails::where('order_id', $order_id)->get();

        // foreach ($products as $product) {
        //     Product::where('id', $product->product_id)
        //             ->update(['product_store' => DB::raw('product_store-'.$product->quantity)]);
        // }

        Order::where('invoice_no', $order_id)->first()->update(['order_status' => 'complete']);

        // return Redirect::route('order.pendingOrders')->with('success', 'Order has been completed!');
        return response()->json([
            'message' => 'Order has been completed!',
        ], 201);
    }

    public function orderDetails($storeId, Int $order_id)
    {
        $order = Order::with('member')->where('id', $order_id)->first();
        $orderDetails = OrderDetails::with('product')
                        ->where('order_id', $order_id)
                        ->orderBy('id', 'DESC')
                        ->get();

        // return view('orders.details-order', [
        //     'order' => $order,
        //     'orderDetails' => $orderDetails,
        // ]);
        return response()->json([
            'order' => $order,
            'orderDetails' => $orderDetails,
        ]);
    }

    public function invoiceDownload(Int $order_id)
    {
        $order = Order::where('id', $order_id)->first();
        $orderDetails = OrderDetails::with('product')
                        ->where('order_id', $order_id)
                        ->orderBy('id', 'DESC')
                        ->get();

        // show data (only for debugging)
        return response()->json([
            'order' => $order,
            'orderDetails' => $orderDetails,
        ]);
        // return view('orders.invoice-order', [
        //     'order' => $order,
        //     'orderDetails' => $orderDetails,
        // ]);
    }

    public function pendingDue()
    {
        $row = (int) request('row', 10);

        if ($row < 1 || $row > 100) {
            abort(400, 'The per-page parameter must be an integer between 1 and 100.');
        }

        $orders = Order::where('due', '>', '0')
            ->sortable()
            ->paginate($row);

        // return view('orders.pending-due', [
        //     'orders' => $orders
        // ]);
        return response()->json($orders);
    }

    public function orderDueAjax(Int $id)
    {
        $order = Order::findOrFail($id);

        return response()->json($order);
    }

    public function updateDue(Request $request)
    {
        $rules = [
            'order_id' => 'required|numeric',
            'due' => 'required|numeric',
        ];

        $validatedData = $request->validate($rules);

        $order = Order::findOrFail($request->order_id);
        $mainPay = $order->pay;
        $mainDue = $order->due;

        $paid_due = $mainDue - $validatedData['due'];
        $paid_pay = $mainPay + $validatedData['due'];

        Order::findOrFail($request->order_id)->update([
            'due' => $paid_due,
            'pay' => $paid_pay,
        ]);

        // return Redirect::route('order.pendingDue')->with('success', 'Due Amount Updated Successfully!');

        // Respons success
        return response()->json([
            'message' => 'Due Amount Updated Successfully!',
        ]);
    }
}
