<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Product;
use App\Models\Customer;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Cart as ModelsCart;
use App\Models\Store;
use Illuminate\Support\Facades\Validator;

class PosController extends Controller
{
    public function __construct()
    {
        $this->middleware('can:Create POS')->only(['addCart']);
        $this->middleware('can:Read POS')->only(['index', 'printInvoice']);
        $this->middleware('can:Update POS')->only(['updateCart']);
        $this->middleware('can:Delete POS')->only(['deleteCart']);
    }

    public function index($storeSlug, Request $request)
    {
        $todayDate = Carbon::now();
        $row = (int) $request->query('row', 12);

        if ($row < 1 || $row > 100) {
            return response()->json([
                'message' => 'The per-page parameter must be an integer between 1 and 100.'
            ], 400);
        }

        $userId = auth()->id(); // Asumsi user harus login
        // $cartItems = ModelsCart::where('user_id', $userId)->get();

        // Tambahkan filter berdasarkan kategori
        $categoryId = $request->query('category');
        $store_id = Store::where('slug', $storeSlug)->first()->id;

        $productsQuery = Product::filter($request->only('search'))
            ->where('store_id', $store_id)
            ->with('productVariants.productAttributes.attributeValue.attribute')
            ->sortable();

        if ($categoryId) {
            $productsQuery->where('category_id', $categoryId);
        }

        $products = $productsQuery->paginate($row);

        return response()->json([
            'customers' => Customer::all()->sortBy('name'),
            'products' => $products,
        ]);
    }

    public function addCart($storeId, Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'name' => 'required|string',
            'price' => 'required|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();
        $userId = auth()->id();

        // Cek apakah item sudah ada di keranjang
        $cartItem = ModelsCart::where('user_id', $userId)
            ->where('product_id', $validated['product_id'])
            ->first();

        if ($cartItem) {
            // Update quantity jika sudah ada
            $cartItem->qty += 1;
            $cartItem->save();
        } else {
            // Tambah item baru
            ModelsCart::create([
                'user_id' => $userId,
                'product_id' => $validated['product_id'],
                'name' => $validated['name'],
                'price' => $validated['price'],
                'qty' => 1,
                'options' => json_encode(['size' => 'large']),
            ]);
        }

        return response()->json(['message' => 'Product added to cart.'], 201);
    }

    public function updateCart($storeId, Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'qty' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();
        $userId = auth()->id();

        $cartItem = ModelsCart::where('user_id', $userId)->where('id', $id)->first();

        if (!$cartItem) {
            return response()->json(['message' => 'Cart item not found.'], 404);
        }

        $cartItem->update(['qty' => $validated['qty']]);

        return response()->json(['message' => 'Cart has been updated.']);
    }

    public function deleteCart($storeId, $id)
    {
        $userId = auth()->id();

        $cartItem = ModelsCart::where('user_id', $userId)->where('id', $id)->first();

        if (!$cartItem) {
            return response()->json(['message' => 'Cart item not found.'], 404);
        }

        $cartItem->delete();

        return response()->json(['message' => 'Cart item has been removed.']);
    }

    public function createInvoice($storeId, Request $request)
    {
        $validator = Validator::make($request->all(), [
            'customer_id' => 'required|exists:customers,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validatedData = $validator->validated();
        $customer = Customer::find($validatedData['customer_id']);
        $content = ModelsCart::where('user_id', $request->user()->id)->get();

        return response()->json([
            'message' => 'Invoice data retrieved successfully.',
            'customer' => $customer,
            'cart' => $content,
        ]);
    }

    public function printInvoice($storeId, Request $request)
    {
        $validator = Validator::make($request->all(), [
            'customer_id' => 'required|exists:customers,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validatedData = $validator->validated();
        $customer = Customer::find($validatedData['customer_id']);
        $content = ModelsCart::where('user_id', $request->user()->id)->get();

        return response()->json([
            'message' => 'Invoice ready for printing.',
            'customer' => $customer,
            'cart' => $content,
        ]);
    }
}
