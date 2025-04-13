import React from 'react';
import { useState } from 'react';
import QuotaForm from './QuotaForm';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);

const PaymentPage = () => {
    const [quota, setQuota] = useState({
        transactions: 0,
        products: 0,
        employees: 0,
        stores: 0,
    });

    const [isAutoRenewal, setIsAutoRenewal] = useState(false); // Opsi pembayaran otomatis
    const [subscriptionEndDate, setSubscriptionEndDate] = useState<Date | null>(null); // Tanggal berakhir langganan

    const handleQuotaSubmit = (quota: { transactions: number; products: number; employees: number; stores: number }) => {
        setQuota(quota);
    };

    const handlePayment = async (token: string) => {
        // Kirim data kuota, token, dan pembayaran ke backend
        const res = await fetch(`${import.meta.env.VITE_SERVER_URI_BASE}api/subscriptions-test`, {
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
                is_auto_renewal: isAutoRenewal,
                token: token, // Kirim PaymentMethod ID sebagai token
            }),
        });

        if (res.ok) {
            alert('Subscription berhasil!');
            setSubscriptionEndDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)); // Contoh: langganan 1 bulan
        } else {
            const data = await res.json();
            alert(`Error: ${data.message}`);
        }
    };

    // Hitung total harga berdasarkan kuota
    const calculateTotalPrice = () => {
        const priceTransactions = quota.transactions * 500;
        const priceProducts = quota.products * 500;
        const priceEmployees = quota.employees * 1000;
        const priceStores = quota.stores * 50000;
        return priceTransactions + priceProducts + priceEmployees + priceStores;
    };

    // Cek apakah langganan sudah habis
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

                    {/* Form Pembayaran */}
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

const PaymentForm: React.FC<{ onPayment: (token: string) => void }> = ({ onPayment }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!stripe || !elements) {
            setLoading(false);
            return;
        }

        // Proses pembayaran dengan Stripe
        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: elements.getElement(CardElement)!,
        });

        if (error) {
            setErrorMessage(error.message || 'Terjadi kesalahan saat memproses pembayaran.');
            setLoading(false);
            return;
        }

        // Kirim PaymentMethod ID ke parent component
        if (paymentMethod?.id) {
            onPayment(paymentMethod.id); // Kirim token (PaymentMethod ID)
        } else {
            setErrorMessage('Gagal mendapatkan PaymentMethod ID.');
        }

        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <CardElement className="border border-gray-300 rounded-md p-2" />
            {errorMessage && <p className="text-red-600">{errorMessage}</p>}
            <button type="submit" disabled={!stripe || loading} className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-500 transition">
                {loading ? 'Processing...' : 'Bayar'}
            </button>
        </form>
    );
};
