import React from 'react';
import { FC, Fragment, useState } from 'react';
import IconCaretDown from '../../components/Icon/IconCaretDown';
import IconPlus from '../../components/Icon/IconPlus';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Autoplay } from 'swiper';
import { useSelector } from 'react-redux';
import { IRootState } from '../../redux/store';
import { formatRupiah } from '../../components/tools';
import NoRecords from '../../components/Layouts/NoRecords';
import Pagination from '../../components/Pagination';
import AttributeSelectionModal from './AttributeSelectionModal';

// Tipe props yang dikirim ke komponen ini
type Props = {
    filteredItems: any;              // Data produk yang telah difilter
    handlePageChange: any;           // Fungsi untuk mengubah halaman
    page: any;                       // Halaman saat ini
    total: any;                      // Total item
    pageSize: any;                   // Jumlah item per halaman
    addPos: any;                     // Fungsi untuk menambahkan item ke POS/cart
    isOpen: any;                     // Menentukan apakah sidebar POS sedang terbuka
};

// Komponen utama POS Product Grid
const PosProductGrid: FC<Props> = ({ filteredItems, handlePageChange, page, total, pageSize, addPos, isOpen }) => {
    // Ambil konfigurasi tema (misalnya RTL/LTR)
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);

    // State untuk membuka modal variasi produk
    const [openModal, setOpenModal] = useState<any>(false);
    // State menyimpan semua variasi dari produk saat ini
    const [currentVariations, setCurrentVariations] = useState<any[]>([]);
    // State menyimpan atribut yang telah dipilih pengguna
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, any>>({});
    // Menyimpan harga yang telah dipilih sesuai variasi
    const [selectedPrice, setSelectedPrice] = useState(null);
    // Menyimpan data variasi yang cocok dengan atribut yang dipilih
    const [currentVariation, setCurrentVariation] = useState<any>(null);
    // Menyimpan informasi produk yang sedang dipilih
    const [variation, setVariation] = useState<Record<string, any>>({});

    /**
     * Fungsi untuk menangani perubahan pilihan atribut
     * Digunakan saat user memilih kombinasi atribut untuk produk
     */
    const handleAttributeChange = (attributeId: string, value: string | number) => {
        const updatedAttributes: Record<string, string | number> = { ...selectedAttributes, [attributeId]: value };
        setSelectedAttributes(updatedAttributes);

        // Cari variasi yang sesuai dengan atribut yang dipilih
        const matchingVariation = currentVariations.find((variation) =>
            variation.product_attributes.every(
                (attr: { attribute_value: { attribute_id: string; value: string | number } }) => updatedAttributes[attr.attribute_value.attribute_id] === attr.attribute_value.value
            )
        );

        // Tetapkan harga jika variasi ditemukan
        if (matchingVariation) {
            setSelectedPrice(matchingVariation.price);
            setCurrentVariation(matchingVariation);
        } else {
            setSelectedPrice(null);
        }
    };

    return (
        <div>
            {/* Jika ada produk, tampilkan grid */}
            {filteredItems?.length !== 0 ? (
                <div
                    className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 ${
                        isOpen ? '2xl:grid-cols-4' : 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
                    } gap-6 mt-5 w-full`}
                >
                    {Array.isArray(filteredItems) &&
                        filteredItems.map((d: any) => {
                            // Ambil gambar dari variasi yang valid
                            let validImages = d.product_variants.map((variation: any) => variation.product_image).filter((image: string | null) => image);

                            validImages = [
                                d.product_image
                                    ? d.product_image.startsWith('http')
                                        ? d.product_image // Jika merupakan URL online, gunakan langsung
                                        : `${import.meta.env.VITE_SERVER_URI_BASE}storage/products/${d.product_image}` // Jika merupakan path di server, tambahkan base URL
                                    : '/assets/images/blank_product.png',
                                ...validImages,
                            ];

                            // Ambil harga termurah dari variasi produk
                            const minPrice = d.product_variants.reduce((min: number, variation: any) => {
                                return variation.price < min ? variation.price : min;
                            }, Infinity);

                            return (
                                <div className="bg-white dark:bg-[#1c232f] rounded-md overflow-hidden text-center shadow relative" key={d.id}>
                                    <div>
                                        {/* Carousel gambar produk */}
                                        <div className="bg-white/40 rounded-t-md bg-center bg-cover pb-0 bg-">
                                            <Swiper
                                                modules={[Navigation, Pagination]}
                                                navigation={{ nextEl: '.swiper-button-next-ex1', prevEl: '.swiper-button-prev-ex1' }}
                                                pagination={{ clickable: true }}
                                                className="swiper max-w-3xl mx-auto mb-5"
                                                id="slider1"
                                                dir={themeConfig.rtlClass}
                                                key={themeConfig.rtlClass === 'rtl' ? 'true' : 'false'}
                                            >
                                                <div className="swiper-wrapper">
                                                    {validImages.length > 0 ? (
                                                        validImages.map((image: string, i: number) => (
                                                            <SwiperSlide key={i}>
                                                                <img src={image} className="object-cover h-36 lg:60 w-full" alt={`Product Image ${i + 1}`} />
                                                            </SwiperSlide>
                                                        ))
                                                    ) : (
                                                        <SwiperSlide>
                                                            <img src="/assets/images/blank_product.png" className="object-cover h-36 lg:60 w-full" alt="Default Image" />
                                                        </SwiperSlide>
                                                    )}
                                                </div>

                                                {/* Tombol navigasi carousel */}
                                                <button className="swiper-button-prev-ex1 grid place-content-center ltr:left-2 rtl:right-2 p-1 transition text-primary hover:text-white border border-primary  hover:border-primary hover:bg-primary rounded-full absolute z-[999] top-1/2 -translate-y-1/2">
                                                    <IconCaretDown className="w-5 h-5 rtl:-rotate-90 rotate-90" />
                                                </button>
                                                <button className="swiper-button-next-ex1 grid place-content-center ltr:right-2 rtl:left-2 p-1 transition text-primary hover:text-white border border-primary  hover:border-primary hover:bg-primary rounded-full absolute z-[999] top-1/2 -translate-y-1/2">
                                                    <IconCaretDown className="w-5 h-5 rtl:rotate-90 -rotate-90" />
                                                </button>
                                            </Swiper>

                                            {/* Tampilkan badge diskon jika tersedia */}
                                            {d.discount_member && (
                                                <span className={`z-10 absolute top-2 ${d.discount_normal ? 'right-14' : 'right-2'} badge bg-info rounded-full`}>{d.discount_member}%</span>
                                            )}
                                            {d.discount_normal ? <span className="z-10 absolute top-2 right-2 badge bg-warning rounded-full">{d.discount_normal}%</span> : <></>}
                                        </div>

                                        {/* Informasi produk */}
                                        <div className="px-4 pb-3 -mt-14 relative">
                                            <div className="mt-16 grid grid-cols-1 ltr:text-left rtl:text-right">
                                                <div className="flex items-center">
                                                    <div className="ltr:mr-2 rtl:ml-2 text-base">{d.product_name}</div>
                                                </div>
                                                <div className="flex items-center">
                                                    <div className="truncate text-white-dark">{d.description}</div>
                                                </div>

                                                {/* Harga dan tombol tambah */}
                                                <div className="flex justify-between items-center mt-2">
                                                    <div>
                                                        {/* Harga sebelum diskon */}
                                                        <div className="text-white-dark line-through">{formatRupiah(minPrice)}</div>
                                                        {/* Harga setelah diskon */}
                                                        <div className="text-primary text-base font-bold">
                                                            {formatRupiah(d.discount_normal ? minPrice - (minPrice * d.discount_normal) / 100 : minPrice)}
                                                        </div>
                                                    </div>
                                                    {/* button tambah ke POS/cart */}
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary w-10 h-10 p-0 my-1 rounded-full"
                                                        onClick={() => {
                                                            if (d.product_variants.length > 1) {
                                                                // Buka modal jika ada lebih dari 1 variasi
                                                                setCurrentVariations(d.product_variants);
                                                                setOpenModal(true);
                                                                setVariation(d);
                                                            } else {
                                                                // Jika hanya 1 variasi langsung tambahkan
                                                                addPos({ ...d, ...d.product_variants[0] });
                                                            }
                                                        }}
                                                    >
                                                        <IconPlus />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            ) : (
                // Jika tidak ada produk
                <NoRecords />
            )}

            {/* 
                Komponen Modal untuk pemilihan variasi produk 
                Ditampilkan ketika produk memiliki lebih dari satu variasi
            */}
            <AttributeSelectionModal
                // State boolean yang mengatur apakah modal sedang terbuka
                openModal={openModal}
                // Fungsi untuk mengubah status modal (buka/tutup)
                setOpenModal={setOpenModal}
                // Daftar semua variasi yang tersedia untuk produk yang dipilih
                currentVariations={currentVariations}
                // Objek atribut yang telah dipilih oleh user, disimpan dalam bentuk { attribute_id: value }
                selectedAttributes={selectedAttributes}
                // Fungsi handler untuk menangani perubahan pilihan atribut (misal warna, ukuran, dll)
                handleAttributeChange={handleAttributeChange}
                // Harga dari variasi yang dipilih berdasarkan atribut yang cocok
                selectedPrice={selectedPrice}
                // Fungsi untuk menambahkan produk ke keranjang/POS
                addPos={addPos}
                // Produk yang sedang dipilih (informasi dasar seperti nama, deskripsi, diskon, dll)
                variation={variation}
                // Setter untuk mereset atribut yang dipilih saat modal dibuka/ditutup
                setSelectedAttributes={setSelectedAttributes}
                // Setter untuk mengatur harga variasi terpilih berdasarkan atribut
                setSelectedPrice={setSelectedPrice}
            />

            {/* 
                Komponen Pagination untuk navigasi halaman produk 
                Digunakan untuk membatasi jumlah produk per halaman
            */}
            <Pagination
                // Nomor halaman saat ini yang sedang ditampilkan
                currentPage={page}
                // Total jumlah item yang tersedia dari hasil pencarian/filter
                totalItems={total}
                // Jumlah item yang ditampilkan per halaman
                itemsPerPage={pageSize}
                // Fungsi handler untuk mengubah halaman ketika user klik navigasi
                onPageChange={handlePageChange}
            />

        </div>
    );
};

export default PosProductGrid;
