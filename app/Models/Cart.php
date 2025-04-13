<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    use HasFactory;

    // protected $fillable = [
    //     'user_id',
    //     'product_id',
    //     'name',
    //     'qty',
    //     'price',
    //     'options',
    // ];

    protected $casts = [
        'options' => 'array', // Pastikan kolom 'options' di-cast sebagai array
    ];

    // use HasFactory;

    protected $table = 'carts'; // Nama tabel yang digunakan untuk menyimpan data cart
    protected $fillable = [
        'user_id', 'product_id', 'name', 'qty', 'price', 'total', 'created_at', 'updated_at'
    ];

    // Mendapatkan jumlah item dalam keranjang
    public static function count()
    {
        return self::sum('qty'); // Menghitung jumlah total item dalam keranjang
    }

    // Mendapatkan subtotal dari keranjang
    public static function subtotal()
    {
        return self::sum(\DB::raw('price * qty')); // Menghitung subtotal (harga * jumlah)
    }

    // Mendapatkan total pajak (contoh, pajak 10% misalnya)
    public static function tax()
    {
        $subtotal = self::subtotal();
        return $subtotal * 0.1; // Pajak 10% dari subtotal
    }

    // Mendapatkan total dari keranjang
    public static function total()
    {
        return self::subtotal() + self::tax(); // Total = Subtotal + Pajak
    }

    // Mendapatkan konten (item) dalam keranjang
    public static function content()
    {
        return self::all(); // Mengambil semua data item dalam keranjang
    }

    // Menghapus semua data keranjang
    public static function myDestroy()
    {
        return self::truncate(); // Menghapus seluruh isi keranjang
    }
}
