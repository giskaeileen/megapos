<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Store;
use Intervention\Image\Facades\Image;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Validator;

class SupplierController extends Controller
{
    /**
     * Display a listing of the resource.
     */
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
            'email',
            'phone',
            'address',
            'shopname',
            'type',
            'account_holder',
            'account_number',
            'bank_name',
            'bank_branch',
            'city',
        ]);

        return response()->json(
            Supplier::filter($filters)
                ->where('store_id', $store_id)
                ->sortable()
                ->paginate($row)
                ->appends(request()->query()
            ),
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store($storeSlug, Request $request)
    {
        // Validasi request
        $validator = Validator::make($request->all(), [
            'photo' => 'nullable|image|file|max:1024',
            'name' => 'required|string|max:50',
            'email' => 'required|email|max:50|unique:suppliers,email',
            'phone' => 'required|string|max:15|unique:suppliers,phone',
            'shopname' => 'required|string|max:50',
            'type' => 'required|string|max:25',
            'account_holder' => 'max:50',
            'account_number' => 'max:25',
            'bank_name' => 'max:25',
            'bank_branch' => 'max:50',
            'city' => 'required|string|max:50',
            'address' => 'required|string|max:100',
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
            $path = 'public/suppliers/';

            $file->storeAs($path, $fileName);
            $validatedData['photo'] = $fileName;
        }

        $supplier = Supplier::create($validatedData);

        // Respons success
        return response()->json($supplier, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($storeSlug, $id)
    {
        $supplier = Supplier::find($id);

        if (!$supplier) {
            return response()->json([
                'message' => 'supplier not found'
            ], 404);
        }

        return response()->json($supplier);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update($storeSlug, $id, Request $request)
    {
        $supplier = Supplier::findOrFail($id);

        // Validasi request
        $validator = Validator::make($request->all(), [
            'photo' => 'nullable|image|file|max:1024',
            'name' => 'required|string|max:50',
            'email' => 'required|email|max:50|unique:suppliers,email,'.$supplier->id,
            'phone' => 'required|string|max:15|unique:suppliers,phone,'.$supplier->id,
            'shopname' => 'required|string|max:50',
            'type' => 'required|string|max:25',
            'account_holder' => 'max:50',
            'account_number' => 'max:25',
            'bank_name' => 'max:25',
            'bank_branch' => 'max:50',
            'city' => 'required|string|max:50',
            'address' => 'required|string|max:100',
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
            $path = 'public/suppliers/';

            /**
             * Delete photo if exists.
             */
            if($supplier->photo){
                Storage::delete($path . $supplier->photo);
            }

            $file->storeAs($path, $fileName);
            $validatedData['photo'] = $fileName;
        }

        // Update
        $supplier->update($validatedData);

        // Respons sukses
        return response()->json([
            'message' => 'Supplier has been updated!',
            'supplier' => $supplier,
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($storeId, $id)
    {
        $supplier = Supplier::findOrFail($id);

        /**
         * Delete photo if exists.
         */
        if($supplier->photo){
            Storage::delete('public/suppliers/' . $supplier->photo);
        }

        Supplier::destroy($supplier->id);

        // Respons sukses
        return response()->json([
            'message' => 'Supplier has been deleted!',
        ], 200);
    }
}
