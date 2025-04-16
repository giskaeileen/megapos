import React from 'react';
import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import IconX from '../../components/Icon/IconX';

// Interface props untuk komponen AddQuotaModal
interface AddQuotaModalProps {
    isOpen: boolean; // Status apakah modal terbuka atau tidak
    onClose: () => void; // Fungsi untuk menutup modal
    onAddQuota: (quota: { additional_transactions: number; additional_products: number; additional_employees: number; additional_stores: number }) => void; // Fungsi callback untuk mengirim data kuota tambahan
}

// Komponen Modal Tambah Kuota
const AddQuotaModal: React.FC<AddQuotaModalProps> = ({ isOpen, onClose, onAddQuota }) => {
    // State untuk menyimpan input tambahan kuota
    const [additionalQuota, setAdditionalQuota] = useState({
        additional_transactions: 0,
        additional_products: 0,
        additional_employees: 0,
        additional_stores: 0,
    });

    // Fungsi saat form disubmit
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault(); // Mencegah reload halaman
        onAddQuota(additionalQuota); // Kirim data ke parent component
        onClose(); // Tutup modal setelah submit
    };

    // Jika modal tidak dibuka, maka tidak ditampilkan
    if (!isOpen) return null;

    return (
        <Transition appear show={isOpen} as={Fragment}>
            {/* Komponen Dialog untuk modal */}
            <Dialog as="div" open={isOpen} onClose={onClose} className="relative z-[51]">
                {/* Transisi background gelap */}
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/60" />
                </Transition.Child>

                {/* Wrapper untuk modal */}
                <div className="fixed inset-0 flex items-center justify-center px-4 py-8">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        {/* Panel utama dari modal */}
                        <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg text-black dark:text-white-dark">
                            {/* Tombol tutup modal */}
                            <button
                                type="button"
                                onClick={onClose}
                                className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                            >
                                <IconX />
                            </button>

                            {/* Judul modal */}
                            <h2 className="text-xl font-bold ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">Add Quota</h2>

                            {/* Konten utama modal */}
                            <div className="p-5">
                                {/* Form input kuota */}
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Grid input: dibagi 2 kolom jika di layar besar */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Input kuota transaksi */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Quota Transactions</label>
                                            <input
                                                type="number"
                                                value={additionalQuota.additional_transactions}
                                                onChange={(e) =>
                                                    setAdditionalQuota({
                                                        ...additionalQuota,
                                                        additional_transactions: parseInt(e.target.value, 10),
                                                    })
                                                }
                                                className="w-full border border-gray-300 rounded-md p-2"
                                                min="0"
                                            />
                                        </div>

                                        {/* Input kuota produk */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Quota Products</label>
                                            <input
                                                type="number"
                                                value={additionalQuota.additional_products}
                                                onChange={(e) =>
                                                    setAdditionalQuota({
                                                        ...additionalQuota,
                                                        additional_products: parseInt(e.target.value, 10),
                                                    })
                                                }
                                                className="w-full border border-gray-300 rounded-md p-2"
                                                min="0"
                                            />
                                        </div>

                                        {/* Input kuota karyawan */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Quota Employees</label>
                                            <input
                                                type="number"
                                                value={additionalQuota.additional_employees}
                                                onChange={(e) =>
                                                    setAdditionalQuota({
                                                        ...additionalQuota,
                                                        additional_employees: parseInt(e.target.value, 10),
                                                    })
                                                }
                                                className="w-full border border-gray-300 rounded-md p-2"
                                                min="0"
                                            />
                                        </div>

                                        {/* Input kuota toko */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Quota Stores</label>
                                            <input
                                                type="number"
                                                value={additionalQuota.additional_stores}
                                                onChange={(e) =>
                                                    setAdditionalQuota({
                                                        ...additionalQuota,
                                                        additional_stores: parseInt(e.target.value, 10),
                                                    })
                                                }
                                                className="w-full border border-gray-300 rounded-md p-2"
                                                min="0"
                                            />
                                        </div>
                                    </div>

                                    {/* Tombol submit */}
                                    <div className="flex justify-end space-x-2">
                                        {/* Tombol untuk submit form dan menambahkan kuota */}
                                        <button type="submit" className="btn btn-primary">
                                            Add Quota
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    );
};

export default AddQuotaModal;
