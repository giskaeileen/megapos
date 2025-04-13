import React from 'react';

interface PaymentSummaryProps {
    quota: {
        transactions: number;
        products: number;
        employees: number;
        stores: number;
    };
    pricing: {
        price_transaction: number;
        price_product: number;
        price_employee: number;
        price_store: number;
    };
    isSubscriptionExpired: boolean;
    calculateTotalPrice: () => number;
    onPayClick: () => void;
}

const PaymentSummary: React.FC<PaymentSummaryProps> = ({ quota, pricing, isSubscriptionExpired, calculateTotalPrice, onPayClick }) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const calculateLineTotal = (quantity: number, price: number) => {
        return quantity * price;
    };

    const totalPrice = calculateTotalPrice();

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-800">Payment Summary</h2>
            </div>

            <table className="w-full mb-2">
                <thead>
                    <tr className="border-b border-gray-200 !bg-white">
                        <th className="text-left py-3 text-gray-600 ffont-bold !pl-0">Item</th>
                        <th className="!text-right py-3 text-gray-600 font-medium">Qty</th>
                        <th className="!text-right py-3 text-gray-600 font-medium">Unit Price</th>
                        <th className="!text-right py-3 text-gray-600 font-medium !pr-0">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="border-b border-gray-100">
                        <td className="py-3 text-gray-600 !pl-0">Transaction Quota</td>
                        <td className="py-3 !text-right">{quota.transactions}</td>
                        <td className="py-3 !text-right">{formatCurrency(pricing.price_transaction)}</td>
                        <td className="py-3 !text-right font-semibold !pr-0">{formatCurrency(calculateLineTotal(quota.transactions, pricing.price_transaction))}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                        <td className="py-3 text-gray-600 !pl-0">Product Quota</td>
                        <td className="py-3 !text-right">{quota.products}</td>
                        <td className="py-3 !text-right">{formatCurrency(pricing.price_product)}</td>
                        <td className="py-3 !text-right font-semibold !pr-0">{formatCurrency(calculateLineTotal(quota.products, pricing.price_product))}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                        <td className="py-3 text-gray-600 !pl-0">Employee Quota</td>
                        <td className="py-3 !text-right">{quota.employees}</td>
                        <td className="py-3 !text-right">{formatCurrency(pricing.price_employee)}</td>
                        <td className="py-3 !text-right font-semibold !pr-0">{formatCurrency(calculateLineTotal(quota.employees, pricing.price_employee))}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                        <td className="py-3 text-gray-600 !pl-0">Store Quota</td>
                        <td className="py-3 !text-right">{quota.stores}</td>
                        <td className="py-3 !text-right">{formatCurrency(pricing.price_store)}</td>
                        <td className="py-3 !text-right font-semibold !pr-0">{formatCurrency(calculateLineTotal(quota.stores > 0 ? quota.stores - 1 : quota.stores, pricing.price_store))}</td>
                    </tr>
                </tbody>
            </table>

            <div className="pt-4 mb-6">
                <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Total Amount:</span>
                    <span className="text-xl font-bold text-primary">{formatCurrency(totalPrice)}</span>
                </div>
            </div>

            {isSubscriptionExpired && (
                <button
                    onClick={onPayClick}
                    disabled={totalPrice <= 0}
                    className={`w-full py-3 px-4 rounded-full font-medium transition-colors ${
                        totalPrice <= 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-secondary hover:bg-primary-dark text-white'
                    }`}
                >
                    Proceed to Payment
                </button>
            )}
        </div>
    );
};

export default PaymentSummary;
