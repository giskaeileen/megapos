import React, { useState } from "react";

// Komponen sidebar keranjang belanja
const CartSidebar: React.FC = () => {
  // State untuk menyimpan status buka/tutup sidebar
  const [isOpen, setIsOpen] = useState(false);

  // Fungsi untuk toggle (buka/tutup) sidebar
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex transition-all duration-300">
      {/* Konten Utama */}
      <div
        className={`flex-grow transition-all duration-300 ${
          isOpen ? "mr-[400px]" : "mr-0"
        }`}
      >
        <div className="p-4">
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Necessitatibus ea autem illo consequatur! Consequuntur repudiandae,
            voluptatem temporibus possimus est animi.
          </p>
        </div>
      </div>

      {/* Sidebar Keranjang */}
      <nav
        className={`${
          // Jika sidebar terbuka, posisikan ke kanan/kiri sesuai arah (RTL atau LTR), jika tidak terbuka maka disembunyikan
          (isOpen && 'ltr:!right-0 rtl:!left-0') || 'hidden'
        } bg-white fixed ltr:-right-[400px] rtl:-left-[400px] top-0 bottom-0 w-full max-w-[400px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-[right] duration-300 z-[51] dark:bg-black p-4`}
      >
        {/* Header sidebar */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">Your Cart</h2>
          <button
            onClick={toggleSidebar}
            className="text-red-500 focus:outline-none"
          >
            Close
          </button>
        </div>

        {/* Konten keranjang */}
        <div className="p-4">
          {/* Pesan jika keranjang kosong */}
          <p>Your cart is empty.</p>
        </div>
      </nav>

      {/* Tombol untuk membuka / menutup sidebar */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50"
      >
        {/* Teks tombol tergantung dari status sidebar */}
        {isOpen ? "Close Cart" : "Open Cart"}
      </button>
    </div>
  );
};

export default CartSidebar;
