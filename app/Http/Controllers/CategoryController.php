<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Store;
use Illuminate\Support\Facades\Validator;

class CategoryController extends Controller
{
    // Middleware untuk otorisasi berdasarkan permission
    // public function __construct()
    // {
    //     $this->middleware('can:Create Category')->only(['store']);
    //     $this->middleware('can:Read Category')->only(['index', 'show']);
    //     $this->middleware('can:Update Category')->only(['update']);
    //     $this->middleware('can:Delete Category')->only(['destroy']);
    // }

    /**
     * Menampilkan daftar kategori berdasarkan slug toko
     */
    public function index($slug)
    {
        // Ambil parameter row (jumlah data per halaman) dengan default 10
        $row = (int) request('row', 10);

        // Validasi nilai row harus antara 1 sampai 100
        if ($row < 1 || $row > 100) {
            abort(400, 'The per-page parameter must be an integer between 1 and 100.');
        }

        // Ambil ID store berdasarkan slug
        $store_id = Store::where('slug', $slug)->first()->id;

        // Ambil filter dari query string
        $filters = request()->only([
            'search',
            'name',
            'slug',
        ]);

        // Kembalikan data kategori yang sudah difilter dan dipaginasi
        return response()->json(
            Category::filter($filters)
                ->where('store_id', $store_id)
                ->sortable()
                ->paginate($row)
                ->appends(request()->query()),
        );
    }

    /**
     * Menyimpan kategori baru
     */
    public function store($slug, Request $request)
    {
        // Validasi input
        $validator = Validator::make($request->all(), [
            'name' => 'required|unique:categories,name',
            'slug' => 'required|unique:categories,slug|alpha_dash',
        ]);

        // Jika validasi gagal, kembalikan error
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Ambil data yang sudah divalidasi
        $validatedData = $validator->validated();

        // Ambil ID store berdasarkan slug toko
        $store_id = Store::where('slug', $slug)->first()->id;

        // Tambahkan ID store ke dalam data kategori
        $validatedData['store_id'] = $store_id;

        // Simpan kategori ke database
        $category = Category::create($validatedData);

        // Kembalikan response kategori yang baru dibuat
        return response()->json($category, 201);
    }

    /**
     * Menampilkan detail kategori berdasarkan ID
     */
    public function show($slug, $id)
    {
        // Cari kategori berdasarkan ID
        $category = Category::find($id);

        // Jika kategori tidak ditemukan, kembalikan response 404
        if (!$category) {
            return response()->json([
                'message' => 'category not found'
            ], 404);
        }

        // Kembalikan data kategori
        return response()->json($category);
    }

    /**
     * Memperbarui data kategori berdasarkan ID
     */
    public function update($slug, $id, Request $request)
    {
        // Ambil data kategori
        $category = Category::findOrFail($id);

        // Validasi input
        $validator = Validator::make($request->all(), [
            'name' => 'required|unique:categories,name,'.$category->id,
            'slug' => 'required|alpha_dash|unique:categories,slug,'.$category->id,
        ]);

        // Jika validasi gagal, kembalikan error
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Ambil data valid
        $validatedData = $validator->validated();

        // Update data kategori
        $category->update($validatedData);

        // Kembalikan response sukses
        return response()->json([
            'message' => 'Category has been updated!',
            'category' => $category,
        ], 200);
    }

    /**
     * Menghapus kategori berdasarkan ID
     */
    public function destroy($slug, $id)
    {
        // Cari kategori berdasarkan ID atau gagal jika tidak ditemukan
        $category = Category::findOrFail($id);

        // Hapus kategori
        Category::destroy($category->id);

        // Kembalikan response sukses
        return response()->json([
            'message' => 'Category has been deleted!',
        ], 200);
    }
}
