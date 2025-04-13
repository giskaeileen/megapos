<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    public function __construct()
    {
        $this->middleware('can:Create User')->only(['store']);
        $this->middleware('can:Read User')->only(['index', 'show']);
        $this->middleware('can:Update User')->only(['update']);
        $this->middleware('can:Delete User')->only(['destroy']);
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
            User::filter($filters)
                ->sortable()
                ->with('roles')
                ->paginate($row)
                ->appends(request()->query()
            ),
        );
    }

    public function store(Request $request)
    {
        // Validasi request
        $validator = Validator::make($request->all(), [
            'name' => 'required|max:50',
            'photo' => 'nullable|image|file|max:1024',
            'email' => 'required|email|max:50|unique:users,email',
            'username' => 'required|min:4|max:25|alpha_dash:ascii|unique:users,username',
            'password' => 'required|min:6|confirmed',
            'password_confirmation' => 'required_with:password|same:password',
            'role' => 'nullable|exists:roles,name',
        ]);

        // Jika validasi gagal, kembalikan error
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Hash password
        $validatedData = $validator->validated();
        $validatedData['password'] = Hash::make($validatedData['password']);

        // Handle upload photo
        if ($request->hasFile('photo')) {
            $file = $request->file('photo');
            $fileName = hexdec(uniqid()) . '.' . $file->getClientOriginalExtension();
            $path = 'public/profile/';

            // Menyimpan file ke Storage
            $file->storeAs($path, $fileName);
            $validatedData['photo'] = $fileName;
        }

        // Buat user baru
        $user = User::create($validatedData);

        // Assign role jika ada
        if ($request->role) {
            $user->assignRole($request->role);
        }

        // Respons success
        return response()->json($user, 201);
    }

    public function show($id)
    {
        $user = User::with('roles')->find($id);

        if (!$user) {
            return response()->json([
                'message' => 'User not found'
            ], 404);
        }

        return response()->json($user);
    }


    // error not found 404 gara2 User $user, maka ganti dengan $id
    public function update($id, Request $request)
    {
        $user = User::findOrFail($id);

        // Validasi request
        $validator = Validator::make($request->all(), [
            'name' => 'required|max:50',
            'photo' => 'nullable|image|file|max:1024',
            'email' => 'required|email|max:50|unique:users,email,' . $user->id,
            'username' => 'required|min:4|max:25|alpha_dash:ascii|unique:users,username,' . $user->id,
        ]);

        // Jika ada perubahan password, tambahkan validasi
        if ($request->password || $request->password_confirmation) {
            $validator->addRules([
                'password' => 'min:6|required_with:password_confirmation',
                'password_confirmation' => 'min:6|same:password',
            ]);
        }

        // Jika validasi gagal, kembalikan error
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Validasi data yang sudah diperiksa
        $validatedData = $validator->validated();
        
        // Hash password jika ada perubahan
        if (isset($request->password)) {
            $validatedData['password'] = Hash::make($request->password);
        }

        // Handle upload photo jika ada perubahan
        if ($request->hasFile('photo')) {
            $file = $request->file('photo');
            $fileName = hexdec(uniqid()) . '.' . $file->getClientOriginalExtension();
            $path = 'public/profile/';

            // Menghapus foto lama jika ada
            if ($user->photo) {
                Storage::delete($path . $user->photo);
            }

            // Menyimpan file baru
            $file->storeAs($path, $fileName);
            $validatedData['photo'] = $fileName;
        }

        // Update data user
        $user->update($validatedData);

        // Sinkronisasi role jika diberikan
        if ($request->role) {
            $user->syncRoles($request->role);
        }

        // Respons sukses
        return response()->json([
            'message' => 'User has been updated!',
            'user' => $user,
        ], 200);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);

        /**
         * Delete photo if exists.
         */
        if($user->photo){
            Storage::delete('public/profile/' . $user->photo);
        }

        User::destroy($user->id);

        // Respons sukses
        return response()->json([
            'message' => 'User has been deleted!',
        ], 200);
    }
}
