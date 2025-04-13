// components/PaymentNotificationHandler.tsx
import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

interface PaymentNotificationHandlerProps {
    API_URL: string;
    quota: {
        transactions: number;
        products: number;
        employees: number;
        stores: number;
    };
    calculateTotalPrice: () => number;
    fetchSubscription: () => void;
}

const PaymentNotificationHandler: React.FC<PaymentNotificationHandlerProps> = ({ API_URL, quota, calculateTotalPrice, fetchSubscription }) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const paymentNotification = async () => {
            const orderId = searchParams.get('order_id');
            const statusCode = searchParams.get('status_code');
            const transactionStatus = searchParams.get('transaction_status');

            const processedKey = `processed_${orderId}`;
            const alreadyProcessed = localStorage.getItem(processedKey);

            if (orderId && statusCode && transactionStatus && calculateTotalPrice() && !alreadyProcessed) {
                localStorage.setItem(processedKey, 'true');
                try {
                    const response = await fetch(`${API_URL}/payment/notification`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                        body: JSON.stringify({
                            transaction_time: new Date().toISOString(),
                            transaction_status: transactionStatus,
                            transaction_id: orderId,
                            status_message: 'midtrans payment notification',
                            status_code: statusCode,
                            signature_key: 'abc123...',
                            email: 'email@gmail.com',
                            order_id: orderId,
                            gross_amount: calculateTotalPrice(),
                            custom_field1: quota.transactions,
                            custom_field2: quota.products,
                            custom_field3: quota.employees,
                            custom_field4: quota.stores,
                        }),
                    });

                    if (response.ok) {
                        fetchSubscription();
                        Swal.fire('Success', 'Payment Success', 'success');
                    }
                    navigate('/current-subs', { replace: true });
                } catch (error) {
                    console.error('Payment notification error:', error);
                }
            }
        };

        paymentNotification();
    }, [searchParams, calculateTotalPrice, quota, navigate, fetchSubscription, API_URL]);

    return null;
};

export default PaymentNotificationHandler;
