import { formatRupiah } from "../../components/tools";

// Komponen CartToggleButton menerima tiga properti:
// - toggleSidebar: fungsi untuk membuka/menutup sidebar keranjang
// - quantity: jumlah item dalam keranjang
// - totalPrice: total harga seluruh item dalam keranjang
const CartToggleButton = ({ toggleSidebar, quantity, totalPrice }) => {
  return (
    // Tombol tetap di pojok kanan bawah layar, digunakan untuk membuka sidebar keranjang
    <button
      onClick={toggleSidebar} // Menjalankan fungsi toggleSidebar saat tombol diklik
      className="fixed bottom-0 right-4 bg-primary text-white px-4 py-3 rounded-lg shadow-lg z-50 flex flex-col items-center max-w-min"
    >
      {/* Bagian atas tombol: menampilkan ikon dan jumlah item */}
      <div className="flex items-center gap-2 text-lg font-semibold">
        {/* Ikon keranjang SVG */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Path utama ikon keranjang */}
          <path d="M3.79424 12.0291C4.33141 9.34329 4.59999 8.00036 5.48746 7.13543C5.65149 6.97557 5.82894 6.8301 6.01786 6.70061C7.04004 6 8.40956 6 11.1486 6H12.8515C15.5906 6 16.9601 6 17.9823 6.70061C18.1712 6.8301 18.3486 6.97557 18.5127 7.13543C19.4001 8.00036 19.6687 9.34329 20.2059 12.0291C20.9771 15.8851 21.3627 17.8131 20.475 19.1793C20.3143 19.4267 20.1267 19.6555 19.9157 19.8616C18.7501 21 16.7839 21 12.8515 21H11.1486C7.21622 21 5.25004 21 4.08447 19.8616C3.87342 19.6555 3.68582 19.4267 3.5251 19.1793C2.63744 17.8131 3.02304 15.8851 3.79424 12.0291Z" stroke="currentColor" strokeWidth="1.5"/>
          {/* Garis atas ikon (penutup keranjang) */}
          <path opacity="0.5" d="M9 6V5C9 3.34315 10.3431 2 12 2C13.6569 2 15 3.34315 15 5V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          {/* Garis bawah ikon (penunjuk isi keranjang) */}
          <path opacity="0.5" d="M9.1709 15C9.58273 16.1652 10.694 17 12.0002 17C13.3064 17 14.4177 16.1652 14.8295 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        {/* Menampilkan jumlah item di dalam keranjang */}
        <span>{quantity} Items</span>
      </div>
      {/* Bagian bawah tombol menampilkan total harga */}
      <div className="bg-white text-primary font-bold text-xl px-3 py-1 rounded-md mt-2">
        {/* Menggunakan fungsi formatRupiah untuk menampilkan harga dalam format Rupiah */}
        {formatRupiah(totalPrice)}
      </div>
    </button>
  );
};

export default CartToggleButton;