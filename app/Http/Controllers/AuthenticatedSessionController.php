<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\Employee;
use App\Providers\RouteServiceProvider;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;
use Illuminate\Support\Facades\Validator;

class AuthenticatedSessionController extends Controller
{
    // /**
    //  * Handle an incoming authentication request.
    //  */
    // public function store(LoginRequest $request): RedirectResponse
    // {
    //     $request->authenticate();

    //     $request->session()->regenerate();

    //     return redirect()->intended(RouteServiceProvider::HOME);
    // }

    // /**
    //  * Destroy an authenticated session.
    //  */
    // public function destroy(Request $request): RedirectResponse
    // {
    //     Auth::guard('web')->logout();

    //     $request->session()->invalidate();

    //     $request->session()->regenerateToken();

    //     return redirect('/');
    // }

    // public function store(Request $request)
    // {
    //     // // Validasi input
    //     // $validator = Validator::make($request->all(), [
    //     //     'email' => ['required', 'email'],
    //     //     'password' => ['required'],
    //     // ]);

    //     // if ($validator->fails()) {
    //     //     return response()->json([
    //     //         'message' => 'Validation error',
    //     //         'errors' => $validator->errors(),
    //     //     ], 422);
    //     // }

    //     // return response()->json([
    //     //     'message' => $validator,
    //     // ]);

    //     // // Cek kredensial
    //     // if (!Auth::attempt($validator)) {
    //     //     return response()->json([
    //     //         'message' => 'Invalid credentials'
    //     //     ], 401);
    //     // }

    //     // // Ambil user
    //     // $user = Auth::user();

    //     // // Generate token
    //     // $token = $user->createToken('auth_token')->plainTextToken;

    //     // // Simpan token di cookie
    //     // $cookieToken = cookie('auth_token', $token, 60 * 24); // Berlaku 1 hari
    //     // $cookieUser = cookie('user', json_encode($user), 60 * 24); // Berlaku 1 hari


    //     // Validasi request login
    //     $validator = Validator::make($request->all(), [
    //         'email' => ['required', 'string', 'email', 'max:255'],
    //         'password' => ['required', 'string'],
    //     ]);

    //     // Jika validasi gagal, kembalikan error
    //     if ($validator->fails()) {
    //         return response()->json([
    //             'message' => 'Validation error',
    //             'errors' => $validator->errors(),
    //         ], 422);
    //     }

    //     // Cek kredensial dan login
    //     if (Auth::attempt(['email' => $request->email, 'password' => $request->password])) {
    //         // Ambil user yang sedang login
    //         $user = Auth::user();

    //         // Generate token untuk user yang berhasil login
    //         $token = $user->createToken('auth_token')->plainTextToken;

    //         // Simpan token dan data user di cookies
    //         // $cookieToken = cookie('auth_token', $token, 60 * 24); // Berlaku selama 1 hari
    //         // $cookieUserName = cookie('user_name', $user->name, 60 * 24); // Berlaku selama 1 hari
    //         // $cookieUserUsername = cookie('user_username', $user->username, 60 * 24); // Berlaku selama 1 hari
    //         // $cookieUserEmail = cookie('user_email', $user->email, 60 * 24); // Berlaku selama 1 hari

    //         // Kembalikan response dengan data user dan token
    //         return response()->json([
    //             'message' => 'Login successful',
    //             'user' => $user,
    //             'token' => $token
    //         ]);
    //         // ->withCookie($cookieToken)
    //         // ->withCookie($cookieUserName)
    //         // ->withCookie($cookieUserUsername)
    //         // ->withCookie($cookieUserEmail);
    //     }

    //     // Kembalikan respons dengan cookies (versi lain)
    //     // return response()->json([
    //     //     'message' => 'Login successful',
    //     //     // 'user' => $user,
    //     // ]);
    //     // ->withCookie($cookieToken)
    //     // ->withCookie($cookieUser);
    // }

    // Versi akhir fungsi store
    public function store(Request $request)
    {
        // Validasi request login, bisa menggunakan email atau username
        $validator = Validator::make($request->all(), [
            'email' => ['required_without:username', 'string', 'email', 'exists:users,email'], // wajib jika username tidak diisi
            'username' => ['required_without:email', 'string', 'alpha_dash:ascii', 'exists:users,username'], // wajib jika email tidak diisi
            'password' => ['required', 'string'], // password wajib
        ]);

        // Jika validasi gagal, bisa kembalikan response error (opsional)
        // if ($validator->fails()) {
        //     return response()->json([
        //         'message' => 'Validation error',
        //         'errors' => $validator->errors(),
        //     ], 422);
        // }

        // Ambil kredensial berdasarkan input
        $credentials = $request->only('email', 'password');
        if ($request->has('username')) {
            $credentials = [
                'username' => $request->username,
                'password' => $request->password,
            ];
        }

        // Coba autentikasi user
        if (!Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        // Ambil user yang sedang login
        $user = Auth::user();

        // Buat token autentikasi
        $token = $user->createToken('auth_token')->plainTextToken;

        // Ambil data employee jika ada
        $employee = Employee::where('user_id', $user->id)->first();

        // Persiapkan data user yang akan dikembalikan
        $user = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'photo' => $user->photo,
            'store_id' => isset($employee) ? $employee->store_id : null,
            'roles' => $user->getRoleNames(), // ambil semua peran user
            'permissions' => $user->getAllPermissions()->pluck('name'), // ambil semua izin user
            'stores' => $user->stores, // daftar toko user
        ];

        // Jika employee punya store yang belum ada di daftar user stores, tambahkan
        if (isset($employee) && $employee->store) {
            if (!$user['stores']->contains($employee->store)) {
                $user['stores']->push($employee->store);
            }
        }

        // Kembalikan response JSON dengan user dan token
        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token
        ]);
    }

    // Fungsi logout / destroy token user
    public function destroy(Request $request)
    {
        // Hapus token akses saat ini
        $request->user()->currentAccessToken()->delete();

        // Kembalikan pesan logout berhasil
        return response()->json([
            'message' => 'Logout successful'
        ]);
    }
}
