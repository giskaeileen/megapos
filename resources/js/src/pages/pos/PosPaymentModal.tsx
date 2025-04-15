import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FC, Fragment } from 'react';
import IconX from '../../components/Icon/IconX';
import MidtransPayment from '../MidtransPayment';

// Tipe properti yang diterima komponen
type Props = {
    addContactModal: any; // Boolean yang mengatur visibilitas modal
    setAddContactModal: any; // Fungsi untuk menutup modal
    paymentMethods: any; // Daftar metode pembayaran
    selectedPaymentMethod: any; // Metode pembayaran yang dipilih
    handlePaymentMethodClick: any; // Fungsi untuk menangani klik metode pembayaran
    totalPrice: any; // Total harga pembelian
    inputValue: any; // Nilai input pembayaran
    handlePayChange: any; // Fungsi untuk menangani perubahan input pembayaran
    handleButtonClick: any; // Fungsi untuk menangani klik tombol angka pada pembayaran tunai
    pay: any; // Nilai pembayaran (tidak digunakan langsung)
    paymentStatus: any; // Status bank/transfer
    handlePaymentStatusChange: any; // Fungsi untuk menangani perubahan status bank
    saveOrder: any; // Fungsi untuk menyimpan pesanan
    handleTotalPriceChange: any; // Fungsi untuk mengubah total harga
    noRekening: any; // Nomor rekening pelanggan (transfer)
    nameRekening: any; // Nama rekening pelanggan (transfer)
    handleNoRekeningChange: any; // Fungsi untuk menangani input no rekening
    handleNameRekeningChange: any; // Fungsi untuk menangani input nama rekening
    createMidtransToken: any; // Fungsi untuk membuat token pembayaran Midtrans
    dataMidtransToken: any; // Data token dari Midtrans
    customer: any; // Data pelanggan
    quantity: any; // Jumlah item dalam keranjang
    subTotalPrice: any; // Harga subtotal sebelum diskon/dll
    storeId: any; // ID toko
    setPaymentStatus: any; // Fungsi untuk set status pembayaran
    setPay: any; // Fungsi untuk set nilai bayar
    dataCart: any; // Data keranjang belanja
    additionalOptions: any; // Opsi tambahan (contoh: cetak invoice)
    setAdditionalOptions: any; // Fungsi untuk mengatur opsi tambahan
    setDataCart: any; // Fungsi untuk set ulang data keranjang
    setTotalPrice: any; // Fungsi untuk set ulang total harga
};

// Komponen Modal pembayaran POS
const PosPaymentModal: FC<Props> = ({
    addContactModal,
    setAddContactModal,
    paymentMethods,
    selectedPaymentMethod,
    handlePaymentMethodClick,
    totalPrice,
    inputValue,
    handlePayChange,
    handleButtonClick,
    pay,
    paymentStatus,
    handlePaymentStatusChange,
    saveOrder,
    handleTotalPriceChange,
    noRekening,
    nameRekening,
    handleNoRekeningChange,
    handleNameRekeningChange,
    createMidtransToken,
    dataMidtransToken,
    customer,
    quantity,
    subTotalPrice,
    storeId,
    setPaymentStatus,
    setPay,
    dataCart,
    additionalOptions,
    setAdditionalOptions,
    setDataCart,
    setTotalPrice,
}) => {
    // Fungsi untuk menangani perubahan checkbox pada opsi tambahan
    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = event.target;
        setAdditionalOptions((prev: any) => ({
            ...prev,
            [name]: checked,
        }));
    };

    return (
        <Transition appear show={addContactModal} as={Fragment}>
            <Dialog as="div" open={addContactModal} onClose={() => setAddContactModal(false)} className="relative z-[51]">
                {/* Latar belakang gelap modal */}
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-[black]/60" />
                </Transition.Child>
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center px-4 py-8">
                        {/* Transisi panel modal */}
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            {/* Panel modal */}
                            <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg text-black dark:text-white-dark">
                                {/* button close */}
                                <button
                                    type="button"
                                    onClick={() => setAddContactModal(false)}
                                    className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                                >
                                    <IconX />
                                </button>
                                {/* Header modal */}
                                <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">Payment</div>
                                {/* Konten modal */}
                                <div className="p-5">
                                    <form>
                                        {/* Pilihan metode pembayaran */}
                                        <div className="mb-5 grid lg:grid-cols-2 grid-cols-1 gap-6">
                                            {paymentMethods.map((method: any) => (
                                                <button
                                                    type="button"
                                                    key={method}
                                                    className={`btn btn-lg rounded-full py-4 ${
                                                        selectedPaymentMethod === method ? 'btn-outline-info hover:bg-inherit hover:text-info' : 'btn-info'
                                                    } gap-2`}
                                                    onClick={() => handlePaymentMethodClick(method)}
                                                >
                                                    {/* <IconDownload /> */}
                                                    {method}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Switch untuk print invoice */}
                                        <div className="mb-4 flex gap-2">
                                            <label className="w-12 h-6 relative">
                                                <input
                                                    type="checkbox"
                                                    name="printReceipt"
                                                    checked={additionalOptions.printReceipt}
                                                    onChange={handleCheckboxChange}
                                                    className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer"
                                                    id="custom_switch_checkbox1"
                                                />
                                                <span className="bg-[#ebedf2] dark:bg-dark block h-full rounded-full before:absolute before:left-1 before:bg-white dark:before:bg-white-dark dark:peer-checked:before:bg-white before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:bg-primary before:transition-all before:duration-300"></span>
                                            </label>
                                            Print Invoice
                                        </div>

                                        /* Form jika metode cash dipilih */}
                                        {selectedPaymentMethod === 'Cash' && (
                                            <div className="flex flex-col items-center">
                                                <div className="flex justify-between flex-col gap-6 w-72">
                                                    <div>
                                                        <div className="flex items-center w-full justify-between mb-2">
                                                            <div className="text-white-dark">Total Bill:</div>
                                                            <div>{totalPrice}</div>
                                                        </div>
                                                        <div className="flex items-center w-full justify-between mb-2">
                                                            <div className="text-white-dark">Payment:</div>
                                                            <div>{inputValue || totalPrice}</div>
                                                        </div>
                                                        <div className="flex items-center w-full justify-between mb-2">
                                                            <div className="text-white-dark">Change:</div>
                                                            <div>{(inputValue || totalPrice) - totalPrice}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Input nominal pembayaran */}
                                                <input
                                                    type="number"
                                                    value={inputValue || totalPrice}
                                                    onChange={handlePayChange}
                                                    className="mb-4 p-3 border rounded text-center text-lg w-full max-w-md"
                                                />
                                                {/* button angka kalkulator */}
                                                <div className="grid grid-cols-3 gap-4 max-w-md">
                                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                                                        <button type="button" key={num} className="btn btn-primary text-lg py-3" onClick={() => handleButtonClick(num.toString())}>
                                                            {num}
                                                        </button>
                                                    ))}
                                                    <button type="button" className="btn btn-warning text-lg py-3" onClick={() => handleButtonClick('clear')}>
                                                        Clear
                                                    </button>
                                                    {[0].map((num) => (
                                                        <button type="button" key={num} className="btn btn-primary text-lg py-3" onClick={() => handleButtonClick(num.toString())}>
                                                            {num}
                                                        </button>
                                                    ))}
                                                    <button type="button" className="btn btn-danger text-lg py-3" onClick={() => handleButtonClick('backspace')}>
                                                        ⌫
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Form jika metode transfer dipilih */}
                                        {selectedPaymentMethod === 'Transfer' && (
                                            <div>
                                                <div className="mb-5">
                                                    <label htmlFor="name">Ammount</label>
                                                    <input id="pay" type="number" placeholder="Enter Ammount" className="form-input" value={totalPrice} onChange={handleTotalPriceChange} />
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="name">Bank</label>
                                                    <select id="bank_name" className="form-select text-white-dark" value={paymentStatus} onChange={handlePaymentStatusChange}>
                                                        <option value="">Choose...</option>
                                                        <option value="BRI">BRI</option>
                                                        <option value="BCA">BCA</option>
                                                    </select>
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="name">No Rekening</label>
                                                    <input id="pay" type="number" placeholder="Enter Ammount" className="form-input" value={noRekening} onChange={handleNoRekeningChange} />
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="name">Nama Rekening</label>
                                                    <input id="pay" type="text" placeholder="Enter Ammount" className="form-input" value={nameRekening} onChange={handleNameRekeningChange} />
                                                </div>
                                            </div>
                                        )}

                                        {/* button bayar jika metode valid */}
                                        {selectedPaymentMethod && (selectedPaymentMethod !== 'Uang Kembali' || inputValue >= totalPrice) && selectedPaymentMethod !== 'Wallet' && (
                                            <div className="flex justify-end items-center mt-8">
                                                <button type="button" className="btn btn-lg rounded-full py-4 btn-primary w-full" onClick={saveOrder}>
                                                    Pay
                                                </button>
                                            </div>
                                        )}

                                        {/* Komponen Midtrans akan dirender jika metode pembayaran yang dipilih adalah 'Wallet' */}
                                        {selectedPaymentMethod === 'Wallet' && (
                                            <MidtransPayment
                                                // Fungsi untuk membuat token Midtrans sebelum melakukan pembayaran
                                                createMidtransToken={createMidtransToken}
                                                // Data token Midtrans yang telah di-generate
                                                dataMidtransToken={dataMidtransToken}
                                                // Informasi customer yang sedang melakukan transaksi
                                                customer={customer}
                                                // Metode pembayaran yang dipilih oleh user (dalam kasus ini 'Wallet')
                                                selectedPaymentMethod={selectedPaymentMethod}
                                                // Total harga seluruh belanjaan (setelah pajak, diskon, dll)
                                                totalPrice={totalPrice}
                                                // Status pembayaran: apakah sudah dibayar, menunggu, gagal, dll
                                                paymentStatus={paymentStatus}
                                                // Nomor rekening tujuan jika perlu untuk proses pembayaran manual
                                                noRekening={noRekening}
                                                // Nama pemilik rekening yang ditampilkan di UI untuk keperluan konfirmasi
                                                nameRekening={nameRekening}
                                                // Jumlah item yang dibeli dalam transaksi
                                                quantity={quantity}
                                                // Total harga sebelum ditambahkan biaya lain-lain (misalnya ongkir, pajak, dll)
                                                subTotalPrice={subTotalPrice}
                                                // ID dari toko yang sedang memproses transaksi
                                                storeId={storeId}
                                                // Fungsi setter untuk mengubah status pembayaran (misalnya dari 'pending' menjadi 'paid')
                                                setPaymentStatus={setPaymentStatus}
                                                // Fungsi setter untuk mengubah status "pay" (biasanya boolean untuk men-trigger UI atau proses pembayaran)
                                                setPay={setPay}
                                                // Fungsi untuk menyimpan order ke database atau backend
                                                saveOrder={saveOrder}
                                                // Data semua item yang ada di dalam keranjang belanja (shopping cart)
                                                dataCart={dataCart}
                                                // Fungsi setter untuk mengubah data keranjang, misalnya menghapus item setelah dibayar
                                                setDataCart={setDataCart}
                                                // Fungsi setter untuk memperbarui total harga jika ada perubahan jumlah/produk
                                                setTotalPrice={setTotalPrice}
                                                // Fungsi setter untuk menampilkan atau menyembunyikan modal tambah kontak
                                                setAddContactModal={setAddContactModal}
                                            />
                                        )}

                                    </form>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default PosPaymentModal;
