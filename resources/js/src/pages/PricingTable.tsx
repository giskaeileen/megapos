// Import React hook useState
import { useState } from "react";

// Ambil hook dari Redux Toolkit Query untuk fetch data subscription plan
import { useGetPlansQuery } from "../redux/features/subscriptions/subscriptionsApi";

// Import icon untuk list benefit
import IconArrowLeft from "../components/Icon/IconArrowLeft";

// Import komponen modal pembayaran
import PaymentModal from "./subscriptions/QuotaForm";
// import PaymentModal from "./PaymentModal"; // (opsional jika kamu ingin pakai versi lain dari modal)

// Komponen utama untuk menampilkan daftar harga subscription
const PricingTable = () => {
    // State untuk menentukan apakah user memilih paket tahunan (true) atau bulanan (false)
    const [yearlyPrice, setYearlyPrice] = useState<boolean>(false);

    // Ambil ID store dari URL path
    const pathnames = location.pathname.split('/').filter((x) => x);
    const storeId = pathnames[0];

    // Ambil data subscription plan dari API menggunakan Redux Toolkit Query
    const { data } = useGetPlansQuery(
        { storeId },
        { refetchOnMountOrArgChange: true } // fetch ulang saat storeId berubah
    );

    // Fungsi untuk memfilter plan berdasarkan interval (bulan / tahun)
    const filteredPrices = (interval: string) => {
        return data?.filter((plan: any) => plan.interval === interval);
    };

    // Pilih data berdasarkan state yearlyPrice
    const prices = yearlyPrice ? filteredPrices("year") : filteredPrices("month");

    // State untuk membuka modal pembayaran
    const [openModal, setOpenModal] = useState<any>(false);

    // State untuk menyimpan client secret dari Stripe (digunakan untuk pembayaran)
    const [clientSecret, setClientSecret] = useState<string | null>(null);

    // Fungsi ketika tombol "Buy Now" diklik
    const handlePurchase = async () => {
        // Simulasi panggil backend untuk buat PaymentIntent dan ambil client_secret
        const response = await fetch(`${import.meta.env.VITE_SERVER_URI}create-payment-intent`, { method: "POST" });
        const data = await response.json();

        // Simpan client_secret dan buka modal pembayaran
        setClientSecret(data.client_secret);
        setOpenModal(true);
    };

    return (
        <div className="max-w-[320px] md:max-w-[1140px] mx-auto dark:text-white-dark">
            {/* Switch untuk memilih Monthly / Yearly */}
            <div className="mt-5 md:mt-10 text-center flex justify-center space-x-4 rtl:space-x-reverse font-semibold text-base">
                {/* Label untuk Monthly */}
                <span className={`${!yearlyPrice ? 'text-primary' : 'text-white-dark'}`}>Monthly</span>
                
                {/* Toggle switch untuk mengganti interval harga */}
                <label className="w-12 h-6 relative">
                    <input
                        type="checkbox"
                        className="custom_switch absolute left-0 top-0 w-full h-full opacity-0 z-10 cursor-pointer peer"
                        onChange={() => setYearlyPrice(!yearlyPrice)}
                    />
                    <span className="outline_checkbox bg-icon border-2 border-[#ebedf2] dark:border-white-dark block h-full rounded-full before:absolute before:left-1 before:bg-[#ebedf2] dark:before:bg-white-dark before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:border-primary peer-checked:before:bg-primary before:transition-all before:duration-300"></span>
                </label>

                {/* Label untuk Yearly dengan badge promo */}
                <span className={`relative ${yearlyPrice ? 'text-primary' : 'text-white-dark'}`}>
                    Yearly
                    <span className="badge bg-success rounded-full absolute left-full ml-2 hidden">20% Off</span>
                </span>
            </div>

            {/* Daftar harga dari backend */}
            <div className="md:flex space-y-4 md:space-y-0 mt-5 md:mt-16 text-white-dark">
                {prices?.map((plan: any) => (
                    <div 
                        key={plan.id} 
                        className="p-4 lg:p-9 border border-white-light dark:border-[#1b2e4b] rounded-md transition-all duration-300 hover:shadow-[0_0_15px_1px_rgba(113,106,202,0.20)]"
                    >
                        {/* Judul paket */}
                        <h3 className="text-xl mb-5 font-semibold text-black dark:text-white-light">Package {plan.product}</h3>
                        <p>Best hosting package with premium features.</p>

                        {/* Harga plan */}
                        <div className="my-7 p-2.5 text-center text-lg">
                            <strong className="text-[#3b3f5c] dark:text-white-light text-xl lg:text-2xl">
                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(plan.amount)}
                            </strong> / {plan.interval}
                        </div>

                        {/* List keuntungan langganan */}
                        <ul className="space-y-2.5 mb-5 font-semibold group-hover:text-primary">
                            <li className="flex justify-center items-center">
                                <IconArrowLeft className="w-3.5 h-3.5 ltr:mr-1 rtl:ml-1 rtl:rotate-180 shrink-0" />
                                Free water saving e-book
                            </li>
                            <li className="flex justify-center items-center">
                                <IconArrowLeft className="w-3.5 h-3.5 ltr:mr-1 rtl:ml-1 rtl:rotate-180 shrink-0" />
                                Free access to forums
                            </li>
                            <li className="flex justify-center items-center">
                                <IconArrowLeft className="w-3.5 h-3.5 ltr:mr-1 rtl:ml-1 rtl:rotate-180 shrink-0" />
                                Beginners tips
                            </li>
                        </ul>

                        {/* Tombol pembelian */}
                        <button 
                            type="button" 
                            className="btn btn-dark w-full"
                            // onClick={() => setOpenModal(true)}
                            onClick={handlePurchase} // ketika diklik, akan ambil clientSecret lalu buka modal pembayaran
                        >
                            Buy Now
                        </button>
                    </div>
                ))}
            </div>

            {/* Modal pembayaran, hanya muncul kalau clientSecret sudah tersedia */}
            {clientSecret && (
                <PaymentModal 
                    isOpen={openModal} 
                    closeModal={() => setOpenModal(false)} 
                    clientSecret={clientSecret} 
                />
            )} 
        </div>
    );
};

export default PricingTable;
