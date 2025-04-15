import React from 'react';
import { FC, Fragment, useState } from 'react';
import IconCaretDown from '../../components/Icon/IconCaretDown';
import { formatRupiah } from '../../components/tools';
import NoRecords from '../../components/Layouts/NoRecords';
import { Dialog, Transition } from '@headlessui/react';
import IconX from '../../components/Icon/IconX';
import Pagination from '../../components/Pagination';
import AttributeSelectionModal from './AttributeSelectionModal';

// Tipe props yang diterima oleh komponen PosProductList
// filteredItems: daftar produk yang sudah difilter
// handlePageChange: fungsi untuk mengganti halaman
// page: halaman aktif saat ini
// total: total jumlah produk
// pageSize: jumlah item per halaman
// addPos: fungsi untuk menambahkan produk ke keranjang POS
type Props = {
    filteredItems: any;
    handlePageChange: any;
    page: any;
    total: any;
    pageSize: any;
    addPos: any;
};

// Komponen PosProductList menampilkan daftar produk dalam bentuk tabel
const PosProductList: FC<Props> = ({ filteredItems, handlePageChange, page, total, pageSize, addPos }) => {
    // State untuk modal pemilihan variasi produk
    const [openModal, setOpenModal] = useState<any>(false);
    // Menyimpan variasi produk yang sedang dipilih
    const [currentVariations, setCurrentVariations] = useState<any[]>([]);
    // Menyimpan data produk yang sedang dipilih
    const [variation, setVariation] = useState<Record<string, any>>({});
    // Menyimpan atribut yang dipilih oleh user (misal warna, ukuran)
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, any>>({});
    // Menyimpan harga dari variasi yang cocok dengan atribut yang dipilih
    const [selectedPrice, setSelectedPrice] = useState(null);
    // Menyimpan variasi produk yang cocok berdasarkan atribut yang dipilih
    const [currentVariation, setCurrentVariation] = useState<any>(null);

    // Handler untuk perubahan atribut produk
    const handleAttributeChange = (attributeId: string, value: string | number) => {
        const updatedAttributes: Record<string, string | number> = { ...selectedAttributes, [attributeId]: value };
        setSelectedAttributes(updatedAttributes);

        // Cari variasi produk berdasarkan atribut yang dipilih
        const matchingVariation = currentVariations.find((variation) =>
            variation.attributes.every(
                (attr: { attribute_value: { attribute_id: string; value: string | number } }) => updatedAttributes[attr.attribute_value.attribute_id] === attr.attribute_value.value
            )
        );

        // Set harga jika variasi cocok ditemukan
        if (matchingVariation) {
            setSelectedPrice(matchingVariation.price);
            setCurrentVariation(matchingVariation);
        } else {
            setSelectedPrice(null);
        }
    };

    return (
        // Tabel
        <div className="mt-5 panel p-0 border-0 overflow-hidden">
            <div className="table-responsive">
                <table className="table-striped table-hover">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Name</th>
                            <th>Discount</th>
                            <th>Price</th>
                            <th className="!text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems && filteredItems?.length !== 0 ? (
                            filteredItems?.map((item: any, index: number) => {
                                // Mengambil harga termurah dari variasi produk
                                const minPrice = item.product_variants.reduce((min: number, variation: any) => {
                                    return variation.price < min ? variation.price : min;
                                }, Infinity);

                                return (
                                    <tr key={item.id}>
                                        {/* Menampilkan nomor urut berdasarkan halaman dan index */}
                                        <td>{(index + 1) + ((page - 1) * pageSize)}</td>
                                        {/* Kolom nama dan deskripsi produk */}
                                        <td>
                                            <div className="flex items-center font-semibold">
                                                <div className="rounded-md w-max ltr:mr-2 rtl:ml-2">
                                                    <img
                                                        className="w-12 h-12 rounded-md overflow-hidden object-cover"
                                                        src={
                                                            item.product_image
                                                                ? item.product_image.startsWith('http')
                                                                    ? item.product_image // Jika merupakan URL online, gunakan langsung
                                                                    : `${import.meta.env.VITE_SERVER_URI_BASE}storage/products/${item.product_image}` // Jika merupakan path di server, tambahkan base URL
                                                                : '/assets/images/blank_product.png'
                                                        }
                                                        alt="Product"
                                                    />
                                                </div>
                                                <div>
                                                    <div className="truncate text-wrap line-clamp-2">{item.product_name}</div>
                                                    <div className="truncate text-white-dark max-w-[200px]">{item.description}</div>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Kolom diskon member dan normal */}
                                        <td className="whitespace-nowrap flex gap-2">
                                            {item.discount_member ? <span className="badge bg-info rounded-full">{item.discount_member}%</span> : <></>}
                                            {item.discount_normal ? <span className="badge bg-warning rounded-full">{item.discount_normal}%</span> : <></>}
                                        </td>
                                        {/* Kolom harga produk */}
                                        <td className="whitespace-nowrap">
                                            <div>
                                                {item.discount_normal ? <div className="text-white-dark line-through">{formatRupiah(minPrice)}</div>: <></>}
                                                <div className="text-primary text-base font-bold">
                                                    {formatRupiah(item.discount_normal ? minPrice - (minPrice * item.discount_normal) / 100 : minPrice)}
                                                </div>
                                            </div>
                                        </td>
                                        {/* button aksi untuk menambahkan ke POS */}
                                        <td>
                                            <div className="flex gap-4 items-center justify-center">
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => {
                                                         // Jika produk memiliki lebih dari satu variasi, buka modal
                                                        if (item.product_variants.length > 1) {
                                                            setCurrentVariations(item.variations);
                                                            setOpenModal(true);
                                                            setVariation(item);
                                                        } else {
                                                            // Jika hanya satu variasi, langsung tambahkan ke POS
                                                            addPos({ ...item, ...item.variations[0] });
                                                        }
                                                    }}
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={5}>
                                    <NoRecords />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Modal untuk memilih variasi produk */}
                <AttributeSelectionModal
                    openModal={openModal} // Status modal (terbuka/tutup)
                    setOpenModal={setOpenModal} // Fungsi untuk mengubah status modal
                    currentVariations={currentVariations} // Daftar variasi produk yang sedang aktif
                    selectedAttributes={selectedAttributes} // Atribut yang dipilih user
                    handleAttributeChange={handleAttributeChange} // Handler saat atribut berubah
                    selectedPrice={selectedPrice} // Harga dari variasi yang dipilih
                    addPos={addPos} // Fungsi untuk menambahkan produk ke POS
                    variation={variation} // Data produk yang sedang dipilih
                    setSelectedAttributes={setSelectedAttributes} // Setter untuk reset atribut
                    setSelectedPrice={setSelectedPrice} // Setter untuk reset harga
                />

                {/* Navigasi pagination */}
                <Pagination
                    currentPage={page} // Halaman aktif saat ini
                    totalItems={total} // Total item dari hasil filter
                    itemsPerPage={pageSize} // Jumlah item per halaman
                    onPageChange={handlePageChange} // Fungsi untuk mengganti halaman
                />
            </div>
        </div>
    );
};

export default PosProductList;
