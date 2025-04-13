<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Order;
use App\Models\Product;
use App\Models\Store;
use App\Models\SubscriptionQuota;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class StoreController extends Controller
{
    public function __construct()
    {
        $this->middleware('can:Create Store')->only(['store']);
        $this->middleware('can:Read Store')->only(['index', 'show']);
        $this->middleware('can:Update Store')->only(['update']);
        $this->middleware('can:Delete Store')->only(['destroy']);
    }

    public function index()
    {
        $row = (int) request('row', 10);

        if ($row < 1 || $row > 100) {
            abort(400, 'The per-page parameter must be an integer between 1 and 100.');
        }

        $filters = request()->only([
            'search', 
            'name',
            'slug', 
            'country',
            'state',
            'city',
            'zip',
            'address',
        ]);

        return response()->json(
            // Store::filter(request(['search']))
            Store::filter($filters)
                ->where('user_id', auth()->id())
                ->sortable()
                ->paginate($row)
                ->appends(request()->query()
            ),
        );
    }

    /**
     * Show the form for creating a new resource.
     */
    public function store(Request $request)
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
        
        if ($statistics['total_stores'] >= $subscription->quota_stores) {
            $quotaExceeded['stores'] = 'Jumlah toko melebihi kuota';
        }
        
        // if ($statistics['total_orders'] >= $subscription->quota_transactions) {
        //     $quotaExceeded['transactions'] = 'Jumlah transaksi melebihi kuota';
        // }
        
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

        // Validasi request
        $validator = Validator::make($request->all(), [
            'photo' => 'nullable|image|file|max:1024',
            'name' => 'required|string|max:50',
            'slug' => 'required|string|max:50',
            'country' => 'nullable|string|max:50',
            'state' => 'nullable|string|max:50',
            'city' => 'nullable|string|max:50',
            'zip' => 'nullable|string|max:50',
            'address' => 'required|string|max:100',
        ]);

        // Jika validasi gagal, kembalikan error
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validatedData = $validator->validated();

        // add user id
        $validatedData['user_id'] = auth()->id();

        /**
         * Handle upload image with Storage.
         */
        if ($file = $request->file('photo')) {
            $fileName = hexdec(uniqid()).'.'.$file->getClientOriginalExtension();
            $path = 'public/stores/';

            $file->storeAs($path, $fileName);
            $validatedData['photo'] = $fileName;
        }

        $store = Store::create($validatedData);

        // Respons success
        return response()->json($store, 201);
    }

    public function show($slug)
    {
        $store = Store::where('slug', $slug)
            ->with('user')
            ->first();

        if (!$store) {
            return response()->json([
                'message' => 'Store not found'
            ], 404);
        }

        return response()->json($store);
    }

    public function update($slug, Request $request)
    {
        $store = Store::where('slug', $slug)->first();

        // Validasi request
        $validator = Validator::make($request->all(), [
            'photo' => 'nullable|image|file|max:1024',
            'name' => 'required|string|max:50',
            'slug' => 'required|string|max:50',
            'country' => 'nullable|string|max:50',
            'state' => 'nullable|string|max:50',
            'city' => 'nullable|string|max:50',
            'zip' => 'nullable|string|max:50',
            'address' => 'required|string|max:100',
        ]);

        // Jika validasi gagal, kembalikan error
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Validasi data yang sudah diperiksa
        $validatedData = $validator->validated();

        /**
         * Handle upload image with Storage.
         */
        if ($file = $request->file('photo')) {
            $fileName = hexdec(uniqid()).'.'.$file->getClientOriginalExtension();
            $path = 'public/stores/';

            /**
             * Delete photo if exists.
             */
            if(isset($store->photo)){
                Storage::delete($path . $store->photo);
            }

            $file->storeAs($path, $fileName);
            $validatedData['photo'] = $fileName;
        }

        // Update
        $store->update($validatedData);

        // Respons sukses
        // return response()->json([
        //     'message' => 'Store has been updated!',
        //     'store' => $store,
        // ], 200);
        return response()->json($store, 201);
    }

    public function destroy($id)
    {
        $store = Store::findOrFail($id);

        /**
         * Delete photo if exists.
         */
        // if($supplier->photo){
        //     Storage::delete('public/suppliers/' . $supplier->photo);
        // }

        Store::destroy($store->id);

        // Respons sukses
        return response()->json([
            'message' => 'Store has been deleted!',
        ], 200);
    }
}
