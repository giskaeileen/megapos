import React from 'react';
import { FC, useEffect, useRef, useState } from 'react';
import { useCreateMidtransTokenMutation, useCreatePosOrderMutation } from '../../redux/features/pos/posApi';
import { useGetMembersQuery } from '../../redux/features/members/membersApi';
import { useGetProductsSKUQuery } from '../../redux/features/products/productsApi';
import Swal from 'sweetalert2';
import { PrintReceipt } from '../../components/PrintInvoice';
import CartItem from './CartItem';
import MemberSelector from './MemberSelector';
import ProductSelector from './ProductSelector';
import PaymentButton from './PaymentButton';
import CartToggleButton from './CartToggleButton';
import PosPaymentModal from './PosPaymentModal';
import PosAddMemberModal from './PosAddMemberModal';

type Props = {
    isOpen: boolean;
    toggleSidebar: () => void;
    dataCart: any[];
    handleQtyChange: (item: any, newQty: number) => void;
    storeId: string;

    customer: any;
    setCustomer: (customer: any) => void;

    setDataCart: (cart: any[]) => void;
    addPos: (product: any) => void;
    totalPrice: any;
    setTotalPrice: any;
};

const Cart: FC<Props> = ({ isOpen, toggleSidebar, dataCart, handleQtyChange, storeId, customer, setCustomer, setDataCart, addPos, totalPrice, setTotalPrice}) => {
    // State management
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
    const [openAddMemberModal, setOpenAddMemberModal] = useState(false);
    const [addContactModal, setAddContactModal] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('');
    const [pay, setPay] = useState('');
    const [noRekening, setNoRekening] = useState('');
    const [nameRekening, setNameRekening] = useState('');
    // const [totalPrice, setTotalPrice] = useState(0);
    const [subTotalPrice, setSubTotalPrice] = useState(0);
    const [quantity, setQuantity] = useState(0);
    const [selectedOption, setSelectedOption] = useState<any>(null);
    const [selectedOption2, setSelectedOption2] = useState<any>(null);
    const [additionalOptions, setAdditionalOptions] = useState({
        printReceipt: true,
        sendEmail: false,
    });

    // API hooks
    const { data: members, refetch } = useGetMembersQuery({ storeId }, { refetchOnMountOrArgChange: true });
    const { data: products } = useGetProductsSKUQuery({ storeId }, { refetchOnMountOrArgChange: true });
    const [createPosOrder] = useCreatePosOrderMutation();
    const [createMidtransToken, { data: dataMidtransToken }] = useCreateMidtransTokenMutation();

    const handleTotalPriceChange = (e: any) => {
        // setTotalPrice(e.target.value);
    };

    // Constants
    const paymentMethods = ['Cash', 'Wallet'];

    // Handlers
    const handlePaymentMethodClick = (method: string) => {
        setSelectedPaymentMethod(method);
    };

    const handleButtonClick = (value: string) => {
        if (value === 'clear') {
            setInputValue('');
        } else if (value === 'backspace') {
            setInputValue((prev) => prev.slice(0, -1));
        } else {
            setInputValue((prev) => prev + value);
        }
    };

    const updateSummary = (cart: any[]) => {
        if (!Array.isArray(cart)) return;

        const totalQuantity = cart.reduce((sum, item) => sum + item.qty, 0);
        const totalSubAmount = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
        const totalAmount = cart.reduce(
            (sum, item) =>
                sum +
                (selectedOption && item.discount_member
                    ? item.price - (item.price * item.discount_member) / 100
                    : item.discount_normal
                    ? item.price - (item.price * item.discount_normal) / 100
                    : item.price) *
                    item.qty,
            0
        );

        setSubTotalPrice(totalSubAmount);
        setTotalPrice(Math.round(totalAmount));
        setQuantity(totalQuantity);
    };

    const saveOrder = async () => {
        const payload = {
            payment_status: selectedPaymentMethod,
            pay: Number(totalPrice),
            member_id: selectedOption?.value,
            total_products: quantity,
            sub_total: subTotalPrice,
            total: totalPrice,
            pay_return: selectedPaymentMethod === 'Cash Back' ? Number(inputValue) - Number(totalPrice) : null,
            bank: selectedPaymentMethod === 'Transfer' ? paymentStatus : null,
            no_rekening: selectedPaymentMethod === 'Transfer' ? noRekening : null,
            name_rekening: selectedPaymentMethod === 'Transfer' ? nameRekening : null,
            cart: dataCart,
        };

        try {
            const response = await createPosOrder({ storeId, data: payload });
            setDataCart([]);
            localStorage.removeItem('cart');

            if (additionalOptions.printReceipt) {
                PrintReceipt(payload);
            }

            await Swal.fire({
                title: 'Payment Successful!',
                text: 'The order has been successfully processed.',
                icon: 'success',
                confirmButtonText: 'OK',
            });

            setPaymentStatus('');
            setPay('');
            setTotalPrice(0);
            setAddContactModal(false);
        } catch (error: any) {
            alert('Failed to create order: ' + (error.data?.message || error.message));
        }
    };

    // Effects
    useEffect(() => {
        if (dataCart?.length > 0) {
            updateSummary(dataCart);
        }
    }, [dataCart, selectedOption]);

    return (
        <div>
            <CartToggleButton toggleSidebar={toggleSidebar} quantity={quantity} totalPrice={totalPrice} />

            <nav
                className={`${isOpen ? 'ltr:!right-0 rtl:!left-0' : 'hidden'} 
        bg-white fixed ltr:-right-[400px] rtl:-left-[400px] top-0 bottom-0 w-full max-w-[400px] 
        sm:h-[calc(100vh_-_60px)] h-full shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] 
        transition-[right] duration-300 z-[51] dark:bg-black p-4`}
            >
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-bold">Your Cart</h2>
                    <button onClick={toggleSidebar} className="text-red-500 focus:outline-none">
                        Close
                    </button>
                </div>

                <div className="overflow-y-auto sm:h-[calc(100vh_-_380px)] border-b">
                    <div className="table-responsive">
                        <table className="table-hover">
                            <tbody>
                                {dataCart?.map((item, index) => (
                                    <CartItem key={index} item={item} selectedOption={selectedOption} handleQtyChange={handleQtyChange} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="py-4">
                    <MemberSelector members={members} selectedOption={selectedOption} setSelectedOption={setSelectedOption} showAddMemberModal={() => setOpenAddMemberModal(true)} refetch={refetch} />

                    <ProductSelector products={products} selectedOption2={selectedOption2} setSelectedOption2={setSelectedOption2} addPos={addPos} />

                    <PaymentButton totalPrice={totalPrice} showPaymentModal={() => setAddContactModal(true)} />

                    <PosPaymentModal
                        addContactModal={addContactModal}
                        setAddContactModal={setAddContactModal}
                        paymentMethods={paymentMethods}
                        selectedPaymentMethod={selectedPaymentMethod}
                        handlePaymentMethodClick={handlePaymentMethodClick}
                        totalPrice={totalPrice}
                        inputValue={inputValue}
                        handlePayChange={(e: any) => setInputValue(e.target.value)}
                        handleButtonClick={handleButtonClick}
                        pay={pay}
                        paymentStatus={paymentStatus}
                        handlePaymentStatusChange={(e: any) => setPaymentStatus(e.target.value)}
                        saveOrder={saveOrder}
                        handleTotalPriceChange={handleTotalPriceChange}
                        noRekening={noRekening}
                        nameRekening={nameRekening}
                        handleNoRekeningChange={(e: any) => setNoRekening(e.target.value)}
                        handleNameRekeningChange={(e: any) => setNameRekening(e.target.value)}
                        createMidtransToken={createMidtransToken}
                        dataMidtransToken={dataMidtransToken}
                        customer={customer}
                        quantity={quantity}
                        subTotalPrice={subTotalPrice}
                        storeId={storeId}
                        setPaymentStatus={setPaymentStatus}
                        setPay={setPay}
                        dataCart={dataCart}
                        additionalOptions={additionalOptions}
                        setAdditionalOptions={setAdditionalOptions}
                        setDataCart={setDataCart}
                        setTotalPrice={setTotalPrice}
                    />

                    <PosAddMemberModal openAddMemberModal={openAddMemberModal} setOpenAddMemberModal={setOpenAddMemberModal} refetch={refetch} />
                </div>
            </nav>
        </div>
    );
};

export default Cart;
