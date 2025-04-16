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
        // Middleware untuk otorisasi berdasarkan permission
        $this->middleware('can:Create Employee')->only(['store']);
        $this->middleware('can:Read Employee')->only(['index', 'show']);
        $this->middleware('can:Update Employee')->only(['update']);
        $this->middleware('can:Delete Employee')->only(['destroy']);
    }

    /**
     * Menampilkan daftar karyawan untuk toko tertentu.
     */
    public function index($storeId)
    {
        // Ambil jumlah baris per halaman dari query string
        $row = (int) request('row', 10);

        // Validasi jumlah baris
        if ($row < 1 || $row > 100) {
            abort(400, 'The per-page parameter must be an integer between 1 and 100.');
        }

        // Konversi slug store menjadi ID
        $store_id = Store::where('slug', $storeId)->first()->id;

        // Ambil filter dari query string
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

        // Ambil daftar karyawan dengan relasi ke user
        $employees = Employee::filter($filters)
            ->with(['user:name,email,photo,id'])
            ->where('employees.store_id', $store_id)
            ->sortable()
            ->paginate($row)
            ->appends(request()->query());

        // Transformasi data agar atribut user muncul di root employee
        $employees->getCollection()->transform(function ($employee) {
            $employee->name = $employee->user->name ?? null;
            $employee->email = $employee->user->email ?? null;
            $employee->photo = $employee->user->photo ?? null;
            unset($employee->user);
            return $employee;
        });

        return response()->json($employees);
    }

    /**
     * Menyimpan data karyawan baru.
     */
    public function store($storeId, Request $request)
    {
        // Ambil user yang sedang login
        $user = $request->user();

        // Cek apakah user memiliki paket aktif
        $subscription = SubscriptionQuota::where('user_id', $user->id)
            ->where('end_date', '>', Carbon::now())
            ->latest()
            ->first();

        // Jika tidak ada paket aktif
        if (!$subscription) {
            return response()->json([
                'message' => 'There are no active packages.',
            ], 404);
        }

        // Ambil semua ID toko milik user
        $storeIds = $user->stores()->pluck('id');

        // Hitung statistik data
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

        // Validasi apakah melebihi kuota
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

        // Jika ada pelanggaran kuota, kirim respons error
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

        // Validasi input request
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

        // Jika validasi gagal
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validatedData = $validator->validated();
        $validatedData['password'] = Hash::make($validatedData['password']);

        /**
         * Upload foto jika tersedia.
         */
        if ($file = $request->file('photo')) {
            $fileName = hexdec(uniqid()).'.'.$file->getClientOriginalExtension();
            $path = 'public/profile/';
            $file->storeAs($path, $fileName);
            $validatedData['photo'] = $fileName;
        }

        /**
         * Simpan user ke tabel `users`
         */
        $user = User::create([
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
            'password' => $validatedData['password'],
            'photo' => $validatedData['photo'] ?? null,
        ]);

        $user->assignRole('Employee');

        // Ambil ID store dari slug
        $store_id = Store::where('slug', $storeId)->first()->id;

        /**
         * Simpan employee ke tabel `employees`
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

        return response()->json($employee, 201);
    }

    /**
     * Menampilkan detail dari employee tertentu.
     */
    public function show($storeId, $id)
    {
        // Cari employee berdasarkan ID
        $employee = Employee::find($id);

        if (!$employee) {
            return response()->json([
                'message' => 'Employee not found'
            ], 404);
        }

        // Ambil data user terkait employee
        $user = User::find($employee->user_id);

        $employee->name = $user->name ?? null;
        $employee->email = $user->email ?? null;
        $employee->photo = $user->photo ?? null;

        return response()->json($employee);
    }

    /**
     * Memperbarui data employee.
     */
    public function update($storeId, $id, Request $request)
    {
        // Cari employee dan relasi user
        $employee = Employee::with('user')->findOrFail($id);

        // Validasi input
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
        ]);

        // Tambahkan validasi password jika diperlukan
        if ($request->password || $request->password_confirmation) {
            $validator->addRules([
                'password' => 'min:6|required_with:password_confirmation',
                'password_confirmation' => 'min:6|same:password',
            ]);
        }

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validatedData = $validator->validated();

        if (isset($request->password)) {
            $validatedData['password'] = Hash::make($request->password);
        }

        /**
         * Upload foto baru jika diunggah
         */
        if ($file = $request->file('photo')) {
            $fileName = hexdec(uniqid()) . '.' . $file->getClientOriginalExtension();
            $path = 'public/profile/';

            // Hapus foto lama jika ada
            if ($employee->user->photo) {
                Storage::delete($path . $employee->user->photo);
            }

            $file->storeAs($path, $fileName);
            $validatedData['photo'] = $fileName;
        }

        /**
         * Update data user
         */
        $userData = [
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
            'photo' => $validatedData['photo'] ?? $employee->user->photo,
        ];

        if ($request->filled('password')) {
            $userData['password'] = Hash::make($validatedData['password']);
        }

        $employee->user->update($userData);

        /**
         * Update data employee
         */
        $employee->update([
            'phone' => $validatedData['phone'],
            'experience' => $validatedData['experience'] ?? $employee->experience,
            'salary' => $validatedData['salary'],
            'vacation' => $validatedData['vacation'] ?? $employee->vacation,
            'city' => $validatedData['city'],
            'address' => $validatedData['address'],
        ]);

        return response()->json([
            'message' => 'Employee has been updated!',
            'employee' => $employee,
        ], 200);
    }

    /**
     * Menghapus employee dan user terkait.
     */
    public function destroy($storeId, $id)
    {
        $employee = Employee::findOrFail($id);

        /**
         * Hapus foto jika ada
         */
        if($employee->photo){
            Storage::delete('public/employees/' . $employee->photo);
        }

        Employee::destroy($employee->id);

        $user = $employee->user;

        if ($user) {
            $user->delete();
        }

        return response()->json([
            'message' => 'Employee has been deleted!',
        ], 200);
    }
}
