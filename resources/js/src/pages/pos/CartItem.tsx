import React from 'react';
import { formatRupiah } from "../../components/tools";
import IconMinus from "../../components/Icon/IconMinus";
import IconPlus from "../../components/Icon/IconPlus";

// Komponen CartItem untuk menampilkan satu item di dalam keranjang POS
const CartItem = ({ item, selectedOption, handleQtyChange }) => {
  return (
    <tr>
      {/* Kolom untuk input jumlah (qty) produk */}
      <td className="!px-0">
        <div className="flex gap-4 items-center justify-center">
          <div className="relative">
            {/* Kontainer tombol + dan - untuk mengatur jumlah produk */}
            <div className="inline-flex flex-col w-[38px]">
              {/* Tombol - untuk mengurangi qty */}
              <button
                type="button"
                className="bg-secondary-light flex justify-center items-center rounded-t-xl p-1 font-semibold border border-b-0"
                onClick={() => handleQtyChange(item, item.qty - 1)} // Panggil handleQtyChange dengan qty dikurangi 1
              >
                <IconMinus className="w-4" /> {/* Ikon minus */}
              </button>
              {/* Input tampilan jumlah produk, readOnly */}
              <input 
                type="text" 
                className="form-input rounded-none text-center py-1 px-2" 
                min="0" 
                max="25" 
                readOnly 
                value={item.qty}
              />
              {/* Tombol + untuk menambah qty */}
              <button
                type="button"
                className="bg-secondary-light flex justify-center items-center rounded-b-xl p-1 font-semibold border border-t-0"
                onClick={() => handleQtyChange(item, item.qty + 1)}
              >
                <IconPlus className="w-4" /> {/* Ikon plus */}
              </button>
            </div>
          </div>
        </div>
      </td>

      {/* Kolom untuk informasi produk */}
      <td>
        <div className="flex items-center !justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Gambar produk */}
            <div className="w-32">
              <img 
                src={item.product_image // Jika ada gambar produk
                  ? item.product_image.startsWith('http') // Jika URL gambar sudah lengkap
                    ? item.product_image // Gunakan URL langsung
                    : `${import.meta.env.VITE_SERVER_URI_BASE}storage/products/${item.product_image}` // Jika nama file, tambahkan base path
                  : '/assets/images/blank_product.png' // Jika tidak ada gambar, tampilkan gambar default
                } 
                className="w-16 h-16 rounded-md overflow-hidden object-cover" 
                alt="img" 
              />
            </div>
            {/* Nama dan detail produk */}
            <div>
              {/* Nama produk */}
              <div className="text-base font-bold line-clamp-2">{item.name}</div>
              {/* Atribut produk (misal: warna, ukuran) */}
              <div>
                {item.attribute && Object.entries(item.attribute).map(([key, value]) => (
                  <span key={key} className="badge bg-info rounded-full mr-1 text-[.7rem] p-1.5 py-0">
                    {value as string} {/* Nilai atribut */}
                  </span> 
                ))}
              </div>
              {/* Harga produk (diskon & harga akhir) */}
              <div>
                {(item.discount_normal || (selectedOption && item.discount_member)) && (
                  // Harga awal dicoret jika ada diskon
                  <div className="text-white-dark line-through">
                    {formatRupiah(item.price)} {/* Format harga asli */}
                    </div>
                )}
                {/* Harga akhir setelah diskon (member atau normal) */}
                <div className="text-primary text-base font-bold">
                  {formatRupiah(
                    selectedOption && item.discount_member
                      ? item.price - (item.price * item.discount_member) / 100 // Diskon member
                      : item.discount_normal
                        ? item.price - (item.price * item.discount_normal) / 100 // Diskon umum
                        : item.price // Harga normal
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
};

export default CartItem;