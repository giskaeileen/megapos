import React, { FC, useEffect, useState } from 'react';
// Hook untuk mengetahui URL saat ini
import { useLocation, useNavigate } from 'react-router-dom';
// Import mutation untuk membuat pesanan POS
import { useCreatePosOrderMutation } from '../redux/features/pos/posApi';
// Import query dan mutation untuk POS
import { useGetPosQuery, useUpdateStatusOrderMutation } from '../redux/features/pos/posApi';
// Import SweetAlert2 untuk notifikasi alert
import Swal from 'sweetalert2';

// Tipe props yang diterima oleh komponen MidtransPayment
type Props = {
    createMidtransToken: any;         // Fungsi untuk membuat Midtrans Snap Token
    dataMidtransToken: any;           // Data dari Midtrans Snap Token
    customer: any;                    // Data customer
    selectedPaymentMethod: any;       // Metode pembayaran yang dipilih
    totalPrice: any;                 // Total harga belanja
    paymentStatus: any;              // Status pembayaran
    noRekening: any;                 // Nomor rekening
    nameRekening: any;               // Nama rekening
    quantity: any;                   // Jumlah produk
    subTotalPrice: any;              // Subtotal sebelum pajak dan diskon
    storeId: any;                    // ID toko
    setPaymentStatus: any;          // Setter untuk status pembayaran
    setPay: any;                     // Setter untuk nilai pembayaran
    saveOrder: any;                  // Fungsi untuk menyimpan pesanan
    dataCart: any;                   // Data keranjang
    setDataCart: any;                // Setter untuk data keranjang
    setTotalPrice: any;             // Setter untuk total harga
    setAddContactModal: any;        // Setter untuk modal kontak customer
};

// Komponen utama MidtransPayment
const MidtransPayment: FC<Props> = ({
    createMidtransToken,
    selectedPaymentMethod,
    totalPrice,
    quantity,
    subTotalPrice,
    storeId,
    dataCart,
    setDataCart,
    setTotalPrice,
    setAddContactModal
}) => {
    // Ambil MIDTRANS_CLIENT_KEY dari environment
    const clientKey = import.meta.env.MIDTRANS_CLIENT_KEY;
    const location = useLocation(); // Dapatkan lokasi route saat ini
    const navigate = useNavigate(); // Hook navigasi ke halaman lain

    // Hook dari Redux Toolkit untuk membuat pesanan POS
    const [createPosOrder, { data: dataOrder, error: errorOrder, isSuccess: isSuccessOrder }] = useCreatePosOrderMutation();
    // Hook dari Redux Toolkit untuk update status pesanan
    const [updateStatusOrder] = useUpdateStatusOrderMutation();

    // useEffect untuk menambahkan script Midtrans Snap.js secara dinamis
    React.useEffect(() => {
        const script = document.createElement('script');
        script.src = `https://app.sandbox.midtrans.com/snap/snap.js`; // URL Midtrans sandbox
        script.setAttribute('data-client-key', clientKey); // Set client key di atribut HTML
        script.async = true;
        document.body.appendChild(script); // Tambahkan script ke DOM

        return () => {
            // Hapus script ketika komponen unmount
            document.body.removeChild(script);
        };
    }, [clientKey]);

    // Fungsi utama ketika tombol "Pay" diklik
    const handlePayClick = async () => {
        try {
            // Payload untuk request token Midtrans
            const payload = {
                payment_status: selectedPaymentMethod,
                pay: Number(totalPrice),
                member_id: null,
                total_products: quantity,
                sub_total: subTotalPrice, // Harga sebelum pajak & diskon
                total: totalPrice,
                pay_return: null,
                bank: null,
                no_rekening: null,
                name_rekening: null,
                cart: dataCart,
            };

            // Panggil API untuk membuat Snap Token Midtrans
            const response = await createMidtransToken({ storeId, data: payload });
            const { snap_token, order_id } = await response.data;

            // Jika token berhasil dibuat dan Snap sudah siap
            if (snap_token && (window as any).snap) {
                // Tampilkan pop-up pembayaran Midtrans
                (window as any).snap.pay(snap_token, {
                    // Jika pembayaran sukses
                    onSuccess: async (result: any) => {
                        console.log('Payment Success:', result);

                        try {
                            const formData = new FormData();
                            formData.append('id', order_id);
                            formData.append('_method', 'PUT');

                            // Update status order di backend
                            await updateStatusOrder({ storeId, data: formData });

                            // Kosongkan keranjang
                            setDataCart([]);
                            localStorage.removeItem('cart'); // Hapus cart dari localStorage
                            setTotalPrice(0); // Set total harga ke 0
                            Swal.fire('Success', 'Payment Success', 'success'); // Tampilkan notifikasi

                            setAddContactModal(false); // Tutup modal kontak customer

                            // Redirect kembali ke halaman POS
                            navigate(`/${storeId}/pos`, { replace: true });
                        } catch (error) {
                            console.error('Failed to update order status:', error);
                        }
                    },
                    // Jika pembayaran masih pending
                    onPending: (result: any) => {
                        console.log('Payment Pending:', result);
                    },
                    // Jika pembayaran gagal
                    onError: (result: any) => {
                        console.error('Payment Error:', result);
                    },
                });
            } else {
                console.error('Snap.js is not loaded yet.');
            }
        } catch (error: any) {
            alert('Failed to create order: ' + (error.data?.message || error.message)); // Tampilkan error
            console.log(error);
        }
    };

    return (
        <div>
            <div className="flex justify-end items-center mt-8">
                {/* Tombol utama untuk memicu pembayaran */}
                <button
                    type="button"
                    id="pay-button"
                    onClick={handlePayClick}
                    className="btn btn-lg py-4 rounded-full btn-primary w-full"
                >
                    Pay
                </button>
            </div>
        </div>
    );
};

export default MidtransPayment;
