// Import React dari library utama React
import React from 'react';

// Deklarasi interface untuk props yang akan diterima oleh komponen
interface QuotaProgressBarProps {
  icon: React.ReactNode; // Komponen ikon yang akan ditampilkan di sebelah kiri
  title: string;         // Judul atau label dari progress bar
  initial: number;       // Nilai awal kuota (tidak digunakan langsung di komponen ini, tapi bisa berguna di masa depan)
  used: number;          // Jumlah kuota yang sudah digunakan
  current: number;       // Jumlah kuota yang tersedia saat ini
  color: 'blue' | 'green' | 'purple' | 'yellow' | 'red' | 'indigo'; // Warna utama progress bar
}

// Komponen fungsi utama
const QuotaProgressBar: React.FC<QuotaProgressBarProps> = ({ 
  icon, 
  title, 
  initial,
  used,
  current,
  color 
}) => {
  // Menghitung persentase pemakaian kuota berdasarkan jumlah yang telah digunakan dan jumlah total saat ini
  const usagePercentage = current === 0 ? 0 : Math.round((used / current) * 100);

  // Mapping warna untuk container dan progress bar dengan Tailwind CSS
  const colorClasses = {
    container: {
      blue: 'bg-blue-100 text-blue-500',
      green: 'bg-green-100 text-green-500',
      purple: 'bg-purple-100 text-purple-500',
      yellow: 'bg-yellow-100 text-yellow-500',
      red: 'bg-red-100 text-red-500',
      indigo: 'bg-indigo-100 text-indigo-500',
    },
    progress: {
      blue: 'bg-gradient-to-r from-blue-400 to-blue-600',
      green: 'bg-gradient-to-r from-green-400 to-green-600',
      purple: 'bg-gradient-to-r from-purple-400 to-purple-600',
      yellow: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
      red: 'bg-gradient-to-r from-red-400 to-red-600',
      indigo: 'bg-gradient-to-r from-indigo-400 to-indigo-600',
    }
  };

  // Struktur tampilan utama
  return (
    <div className="flex items-center">
      {/* Bagian ikon di sebelah kiri */}
      <div className="w-9 h-9 mr-3">
        {/* Background warna berdasarkan props 'color' */}
        <div className={`rounded-full w-9 h-9 grid place-content-center ${colorClasses.container[color]}`}>
          {icon}
        </div>
      </div>

      {/* Bagian isi progress bar */}
      <div className="flex-1">
        {/* Header baris atas: Judul dan angka kuota */}
        <div className="flex font-semibold text-gray-700 mb-1">
          <h6>{title}</h6>
          <p className="ml-auto">
            {used}/{current} {/* Menampilkan jumlah yang digunakan dan total */}
          </p>
        </div>

        {/* Bar progres utama */}
        <div className="rounded-full h-2 bg-gray-200 shadow mb-1">
          <div
            className={`${colorClasses.progress[color]} h-full rounded-full`}
            style={{ width: `${usagePercentage}%` }} // Mengatur lebar berdasarkan persentase penggunaan
          ></div>
        </div>
      </div>
    </div>
  );
};

// Ekspor komponen agar bisa digunakan di file lain
export default QuotaProgressBar;
