<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Order;
use App\Models\PaymentHistory;
use App\Models\Plan;
use App\Models\Product;
use App\Models\QuotaSetting;
use App\Models\Setting;
use App\Models\SubscriptionQuota;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Midtrans\Config;
use Midtrans\Snap;

class SubscriptionController extends Controller
{
    // public function __construct()
    // {
    //     $this->middleware('auth');
    // }

    public function cancel(Request $request)
    {
        // $this->authorize('cancel', $subscription = $request->user()->subscription('default'));
        $subscription = $request->user()->subscription('default');

        $subscription->cancel();

        // return redirect()->route('account.subscriptions');
    }

    public function resume(Request $request)
    {
        // $this->authorize('resume', $subscription = $request->user()->subscription('default'));
        $subscription = $request->user()->subscription('default');

        $subscription->resume();

        // return redirect()->route('account.subscriptions');
    }

    public function store(Request $request)
    {
        $this->validate($request, [
            'token' => 'required',
            'plan'  => 'required'
        ]);

        $plan = Plan::where('slug', $request->plan)
            ->orWhere('slug', 'basic-monthly')
            ->firstOrFail();

        $user = $request->user();

        // Buat subscription di Stripe dan simpan ke database
        $subscription = $user->newSubscription('default', $plan->stripe_id)
            ->create($request->token);


        return response()->json([
            'message' => 'Subscription berhasil!',
            'subscription' => $subscription
        ]);
    }

    public function current(Request $request)
    {
        $user = Auth::user();

        // Ambil subscription yang sedang berjalan
        $subscription = SubscriptionQuota::where('user_id', $user->id)
            ->where('end_date', '>', Carbon::now()) // Hanya subscription yang masih aktif
            ->latest() // Ambil yang terbaru
            ->first();

        if (!$subscription) {
            return response()->json([
                'message' => 'There are no active packages.',
            ], 404);
        }

        // Hitung sisa hari
        $endDate = Carbon::parse($subscription->end_date);
        $remainingDays = $endDate->diffInDays(Carbon::now());

        return response()->json([
            'subscription' => [
                'start_date' => $subscription->start_date,
                'end_date' => $subscription->end_date,
                'remaining_days' => $remainingDays,
                'quota_transactions' => $subscription->quota_transactions,
                'quota_products' => $subscription->quota_products,
                'quota_employees' => $subscription->quota_employees,
                'quota_stores' => $subscription->quota_stores,
            ],
        ]);
    }

    public function addQuota(Request $request)
    {
        $user = Auth::user();

        // Validasi request
        $request->validate([
            'additional_transactions' => 'required|integer|min:0',
            'additional_products' => 'required|integer|min:0',
            'additional_employees' => 'required|integer|min:0',
            'additional_stores' => 'required|integer|min:0',
        ]);

        // Mulai database transaction
        DB::beginTransaction();

        try {
            // Ambil subscription yang sedang berjalan
            $subscription = SubscriptionQuota::where('user_id', $user->id)
                // ->where('end_date', '>', Carbon::now())
                ->latest()
                ->first();

            if (!$subscription) {
                return response()->json([
                    'message' => 'There are no active packages.',
                ], 404);
            }

            // Ambil harga dari database
            $prices = Setting::whereIn('key', [
                'quota_transactions',
                'quota_products',
                'quota_employees',
                'quota_stores'
            ])->pluck('value', 'key');

            // Pastikan semua harga ada
            if ($prices->count() !== 4) {
                return response()->json(['error' => 'Pricing configuration incomplete'], 500);
            }

            // Hitung total harga
            $additionalPrice = ($request->additional_transactions * $prices['quota_transactions']) +
                ($request->additional_products * $prices['quota_products']) +
                ($request->additional_employees * $prices['quota_employees']) +
                ($request->additional_stores * $prices['quota_stores']);

            // Buat order ID yang meaningful
            $orderId = 'SUB-' . time() . '-' . strtoupper(uniqid());

            // Simpan payment history dengan status pending
            $payment = PaymentHistory::create([
                'user_id' => $request->user()->id,
                'order_id' => $orderId,
                'amount' => $additionalPrice,
                'status' => 'pending',
                'quota_details' => [
                    'current_transactions' => $subscription->quota_transactions,
                    'current_products' => $subscription->quota_products,
                    'current_employees' => $subscription->quota_employees,
                    'current_stores' => $subscription->quota_stores,
                    'additional_transactions' => $request->additional_transactions,
                    'additional_products' => $request->additional_products,
                    'additional_employees' => $request->additional_employees,
                    'additional_stores' => $request->additional_stores,
                    'new_transactions' => $subscription->quota_transactions + $request->additional_transactions,
                    'new_products' => $subscription->quota_products + $request->additional_products,
                    'new_employees' => $subscription->quota_employees + $request->additional_employees,
                    'new_stores' => $subscription->quota_stores + $request->additional_stores,
                ],
            ]);

            // Konfigurasi Midtrans
            Config::$serverKey = env('MIDTRANS_SERVER_KEY');
            Config::$isProduction = env('MIDTRANS_IS_PRODUCTION', false);
            Config::$isSanitized = true;
            Config::$is3ds = true;

            // Buat transaksi Midtrans
            $transactionDetails = [
                'order_id' => $orderId, // Gunakan order_id yang sama
                'gross_amount' => $additionalPrice, // Total harga tambahan
            ];

            $customerDetails = [
                'first_name' => $user->name,
                'email' => $user->email,
            ];

            $customFields = [
                'custom_field1' => $request->additional_transactions,
                'custom_field2' => $request->additional_products,
                'custom_field3' => $request->additional_employees,
                'custom_field4' => $request->additional_stores,
            ];

            $transaction = [
                'transaction_details' => $transactionDetails,
                'customer_details' => $customerDetails,
                'custom_fields' => $customFields,
            ];

            DB::commit();

            try {
                $snapToken = Snap::getSnapToken($transaction);
                return response()->json([
                    'snap_token' => $snapToken,
                    'payment_id' => $payment->id, // Kirim payment ID untuk referensi callback
                    'order_id' => $orderId,
                ]);
            } catch (\Exception $e) {
                DB::rollBack();
                return response()->json(['error' => $e->getMessage()], 500);
            }
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function handleAddQuota(Request $request)
    {
        // Validasi payload notifikasi
        $payload = $request->getContent();
        $notification = json_decode($payload, true);

        // Verifikasi signature key (uncomment when ready)
        /*
        $validSignatureKey = hash('sha512', 
            $notification['order_id'] . 
            $notification['status_code'] . 
            $notification['gross_amount'] . 
            env('MIDTRANS_SERVER_KEY')
        );
        if ($notification['signature_key'] !== $validSignatureKey) {
            return response()->json(['message' => 'Invalid signature'], 400);
        }
        */

        DB::beginTransaction();
        try {
            $orderId = $notification['order_id'];
            $statusCode = $notification['status_code'];
            $transactionStatus = $notification['transaction_status'];
            // $grossAmount = $notification['gross_amount'];

            // Temukan payment history yang sesuai
            $payment = PaymentHistory::where('order_id', $orderId)->first();

            if (!$payment) {
                return response()->json(['message' => 'Payment not found'], 404);
            }

            // Update status payment berdasarkan notifikasi
            $payment->update([
                'status' => $transactionStatus,
                'payment_method' => $notification['payment_type'] ?? null,
                'transaction_time' => $notification['transaction_time'] ?? null,
                'settlement_time' => $notification['settlement_time'] ?? null,
            ]);

            // Jika pembayaran berhasil
            if ($statusCode == "200" && $transactionStatus === "settlement") {
                $user = User::find($payment->user_id);

                if ($user) {
                    // Ambil subscription yang sedang berjalan
                    $subscription = SubscriptionQuota::where('user_id', $user->id)
                        // ->where('end_date', '>', Carbon::now()) // Uncomment if you want to check active subscription
                        ->latest()
                        ->first();

                    if ($subscription) {
                        // Dapatkan detail tambahan kuota dari payment history
                        $quotaDetails = $payment->quota_details;

                        // Update kuota subscription
                        $subscription->update([
                            'quota_transactions' => $quotaDetails['new_transactions'] ?? ($subscription->quota_transactions + ($notification['custom_field1'] ?? 0)),
                            'quota_products' => $quotaDetails['new_products'] ?? ($subscription->quota_products + ($notification['custom_field2'] ?? 0)),
                            'quota_employees' => $quotaDetails['new_employees'] ?? ($subscription->quota_employees + ($notification['custom_field3'] ?? 0)),
                            'quota_stores' => $quotaDetails['new_stores'] ?? ($subscription->quota_stores + ($notification['custom_field4'] ?? 0)),
                        ]);

                        // Logika baru: Aktifkan/nonaktifkan multi_store berdasarkan quota_stores
                        $multiStoreActive = $quotaDetails['new_stores'] > 1;
                        
                        $user->update([
                            'multi_store' => $multiStoreActive
                        ]);

                        // Update role berdasarkan multi_store
                        if ($multiStoreActive) {
                            $user->removeRole('Employee');
                        } else {
                            $user->assignRole('Employee');
                        }

                        // Kirim notifikasi ke user (email/notification)
                        // $user->notify(new QuotaAddedNotification($payment, $subscription));
                    }
                }
            }

            DB::commit();
            return response()->json(['message' => 'Notification processed successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to process quota addition: ' . $e->getMessage());
            return response()->json(['message' => 'Error processing notification', 'error' => $e->getMessage()], 500);
        }
    }

    public function saveQuota(Request $request)
    {
        $user = Auth::user();

        // Validasi request
        $request->validate([
            'quota_transactions' => 'required|integer|min:0',
            'quota_products' => 'required|integer|min:0',
            'quota_employees' => 'required|integer|min:0',
            'quota_stores' => 'required|integer|min:0',
        ]);

        // Ambil atau buat subscription yang sedang berjalan
        $subscription = QuotaSetting::where('user_id', $user->id)
            ->latest()
            ->first();

        if (!$subscription) {
            // Jika tidak ada subscription yang aktif, buat baru
            $subscription = QuotaSetting::create([
                'user_id' => $user->id,
                'quota_transactions' => $request->quota_transactions,
                'quota_products' => $request->quota_products,
                'quota_employees' => $request->quota_employees,
                'quota_stores' => $request->quota_stores,
            ]);
        } else {
            // Jika ada subscription yang aktif, update kuota
            $subscription->update([
                'quota_transactions' => $request->quota_transactions,
                'quota_products' => $request->quota_products,
                'quota_employees' => $request->quota_employees,
                'quota_stores' => $request->quota_stores,
            ]);
        }

        return response()->json([
            'message' => 'Kuota berhasil disimpan.',
            'subscription' => $subscription,
        ]);
    }

    public function fetchQuotaSettings(Request $request)
    {
        $user = $request->user();

        // Ambil data kuota dari tabel quota_settings
        $quotaSetting = QuotaSetting::where('user_id', $user->id)->first();

        if (!$quotaSetting) {
            // Jika tidak ada data kuota, kembalikan nilai default
            return response()->json([
                'quota_transactions' => 0,
                'quota_products' => 0,
                'quota_employees' => 0,
                'quota_stores' => 0,
            ]);
        }

        // Kembalikan data kuota
        return response()->json([
            'quota_transactions' => $quotaSetting->quota_transactions,
            'quota_products' => $quotaSetting->quota_products,
            'quota_employees' => $quotaSetting->quota_employees,
            'quota_stores' => $quotaSetting->quota_stores,
        ]);
    }

    // app/Http/Controllers/DashboardController.php
    public function getOwnerStatistics(Request $request)
    {
        $user = $request->user(); // Get authenticated owner

        // Get all store IDs owned by this user
        $storeIds = $user->stores()->pluck('id');

        // Count data from all stores
        $statistics = [
            'total_stores' => $user->stores()->count(),
            'total_orders' => Order::whereIn('store_id', $storeIds)->count(),
            'total_products' => Product::whereIn('store_id', $storeIds)->count(),
            'total_employees' => Employee::whereIn('store_id', $storeIds)->count(),

            // Jika ingin menghitung total penjualan
            'total_sales' => Order::whereIn('store_id', $storeIds)
                ->where('payment_status', 'paid')
                ->sum('total'),

            // Data per store (opsional)
            'stores_data' => $user->stores()->withCount([
                'orders',
                'products',
                'employees'
            ])->get()
        ];

        return response()->json($statistics);
    }

    public function getActiveSubscriptions()
    {
        // Ambil owner yang memiliki subscription aktif
        $owners = User::role('Owner')
            ->whereHas('subscription', function($query) {
                $query->where('end_date', '>', Carbon::now());
            })
            ->with(['stores', 'subscription'])
            ->get()
            ->map(function($owner) {
                // Hitung sisa waktu subscription
                $remainingDays = Carbon::now()->diffInDays($owner->subscription->end_date, false);
                
                return [
                    'owner_id' => $owner->id,
                    'owner_image' => $owner->photo,
                    'owner_name' => $owner->name,
                    'owner_email' => $owner->email,
                    'subscription_end_date' => $owner->subscription->end_date,
                    'remaining_days' => $remainingDays > 0 ? $remainingDays : 0,
                    'stores' => $owner->stores->map(function($store) {
                        return [
                            'store_id' => $store->id,
                            'store_name' => $store->name,
                            'store_address' => $store->address,
                            'created_at' => $store->created_at
                        ];
                    }),
                    'quota' => [
                        'transactions' => $owner->subscription->quota_transactions,
                        'products' => $owner->subscription->quota_products,
                        'employees' => $owner->subscription->quota_employees,
                        'stores' => $owner->subscription->quota_stores,
                    ]
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $owners
        ]);
    }
}
