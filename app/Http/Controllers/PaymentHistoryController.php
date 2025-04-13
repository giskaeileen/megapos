<?php

namespace App\Http\Controllers;

use App\Models\PaymentHistory;
use Illuminate\Http\Request;

class PaymentHistoryController extends Controller
{
    public function getLastPaymentHistory(Request $request)
    {
        $payment = PaymentHistory::where('user_id', $request->user()->id)
                    ->orderBy('created_at', 'desc')
                    ->first();

        if (!$payment) {
            return response()->json(['message' => 'No payment history found'], 404);
        }

        return response()->json([
            'id' => $payment->id,
            'order_id' => $payment->order_id,
            'amount' => $payment->amount,
            'quota_details' => $payment->quota_details,
            'created_at' => $payment->created_at
        ]);
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
            'email',
            'username',
        ]);

        return response()->json(
            PaymentHistory::filter($filters)
                ->where('status', 'settlement')
                ->sortable()
                // ->with('roles')
                ->paginate($row)
                ->appends(request()->query()
            ),
        );
    }

}
