<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Store;
use Illuminate\Support\Facades\Validator;

class CategoryController extends Controller
{
    // public function __construct()
    // {
    //     $this->middleware('can:Create Category')->only(['store']);
    //     $this->middleware('can:Read Category')->only(['index', 'show']);
    //     $this->middleware('can:Update Category')->only(['update']);
    //     $this->middleware('can:Delete Category')->only(['destroy']);
    // }

    /**
     * Display a listing of the resource.
     */
    public function index($slug)
    {
        $row = (int) request('row', 10);

        if ($row < 1 || $row > 100) {
            abort(400, 'The per-page parameter must be an integer between 1 and 100.');
        }

        $store_id = Store::where('slug', $slug)->first()->id;

        $filters = request()->only([
            'search',
            'name',
            'slug',
        ]);

        return response()->json(
            Category::filter($filters)
                ->where('store_id', $store_id)
                ->sortable()
                ->paginate($row)
                ->appends(request()->query()),
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store($slug, Request $request)
    {
        // Validasi request
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

        $validatedData = $validator->validated();

        $store_id = Store::where('slug', $slug)->first()->id;

        $validatedData['store_id'] = $store_id;

        $category = Category::create($validatedData);

        return response()->json($category, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($slug, $id)
    {
        $category = Category::find($id);

        if (!$category) {
            return response()->json([
                'message' => 'category not found'
            ], 404);
        }

        return response()->json($category);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update($slug, $id, Request $request)
    {
        $category = Category::findOrFail($id);

        // Validasi request
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

        // Validasi data yang sudah diperiksa
        $validatedData = $validator->validated();

        $category->update($validatedData);

        // Respons sukses
        return response()->json([
            'message' => 'Category has been updated!',
            'category' => $category,
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($slug, $id)
    {
        $category = Category::findOrFail($id);

        Category::destroy($category->id);

        // Respons sukses
        return response()->json([
            'message' => 'Category has been deleted!',
        ], 200);
    }
}
