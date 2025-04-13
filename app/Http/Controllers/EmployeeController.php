<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Store;
use App\Models\SubscriptionQuota;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class EmployeeController extends Controller
{
    public function __construct()
    {
        $this->middleware('can:Create Employee')->only(['store']);
        $this->middleware('can:Read Employee')->only(['index', 'show']);
        $this->middleware('can:Update Employee')->only(['update']);
        $this->middleware('can:Delete Employee')->only(['destroy']);
    }

    /**
     * Display a listing of the resource.
     */
    public function index($storeId)
    {
        $row = (int) request('row', 10);

        if ($row < 1 || $row > 100) {
            abort(400, 'The per-page parameter must be an integer between 1 and 100.');
        }

        //$storeId = slug
        $store_id = Store::where('slug', $storeId)->first()->id;

        $filters = request()->only([
            'search',
            'name',
            'email',
            'address',
            'experience',
            'salary',
            'vacation',
            'city',
        ]);

        // Query Employee dan relasi User
        $employees = Employee::filter($filters)
            ->with(['user:name,email,photo,id']) // Memuat relasi User dengan atribut tertentu
            // ->where('store_id', $store_id)
            ->where('employees.store_id', $store_id)
            ->sortable()
            ->paginate($row)
            ->appends(request()->query());

        // Tambahkan atribut name, email, dan photo ke setiap employee
        $employees->getCollection()->transform(function ($employee) {
            $employee->name = $employee->user->name ?? null;
            $employee->email = $employee->user->email ?? null;
            $employee->photo = $employee->user->photo ?? null;
            unset($employee->user); // Opsional: Hilangkan relasi jika tidak dibutuhkan
            return $employee;
        });

        return response()->json($employees);
    }

    /**
     * Store a newly created resource in storage.
     */

    public function store($storeId, Request $request)
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
        
        if ($statistics['total_orders'] >= $subscription->quota_transactions) {
            $quotaExceeded['transactions'] = 'Jumlah transaksi melebihi kuota';
        }
        
        if ($statistics['total_products'] >= $subscription->quota_products) {
            $quotaExceeded['products'] = 'Jumlah produk melebihi kuota';
        }
        
        if ($statistics['total_employees'] >= $subscription->quota_employees) {
            $quotaExceeded['employees'] = 'Jumlah karyawan melebihi kuota';
        }

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
            'email' => 'required|email|max:50|unique:users,email',
            'phone' => 'required|string|max:15|unique:employees,phone',
            'experience' => 'max:6|nullable',
            'salary' => 'required|numeric',
            'vacation' => 'max:50|nullable',
            'city' => 'required|max:50',
            'address' => 'required|max:100',
            'password' => 'required|min:6|confirmed',
            'password_confirmation' => 'required_with:password|same:password',
        ]);

        // Jika validasi gagal, kembalikan error
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validatedData = $validator->validated();
        $validatedData['password'] = Hash::make($validatedData['password']);

        /**
         * Handle upload image with Storage.
         */
        if ($file = $request->file('photo')) {
            $fileName = hexdec(uniqid()).'.'.$file->getClientOriginalExtension();
            $path = 'public/profile/';

            $file->storeAs($path, $fileName);
            $validatedData['photo'] = $fileName;
        }

        /**
         * Buat User di tabel `users`
         */
        $user = User::create([
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
            'password' => $validatedData['password'],
            'photo' => $validatedData['photo'] ?? null,
        ]);

        $user->assignRole('Employee');

        //$storeId = slug
        $store_id = Store::where('slug', $storeId)->first()->id;

        /**
         * Buat Employee di tabel `employees`
         */
        $employee = Employee::create([
            'user_id' => $user->id, 
            'phone' => $validatedData['phone'],
            'experience' => $validatedData['experience'] ?? null,
            'salary' => $validatedData['salary'],
            'vacation' => $validatedData['vacation'] ?? null,
            'city' => $validatedData['city'],
            'address' => $validatedData['address'],
            'store_id' => $store_id,
        ]);

        // Respons success
        return response()->json($employee, 201);
    }

    /**
     * Display the specified resource.
     */

    public function show($storeId, $id)
    {
        // Cari Employee berdasarkan ID
        $employee = Employee::find($id);

        // Jika Employee tidak ditemukan, kembalikan respons 404
        if (!$employee) {
            return response()->json([
                'message' => 'Employee not found'
            ], 404);
        }

        // Ambil data User yang terkait dengan Employee
        $user = User::find($employee->user_id);

        // Tambahkan atribut name, email, dan photo dari User ke Employee
        $employee->name = $user->name ?? null;
        $employee->email = $user->email ?? null;
        $employee->photo = $user->photo ?? null;

        // Kembalikan respons JSON
        return response()->json($employee);
    }

    /**
     * Update the specified resource in storage.
     */

    public function update($storeId, $id, Request $request)
    {
        // Temukan Employee berdasarkan ID, termasuk relasi ke User
        $employee = Employee::with('user')->findOrFail($id);

        // Validasi request
        $validator = Validator::make($request->all(), [
            'photo' => 'nullable|image|file|max:1024',
            'name' => 'required|string|max:50',
            'email' => 'required|email|max:50|unique:users,email,'.$employee->user->id,
            'phone' => 'required|string|max:20|unique:employees,phone,'.$employee->id,
            'experience' => 'string|max:6|nullable',
            'salary' => 'numeric',
            'vacation' => 'max:50|nullable',
            'city' => 'max:50',
            'address' => 'required|max:100',
            // 'password' => 'required|min:6|confirmed',
            // 'password_confirmation' => 'required_with:password|same:password',
        ]);

        // Jika validasi gagal, kembalikan error
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Jika ada perubahan password, tambahkan validasi
        if ($request->password || $request->password_confirmation) {
            $validator->addRules([
                'password' => 'min:6|required_with:password_confirmation',
                'password_confirmation' => 'min:6|same:password',
            ]);
        }

        // Validasi data yang sudah diperiksa
        $validatedData = $validator->validated();

        // Hash password jika ada perubahan
        if (isset($request->password)) {
            $validatedData['password'] = Hash::make($request->password);
        }

        /**
         * Handle upload image with Storage.
         */
        if ($file = $request->file('photo')) {
            $fileName = hexdec(uniqid()) . '.' . $file->getClientOriginalExtension();
            $path = 'public/profile/';

            // Hapus foto lama di Storage jika ada
            if ($employee->user->photo) {
                Storage::delete($path . $employee->user->photo);
            }

            // Simpan foto baru
            $file->storeAs($path, $fileName);
            $validatedData['photo'] = $fileName;
        }

        /**
         * Update User data.
         */
        $userData = [
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
            'photo' => $validatedData['photo'] ?? $employee->user->photo,
            // 'password' => Hash::make($validatedData['password_confirmation']),
        ];

        // Hash password hanya jika ada perubahan
        if ($request->filled('password')) {
            $userData['password'] = Hash::make($validatedData['password']);
        }

        $employee->user->update($userData);

        /**
         * Update Employee data.
         */
        $employee->update([
            'phone' => $validatedData['phone'],
            'experience' => $validatedData['experience'] ?? $employee->experience,
            'salary' => $validatedData['salary'],
            'vacation' => $validatedData['vacation'] ?? $employee->vacation,
            'city' => $validatedData['city'],
            'address' => $validatedData['address'],
        ]);

        // Respons sukses
        return response()->json([
            'message' => 'Employee has been updated!',
            'employee' => $employee,
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($storeId, $id)
    {
        $employee = Employee::findOrFail($id);

        /**
         * Delete photo if exists.
         */
        if($employee->photo){
            Storage::delete('public/employees/' . $employee->photo);
        }

        Employee::destroy($employee->id);

        $user = $employee->user;

        if ($user) {
            $user->delete();
        }

        // Respons sukses
        return response()->json([
            'message' => 'Employee has been deleted!',
        ], 200);
    }
}
