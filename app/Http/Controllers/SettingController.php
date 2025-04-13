<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class SettingController extends Controller
{
    /**
     * Get all settings.
     */
    public function index()
    {
        $settings = Setting::all();
        return response()->json($settings);
    }

    /**
     * Get a specific setting by key.
     */
    public function show($key)
    {
        $setting = Setting::where('key', $key)->first();

        if (!$setting) {
            return response()->json(['message' => 'Setting not found'], 404);
        }

        return response()->json($setting);
    }

    /**
     * Update a setting by key.
     */
    public function update(Request $request, $key)
    {
        $request->validate([
            'value' => 'required'
        ]);

        $setting = Setting::updateOrCreate(
            ['key' => $key],
            ['value' => $request->value]
        );

        return response()->json(['message' => 'Setting updated', 'setting' => $setting]);
    }

    // public function multi(Request $request)
    // {
    //     $request->validate([
    //         'multi_store' => 'required'
    //     ]);

    //     $user = Auth::user();

    //     if($request->multi_store == 1) {
    //         $user->update([
    //             multi_store => 1
    //         ]);
    //     } else {
    //         $user->update([
    //             multi_store => 0
    //         ]);
    //     }

    //     return response()->json(['message' => 'Setting updated', 'user' => $user]);
    // }

    public function multi(Request $request)
    {
        $request->validate([
            'multi_store' => 'required|boolean'
        ]);

        $user = User::find(auth()->id());
        
        $user->update([
            'multi_store' => $request->multi_store
        ]);

        if ($request->multi_store == 1) {
            $user->removeRole('Employee');
        }

        if ($request->multi_store == 0) {
            $user->assignRole('Employee');
        }

        return response()->json(['message' => 'Setting updated', 'user' => $user]);
    }
}
