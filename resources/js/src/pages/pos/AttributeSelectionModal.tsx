import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import IconX from '../../components/Icon/IconX';

interface AttributeSelectionModalProps {
    openModal: boolean; // Status apakah modal sedang terbuka
    setOpenModal: any; // Fungsi untuk mengatur status modal (buka/tutup)
    currentVariations: any; // Daftar variasi produk yang tersedia
    selectedAttributes: any; // Atribut yang dipilih oleh pengguna
    handleAttributeChange: any; // Fungsi untuk mengubah atribut yang dipilih
    selectedPrice: any; // Harga dari variasi yang dipilih
    addPos: any; // Fungsi untuk menambahkan produk ke POS (Point of Sale)
    variation: any; // Variasi produk yang sedang diproses
    setSelectedAttributes: any; // Fungsi untuk mengatur ulang atribut yang dipilih
    setSelectedPrice: any; // Fungsi untuk mengatur ulang harga yang dipilih
}

// Komponen React untuk modal pemilihan atribut produk
const AttributeSelectionModal: React.FC<AttributeSelectionModalProps> = ({
    openModal,
    setOpenModal,
    currentVariations,
    selectedAttributes,
    handleAttributeChange,
    selectedPrice,
    addPos,
    variation,
    setSelectedAttributes,
    setSelectedPrice,
}) => {

    return (
        <Transition appear show={openModal} as={Fragment}>
            <Dialog as="div" open={openModal} onClose={() => setOpenModal(false)} className="relative z-[51]">
                {/* Background hitam transparan saat modal muncul */}
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-[black]/60" />
                </Transition.Child>
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center px-4 py-8">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            {/* Kontainer modal */}
                            <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg text-black dark:text-white-dark">
                                {/* button close (X) */}
                                <button
                                    type="button"
                                    onClick={() => setOpenModal(false)}
                                    className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                                >
                                    <IconX />
                                </button>
                                {/* Header modal */}
                                <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">Select Attribute</div>
                                {/* Konten modal */}
                                <div className="p-5">
                                    {/* Tampilkan atribut jika variasi tersedia */}
                                    {currentVariations.length > 0 && (
                                        <div className="space-y-4">
                                            {Array.from(
                                                new Map(
                                                    // Ambil seluruh atribut dari variasi yang ada dan pastikan unik berdasarkan attribute_id
                                                    currentVariations
                                                        .flatMap((variation: any) =>
                                                            variation.product_attributes.map((attr: any) => ({
                                                                id: attr.attribute_value.attribute_id,
                                                                name: attr.attribute_value.attribute.name, // Ambil nama atribut
                                                            }))
                                                        )
                                                        .map((attr: any) => [attr.id, attr]) // Gunakan Map untuk memastikan unik berdasarkan id
                                                ).values() // Ambil hanya nilai unik
                                            ).map((attribute: any) => (
                                                <div key={attribute.id}>
                                                    {/* Label atribut */}
                                                    <label className="block mb-2 font-medium">
                                                        Select <span className="text-primary">
                                                        {
                                                            currentVariations[0].product_attributes.find((attr: any) => attr.attribute_value.attribute_id === attribute.id)?.attribute_value.attribute
                                                                .name
                                                        }</span>
                                                    </label>

                                                    {/* Opsi pilihan untuk masing-masing nilai atribut */}
                                                    <div className="flex flex-wrap gap-2">
                                                        {Array.from(
                                                            new Set(
                                                                currentVariations.flatMap((variation: any) =>
                                                                    variation.product_attributes
                                                                        .filter((attr: any) => attr.attribute_value.attribute_id === attribute.id)
                                                                        .map((attr: any) => attr.attribute_value.value)
                                                                )
                                                            )
                                                        ).map((value: any) => (
                                                            <button
                                                                key={value}
                                                                type="button"
                                                                className={`px-4 py-2 rounded-lg border transition-all ${
                                                                    selectedAttributes[attribute.id] === value ? 'bg-secondary text-white' : 'bg-gray-200 hover:bg-gray-300'
                                                                }`}
                                                                onClick={() => handleAttributeChange(attribute.id, value)}
                                                            >
                                                                {value}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {selectedPrice && (
                                        <div className="mt-4">
                                            <h3 className="text-xl font-bold">Harga: {selectedPrice}</h3>
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        className="btn btn-primary mt-6 w-full"
                                        disabled={!selectedPrice}
                                        onClick={() => {
                                            // Tambahkan ke POS dengan atribut terpilih
                                            addPos({ ...variation, selectedAttributes, price: selectedPrice, product_id: variation?.product_variants[0]?.product_id });
                                            setOpenModal(false);
                                            setSelectedAttributes({});
                                            setSelectedPrice(null);
                                        }}
                                    >
                                        Add
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default AttributeSelectionModal;
