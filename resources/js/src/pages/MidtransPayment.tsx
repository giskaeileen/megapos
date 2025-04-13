import React, { FC, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCreatePosOrderMutation } from '../redux/features/pos/posApi';
import { useGetPosQuery, useUpdateStatusOrderMutation } from '../redux/features/pos/posApi';
import Swal from 'sweetalert2';

type Props = {
    createMidtransToken: any;
    dataMidtransToken: any;
    customer: any;
    selectedPaymentMethod: any;
    totalPrice: any;
    paymentStatus: any;
    noRekening: any;
    nameRekening: any;
    quantity: any;
    subTotalPrice: any;
    storeId: any;
    setPaymentStatus: any;
    setPay: any;
    saveOrder: any;
    dataCart: any;
    setDataCart: any;
    setTotalPrice: any;
    setAddContactModal: any;
};

const MidtransPayment: FC<Props> = ({ createMidtransToken, selectedPaymentMethod, totalPrice, quantity, subTotalPrice, storeId, dataCart, setDataCart, setTotalPrice, setAddContactModal }) => {
    const clientKey = import.meta.env.MIDTRANS_CLIENT_KEY;
    const location = useLocation();
    const navigate = useNavigate();
    const [createPosOrder, { data: dataOrder, error: errorOrder, isSuccess: isSuccessOrder }] = useCreatePosOrderMutation();
    const [updateStatusOrder] = useUpdateStatusOrderMutation();

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
        try {
            // console.log(selectedPaymentMethod);
            const payload = {
                payment_status: selectedPaymentMethod,
                pay: Number(totalPrice),
                member_id: null,
                total_products: quantity,
                sub_total: subTotalPrice, //harga sebelum diskon dan pajak
                total: totalPrice,
                pay_return: null,
                bank: null,
                no_rekening: null,
                name_rekening: null,
                cart: dataCart,
            };

            const response = await createMidtransToken({ storeId, data: payload });
            // snapToken = response.data;
            const { snap_token, order_id } = await response.data;

            if (snap_token && (window as any).snap) {
                (window as any).snap.pay(snap_token, {
                    onSuccess: async (result: any) => {
                        console.log('Payment Success:', result);
                        try {
                            const formData = new FormData();
                            formData.append('id', order_id);
                            formData.append('_method', 'PUT');

                            await updateStatusOrder({ storeId, data: formData });

                            setDataCart([]);

                            // if (statusCode === '200' && transactionStatus === 'settlement') {
                            localStorage.removeItem('cart');
                            setTotalPrice(0);
                            Swal.fire('Success', 'Payment Success', 'success');
                            // }
                            setAddContactModal(false);

                            navigate(`/${storeId}/pos`, { replace: true });
                        } catch (error) {
                            console.error('Failed to update order status:', error);
                            // Jika gagal, hapus flag processed agar bisa dicoba lagi
                            // localStorage.removeItem(processedKey);
                        }
                    },
                    onPending: (result: any) => {
                        console.log('Payment Pending:', result);
                    },
                    onError: (result: any) => {
                        console.error('Payment Error:', result);
                    },
                });
            } else {
                console.error('Snap.js is not loaded yet.');
            }
        } catch (error: any) {
            alert('Failed to create order: ' + (error.data?.message || error.message));
            console.log(error)
        }
    };

    return (
        <div>
            <div className="flex justify-end items-center mt-8">
                <button type="button" id="pay-button" onClick={handlePayClick} className="btn btn-lg py-4 rounded-full btn-primary w-full">
                    Pay
                </button>
            </div>
        </div>
    );
};

export default MidtransPayment;
