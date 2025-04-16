import React from 'react';
import { formatRupiah } from "../../components/tools";

// Komponen PaymentButton menerima dua props:
// totalPrice: jumlah total yang akan ditampilkan dalam format Rupiah
// showPaymentModal: fungsi yang dijalankan saat tombol diklik
const PaymentButton = ({ totalPrice, showPaymentModal }) => {
  // Cek apakah tombol harus dinonaktifkan (jika totalPrice <= 0)
  const isDisabled = totalPrice <= 0;
  
  return (
    <button 
      type="button" 
      className={`btn btn-lg w-full rounded-full justify-between p-1 pl-6 ${
        isDisabled ? 'btn-dark opacity-50 cursor-not-allowed'  // Gaya jika tombol nonaktif
        : 'btn-secondary' // Gaya jika button aktif
      }`} 
      onClick={!isDisabled ? showPaymentModal : undefined} // Hanya aktif jika tidak disable
      disabled={isDisabled} // Nonaktifkan button jika tidak ada harga
    >
      Payment {/* Teks button */}
      <div className={`btn btn-lg shadow-none rounded-full ${
        isDisabled ? 'bg-gray-200 text-gray-500' // Warna jika tombol nonaktif
        : 'bg-white text-secondary'  // Warna jika tombol aktif
      }`}>
        {formatRupiah(totalPrice)} {/* Format angka ke format Rupiah, misalnya Rp10.000 */}
      </div>
    </button>
  );
};

export default PaymentButton;