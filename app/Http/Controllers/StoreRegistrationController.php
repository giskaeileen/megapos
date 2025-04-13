<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Models\StoreRegistration;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Mail\StoreApprovedMail;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Exception;
use Illuminate\Support\Facades\Log;

class StoreRegistrationController extends Controller
{
    public function index()
    {
        $row = (int) request('row', 10);

        if ($row < 1 || $row > 100) {
            abort(400, 'The per-page parameter must be an integer between 1 and 100.');
        }

        $filters = request()->only([
            'search', 
            'store_name', 
            'owner_name', 
            'owner_email', 
            'status', 
            'country', 
            'city', 
            'state'
        ]);

        return response()->json(
            // StoreRegistration::filter(request(['search']))
            StoreRegistration::filter($filters)
                ->sortable()
                ->paginate($row)
                ->appends(request()->query()
            ),
        );
    }

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'store_name' => 'required|string|max:255|unique:stores,name',
            'slug' => 'required|string',
            'country' => 'required|string',
            'city' => 'required|string',
            'state' => 'required|string',
            'zip' => 'required|string',
            'street_address' => 'required|string',
            'owner_name' => 'required|string|max:255',
            // 'owner_email' => 'required|email|unique:store_registrations,owner_email|unique:users,email',
            'owner_email' => 'required|email|unique:users,email',
            'owner_phone' => 'required|string|max:15',
        ]);

        // Jika validasi gagal, kembalikan error
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validatedData = $validator->validated();

        StoreRegistration::create($validatedData);

        return response()->json(['message' => 'Pendaftaran berhasil, menunggu persetujuan admin.']);
    }

    public function approve($id)
    {
        $registration = StoreRegistration::findOrFail($id);

        // Cek apakah mail_username dan mail_password tersedia
        $mailUsername = Config::get('mail.username');
        $mailPassword = Config::get('mail.password');

        // return response()->json($mailPassword);

        if (empty($mailUsername) || empty($mailPassword)) {
            return response()->json([
                // 'message' => 'bangke'
                'message' => 'Failed to send email. Invalid email configuration.',
            ], 500);
        }

        // Generate password acak
        $password = Str::random(12);

        // Buat akun kepala toko
        $user = User::create([
            'name' => $registration->owner_name,
            'email' => $registration->owner_email,
            'password' => Hash::make($password),
            'role' => 'manager',
        ]);

        // Buat data toko
        $store = Store::create([
            'name' => $registration->store_name,
            'slug' => $registration->slug,
            'country' => $registration->country,
            'city' => $registration->city,
            'state' => $registration->state,
            'zip' => $registration->zip,
            'address' => $registration->street_address,
            'user_id' => $user->id,
        ]);

        $user->assignRole('Owner');
        $user->assignRole('Employee');

        // Coba kirim email, jika gagal rollback data
        try {
            Mail::to($user->email)->send(new StoreApprovedMail($store, $user, $password));
        } catch (Exception $e) {
            // Log error jika email gagal dikirim
            Log::error('Gagal mengirim email: ' . $e->getMessage());

            // Hapus data yang telah dibuat agar tidak ada akun/store tanpa pemberitahuan
            $user->delete();
            $store->delete();

            return response()->json([
                'message' => $e->getMessage()
                // 'message' => 'Failed to send email. Invalid email configuration.',
            ], 500);
        }

        $registration->update(['status' => 'approved']);

        return response()->json(['message' => 'Store approved.']);
    }

    public function reject($id)
    {
        $registration = StoreRegistration::findOrFail($id);
        $registration->update(['status' => 'rejected']);

        return response()->json(['message' => 'Pendaftaran toko ditolak.']);
    }
}
