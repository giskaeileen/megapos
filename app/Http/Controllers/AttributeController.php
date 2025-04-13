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
     *
     * Fungsi ini digunakan untuk menampilkan daftar atribut dari sebuah toko tertentu,
     * berdasarkan slug toko yang dikirim dari URL. Data yang ditampilkan bisa difilter
     * berdasarkan pencarian dan nama, serta ditampilkan per halaman (pagination).
     *
     * @param string $slug Slug dari toko yang digunakan untuk mencari ID toko.
     * @return \Illuminate\Http\JsonResponse Mengembalikan data atribut dalam format JSON.
     * @throws \Symfony\Component\HttpKernel\Exception\HttpException Jika nilai `row` di luar batas 1 sampai 100.
     */
    public function index($slug)
    {
        $row = (int) request('row', 10); // Ambil jumlah data per halaman (default 10)

        if ($row < 1 || $row > 100) {
            abort(400, 'The per-page parameter must be an integer between 1 and 100.');
        }

        // Cari ID toko dari slug yang dikirim
        $store_id = Store::where('slug', $slug)->first()->id;

        // Ambil filter dari query string (misalnya: search, name)
        $filters = request()->only([
            'search',
            'name',
            // 'value',
        ]);

        // Ambil data atribut yang sesuai dan tampilkan dengan pagination
        return response()->json(
            Attribute::filter($filters)
                ->where('store_id', $store_id)
                ->with('values')
                ->sortable()
                ->paginate($row)
                ->appends(request()->query()
            ),
        ); 
    }

    /**
     * Menyimpan data atribut baru berdasarkan slug toko.
     *
     * Fungsi ini menerima input dari user berupa nama atribut dan daftar nilai atribut,
     * lalu memvalidasi data tersebut. Jika validasi berhasil, data akan disimpan ke dalam
     * tabel `attributes` dan `attribute_values`. Data dikaitkan dengan toko berdasarkan slug.
     *
     * @param string $slug Slug toko yang digunakan untuk mencari ID toko.
     * @param \Illuminate\Http\Request $request Data request yang dikirim oleh user (berisi name dan values).
     *
     * @return \Illuminate\Http\JsonResponse Mengembalikan data atribut yang sudah disimpan beserta nilai-nilainya.
     *
     * @throws \Illuminate\Validation\ValidationException Jika data input tidak valid (misal: name kosong, values tidak sesuai format).
     */
    public function store($slug, Request $request)
    {
        // Validasi input
        $validator = Validator::make($request->all(), [
            'name' => 'required|string',
            'values' => 'required|array',
            'values.*.value' => 'required|string',
        ]);

        // Jika validasi gagal, kirim response error
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Ambil data yang sudah tervalidasi
        $validatedData = $validator->validated();

        // Cari ID toko berdasarkan slug
        $store_id = Store::where('slug', $slug)->first()->id;

        // Simpan data ke tabel attributes
        $attribute = Attribute::create([
            'name' => $validatedData['name'],
            'store_id' => $store_id,
        ]);

        // Simpan data ke tabel attribute_values
        foreach ($validatedData['values'] as $value) {
            AttributeValue::create([
                'attribute_id' => $attribute->id,
                'value' => $value['value'],
            ]);
        }

        // Return response
        return response()->json($attribute->load('values'));
    }

    /**
     * Menampilkan detail data atribut berdasarkan ID dan slug toko.
     *
     * Fungsi ini digunakan untuk menampilkan satu data atribut lengkap dengan value-nya
     * berdasarkan ID yang dikirim. Jika data tidak ditemukan, maka akan mengembalikan
     * pesan error dengan status 404.
     *
     * @param string $slug Slug dari toko (tidak dipakai langsung, tapi bisa digunakan untuk validasi di masa depan).
     * @param int $id ID dari atribut yang ingin ditampilkan.
     *
     * @return \Illuminate\Http\JsonResponse Mengembalikan data atribut beserta relasi `values`, atau error jika tidak ditemukan.
     *
     * @throws \Symfony\Component\HttpKernel\Exception\NotFoundHttpException Jika data dengan ID tersebut tidak ditemukan.
     */
    public function show($slug, $id)
    {
        // Ambil data atribut berdasarkan ID, sertakan relasi values
        $data= Attribute::with('values')->find($id);

        // Kalau data tidak ditemukan, kirim response error 404
        if (!$data) {
            return response()->json([
                'message' => 'Data not found'
            ], 404);
        }

        // Kembalikan data atribut dalam format JSON
        return response()->json($data);
    }

    /**
     * Mengupdate data atribut berdasarkan slug toko dan ID atribut.
     *
     * Fungsi ini akan memvalidasi input dari user, lalu memperbarui data atribut dan
     * seluruh value yang terkait di database. Jika data tidak ditemukan, maka akan
     * mengembalikan pesan error 404.
     *
     * @param string $slug Slug dari toko yang digunakan untuk mencari ID toko.
     * @param int $attributeId ID atribut yang ingin diperbarui.
     * @param \Illuminate\Http\Request $request Data request yang dikirim dari user (berisi name dan values).
     *
     * @return \Illuminate\Http\JsonResponse Response JSON berisi pesan sukses dan data atribut terbaru.
     *
     * @throws \Illuminate\Validation\ValidationException Jika input tidak sesuai aturan validasi.
     * @throws \Symfony\Component\HttpKernel\Exception\NotFoundHttpException Jika atribut tidak ditemukan.
     */
    public function update($slug, $attributeId, Request $request)
    {
        // Validasi input
        $validator = Validator::make($request->all(), [
            'name' => 'required|string',
            'values' => 'required|array',
            'values.*.value' => 'required|string',
        ]);

        // Jika validasi gagal, kirim pesan error
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Ambil data yang sudah tervalidasi
        $validatedData = $validator->validated();

        // Cari ID toko dari slug
        //$storeId = slug
        $store_id = Store::where('slug', $slug)->first()->id;

        // Cari atribut berdasarkan ID dan store_id
        $attribute = Attribute::where('id', $attributeId)->where('store_id', $store_id)->first();

        // Kalau atribut tidak ditemukan, kirim error
        if (!$attribute) {
            return response()->json([
                'message' => 'Attribute not found',
            ], 404);
        }

        // Update data attribute
        $attribute->update([
            'name' => $validatedData['name'],
        ]);

        // Hapus semua attribute_values terkait
        $attribute->values()->delete();

        // Simpan ulang data attribute_values
        foreach ($validatedData['values'] as $value) {
            AttributeValue::create([
                'attribute_id' => $attribute->id,
                'value' => $value['value'],
            ]);
        }

        // Kembalikan data terbaru dalam bentuk JSON
        return response()->json([
            'message' => 'Attribute updated successfully',
            'data' => $attribute->load('values'),
        ]);
    }

    /**
     * Menghapus data atribut dan semua value yang terkait berdasarkan slug toko dan ID atribut.
     *
     * Fungsi ini digunakan untuk menghapus satu atribut beserta seluruh value-nya dari database.
     * Pertama akan dicari ID toko berdasarkan slug, kemudian dicek apakah atributnya ada.
     * Jika tidak ditemukan, maka akan mengembalikan response error 404.
     *
     * @param string $slug Slug dari toko untuk mencari ID toko.
     * @param int $id ID dari atribut yang ingin dihapus.
     *
     * @return \Illuminate\Http\JsonResponse Response JSON yang berisi pesan sukses atau error.
     *
     * @throws \Symfony\Component\HttpKernel\Exception\NotFoundHttpException Jika atribut tidak ditemukan.
     */
    public function destroy($slug, $id)
    {
        // Ambil store_id dari slug
        $store_id = Store::where('slug', $slug)->first()->id;

        // Cari data attribute berdasarkan ID dan store_id
        $attribute = Attribute::where('id', $id)->where('store_id', $store_id)->first();

        // Jika atribut tidak ditemukan, kirim response error
        if (!$attribute) {
            return response()->json([
                'message' => 'Attribute not found',
            ], 404);
        }

        // Hapus semua attribute_values terkait
        $attribute->values()->delete();

        // Hapus attribute
        $attribute->delete();

        // Kembalikan response sukses
        return response()->json([
            'message' => 'Attribute deleted successfully',
        ], 200);
    }
}
