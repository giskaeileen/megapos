import React, { useEffect, useState } from 'react';
import QuotaForm from './QuotaForm';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';

const TestPage = () => {
    const [quota, setQuota] = useState({
        transactions: 0,
        products: 0,
        employees: 0,
        stores: 0,
    });

    const [isAutoRenewal, setIsAutoRenewal] = useState(false);
    const [subscriptionEndDate, setSubscriptionEndDate] = useState<Date | null>(null);

    const handleQuotaSubmit = (quota: { transactions: number; products: number; employees: number; stores: number }) => {
        setQuota(quota);
    };

    const calculateTotalPrice = () => {
        const priceTransactions = quota.transactions * 500;
        const priceProducts = quota.products * 500;
        const priceEmployees = quota.employees * 1000;
        const priceStores = quota.stores * 50000;
        return priceTransactions + priceProducts + priceEmployees + priceStores;
    };

    const isSubscriptionExpired = subscriptionEndDate ? new Date() > subscriptionEndDate : true;

    const clientKey = import.meta.env.MIDTRANS_CLIENT_KEY;

    React.useEffect(() => {
        const script = document.createElement('script');
        script.src = `https://app.sandbox.midtrans.com/snap/snap.js`;
        script.setAttribute('data-client-key', clientKey);
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, [clientKey]);

    // click pay
    const handlePayClick = async () => {
        let snapToken;

        try {
            // const response = await createMidtransToken({storeId, data: payload});
            // snapToken = response.data;

            // Buat transaksi Midtrans
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

            const { snap_token } = await response.json();
            snapToken = snap_token;
        } catch (error: any) {
            alert('Failed to create order: ' + (error.data?.message || error.message));
        }

        console.log(snapToken);

        if (snapToken && (window as any).snap) {
            (window as any).snap.pay(snapToken, {
                onSuccess: (result: any) => {
                    alert('Pembayaran berhasil!');
                    setSubscriptionEndDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)); // Langganan 30 hari
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

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const paymentNotification = async () => {
            const orderId = searchParams.get('order_id');
            const statusCode = searchParams.get('status_code');
            const transactionStatus = searchParams.get('transaction_status');
            const grossAmount = searchParams.get('gross_amount');
            const paymentType = searchParams.get('payment_type');
            const fraudStatus = searchParams.get('fraud_status');
            const email = 'user@example.com'; // Ganti dengan email user yang login

            if (orderId && statusCode === '200' && transactionStatus === 'settlement') {
                try {
                    // Data notifikasi yang akan dikirim ke backend
                    const notificationData = {
                        transaction_time: new Date().toISOString(), // Waktu transaksi
                        transaction_status: transactionStatus,
                        transaction_id: orderId, // ID transaksi
                        status_message: 'midtrans payment notification',
                        status_code: statusCode,
                        signature_key: 'abc123...', // Signature key (harus digenerate sesuai aturan Midtrans)
                        payment_type: paymentType, // Jenis pembayaran
                        order_id: orderId,
                        gross_amount: grossAmount, // Total harga
                        fraud_status: fraudStatus, // Status fraud
                        email: email, // Email user
                        custom_field1: quota.transactions.toString(), // Quota Transactions
                        custom_field2: quota.products.toString(), // Quota Products
                        custom_field3: quota.employees.toString(), // Quota Employees
                        custom_field4: quota.stores.toString(), // Quota Stores
                    };

                    // Kirim notifikasi ke backend
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

                    // Hapus query params setelah alert ditampilkan
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

        paymentNotification();
    }, []);

    return (
        <div className="p-6 flex gap-6">
            {/* Sebelah Kiri: Form Kuota */}
            <div className="w-1/2">
                <h1 className="text-2xl font-bold mb-4">Atur Kuota</h1>
                <QuotaForm onSubmit={handleQuotaSubmit} />
            </div>

            {/* Sebelah Kanan: Cart Payment */}
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
                        <span>Rp {calculateTotalPrice().toLocaleString()}</span>
                    </div>

                    {/* Opsi Pembayaran Otomatis */}
                    <div className="mt-4">
                        <label className="flex items-center space-x-2">
                            <input type="checkbox" checked={isAutoRenewal} onChange={(e) => setIsAutoRenewal(e.target.checked)} className="form-checkbox" />
                            <span>Pembayaran Otomatis</span>
                        </label>
                    </div>

                    {/* Tombol Pembayaran */}
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
