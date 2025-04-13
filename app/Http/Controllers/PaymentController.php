<?php

namespace App\Http\Controllers;

use App\Models\PaymentHistory;
use App\Models\Setting;
use App\Models\SubscriptionQuota;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Midtrans\Config;
use Midtrans\Snap;

class PaymentController extends Controller
{
    public function createPayment(Request $request)
    {
        // Validasi request
        $request->validate([
            'quota_transactions' => 'required|integer|min:0',
            'quota_products' => 'required|integer|min:0',
            'quota_employees' => 'required|integer|min:0',
            'quota_stores' => 'required|integer|min:0',
        ]);

        // Mulai database transaction
        DB::beginTransaction();

        try {
            // Ambil harga dari database
            $prices = Setting::whereIn('key', [
                'quota_transactions',
                'quota_products',
                'quota_employees',
                'quota_stores'
            ])->pluck('value', 'key');

            if ($prices->count() !== 4) {
                throw new \Exception('Pricing configuration incomplete');
            }

            // Hitung total harga
            $totalPrice = ($request->quota_transactions * $prices['quota_transactions']) +
                         ($request->quota_products * $prices['quota_products']) +
                         ($request->quota_employees * $prices['quota_employees']) +
                         ($request->quota_stores > 0 ? ($request->quota_stores - 1) * $prices['quota_stores'] : $request->quota_stores * $prices['quota_stores']);

            // Buat order ID yang meaningful
            $orderId = 'SUB-' . time() . '-' . strtoupper(uniqid());

            // Simpan payment history dengan status pending
            $payment = PaymentHistory::create([
                'user_id' => $request->user()->id,
                'order_id' => $orderId,
                'amount' => $totalPrice,
                'status' => 'pending',
                'quota_details' => [
                    'transactions' => $request->quota_transactions,
                    'products' => $request->quota_products,
                    'employees' => $request->quota_employees,
                    'stores' => $request->quota_stores,
                ],
            ]);

            // Konfigurasi Midtrans
            Config::$serverKey = env('MIDTRANS_SERVER_KEY');
            Config::$isProduction = env('MIDTRANS_IS_PRODUCTION', false);
            Config::$isSanitized = true;
            Config::$is3ds = true;

            // Buat transaksi Midtrans
            $transactionDetails = [
                'order_id' => $orderId,
                'gross_amount' => $totalPrice,
            ];

            $customerDetails = [
                'first_name' => $request->user()->name,
                'email' => $request->user()->email,
            ];

            // Item details untuk transparansi
            $itemDetails = [
                [
                    'id' => 'quota_transactions',
                    'price' => $prices['quota_transactions'],
                    'quantity' => $request->quota_transactions,
                    'name' => 'Transaction Quota'
                ],
                // Tambahkan item details lainnya...
            ];

            $transaction = [
                'transaction_details' => $transactionDetails,
                'customer_details' => $customerDetails,
                // 'item_details' => $itemDetails,
            ];

            $snapToken = Snap::getSnapToken($transaction);

            DB::commit();

            return response()->json([
                'snap_token' => $snapToken,
                'order_id' => $orderId,
                'payment_id' => $payment->id,
                'price' => $totalPrice,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function handlePaymentNotification(Request $request)
    {
        // Validasi notifikasi
        $validator = Validator::make($request->all(), [
            'transaction_time' => 'required|date',
            'transaction_status' => 'required|string|in:pending,settlement,cancel,deny,expire',
            'transaction_id' => 'required|string',
            'status_code' => 'required|string',
            'order_id' => 'required|string',
            'gross_amount' => 'required|numeric',
            // 'payment_type' => 'required|string',
            'email' => 'required|email',
            'custom_field1' => 'required|integer', // Quota Transactions
            'custom_field2' => 'required|integer', // Quota Products
            'custom_field3' => 'required|integer', // Quota Employees
            'custom_field4' => 'required|integer', // Quota Stores
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        DB::beginTransaction();

        try {
            // Update payment history
            $payment = PaymentHistory::where('order_id', $request->order_id)->firstOrFail();
            
            $payment->update([
                'status' => $request->transaction_status,
                // 'status' => 'success',
                'payment_method' => $request->payment_type,
                // 'transaction_id' => $request->transaction_id,
                'transaction_time' => $request->transaction_time,
                'metadata' => [
                    'status_code' => $request->status_code,
                    'status_message' => $request->status_message ?? null,
                    'fraud_status' => $request->fraud_status ?? null,
                ]
            ]);

            // Jika pembayaran berhasil
            if ($request->status_code == "200" && $request->transaction_status === "settlement") {
                $user = $request->user();

                // Update atau buat subscription
                SubscriptionQuota::updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'start_date' => Carbon::now(),
                        'end_date' => Carbon::now()->addDays(30),
                        'quota_transactions' => $request->custom_field1,
                        'quota_products' => $request->custom_field2,
                        'quota_employees' => $request->custom_field3,
                        'quota_stores' => $request->custom_field4,
                        'payment_history_id' => $payment->id,
                    ]
                );

                // Logika baru: Aktifkan/nonaktifkan multi_store berdasarkan quota_stores
                $multiStoreActive = $request->custom_field4 > 1;
                
                $user->update([
                    'multi_store' => $multiStoreActive
                ]);

                // Update role berdasarkan multi_store
                if ($multiStoreActive) {
                    $user->removeRole('Employee');
                } else {
                    $user->assignRole('Employee');
                }

                // Kirim notifikasi ke user
                // $user->notify(new PaymentSuccessfulNotification($payment));
            }

            DB::commit();

            return response()->json([
                'message' => 'Payment processed successfully',
                'payment_id' => $payment->id
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to process payment',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}