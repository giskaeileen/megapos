// components/MidtransScriptLoader.tsx
import { useEffect } from 'react';

// Mendefinisikan tipe props yang akan diterima oleh komponen MidtransScriptLoader
interface MidtransScriptLoaderProps {
  // clientKey adalah string yang digunakan sebagai autentikasi untuk Midtrans Snap
  clientKey: string;
}

// Komponen fungsional React untuk memuat script Midtrans Snap ke dalam halaman
const MidtransScriptLoader: React.FC<MidtransScriptLoaderProps> = ({ clientKey }) => {
  // Menggunakan useEffect untuk menambahkan script Midtrans saat komponen di-render
  useEffect(() => {
    // Membuat elemen <script> baru
    const script = document.createElement('script');

    // Menentukan sumber script dari sandbox Midtrans
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';

    // Menambahkan atribut `data-client-key` yang dibutuhkan oleh Midtrans
    script.setAttribute('data-client-key', clientKey);

    // Mengatur agar script dimuat secara asynchronous
    script.async = true;

    // Menambahkan elemen script ke dalam body dokumen HTML
    document.body.appendChild(script);

    // Fungsi cleanup: akan dijalankan ketika komponen di-unmount
    return () => {
      // Menghapus script dari body dokumen untuk menghindari duplikasi atau memory leak
      document.body.removeChild(script);
    };
  // Menjalankan efek hanya ketika `clientKey` berubah
  }, [clientKey]);

  // Komponen ini tidak merender elemen apapun di UI, hanya menjalankan efek samping
  return null;
};

// Mengekspor komponen agar bisa digunakan di file lain
export default MidtransScriptLoader;