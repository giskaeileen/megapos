<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class MemberController extends Controller
{
    // public function __construct()
    // {
    //     $this->middleware('can:Create Customer')->only(['store']);
    //     $this->middleware('can:Read Customer')->only(['index', 'show']);
    //     $this->middleware('can:Update Customer')->only(['update']);
    //     $this->middleware('can:Delete Customer')->only(['destroy']);
    // }

    public function index($storeSlug)
    {
        $row = (int) request('row', 10);

        if ($row < 1 || $row > 100) {
            abort(400, 'The per-page parameter must be an integer between 1 and 100.');
        }

        $store_id = Store::where('slug', $storeSlug)->first()->id;

        $filters = request()->only([
            'search',
            'name',
            'slug',
        ]);

        return response()->json(
            Member::filter($filters)
                ->where('store_id', $store_id)
                ->sortable()
                ->paginate($row)
                ->appends(request()->query()
            ),
        );
    }

    public function store($storeSlug, Request $request)
    {
        // Validasi request
        $validator = Validator::make($request->all(), [
            'photo' => 'nullable|image|file|max:1024',
            'name' => 'required|string|max:50',
            'email' => 'nullable|email|max:50|unique:members,email',
            'phone' => 'required|string|max:15|unique:members,phone',
            'city' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:100',
        ]);

        // Jika validasi gagal, kembalikan error
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validatedData = $validator->validated();

        $store_id = Store::where('slug', $storeSlug)->first()->id;

        $validatedData['store_id'] = $store_id;

        /**
         * Handle upload image with Storage.
         */
        if ($file = $request->file('photo')) {
            $fileName = hexdec(uniqid()).'.'.$file->getClientOriginalExtension();
            $path = 'public/members/';

            $file->storeAs($path, $fileName);
            $validatedData['photo'] = $fileName;
        }

        $customer = Member::create($validatedData);

        // Respons success
        return response()->json($customer, 201);
    }

    public function show($storeSlug, $id)
    {
        $customer = Member::find($id);

        if (!$customer) {
            return response()->json([
                'message' => 'Customer not found'
            ], 404);
        }

        return response()->json($customer);
    }

    public function update($storeSlug, $id, Request $request)
    {
        $customer = Member::findOrFail($id);

        // Validasi request
        $validator = Validator::make($request->all(), [
            'photo' => 'nullable|image|file|max:1024',
            'name' => 'required|string|max:50',
            'email' => 'nullable|email|max:50|unique:members,email,'.$customer->id,
            'phone' => 'required|string|max:15|unique:members,phone,'.$customer->id,
            'city' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:100',
        ]);

        // Jika validasi gagal, kembalikan error
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Validasi data yang sudah diperiksa
        $validatedData = $validator->validated();

        /**
         * Handle upload image with Storage.
         */
        if ($file = $request->file('photo')) {
            $fileName = hexdec(uniqid()).'.'.$file->getClientOriginalExtension();
            $path = 'public/members/';

            /**
             * Delete photo if exists.
             */
            if($customer->photo){
                Storage::delete($path . $customer->photo);
            }

            $file->storeAs($path, $fileName);
            $validatedData['photo'] = $fileName;
        }

        // Update
        $customer->update($validatedData);

        // Respons sukses
        return response()->json([
            'message' => 'Customer has been updated!',
            'customer' => $customer,
        ], 200);
    }

    public function destroy($storeSlug, $id)
    {
        $customer = Member::findOrFail($id);

        /**
         * Delete photo if exists.
         */
        if($customer->photo){
            Storage::delete('public/members/' . $customer->photo);
        }

        Member::destroy($customer->id);

        // Respons sukses
        return response()->json([
            'message' => 'Customer has been deleted!',
        ], 200);
    }
}