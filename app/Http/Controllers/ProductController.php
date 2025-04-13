<?php

namespace App\Http\Controllers;

use Exception;
use App\Models\Product;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Order;
use App\Models\ProductAttribute;
use App\Models\ProductVariant;
use App\Models\Store;
use App\Models\SubscriptionQuota;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Illuminate\Support\Facades\Redirect;
use PhpOffice\PhpSpreadsheet\Writer\Xls;
// use Picqer\Barcode\BarcodeGeneratorHTML;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    public function __construct()
    {
        $this->middleware('can:Create Product')->only(['store']);
        $this->middleware('can:Read Product')->only(['index', 'show']);
        $this->middleware('can:Update Product')->only(['update']);
        $this->middleware('can:Delete Product')->only(['destroy']);
    }

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
            'product_name',
            'category',
            'supplier',
            'unit',
        ]);

        return response()->json(
            Product::with(['category', 'supplier'])
                // ->with('variations.attributes.attributeValue')
                ->where('store_id', $store_id)
                ->filter($filters)
                ->sortable()
                ->paginate($row)
                ->appends(request()->query()),
        );
    }

    public function indexSKU($storeSlug)
    {
        $row = (int) request('row', 10);

        if ($row < 1 || $row > 100) {
            abort(400, 'The per-page parameter must be an integer between 1 and 100.');
        }

        $store_id = Store::where('slug', $storeSlug)->first()->id;

        $filters = request()->only([
            'search',
            'product_name',
            'category',
            'supplier',
            'unit',
        ]);

        return response()->json(
            Product::with(['category', 'supplier'])
                ->with('productVariants.productAttributes.attributeValue')
                ->where('store_id', $store_id)
                ->filter($filters)
                ->sortable()
                ->paginate($row)
                ->appends(request()->query()),
        );
    }

    /**
     * Display the specified resource.
     */
    public function show($storeSlug, $id)
    {
        $product = Product::with('productVariants.productAttributes.attributeValue.attribute')->find($id);
        // $product = Product::with('variations.attributes')->find($id);

        // Barcode Generator
        // $generator = new BarcodeGeneratorHTML();

        // $barcode = $generator->getBarcode($product->product_code, $generator::TYPE_CODE_128);

        return response()->json($product);
    }

    public function store($storeSlug, Request $request)
    {
        $user = $request->user();

        $subscription = SubscriptionQuota::where('user_id', $user->id)
            ->where('end_date', '>', Carbon::now())
            ->latest()
            ->first();

        if (!$subscription) {
            return response()->json([
                'message' => 'There are no active packages.',
            ], 404);
        }

        $storeIds = $user->stores()->pluck('id');

        // Count data from all stores
        $statistics = [
            'total_stores' => $user->stores()->count(),
            'total_orders' => Order::whereIn('store_id', $storeIds)->count(),
            'total_products' => Product::whereIn('store_id', $storeIds)->count(),
            'total_employees' => Employee::whereIn('store_id', $storeIds)->count(),
            'total_sales' => Order::whereIn('store_id', $storeIds)
                ->where('payment_status', 'paid')
                ->sum('total'),
            'stores_data' => $user->stores()->withCount([
                'orders',
                'products',
                'employees'
            ])->get()
        ];

        // Check quota limits
        $quotaExceeded = [];
        
        // if ($statistics['total_stores'] >= $subscription->quota_stores) {
        //     $quotaExceeded['stores'] = 'Jumlah toko melebihi kuota';
        // }
        
        // if ($statistics['total_orders'] >= $subscription->quota_transactions) {
        //     $quotaExceeded['transactions'] = 'Jumlah transaksi melebihi kuota';
        // }
        
        if ($statistics['total_products'] >= $subscription->quota_products) {
            $quotaExceeded['products'] = 'Jumlah produk melebihi kuota';
        }
        
        // if ($statistics['total_employees'] >= $subscription->quota_employees) {
        //     $quotaExceeded['employees'] = 'Jumlah karyawan melebihi kuota';
        // }

        if (!empty($quotaExceeded)) {
            return response()->json([
                'message' => 'Quota Exceeded',
                'errors' => $quotaExceeded,
                'statistics' => $statistics,
                'quota_limits' => [
                    'transactions' => $subscription->quota_transactions,
                    'products' => $subscription->quota_products,
                    'employees' => $subscription->quota_employees,
                    'stores' => $subscription->quota_stores
                ]
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'product_name' => 'required|string|max:255',
            'category_id' => 'nullable|integer',
            'supplier_id' => 'nullable|integer',
            'unit' => 'nullable|string|max:255',
            'product_image' => 'nullable',
            'discount_normal' => 'nullable|integer',
            'discount_member' => 'nullable|integer',
            'variants' => 'required|array',
            'variants.*.price' => 'nullable|numeric',
            'variants.*.sale_price' => 'nullable|numeric',
            'variants.*.quantity' => 'nullable|integer',
            'variants.*.sku' => 'nullable|string|unique:product_variants,sku',
        ]);

        // If validation fails, return error response
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validatedData = $validator->validated();

        DB::beginTransaction(); // Start transaction

        try {
            $product_image = null;
            if ($file = $request->file('product_image')) {
                $fileName = hexdec(uniqid()).'.'.$file->getClientOriginalExtension();
                $path = 'public/products/';

                $file->storeAs($path, $fileName);
                $product_image = $fileName;
            }

            $store = Store::where('slug', $storeSlug)->first();

            if (!$store) {
                throw new \Exception("Store not found");
            }

            // Insert into products table
            $product = Product::create([
                'product_name' => $request->product_name,
                'category_id' => $request->category_id,
                'supplier_id' => $request->supplier_id,
                'unit' => $request->unit,
                'product_image' => $product_image,
                'discount_normal' => $request->discount_normal,
                'discount_member' => $request->discount_member,
                'description' => $request->description,
                'store_id' => $store->id,
            ]);

            foreach ($request->variants as $variant) {
                $variantImage = null;

                if (isset($variant['images']) && $variant['images'] instanceof UploadedFile) {
                    $variantFile = $variant['images'];
                    $fileName = hexdec(uniqid()) . '.' . $variantFile->getClientOriginalExtension();
                    $variantFile->storeAs('public/products', $fileName);
                    $variantImage = $fileName;
                }

                $productVariant = ProductVariant::create([
                    'product_id' => $product->id,
                    'sku' => $variant['sku'] ?? null,
                    'price' => $variant['price'] ?? null,
                    'sale_price' => $variant['sale_price'] ?? null,
                    'quantity' => $variant['quantity'] ?? 0,
                    'product_image' => $variantImage,
                ]);

                if (isset($variant['attributes']) && is_array($variant['attributes'])) {
                    foreach ($variant['attributes'] as $attribute) {
                        ProductAttribute::create([
                            'product_variant_id' => $productVariant->id,
                            // 'product_id' => $productVariant->id,
                            'attribute_value_id' => $attribute['valueId'],
                        ]);
                    }
                }
            }

            DB::commit(); // Commit transaction

            return response()->json($product, 201);

        } catch (\Exception $e) {
            DB::rollBack(); // Rollback transaction if any error occurs

            return response()->json([
                'message' => 'Failed to store product',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function update($storeSlug, $id, Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_name' => 'required|string|max:255',
            'category_id' => 'nullable|integer',
            'supplier_id' => 'nullable|integer',
            'unit' => 'nullable|string|max:255',
            'product_image' => 'nullable',
            'description' => 'nullable|string',
            'discount_normal' => 'nullable|integer',
            'discount_member' => 'nullable|integer',
            'variants' => 'required|array',
            'variants.*.id' => 'nullable|integer|exists:product_variants,id',
            'variants.*.price' => 'nullable|numeric',
            'variants.*.sale_price' => 'nullable|numeric',
            'variants.*.quantity' => 'nullable|integer',
            'variants.*.sku' => [
                'nullable', 'string',
                Rule::unique('product_variants', 'sku')->ignore($id, 'product_id'),
            ],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validatedData = $validator->validated();

        $product = Product::find($id);
        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        // **Handle Gambar Produk**
        if ($file = $request->file('product_image')) {
            if ($product->product_image) {
                Storage::delete('public/products/' . $product->product_image);
            }
            $fileName = hexdec(uniqid()) . '.' . $file->getClientOriginalExtension();

            $file->storeAs('public/products', $fileName);

            $product_image = $fileName;
        } else {
            $product_image = $product->product_image;
        }

        $store_id = Store::where('slug', $storeSlug)->value('id');

        // **Update Produk**
        $product->update(array_merge($validatedData, [
            'product_image' => $product_image,
            'store_id' => $store_id,
        ]));

        $existingVariants = ProductVariant::where('product_id', $product->id)->pluck('id')->toArray();
        $updatedVariantIds = [];

        // **Proses Variants**
        foreach ($request->variants as $variant) {
            $variantData = [
                'product_id' => $product->id,
                'sku' => $variant['sku'] ?? null,
                'price' => $variant['price'] ?? null,
                'sale_price' => $variant['sale_price'] ?? null,
                'quantity' => $variant['quantity'] ?? 0,
            ];

            // **Update atau Tambah Variant**
            if (!empty($variant['id'])) {
                $productVariant = ProductVariant::find($variant['id']);
                if ($productVariant) {
                    // **Handle Gambar Varian**
                    if (isset($variant['images']) && $variant['images'] instanceof UploadedFile) {
                        if ($productVariant->product_image) {
                            Storage::delete('public/products/' . $productVariant->product_image);
                        }

                        $variantFile = $variant['images'];
                        $fileName = hexdec(uniqid()) . '.' . $variantFile->getClientOriginalExtension();
                        $variantFile->storeAs('public/products', $fileName);

                        $variantData['product_image'] = $fileName;
                    } else {
                        $variantData['product_image'] = $productVariant->product_image;
                    }

                    $productVariant->update($variantData);
                    $updatedVariantIds[] = $productVariant->id;
                }
            } else {
                if (isset($variant['images']) && $variant['images'] instanceof UploadedFile) {
                    $fileName = $variant['images']->storeAs('public/products', hexdec(uniqid()) . '.' . $variant['images']->getClientOriginalExtension());
                    $variantData['product_image'] = $fileName;
                }

                $productVariant = ProductVariant::create($variantData);
                $updatedVariantIds[] = $productVariant->id;
            }

            // **Update Attributes**
            if (!empty($variant['attributes'])) {
                $productVariant->productAttributes()->delete();
                $attributesData = array_map(function ($attribute) use ($productVariant) {
                    return [
                        'product_variant_id' => $productVariant->id,
                        'attribute_value_id' => $attribute['valueId'],
                    ];
                }, $variant['attributes']);
                ProductAttribute::insert($attributesData);
            }
        }

        // **Hapus Variants yang Tidak Digunakan**
        $variantsToDelete = array_diff($existingVariants, $updatedVariantIds);
        ProductAttribute::whereIn('product_variant_id', $variantsToDelete)->delete();
        ProductVariant::whereIn('id', $variantsToDelete)->delete();

        return response()->json($product, 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($storeSlug, $id)
    {
        $product = Product::findOrFail($id);

        /**
         * Delete photo if exists.
         */
        if($product->product_image){
            Storage::delete('public/products/' . $product->product_image);
        }

        Product::destroy($product->id);

        // Respons sukses
        return response()->json([
            'message' => 'Product has been deleted!',
        ], 200);
    }

    public function importStore(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'upload_file' => 'required|file|mimes:xls,xlsx',
        ]);

        // Jika validasi gagal, kembalikan error
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $the_file = $request->file('upload_file');

        try{
            $spreadsheet = IOFactory::load($the_file->getRealPath());
            $sheet        = $spreadsheet->getActiveSheet();
            $row_limit    = $sheet->getHighestDataRow();
            $column_limit = $sheet->getHighestDataColumn();
            $row_range    = range( 2, $row_limit );
            $column_range = range( 'J', $column_limit );
            $startcount = 2;
            $data = array();
            foreach ( $row_range as $row ) {
                $data[] = [
                    'product_name' => $sheet->getCell( 'A' . $row )->getValue(),
                    'category_id' => $sheet->getCell( 'B' . $row )->getValue(),
                    'supplier_id' => $sheet->getCell( 'C' . $row )->getValue(),
                    'product_code' => $sheet->getCell( 'D' . $row )->getValue(),
                    'product_garage' => $sheet->getCell( 'E' . $row )->getValue(),
                    'product_image' => $sheet->getCell( 'F' . $row )->getValue(),
                    'product_store' =>$sheet->getCell( 'G' . $row )->getValue(),
                    'buying_date' =>$sheet->getCell( 'H' . $row )->getValue(),
                    'expire_date' =>$sheet->getCell( 'I' . $row )->getValue(),
                    'buying_price' =>$sheet->getCell( 'J' . $row )->getValue(),
                    'selling_price' =>$sheet->getCell( 'K' . $row )->getValue(),
                ];
                $startcount++;
            }

            Product::insert($data);

        } catch (Exception $e) {
            // $error_code = $e->errorInfo[1];
            // return Redirect::route('products.index')->with('error', 'There was a problem uploading the data!');
            return response()->json([
                'error' => 'There was a problem uploading the data!',
                // 'errors' => $validator->errors(),
            ], 422);
        }
        return Redirect::route('products.index')->with('success', 'Data has been successfully imported!');
    }

    public function exportExcel($products){
        ini_set('max_execution_time', 0);
        ini_set('memory_limit', '4000M');

        try {
            $spreadSheet = new Spreadsheet();
            $spreadSheet->getActiveSheet()->getDefaultColumnDimension()->setWidth(20);
            $spreadSheet->getActiveSheet()->fromArray($products);
            $Excel_writer = new Xls($spreadSheet);
            header('Content-Type: application/vnd.ms-excel');
            header('Content-Disposition: attachment;filename="Products_ExportedData.xls"');
            header('Cache-Control: max-age=0');
            ob_end_clean();
            $Excel_writer->save('php://output');
            exit();
        } catch (Exception $e) {
            return;
        }
    }

    /**
     *This function loads the customer data from the database then converts it
     * into an Array that will be exported to Excel
     */
    function exportData(){
        $products = Product::all()->sortByDesc('product_id');

        $product_array [] = array(
            'Product Name',
            'Category Id',
            'Supplier Id',
            'Product Code',
            'Product Garage',
            'Product Image',
            'Product Store',
            'Buying Date',
            'Expire Date',
            'Buying Price',
            'Selling Price',
        );

        foreach($products as $product)
        {
            $product_array[] = array(
                'Product Name' => $product->product_name,
                'Category Id' => $product->category_id,
                'Supplier Id' => $product->supplier_id,
                'Product Code' => $product->product_code,
                'Product Garage' => $product->product_garage,
                'Product Image' => $product->product_image,
                'Product Store' =>$product->product_store,
                'Buying Date' =>$product->buying_date,
                'Expire Date' =>$product->expire_date,
                'Buying Price' =>$product->buying_price,
                'Selling Price' =>$product->selling_price,
            );
        }

        $this->ExportExcel($product_array);
    }
}
