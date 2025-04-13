<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class ProfileController extends Controller
{
    /**
     * Get user profile.
     */
    public function show(Request $request)
    {
        return response()->json(
            $request->user()
        );
    }

    /**
     * Update profile.
     */
    public function update(Request $request)
    {
        $user = Auth::user();

        // Validasi input
        $validator = Validator::make($request->all(), [
            'name' => 'required|max:50',
            'photo' => 'image|file|max:1024',
            'email' => 'nullable|email|max:50|unique:users,email,' . $user->id,
            'username' => 'nullable|min:4|max:25|alpha_dash:ascii|unique:users,username,' . $user->id
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $validatedData = $validator->validated();

        if (isset($validatedData['email'])) {
            if ($validatedData['email'] !== $user->email) {
                $validatedData['email_verified_at'] = null;
            }
        }

        // Handle file upload
        if ($request->hasFile('photo')) {
            // Hapus foto lama jika ada
            if ($user->photo) {
                Storage::delete('public/profile/' . $user->photo);
            }

            $file = $request->file('photo');
            $fileName = hexdec(uniqid()) . '.' . $file->getClientOriginalExtension();
            $file->storeAs('public/profile', $fileName);
            $validatedData['photo'] = $fileName;
        }

        $user->update($validatedData);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user
        ]);
    }

    /**
     * Change password.
     */
    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required',
            'new_password' => 'required|min:6|confirmed'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Current password is incorrect'
            ], 400);
        }

        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        return response()->json([
            'message' => 'Password changed successfully'
        ]);
    }

    /**
     * Delete user account.
     */
    public function destroy()
    {
        $user = Auth::user();

        // Hapus foto profil jika ada
        if ($user->photo) {
            Storage::delete('public/profile/' . $user->photo);
        }

        $user->delete();

        return response()->json([
            'message' => 'User account deleted successfully'
        ]);
    }
}
