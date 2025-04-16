<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AttributeController extends Controller
{
    /**
     * Menampilkan data atribut berdasarkan slug toko.
     */
    public function index($slug)
    {
        $row = (int) request('row', 10); // Ambil jumlah data per halaman, default 10

        if ($row < 1 || $row > 100) {
            // Validasi batas maksimum dan minimum row
            abort(400, 'The per-page parameter must be an integer between 1 and 100.');
        }

        // Ambil ID toko berdasarkan slug
        $store_id = Store::where('slug', $slug)->first()->id;

        // Ambil filter dari query string
        $filters = request()->only([
            'search',
            'name',
            // 'value',
        ]);

        // Ambil data attribute yang sesuai filter dan store_id, dengan relasi values dan sorting
        return response()->json(
            Attribute::filter($filters)
                ->where('store_id', $store_id)
                ->with('values') // eager loading relasi values
                ->sortable() // fungsi sorting jika tersedia di model
                ->paginate($row) // pagination
                ->appends(request()->query()) // tetap menyertakan query string di pagination
        );
    }

    /**
     * Menyimpan data atribut baru berdasarkan slug toko.
     */
    public function store($slug, Request $request)
    {
        // Validasi input
        $validator = Validator::make($request->all(), [
            'name' => 'required|string',
            'values' => 'required|array',
            'values.*.value' => 'required|string', // validasi tiap item dalam array values
        ]);

        if ($validator->fails()) {
            // Jika validasi gagal, kembalikan pesan error
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Data yang sudah tervalidasi
        $validatedData = $validator->validated();

        // Ambil ID toko berdasarkan slug
        $store_id = Store::where('slug', $slug)->first()->id;

        // Simpan data ke tabel attributes
        $attribute = Attribute::create([
            'name' => $validatedData['name'],
            'store_id' => $store_id,
        ]);

        // Simpan setiap nilai attribute ke tabel attribute_values
        foreach ($validatedData['values'] as $value) {
            AttributeValue::create([
                'attribute_id' => $attribute->id,
                'value' => $value['value'],
            ]);
        }

        // Kembalikan response JSON dengan relasi values
        return response()->json($attribute->load('values'));
    }

    /**
     * Menampilkan detail data atribut berdasarkan ID dan slug toko.
     */
    public function show($slug, $id)
    {
        // Ambil data atribut berdasarkan ID beserta relasi values
        $data = Attribute::with('values')->find($id);

        if (!$data) {
            // Jika data tidak ditemukan, kembalikan response error
            return response()->json([
                'message' => 'Data not found'
            ], 404);
        }

        // Kembalikan data atribut dalam format JSON
        return response()->json($data);
    }

    /**
     * Mengupdate data atribut berdasarkan slug toko dan ID atribut.
     */
    public function update($slug, $attributeId, Request $request)
    {
        // Validasi input dari user
        $validator = Validator::make($request->all(), [
            'name' => 'required|string',
            'values' => 'required|array',
            'values.*.value' => 'required|string',
        ]);

        if ($validator->fails()) {
            // Jika validasi gagal, kembalikan pesan error
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Data tervalidasi
        $validatedData = $validator->validated();

        // Ambil ID toko berdasarkan slug
        $store_id = Store::where('slug', $slug)->first()->id;

        // Cari atribut berdasarkan ID dan store_id
        $attribute = Attribute::where('id', $attributeId)
            ->where('store_id', $store_id)
            ->first();

        if (!$attribute) {
            // Jika atribut tidak ditemukan, kembalikan error
            return response()->json([
                'message' => 'Attribute not found',
            ], 404);
        }

        // Update nama atribut
        $attribute->update([
            'name' => $validatedData['name'],
        ]);

        // Hapus semua nilai lama yang berkaitan dengan atribut
        $attribute->values()->delete();

        // Simpan nilai baru
        foreach ($validatedData['values'] as $value) {
            AttributeValue::create([
                'attribute_id' => $attribute->id,
                'value' => $value['value'],
            ]);
        }

        // Kembalikan data terbaru beserta relasi values
        return response()->json([
            'message' => 'Attribute updated successfully',
            'data' => $attribute->load('values'),
        ]);
    }

    /**
     * Menghapus data atribut dan semua value yang terkait berdasarkan slug toko dan ID atribut.
     */
    public function destroy($slug, $id)
    {
        // Ambil ID toko berdasarkan slug
        $store_id = Store::where('slug', $slug)->first()->id;

        // Cari atribut berdasarkan ID dan store_id
        $attribute = Attribute::where('id', $id)
            ->where('store_id', $store_id)
            ->first();

        if (!$attribute) {
            // Jika tidak ditemukan, kembalikan error
            return response()->json([
                'message' => 'Attribute not found',
            ], 404);
        }

        // Hapus semua value terkait
        $attribute->values()->delete();

        // Hapus atribut
        $attribute->delete();

        // Kembalikan response sukses
        return response()->json([
            'message' => 'Attribute deleted successfully',
        ], 200);
    }
}
