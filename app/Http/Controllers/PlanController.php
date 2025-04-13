<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\Request;
use Stripe\Price;
use Stripe\Stripe;

class PlanController extends Controller
{
    // public function __construct()
    // {
    //     $this->middleware('auth');
    // }

    // public function index()
    // {
    //     // $plans = Plan::all();
    //     // return view('subscriptions.plans', [
    //     //     'plans' => $plans
    //     // ]);

    //     Stripe::setApiKey(env('STRIPE_SECRET'));

    //     $prices = Price::all();

    //     return response()->json($prices);

    //     // return response()->json(
    //     //     Plan::all(),
    //     // );
    // }

    public function index()
    {
        Stripe::setApiKey(env('STRIPE_SECRET'));

        $prices = Price::all();

        $plans = collect($prices->data)->map(function ($price) {
            return [
                'id' => $price->id,
                'product' => $price->product,
                'amount' => $price->unit_amount / 100, // Convert cents to currency
                'currency' => strtoupper($price->currency),
                'interval' => $price->recurring ? $price->recurring->interval : null,
            ];
        });

        return response()->json($plans);
    }

    public function indexSub(Request $request)
    {
        return view('subscriptions.checkout', [
            'intent' => $request->user()->createSetupIntent()
        ]);
    }

    public function store(Request $request)
    {
        $this->validate($request, [
            'token' => 'required'
        ]);

        $plan = Plan::where('slug', $request->plan)
            ->orWhere('slug', 'basic-monthly')
            ->first();

        $request->user()
            ->newSubscription('default', $plan->stripe_id)
            ->create($request->token);

        return back();
    }

    public function accountIndex(Request $request)
    {
        return view('subscriptions.account');
    }

    public function subscriptionDetail(Request $request)
    {
        return view('subscriptions.detail');
    }
    public function cancel(Request $request)
    {
        return view('subscriptions.cancel');
    }
    public function resume(Request $request)
    {
        return view('subscriptions.resume');
    }
}
