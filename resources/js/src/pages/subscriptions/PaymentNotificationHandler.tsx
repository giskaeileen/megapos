// components/PaymentNotificationHandler.tsx
import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom'; // Hook untuk ambil parameter dari URL dan navigasi halaman
import Swal from 'sweetalert2'; // Library untuk menampilkan alert pop-up yang interaktif

// Interface untuk tipe properti yang dibutuhkan komponen ini
interface PaymentNotificationHandlerProps {
    API_URL: string; // URL dari API backend
    quota: {
        transactions: number;
        products: number;
        employees: number;
        stores: number;
    };
    calculateTotalPrice: () => number; // Fungsi untuk menghitung total harga pembayaran
    fetchSubscription: () => void; // Fungsi untuk mengambil ulang data langganan user setelah pembayaran
}

// Komponen utama yang akan otomatis membaca notifikasi pembayaran dari URL
const PaymentNotificationHandler: React.FC<PaymentNotificationHandlerProps> = ({
    API_URL,
    quota,
    calculateTotalPrice,
    fetchSubscription,
}) => {
    const [searchParams] = useSearchParams(); // Mengambil parameter dari URL seperti order_id, status_code, dll
    const navigate = useNavigate(); // Hook untuk navigasi antar halaman

    // useEffect dipakai agar fungsi hanya dipanggil saat komponen mount (sekali aja)
    useEffect(() => {
        const paymentNotification = async () => {
            // Mengambil parameter pembayaran dari URL
            const orderId = searchParams.get('order_id');
            const statusCode = searchParams.get('status_code');
            const transactionStatus = searchParams.get('transaction_status');

            // Cek apakah order ini sudah diproses sebelumnya di localStorage
            const processedKey = `processed_${orderId}`;
            const alreadyProcessed = localStorage.getItem(processedKey);

            // Jika semua parameter tersedia, total harga valid, dan belum diproses sebelumnya
            if (orderId && statusCode && transactionStatus && calculateTotalPrice() && !alreadyProcessed) {
                // Tandai bahwa order ini sudah diproses agar tidak dikirim ulang jika user refresh
                localStorage.setItem(processedKey, 'true');
                try {
                    // Kirim notifikasi pembayaran ke backend
                    const response = await fetch(`${API_URL}/payment/notification`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${localStorage.getItem('token')}`, // Ambil token dari localStorage
                        },
                        body: JSON.stringify({
                            transaction_time: new Date().toISOString(), // Waktu transaksi saat ini
                            transaction_status: transactionStatus,
                            transaction_id: orderId,
                            status_message: 'midtrans payment notification',
                            status_code: statusCode,
                            signature_key: 'abc123...', // Signature dummy, idealnya digenerate dari backend
                            email: 'email@gmail.com', // Email dummy, seharusnya dari auth atau data user
                            order_id: orderId,
                            gross_amount: calculateTotalPrice(),
                            custom_field1: quota.transactions,
                            custom_field2: quota.products,
                            custom_field3: quota.employees,
                            custom_field4: quota.stores,
                        }),
                    });

                    // Jika berhasil, refresh data subscription dan tampilkan notifikasi sukses
                    if (response.ok) {
                        fetchSubscription();
                        Swal.fire('Success', 'Payment Success', 'success');
                    }

                    // Redirect ke halaman subscription aktif
                    navigate('/current-subs', { replace: true });
                } catch (error) {
                    // Tampilkan error jika proses gagal
                    console.error('Payment notification error:', error);
                }
            }
        };

        // Jalankan fungsi notifikasi saat komponen aktif
        paymentNotification();
    }, [searchParams, calculateTotalPrice, quota, navigate, fetchSubscription, API_URL]);

    return null; // Komponen ini tidak menampilkan apa-apa di UI
};

export default PaymentNotificationHandler;
