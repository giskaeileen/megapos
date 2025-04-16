import React, { useEffect, useState } from 'react';
import QuotaForm from './QuotaForm';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';

const TestPage = () => {
    // State untuk menyimpan kuota langganan yang dipilih user
    const [quota, setQuota] = useState({
        transactions: 0,
        products: 0,
        employees: 0,
        stores: 0,
    });

    // State untuk mengaktifkan atau menonaktifkan fitur perpanjangan otomatis
    const [isAutoRenewal, setIsAutoRenewal] = useState(false);

    // State untuk menyimpan tanggal berakhirnya langganan saat ini
    const [subscriptionEndDate, setSubscriptionEndDate] = useState<Date | null>(null);

    // Fungsi untuk menangani submit dari form kuota
    const handleQuotaSubmit = (quota: { transactions: number; products: number; employees: number; stores: number }) => {
        setQuota(quota);
    };

    // Fungsi untuk menghitung total harga berdasarkan kuota
    const calculateTotalPrice = () => {
        const priceTransactions = quota.transactions * 500;
        const priceProducts = quota.products * 500;
        const priceEmployees = quota.employees * 1000;
        const priceStores = quota.stores * 50000;
        return priceTransactions + priceProducts + priceEmployees + priceStores;
    };

    // Cek apakah langganan sudah kedaluwarsa
    const isSubscriptionExpired = subscriptionEndDate ? new Date() > subscriptionEndDate : true;

    // Ambil Midtrans client key dari environment variable
    const clientKey = import.meta.env.MIDTRANS_CLIENT_KEY;

    // Load script Snap Midtrans saat komponen dimount
    React.useEffect(() => {
        const script = document.createElement('script');
        script.src = `https://app.sandbox.midtrans.com/snap/snap.js`;
        script.setAttribute('data-client-key', clientKey);
        script.async = true;
        document.body.appendChild(script);

        // Hapus script saat komponen di-unmount
        return () => {
            document.body.removeChild(script);
        };
    }, [clientKey]);

    // Fungsi untuk memulai proses pembayaran
    const handlePayClick = async () => {
        let snapToken;

        try {
            // Kirim permintaan ke backend untuk membuat transaksi dan mendapatkan snap token
            const response = await fetch(`${import.meta.env.VITE_SERVER_URI_BASE}api/payment/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    quota_transactions: quota.transactions,
                    quota_products: quota.products,
                    quota_employees: quota.employees,
                    quota_stores: quota.stores,
                }),
            });

            // Ambil token dari respon
            const { snap_token } = await response.json();
            snapToken = snap_token;
        } catch (error: any) {
            alert('Failed to create order: ' + (error.data?.message || error.message));
        }

        console.log(snapToken);

        // Jika token berhasil diperoleh dan script Snap tersedia
        if (snapToken && (window as any).snap) {
            (window as any).snap.pay(snapToken, {
                onSuccess: (result: any) => {
                    alert('Pembayaran berhasil!');
                    setSubscriptionEndDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)); // Tambah 30 hari
                },
                onPending: (result: any) => {
                    alert('Pembayaran tertunda. Silakan selesaikan pembayaran.');
                },
                onError: (error: any) => {
                    alert('Pembayaran gagal. Silakan coba lagi.');
                },
            });
        } else {
            console.error('Snap.js is not loaded yet.');
        }
    };

    // Untuk membaca query parameter dari URL (digunakan untuk notifikasi pembayaran)
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        // Fungsi untuk memproses notifikasi pembayaran jika ada parameter pada URL
        const paymentNotification = async () => {
            const orderId = searchParams.get('order_id');
            const statusCode = searchParams.get('status_code');
            const transactionStatus = searchParams.get('transaction_status');
            const grossAmount = searchParams.get('gross_amount');
            const paymentType = searchParams.get('payment_type');
            const fraudStatus = searchParams.get('fraud_status');
            const email = 'user@example.com'; // Ganti dengan email user yang sedang login

            // Validasi bahwa transaksi sukses
            if (orderId && statusCode === '200' && transactionStatus === 'settlement') {
                try {
                    // Data notifikasi yang akan dikirim ke backend
                    const notificationData = {
                        transaction_time: new Date().toISOString(),
                        transaction_status: transactionStatus,
                        transaction_id: orderId,
                        status_message: 'midtrans payment notification',
                        status_code: statusCode,
                        signature_key: 'abc123...', // Signature harus digenerate sesuai spesifikasi Midtrans
                        payment_type: paymentType,
                        order_id: orderId,
                        gross_amount: grossAmount,
                        fraud_status: fraudStatus,
                        email: email,
                        custom_field1: quota.transactions.toString(),
                        custom_field2: quota.products.toString(),
                        custom_field3: quota.employees.toString(),
                        custom_field4: quota.stores.toString(),
                    };

                    // Kirim data ke endpoint notifikasi backend
                    const response = await fetch(`${import.meta.env.VITE_SERVER_URI_BASE}api/payment/notification`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                        body: JSON.stringify(notificationData),
                    });

                    if (!response.ok) {
                        throw new Error('Gagal mengirim notifikasi pembayaran.');
                    }

                    // Tampilkan alert sukses
                    await Swal.fire({
                        title: 'Payment Successfully!',
                        text: `Order ID: ${orderId} successfully processed.`,
                        icon: 'success',
                        confirmButtonText: 'OK',
                    });

                    // Hapus query params dari URL
                    navigate(`/test-page`, { replace: true });
                } catch (error) {
                    console.error('Gagal memperbarui status pesanan:', error);
                    Swal.fire({
                        title: 'Error!',
                        text: 'Gagal memproses pembayaran.',
                        icon: 'error',
                        confirmButtonText: 'OK',
                    });
                }
            }
        };

        paymentNotification(); // Jalankan saat komponen pertama kali mount
    }, []);

    return (
        <div className="p-6 flex gap-6">
            {/* Sebelah Kiri: Form Kuota */}
            <div className="w-1/2">
                <h1 className="text-2xl font-bold mb-4">Atur Kuota</h1>
                {/* Komponen Form Kuota */}
                <QuotaForm onSubmit={handleQuotaSubmit} />
            </div>

            {/* Sebelah Kanan: Ringkasan dan Pembayaran */}
            <div className="w-1/2">
                <h1 className="text-2xl font-bold mb-4">Pembayaran</h1>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Resume Kuota</h2>
                    <div className="space-y-2">
                        <p>Quota Transactions: {quota.transactions}</p>
                        <p>Quota Products: {quota.products}</p>
                        <p>Quota Employees: {quota.employees}</p>
                        <p>Quota Stores: {quota.stores}</p>
                    </div>
                    <hr className="my-4" />
                    <div className="flex justify-between">
                        <span className="font-semibold">Total Harga:</span>
                        {/* Format harga dengan pemisah ribuan */}
                        <span>Rp {calculateTotalPrice().toLocaleString()}</span>
                    </div>

                    {/* Checkbox untuk memilih pembayaran otomatis */}
                    <div className="mt-4">
                        <label className="flex items-center space-x-2">
                            <input type="checkbox" checked={isAutoRenewal} onChange={(e) => setIsAutoRenewal(e.target.checked)} className="form-checkbox" />
                            <span>Pembayaran Otomatis</span>
                        </label>
                    </div>

                    {/* Tombol untuk memulai pembayaran jika langganan sudah habis dan bukan otomatis */}
                    {!isAutoRenewal && isSubscriptionExpired && (
                        <button onClick={handlePayClick} className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-500 transition mt-6">
                            Bayar Sekarang
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TestPage;
