import React from 'react';
import { useState } from 'react';
import QuotaForm from './QuotaForm'; // Komponen form untuk mengatur kuota
import { loadStripe } from '@stripe/stripe-js'; // Library untuk inisialisasi Stripe
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'; // Komponen dan hooks dari Stripe untuk React

// Inisialisasi Stripe dengan public key dari environment variable
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);

// Komponen utama halaman pembayaran
const PaymentPage = () => {
    // State untuk menyimpan kuota yang dipilih user
    const [quota, setQuota] = useState({
        transactions: 0,
        products: 0,
        employees: 0,
        stores: 0,
    });

    const [isAutoRenewal, setIsAutoRenewal] = useState(false); // State untuk cek apakah user pilih pembayaran otomatis
    const [subscriptionEndDate, setSubscriptionEndDate] = useState<Date | null>(null); // State untuk menyimpan tanggal akhir langganan

    // Handler saat form kuota disubmit
    const handleQuotaSubmit = (quota: { transactions: number; products: number; employees: number; stores: number }) => {
        setQuota(quota); // Update state kuota
    };

    // Fungsi untuk mengirim data pembayaran ke server
    const handlePayment = async (token: string) => {
        const res = await fetch(`${import.meta.env.VITE_SERVER_URI_BASE}api/subscriptions-test`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`, // Ambil token user dari localStorage
            },
            body: JSON.stringify({
                quota_transactions: quota.transactions,
                quota_products: quota.products,
                quota_employees: quota.employees,
                quota_stores: quota.stores,
                is_auto_renewal: isAutoRenewal,
                token: token, // Token di sini adalah PaymentMethod ID dari Stripe
            }),
        });

        // Tampilkan pesan berhasil atau error
        if (res.ok) {
            alert('Subscription berhasil!');
            setSubscriptionEndDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)); // Langganan 1 bulan dari sekarang
        } else {
            const data = await res.json();
            alert(`Error: ${data.message}`);
        }
    };

    // Hitung total harga berdasarkan kuota yang dipilih
    const calculateTotalPrice = () => {
        const priceTransactions = quota.transactions * 500;
        const priceProducts = quota.products * 500;
        const priceEmployees = quota.employees * 1000;
        const priceStores = quota.stores * 50000;
        return priceTransactions + priceProducts + priceEmployees + priceStores;
    };

    // Cek apakah langganan sudah berakhir
    const isSubscriptionExpired = subscriptionEndDate ? new Date() > subscriptionEndDate : true;

    return (
        <div className="p-6 flex gap-6">
            {/* Sebelah Kiri: Form Kuota */}
            <div className=" w-1/2">
                <h1 className="text-2xl font-bold mb-4">Atur Kuota</h1>
                <QuotaForm onSubmit={handleQuotaSubmit} />
            </div>

            {/* Sebelah Kanan: Cart Payment */}
            <div className="w-1/2">
                <h1 className="text-2xl font-bold mb-4">Pembayaran</h1>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Resume Kuota</h2>
                    {/* Tampilkan kuota yang sudah dipilih */}
                    <div className="space-y-2">
                        <p>Quota Transactions: {quota.transactions}</p>
                        <p>Quota Products: {quota.products}</p>
                        <p>Quota Employees: {quota.employees}</p>
                        <p>Quota Stores: {quota.stores}</p>
                    </div>
                    <hr className="my-4" />
                    {/* Total harga kuota */}
                    <div className="flex justify-between">
                        <span className="font-semibold">Total Harga:</span>
                        <span>Rp {calculateTotalPrice().toLocaleString()}</span>
                    </div>

                    {/* Checkbox untuk opsi pembayaran otomatis */}
                    <div className="mt-4">
                        <label className="flex items-center space-x-2">
                            <input type="checkbox" checked={isAutoRenewal} onChange={(e) => setIsAutoRenewal(e.target.checked)} className="form-checkbox" />
                            <span>Pembayaran Otomatis</span>
                        </label>
                    </div>

                    {/* Tampilkan form pembayaran jika tidak memilih auto-renew dan langganan sudah expired */}
                    {!isAutoRenewal && isSubscriptionExpired && (
                        <div className="mt-6">
                            <h2 className="text-xl font-semibold mb-4">Proses Pembayaran</h2>
                            <Elements stripe={stripePromise}>
                                <PaymentForm onPayment={handlePayment} />
                            </Elements>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;

// Komponen form Stripe untuk mengisi data kartu dan memproses pembayaran
const PaymentForm: React.FC<{ onPayment: (token: string) => void }> = ({ onPayment }) => {
    const stripe = useStripe(); // Hook dari Stripe untuk akses objek Stripe
    const elements = useElements(); // Hook untuk akses elemen kartu
    const [loading, setLoading] = useState(false); // State untuk loading saat submit
    const [errorMessage, setErrorMessage] = useState(''); // State untuk pesan error jika terjadi kesalahan

    // Fungsi yang dijalankan saat form disubmit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Pastikan Stripe dan Elements tersedia
        if (!stripe || !elements) {
            setLoading(false);
            return;
        }

        // Buat metode pembayaran menggunakan kartu
        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: elements.getElement(CardElement)!,
        });

        // Tampilkan error jika ada
        if (error) {
            setErrorMessage(error.message || 'Terjadi kesalahan saat memproses pembayaran.');
            setLoading(false);
            return;
        }

        // Kirim PaymentMethod ID ke parent component
        if (paymentMethod?.id) {
            onPayment(paymentMethod.id); // Kirim token ke fungsi handlePayment
        } else {
            setErrorMessage('Gagal mendapatkan PaymentMethod ID.');
        }

        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input kartu kredit/debit */}
            <CardElement className="border border-gray-300 rounded-md p-2" />
            {/* Tampilkan pesan error jika ada */}
            {errorMessage && <p className="text-red-600">{errorMessage}</p>}
            {/* Tombol submit */}
            <button type="submit" disabled={!stripe || loading} className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-500 transition">
                {loading ? 'Processing...' : 'Bayar'}
            </button>
        </form>
    );
};
