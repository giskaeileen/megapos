<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Store;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class CustomerController extends Controller
{
    public function __construct()
    {
        $this->middleware('can:Create Customer')->only(['store']);
        $this->middleware('can:Read Customer')->only(['index', 'show']);
        $this->middleware('can:Update Customer')->only(['update']);
        $this->middleware('can:Delete Customer')->only(['destroy']);
    }

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
            Customer::filter($filters)
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
            'email' => 'required|email|max:50|unique:customers,email',
            'phone' => 'required|string|max:15|unique:customers,phone',
            'shopname' => 'required|string|max:50',
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
            $path = 'public/customers/';

            $file->storeAs($path, $fileName);
            $validatedData['photo'] = $fileName;
        }

        $customer = Customer::create($validatedData);

        // Respons success
        return response()->json($customer, 201);
    }

    public function show($storeSlug, $id)
    {
        $customer = Customer::find($id);

        if (!$customer) {
            return response()->json([
                'message' => 'Customer not found'
            ], 404);
        }

        return response()->json($customer);
    }

    public function update($storeSlug, $id, Request $request)
    {
        $customer = Customer::findOrFail($id);

        // Validasi request
        $validator = Validator::make($request->all(), [
            'photo' => 'nullable|image|file|max:1024',
            'name' => 'required|string|max:50',
            'email' => 'required|email|max:50|unique:customers,email,'.$customer->id,
            'phone' => 'required|string|max:15|unique:customers,phone,'.$customer->id,
            'shopname' => 'required|string|max:50',
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
            $path = 'public/customers/';

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
        $customer = Customer::findOrFail($id);

        /**
         * Delete photo if exists.
         */
        if($customer->photo){
            Storage::delete('public/customers/' . $customer->photo);
        }

        Customer::destroy($customer->id);

        // Respons sukses
        return response()->json([
            'message' => 'Customer has been deleted!',
        ], 200);
    }
}
