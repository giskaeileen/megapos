<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\SubscriptionQuota;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SubscriptionQuotaController extends Controller
{
    private function calculatePrice($quotaTransactions, $quotaProducts, $quotaEmployees, $quotaStores)
    {
        $priceTransactions = 500 * $quotaTransactions;
        $priceProducts = 500 * $quotaProducts;
        $priceEmployees = 1000 * $quotaEmployees;
        $priceStores = 50000 * $quotaStores;

        return $priceTransactions + $priceProducts + $priceEmployees + $priceStores;
    }

    public function store(Request $request)
    {
        // Validasi input secara manual
        $validator = Validator::make($request->all(), [
            'token' => 'required',
            'quota_transactions' => 'required|integer|min:0',
            'quota_products' => 'required|integer|min:0',
            'quota_employees' => 'required|integer|min:0',
            'quota_stores' => 'required|integer|min:0',
            'plan' => 'nullable|string|exists:plans,slug',
        ]);

        // Jika validasi gagal, kembalikan response JSON dengan error
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        // Hitung harga berdasarkan kuota
        $amount = $this->calculatePrice(
            $request->quota_transactions,
            $request->quota_products,
            $request->quota_employees,
            $request->quota_stores
        );

        // ============>
        $plan = Plan::where('slug', $request->plan)
            ->orWhere('slug', 'basic-monthly')
            ->firstOrFail();
        // ============>

        // Buat subscription di Stripe
        $subscription = $user->newSubscription('default', $plan->stripe_id) // Ganti dengan ID plan Stripe
            ->create($request->token, [
                'amount' => $amount,
                'currency' => 'idr',
            ]);

        // Simpan kuota ke database
        $user->subscriptionQuota()->create([
            'quota_transactions' => $request->quota_transactions,
            'quota_products' => $request->quota_products,
            'quota_employees' => $request->quota_employees,
            'quota_stores' => $request->quota_stores,
        ]);

        return response()->json([
            'message' => 'Subscription berhasil!',
            'subscription' => $subscription,
            'quota' => $user->subscriptionQuota,
        ]);
    }

    public function updateQuota(Request $request)
    {
        $this->validate($request, [
            'quota_transactions' => 'required|integer|min:0',
            'quota_products' => 'required|integer|min:0',
            'quota_employees' => 'required|integer|min:0',
            'quota_stores' => 'required|integer|min:0',
        ]);

        $user = $request->user();

        // Update kuota
        $user->subscriptionQuota()->update([
            'quota_transactions' => $request->quota_transactions,
            'quota_products' => $request->quota_products,
            'quota_employees' => $request->quota_employees,
            'quota_stores' => $request->quota_stores,
        ]);

        return response()->json([
            'message' => 'Kuota berhasil diupdate!',
            'quota' => $user->subscriptionQuota,
        ]);
    }

    public function useQuota($user, $type, $amount = 1)
    {
        $quota = $user->subscriptionQuota;

        switch ($type) {
            case 'transactions':
                $quota->quota_transactions -= $amount;
                break;
            case 'products':
                $quota->quota_products -= $amount;
                break;
            case 'employees':
                $quota->quota_employees -= $amount;
                break;
            case 'stores':
                $quota->quota_stores -= $amount;
                break;
        }

        $quota->save();
    }
}
