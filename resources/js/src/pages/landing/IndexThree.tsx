import { Link, NavLink } from "react-router-dom";

import '../../assets/landing/css/tailwind.css'
import '../../assets/landing/css/materialdesignicons.min.css'

import heroImg from "../../assets/landing/images/hero.png"
import bg from '../../assets/landing/images/bg/2.png'

import CountUp from "react-countup";
import Switcher from "../../components/landing/switcher";
import Navbar from "../../components/landing/navbar";
import About from "../../components/landing/about";
import Services from "../../components/landing/services";
import AgencyTab from "../../components/landing/agencyTab";
import PricingTableLanding from "../../components/landing/PricingTableLanding";
import Footer from "../../components/Layouts/Footer";
import { useTranslation } from "react-i18next";

// Komponen utama halaman landing
const IndexThree: React.FC = () => {
    const { t } = useTranslation(); // Hook untuk mengambil fungsi translate
    
    return (
        // Wrapper utama dengan background dark support
        <div className="dark:bg-slate-900 dark:text-white">
            {/* Navbar navigasi */}
            <Navbar/>
            {/* Hero Section dengan background image */}
            <section 
                className="relative flex items-center md:h-screen py-36 bg-no-repeat bg-center bg-cover" 
                id="home" 
                style={{ backgroundImage: `url(${bg})` }}
            >
                <div className="container relative">
                    <div className="grid lg:grid-cols-12 md:grid-cols-2 grid-cols-1 items-center mt-6 gap-6 relative">
                        {/* Kolom kiri (teks hero) */}
                        <div className="lg:col-span-7 md:me-6">
                            <h4 className="font-semibold lg:leading-normal leading-normal tracking-wide text-4xl lg:text-5xl mb-5">
                                {/* Menggunakan i18next untuk mendukung multi bahasa */}
                                {t('Manage Your Store Business Smarter')}
                            </h4>
                            <p className="text-slate-400 text-lg max-w-xl">
                                {/* Deskripsi singkat */}
                                {t('Simplify cash management and improve business efficiency with MEGAPOS.')}
                            </p>
                            <div className="relative mt-6 space-x-1">
                                {/* Tombol CTA untuk menuju ke halaman pendaftaran toko */}
                                <a 
                                    href="/store-registration"
                                    className="h-10 px-6 tracking-wide inline-flex items-center justify-center font-medium rounded-md bg-teal-500 text-white"
                                >
                                   {t('Register Store')}
                                </a>
                            </div>
                        </div>

                        {/* Kolom kanan (hero image) */}
                        <div className="lg:col-span-5">
                            <div className="relative">
                                <img 
                                    src={heroImg}  // Gambar utama
                                    className="mx-auto rounded-[150px] rounded-br-2xl shadow dark:shadow-gray-700 w-[90%]" 
                                    alt="Hero"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Komponen tambahan lainnya */}
            <Switcher/> {/* Komponen untuk switch mode atau warna */}
            <About/> {/* section tentang aplikasi/produk */}
            <Services/> {/* section layanan */}
            <AgencyTab/> {/* Tab atau fitur agensi */}
            <Footer/> {/* Footer halaman */}
        </div>
    );
};

export default IndexThree;