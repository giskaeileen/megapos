// components/SubscriptionInfoCard.tsx

// Import React dan Link dari react-router-dom untuk navigasi
import React from 'react';
import { Link } from 'react-router-dom';

// Definisi tipe props yang diterima oleh komponen
interface SubscriptionInfoCardProps {
  startDate: string;         // Tanggal mulai langganan (format string)
  endDate: string;           // Tanggal akhir langganan
  remainingDays: number;     // Jumlah hari yang tersisa dalam langganan
  totalDays: number;         // Total durasi langganan (dalam hari)
  onAddQuota: () => void;    // Fungsi callback saat tombol "Add Quota" diklik
}

// Komponen fungsi utama SubscriptionInfoCard
const SubscriptionInfoCard: React.FC<SubscriptionInfoCardProps> = ({
  startDate,
  endDate,
  remainingDays,
  totalDays,
  onAddQuota
}) => {
  // Menghitung persentase sisa hari dari total hari langganan
  const remainingDaysPercentage = ((remainingDays / totalDays) * 100).toFixed(2);

  // Tampilan kartu informasi langganan
  return (
    <div className="panel p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Package Information</h2>

      <div className="space-y-4">
        {/* Tabel info tanggal mulai dan akhir langganan */}
        <div className="mb-6">
          <table>
            <tbody>
              <tr>
                <td className="!px-0">Start Date</td>
                {/* Format tanggal jadi bentuk lokal seperti 15/04/2025 */}
                <td className="!px-0">{new Date(startDate).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td className="!px-0">End Date</td>
                <td className="!px-0">{new Date(endDate).toLocaleDateString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Progress bar sisa hari */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="font-medium">Remaining days:</span>
            <span>
              {/* Menampilkan jumlah hari yang tersisa */}
              {/* {remainingDays} hari ({remainingDaysPercentage}%) */}
              {remainingDays} days 
            </span>
          </div>
          {/* Progress bar visual sisa waktu */}
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600" 
              style={{ width: `${remainingDaysPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Tombol aksi di bagian bawah */}
      <div className="flex justify-between mt-auto pt-6">
        {/* Tombol untuk menambah kuota */}
        <button onClick={onAddQuota} className="btn btn-info">
          Add Qouota
        </button>
        {/* Navigasi ke halaman langganan */}
        <Link to="/subs-page" className="btn btn-primary">
          Subscription
        </Link>
      </div>
    </div>
  );
};

// Ekspor komponen agar bisa digunakan di file lain
export default SubscriptionInfoCard;
