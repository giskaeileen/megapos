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
    isOpen: boolean; // Menentukan apakah sidebar cart terbuka
    toggleSidebar: () => void; // Fungsi untuk membuka/tutup sidebar
    dataCart: any[]; // Data cart (produk yang ditambahkan)
    handleQtyChange: (item: any, newQty: number) => void; // Handler untuk mengubah jumlah item
    storeId: string; // ID toko untuk query API

    customer: any; // Data customer
    setCustomer: (customer: any) => void; // Setter customer

    setDataCart: (cart: any[]) => void;  // Setter data cart
    addPos: (product: any) => void; // Fungsi untuk menambahkan produk ke cart
    totalPrice: any; // Total harga seluruh cart
    setTotalPrice: any; // Setter total harga
};

const Cart: FC<Props> = ({ isOpen, toggleSidebar, dataCart, handleQtyChange, storeId, customer, setCustomer, setDataCart, addPos, totalPrice, setTotalPrice}) => {
    // State internal komponen
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
    const [openAddMemberModal, setOpenAddMemberModal] = useState(false);
    const [addContactModal, setAddContactModal] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('');
    const [pay, setPay] = useState('');
    const [noRekening, setNoRekening] = useState('');
    const [nameRekening, setNameRekening] = useState('');
    const [subTotalPrice, setSubTotalPrice] = useState(0);
    const [quantity, setQuantity] = useState(0);
    const [selectedOption, setSelectedOption] = useState<any>(null); // Untuk member
    const [selectedOption2, setSelectedOption2] = useState<any>(null); // Untuk produk
    const [additionalOptions, setAdditionalOptions] = useState({
        printReceipt: true, // Cetak struk setelah order
        sendEmail: false,
    });

    // API hooks
    const { data: members, refetch } = useGetMembersQuery({ storeId }, { refetchOnMountOrArgChange: true });
    const { data: products } = useGetProductsSKUQuery({ storeId }, { refetchOnMountOrArgChange: true });
    const [createPosOrder] = useCreatePosOrderMutation(); // Untuk simpan order
    const [createMidtransToken, { data: dataMidtransToken }] = useCreateMidtransTokenMutation(); // Untuk bayar pakai Midtrans

    const handleTotalPriceChange = (e: any) => {
        // setTotalPrice(e.target.value);
    };

    // Untuk bayar pakai Midtrans
    const paymentMethods = ['Cash', 'Wallet'];

    // Pilih metode pembayaran
    const handlePaymentMethodClick = (method: string) => {
        setSelectedPaymentMethod(method);
    };

    // Tombol virtual untuk input nilai pembayaran
    const handleButtonClick = (value: string) => {
        if (value === 'clear') {
            setInputValue('');
        } else if (value === 'backspace') {
            setInputValue((prev) => prev.slice(0, -1));
        } else {
            setInputValue((prev) => prev + value);
        }
    };

    // Hitung ulang total dan subtotal dari cart
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

    // Simpan order ke backend
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
            setDataCart([]); // Kosongkan cart
            localStorage.removeItem('cart'); // Hapus cache cart

            // Cetak struk jika diaktifkan
            if (additionalOptions.printReceipt) {
                PrintReceipt(payload);
            }

            await Swal.fire({
                title: 'Payment Successful!',
                text: 'The order has been successfully processed.',
                icon: 'success',
                confirmButtonText: 'OK',
            });

            // Reset state pembayaran
            setPaymentStatus('');
            setPay('');
            setTotalPrice(0);
            setAddContactModal(false);
        } catch (error: any) {
            alert('Failed to create order: ' + (error.data?.message || error.message));
        }
    };

    // Hitung ulang total jika cart atau member berubah
    useEffect(() => {
        if (dataCart?.length > 0) {
            updateSummary(dataCart);
        }
    }, [dataCart, selectedOption]);

    return (
        <div>
            {/* Tombol toggle cart */}
            <CartToggleButton toggleSidebar={toggleSidebar} quantity={quantity} totalPrice={totalPrice} />

            {/* Sidebar Cart */}
            <nav
                className={`${isOpen ? 'ltr:!right-0 rtl:!left-0' : 'hidden'} 
        bg-white fixed ltr:-right-[400px] rtl:-left-[400px] top-0 bottom-0 w-full max-w-[400px] 
        sm:h-[calc(100vh_-_60px)] h-full shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] 
        transition-[right] duration-300 z-[51] dark:bg-black p-4`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-bold">Your Cart</h2>
                    <button onClick={toggleSidebar} className="text-red-500 focus:outline-none">
                        Close
                    </button>
                </div>

                {/* Daftar item */}
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

                {/* Footer: Member, Produk, dan Pembayaran */}
                <div className="py-4">
                    {/* Komponen untuk memilih member yang akan digunakan dalam transaksi */}
                    <MemberSelector 
                        members={members} // Daftar member yang tersedia
                        selectedOption={selectedOption} // Member yang sedang dipilih
                        setSelectedOption={setSelectedOption}  // Fungsi untuk mengatur member yang dipilih
                        showAddMemberModal={() => setOpenAddMemberModal(true)}  // Menampilkan modal untuk menambah member
                        refetch={refetch}   // Fungsi untuk me-refresh data member
                    />

                    {/* Komponen untuk memilih produk yang akan dimasukkan ke dalam cart/POS */}
                    <ProductSelector  // Daftar produk
                        products={products} // Daftar Produk
                        selectedOption2={selectedOption2} // Produk yang sedang dipilih
                        setSelectedOption2={setSelectedOption2}  // Fungsi untuk mengatur produk yang dipilih
                        addPos={addPos}  // Fungsi untuk menambahkan produk ke daftar transaksi
                    /> 

                    {/* Tombol untuk menampilkan modal pembayaran jika sudah ada item dalam cart */}
                    <PaymentButton 
                        totalPrice={totalPrice} // Total harga dari semua produk yang dipilih
                        showPaymentModal={() => setAddContactModal(true)} // Menampilkan modal pembayaran
                    />

                    {/* Modal untuk proses pembayaran */}
                    <PosPaymentModal
                        addContactModal={addContactModal} // State untuk membuka modal
                        setAddContactModal={setAddContactModal} // Fungsi untuk mengatur buka/tutup modal
                        paymentMethods={paymentMethods} // Daftar metode pembayaran (tunai, transfer, dll)
                        selectedPaymentMethod={selectedPaymentMethod} // Metode pembayaran yang dipilih
                        handlePaymentMethodClick={handlePaymentMethodClick} // Fungsi saat memilih metode pembayaran
                        totalPrice={totalPrice}  // Total harga yang harus dibayar
                        inputValue={inputValue} // Nilai input pembayaran dari user
                        handlePayChange={(e: any) => setInputValue(e.target.value)}  // Fungsi untuk mengatur nilai pembayaran
                        handleButtonClick={handleButtonClick}  // Fungsi ketika tombol "Bayar" ditekan
                        pay={pay} // Jumlah yang dibayarkan
                        paymentStatus={paymentStatus} // Status pembayaran (Lunas / Belum Lunas)
                        handlePaymentStatusChange={(e: any) => setPaymentStatus(e.target.value)} // Fungsi untuk mengubah status pembayaran
                        saveOrder={saveOrder} // Fungsi untuk menyimpan transaksi
                        handleTotalPriceChange={handleTotalPriceChange} // Fungsi untuk mengubah total harga (misal karena diskon)
                        noRekening={noRekening} // Nomor rekening customer (jika metode transfer)
                        nameRekening={nameRekening} // Nama pemilik rekening
                        handleNoRekeningChange={(e: any) => setNoRekening(e.target.value)} // Fungsi untuk mengatur nomor rekening
                        handleNameRekeningChange={(e: any) => setNameRekening(e.target.value)}  // Fungsi untuk mengatur nama rekening
                        createMidtransToken={createMidtransToken} // Fungsi untuk membuat token Midtrans (gateway pembayaran)
                        dataMidtransToken={dataMidtransToken} // Token Midtrans yang sudah dibuat
                        customer={customer} // Data customer yang digunakan dalam transaksi
                        quantity={quantity} // Total jumlah produk
                        subTotalPrice={subTotalPrice} // Harga sebelum pajak/diskon (jika ada)
                        storeId={storeId} // ID toko / cabang
                        setPaymentStatus={setPaymentStatus} // Fungsi untuk mengatur status pembayaran
                        setPay={setPay} // Fungsi untuk mengatur nominal yang dibayarkan
                        dataCart={dataCart} // Daftar produk yang ada dalam keranjang
                        additionalOptions={additionalOptions} // Opsi tambahan seperti catatan, diskon, dsb
                        setAdditionalOptions={setAdditionalOptions} // Fungsi untuk mengatur opsi tambahan
                        setDataCart={setDataCart} // Fungsi untuk mengatur ulang isi cart
                        setTotalPrice={setTotalPrice} // Fungsi untuk mengubah total harga
                    />

                    {/* Modal untuk menambahkan member baru */}
                    <PosAddMemberModal 
                        openAddMemberModal={openAddMemberModal} // State pembuka modal
                        setOpenAddMemberModal={setOpenAddMemberModal}  // Fungsi untuk menutup modal
                        refetch={refetch} // Fungsi untuk refresh data member setelah penambahan
                    />
                </div>
            </nav>
        </div>
    );
};

export default Cart;
