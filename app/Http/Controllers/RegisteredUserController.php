<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Providers\RouteServiceProvider;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\View\View;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Cookie;


class RegisteredUserController extends Controller
{
    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    // public function store(Request $request)
    // {
    //     // // Validasi request
    //     // $validator = Validator::make($request->all(), [
    //     //     'name' => ['required', 'string', 'max:255'],
    //     //     'username' => ['required', 'string', 'max:255', 'unique:users', 'alpha_dash:ascii'],
    //     //     'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
    //     //     'password' => ['required', 'confirmed', Rules\Password::defaults()],
    //     // ]);

    //     // if ($validator->fails()) {
    //     //     return response()->json([
    //     //         'message' => 'Validation error',
    //     //         'errors' => $validator->errors(),
    //     //     ], 422);
    //     // }

    //     // // Buat user baru
    //     // $user = User::create([
    //     //     'name' => $request->name,
    //     //     'username' => $request->username,
    //     //     'email' => $request->email,
    //     //     'password' => Hash::make($request->password),
    //     // ]);

    //     // // Trigger event user terdaftar
    //     // event(new Registered($user));

    //     // // Login user
    //     // Auth::login($user);

    //     // // Kembalikan respons JSON
    //     // return response()->json([
    //     //     'message' => 'User registered successfully',
    //     //     'user' => $user,
    //     //     'token' => $user->createToken('auth_token')->plainTextToken,
    //     // ], 201);

    //     // Validasi request
    //     $validator = Validator::make($request->all(), [
    //         'name' => ['required', 'string', 'max:255'],
    //         'username' => ['required', 'string', 'max:255', 'unique:users', 'alpha_dash:ascii'],
    //         'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
    //         'password' => ['required', 'confirmed', Rules\Password::defaults()],
    //     ]);

    //     if ($validator->fails()) {
    //         return response()->json([
    //             'message' => 'Validation error',
    //             'errors' => $validator->errors(),
    //         ], 422);
    //     }

    //     // Buat user baru
    //     $user = User::create([
    //         'name' => $request->name,
    //         'username' => $request->username,
    //         'email' => $request->email,
    //         'password' => Hash::make($request->password),
    //     ]);

    //     // Trigger event user terdaftar
    //     event(new Registered($user));

    //     // Generate token
    //     $token = $user->createToken('auth_token')->plainTextToken;

    //     // // Simpan token dan data user di cookies
    //     // $cookieToken = cookie('auth_token', $token, 60 * 24); // Berlaku selama 1 hari
    //     // $cookieUserName = cookie('user_name', $user->name, 60 * 24); // Berlaku selama 1 hari
    //     // $cookieUserUsername = cookie('user_username', $user->username, 60 * 24); // Berlaku selama 1 hari
    //     // $cookieUserEmail = cookie('user_email', $user->email, 60 * 24); // Berlaku selama 1 hari

    //     // Login user
    //     Auth::login($user);

    //     // Kembalikan respons JSON dengan cookies
    //     return response()->json([
    //         'message' => 'User registered successfully',
    //         'user' => $user,
    //         'token' => $token
    //     ]);
    //     // ])->withCookie($cookieToken)
    //     //   ->withCookie($cookieUserName)
    //     //   ->withCookie($cookieUserUsername)
    //     //   ->withCookie($cookieUserEmail);
    // }

    public function store(Request $request)
    {
        // Validasi request
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:255', 'unique:users', 'alpha_dash:ascii'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Buat user baru
        $user = User::create([
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Trigger event user terdaftar
        event(new Registered($user));

        // Generate token
        $token = $user->createToken('auth_token')->plainTextToken;

        // Kembalikan respons JSON dengan cookies
        return response()->json([
            'message' => 'User registered successfully',
            'user' => $user,
            'token' => $token
        ]);
    }
}
