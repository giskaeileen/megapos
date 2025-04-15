import { useEffect, useState } from "react";
import IconHome from "../../components/Icon/IconHome";
import IconUser from "../../components/Icon/IconUser";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useRegistrationStoreMutation } from "../../redux/features/stores/storesApi";
import toast from "react-hot-toast";
import { generateSlug } from "../../components/tools";
import { useTranslation } from "react-i18next";

// Membuat schema validasi menggunakan Yup untuk data toko
const schema = Yup.object().shape({
    // Validasi untuk field "store_name"
    store_name: Yup.string()
        .max(255, "Nama toko tidak boleh lebih dari 255 karakter") // Batas maksimal 255 karakter
        .required("Nama toko wajib diisi"), // Wajib diisi

    // Validasi untuk field "slug"
    slug: Yup.string()
        .required("Slug toko wajib diisi"), // Wajib diisi, biasanya digunakan untuk URL

    // Validasi untuk field "country"
    country: Yup.string()
        .required("Negara wajib diisi"), // Wajib diisi

    // Validasi untuk field "city"
    city: Yup.string()
        .required("Kota wajib diisi"), // Wajib diisi

    // Validasi untuk field "state"
    state: Yup.string()
        .required("Provinsi wajib diisi"), // Wajib diisi

    // Validasi untuk field "zip"
    zip: Yup.string()
        .required("Kode pos wajib diisi"), // Wajib diisi

    // Validasi untuk field "street_address"
    street_address: Yup.string()
        .required("Alamat wajib diisi"), // Wajib diisi

    // Validasi untuk field "owner_name"
    owner_name: Yup.string()
        .max(255, "Nama pemilik tidak boleh lebih dari 255 karakter") // Maksimal 255 karakter
        .required("Nama pemilik wajib diisi"), // Wajib diisi

    // Validasi untuk field "owner_email"
    owner_email: Yup.string()
        .email("Format email tidak valid") // Harus sesuai format email
        .required("Email pemilik wajib diisi"), // Wajib diisi

    // Validasi untuk field "owner_phone"
    owner_phone: Yup.string()
        .max(15, "Nomor telepon tidak boleh lebih dari 15 karakter") // Maksimal 15 karakter
        .required("Nomor telepon wajib diisi"), // Wajib diisi
});


const StoreRegistration = () => {
    // Menggunakan hook useTranslation dari i18next untuk menerjemahkan teks (multibahasa)
    const { t } = useTranslation();

    // State untuk tab aktif, default-nya adalah tab ke-1
    const [activeTab, setActiveTab] = useState(1); // Mengganti nama state lebih deskriptif

    // Hook dari Redux Toolkit untuk memanggil API pendaftaran toko (store registration)
    // Destructuring data, error, dan status dari response API
    const [registrationStore, { data, error, isSuccess }] = useRegistrationStoreMutation()

    // Inisialisasi Formik untuk meng-handle form pendaftaran toko
    const formik = useFormik({
        enableReinitialize: true, // Mengaktifkan update form jika initialValues berubah
        initialValues: { 
            store_name: "",           // Nama toko
            slug: "",                 // Slug toko (biasanya untuk URL)
            country: "",              // Negara
            city: "",                 // Kota
            state: "",                // Provinsi
            zip: "",                  // Kode pos
            street_address: "",       // Alamat lengkap
            owner_name: "",           // Nama pemilik toko
            owner_email: "",          // Email pemilik
            owner_phone: ""           // Nomor telepon pemilik
        },
        validationSchema: schema, // Skema validasi menggunakan Yup (sudah dibuat sebelumnya)
        
        // Fungsi yang dipanggil ketika form disubmit
        onSubmit: async (values) => {
            console.log(values) // Debug: menampilkan isi form ke console
            await registrationStore(values) // Kirim data form ke API
        },
    });

    // Destructuring method dan state dari formik agar mudah dipakai
    const { errors, touched, values, handleChange, handleSubmit } = formik

    // Hook useEffect untuk menangani efek samping setelah pengiriman data (submit)
    useEffect(() => {
        // Jika berhasil, tampilkan notifikasi sukses
        if (isSuccess) {
            toast.success("Registration Successfully");
        }

        // Jika terdapat error dari backend
        if (error) {
            const errorData = error as any; // Casting error ke tipe bebas (any)

            // Jika error berupa validasi dari backend, update formik error field
            if (errorData.data.errors) {
                Object.keys(errorData.data.errors).forEach((key) => {
                    // Set error untuk setiap field berdasarkan response backend
                    formik.setFieldError(key, errorData.data.errors[key][0]); // Ambil pesan error pertama
                });
            }
        }
    }, [isSuccess, error]); // Jalankan efek saat status berhasil atau error berubah


    return (
        <div>
            {/* Wrapper utama halaman */}
            <div className="absolute inset-0">
                {/* Background gradasi */}
                <img src="/assets/images/auth/bg-gradient2.png" alt="image" className="h-full w-full object-cover" />
            </div>
            <div className="relative flex min-h-screen items-center justify-center bg-[url(/assets/images/auth/map.png)] bg-cover bg-center bg-no-repeat px-6 py-10 dark:bg-[#060818] sm:px-16">
                {/* Objek dekoratif sisi kiri */}
                <img src="/assets/images/auth/coming-soon-object1.png" alt="image" className="absolute left-0 top-1/2 h-full max-h-[893px] -translate-y-1/2" />

                {/* Kontainer utama form */}
                <div className="relative w-full max-w-[1100px] rounded-md bg-[linear-gradient(45deg,#fff9f9_0%,rgba(255,255,255,0)_25%,rgba(255,255,255,0)_75%,_#fff9f9_100%)] p-2 dark:bg-[linear-gradient(52.22deg,#0E1726_0%,rgba(14,23,38,0)_18.66%,rgba(14,23,38,0)_51.04%,rgba(14,23,38,0)_80.07%,#0E1726_100%)]">
                    <div className="relative flex flex-col justify-center rounded-md bg-white/60 backdrop-blur-lg dark:bg-black/50 px-6 lg:min-h-[758px] py-20">
                        <div className="mx-auto w-full max-w-[640px]">
                            <div className="inline-block w-full">
                                <div className="relative z-[1]">
                                    {/* Indicator progress tab */}
                                    <div
                                        className={`${activeTab === 1 ? 'w-[25%]' : 'w-[75%]'} 
                                            bg-primary h-1 absolute ltr:left-0 rtl:right-0 top-[30px] m-auto -z-[1] transition-[width]`}
                                    ></div>

                                    {/* Tab navigasi: Store dan Owner */}
                                    <ul className="mb-5 grid grid-cols-2">
                                        <li className="mx-auto">
                                            <button
                                                type="button"
                                                className={`${activeTab === 1 ? '!border-primary !bg-primary text-white' : ''} 
                                                bg-white dark:bg-[#253b5c] border-[3px] border-[#f3f2ee] dark:border-[#1b2e4b] 
                                                flex justify-center items-center w-16 h-16 rounded-full`}
                                                onClick={() => setActiveTab(1)}
                                            >
                                                <IconHome />
                                            </button>
                                        </li>

                                        <li className="mx-auto">
                                            <button
                                                type="button"
                                                className={`${activeTab === 2 ? '!border-primary !bg-primary text-white' : ''} 
                                                bg-white dark:bg-[#253b5c] border-[3px] border-[#f3f2ee] dark:border-[#1b2e4b] 
                                                flex justify-center items-center w-16 h-16 rounded-full`}
                                                onClick={() => setActiveTab(2)}
                                            >
                                                <IconUser className="w-5 h-5" />
                                            </button>
                                        </li>
                                    </ul>
                                </div>

                                {/* Form pendaftaran toko */}
                                <form className="space-y-5 dark:text-white" onSubmit={handleSubmit} >
                                    <div>
                                        {/* Tab 1: Data Toko */}
                                        {activeTab === 1 && (
                                            <div className="space-y-5 dark:text-white">
                                                <div className="mb-10">
                                                    <h1 className="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl">
                                                        {t('Store')}
                                                    </h1>
                                                    <p className="text-base font-bold leading-normal text-white-dark">
                                                        {t('Enter your data store register store')}
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {/* Input nama toko */}
                                                    <div>
                                                        <label htmlFor="store_name">{t('Name')}</label>
                                                        <div className="relative text-white-dark">
                                                            <input 
                                                                id="store_name" 
                                                                type="text" 
                                                                placeholder={t("Enter Name")}
                                                                className="form-input placeholder:text-white-dark"
                                                                value={values.store_name}
                                                                // onChange={handleChange}
                                                                onChange={(e) => {
                                                                    handleChange(e); // Tetap gunakan handleChange dari Formik
                                                                    formik.setFieldValue('slug', generateSlug(e.target.value)); // Perbarui slug secara real-time
                                                                }}
                                                            />
                                                        </div>
                                                        {errors.store_name&& touched.store_name&& (
                                                            <span className="text-red-500 mt-2 block">{errors.store_name}</span>
                                                        )}
                                                    </div>

                                                    {/* Slug toko (terisi otomatis & tidak bisa diubah) */}
                                                    <div hidden>
                                                        <label htmlFor="slug">{t('Slug')}<span className="text-danger">*</span></label>
                                                        <input
                                                            id="slug"
                                                            type="text"
                                                            placeholder={t("Enter Slug")}
                                                            className="form-input pointer-events-none bg-[#eee] dark:bg-[#1b2e4b] cursor-not-allowed"
                                                            readOnly
                                                            value={values.slug}
                                                        />
                                                        {errors.slug && touched.slug && (
                                                            <span className="text-red-500 block mt-2">{errors.slug}</span>
                                                        )}
                                                    </div>

                                                    {/* Negara toko */}
                                                    <div>
                                                        <label htmlFor="country">{t('Country')}</label>
                                                        <div className="relative text-white-dark">
                                                            <input 
                                                                id="country" 
                                                                type="text" 
                                                                placeholder={t("Enter Country")}
                                                                className="form-input placeholder:text-white-dark"
                                                                value={values.country}
                                                                onChange={handleChange}
                                                            />
                                                        </div>
                                                        {errors.country && touched.country && (
                                                            <span className="text-red-500 mt-2 block">{errors.country}</span>
                                                        )}
                                                    </div>

                                                    {/* Provinsi toko */}
                                                    <div>
                                                        <label htmlFor="state">{t('State')}</label>
                                                        <div className="relative text-white-dark">
                                                            <input 
                                                                id="state" 
                                                                type="text" 
                                                                placeholder={t("Enter State")} 
                                                                className="form-input placeholder:text-white-dark"
                                                                value={values.state}
                                                                onChange={handleChange}
                                                            />
                                                        </div>
                                                        {errors.state && touched.state && (
                                                            <span className="text-red-500 mt-2 block">{errors.state}</span>
                                                        )}
                                                    </div>

                                                    {/* Kota toko */}
                                                    <div>
                                                        <label htmlFor="city">{t('City')}</label>
                                                        <div className="relative text-white-dark">
                                                            <input 
                                                                id="city" 
                                                                type="text" 
                                                                placeholder={t("Enter City")} 
                                                                className="form-input placeholder:text-white-dark"
                                                                value={values.city}
                                                                onChange={handleChange}
                                                            />
                                                        </div>
                                                        {errors.city && touched.city && (
                                                            <span className="text-red-500 mt-2 block">{errors.city}</span>
                                                        )}
                                                    </div>

                                                    {/* Kode pos toko */}
                                                    <div>
                                                        <label htmlFor="zip">{t('ZIP')}</label>
                                                        <div className="relative text-white-dark">
                                                            <input 
                                                                id="zip" 
                                                                type="text" 
                                                                placeholder={t("Enter ZIP")} 
                                                                className="form-input placeholder:text-white-dark"
                                                                value={values.zip}
                                                                onChange={handleChange}
                                                            />
                                                        </div>
                                                        {errors.zip && touched.zip && (
                                                            <span className="text-red-500 mt-2 block">{errors.zip}</span>
                                                        )}
                                                    </div>

                                                    {/* Alamat lengkap toko */}
                                                    <div>
                                                        <label htmlFor="street_address">{t('Street Address')}</label>
                                                        <div className="relative text-white-dark">
                                                            <input 
                                                                id="street_address" 
                                                                type="text" 
                                                                placeholder={t("Enter Street Address")} 
                                                                className="form-input placeholder:text-white-dark"
                                                                value={values.street_address}
                                                                onChange={handleChange}
                                                            />
                                                        </div>
                                                        {errors.street_address && touched.street_address && (
                                                            <span className="text-red-500 mt-2 block">{errors.street_address}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Tab 2: Data Pemilik */}
                                        {activeTab === 2 && (
                                            <div className="space-y-5 dark:text-white">
                                                <div className="mb-10">
                                                    <h1 className="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl">Owner</h1>
                                                    <p className="text-base font-bold leading-normal text-white-dark">
                                                        {t('Enter your name, email, and phone to register owner')}
                                                    </p>
                                                </div>

                                                {/* Nama pemilik */}
                                                <div>
                                                    <label htmlFor="owner_name">{t('Name')}</label>
                                                    <div className="relative text-white-dark">
                                                        <input 
                                                            id="owner_name" 
                                                            type="text" 
                                                            placeholder={t("Enter Name")} 
                                                            className="form-input placeholder:text-white-dark"
                                                            value={values.owner_name}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                    {errors.owner_name && touched.owner_name && (
                                                        <span className="text-red-500 mt-2 block">{errors.owner_name}</span>
                                                    )}
                                                </div>

                                                {/* Email pemilik */}
                                                <div>
                                                    <label htmlFor="owner_email">{t('Email')}</label>
                                                    <div className="relative text-white-dark">
                                                        <input 
                                                            id="owner_email" 
                                                            type="email" 
                                                            placeholder={t("Enter Name")} 
                                                            className="form-input placeholder:text-white-dark"
                                                            value={values.owner_email}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                    {errors.owner_email && touched.owner_email && (
                                                        <span className="text-red-500 mt-2 block">{errors.owner_email}</span>
                                                    )}
                                                </div>

                                                {/* Nomor telepon pemilik */}
                                                <div>
                                                    <label htmlFor="owner_phone">{t('Phone')}</label>
                                                    <div className="relative text-white-dark">
                                                        <input 
                                                            id="owner_phone" 
                                                            type="text" 
                                                            placeholder={t("Enter Phone")} 
                                                            className="form-input placeholder:text-white-dark"
                                                            value={values.owner_phone}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                    {errors.owner_phone && touched.owner_phone && (
                                                        <span className="text-red-500 mt-2 block">{errors.owner_phone}</span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Tombol navigasi antar tab dan submit */}
                                    <div className="flex justify-between">
                                        <button
                                            type="button"
                                            className={`btn btn-primary ${activeTab === 1 ? 'hidden' : ''}`}
                                            onClick={() => setActiveTab(1)}
                                        >
                                            Back
                                        </button>
                                        <button
                                            type={activeTab === 2 ? "submit" : "button"}
                                            className="btn btn-primary ltr:ml-auto rtl:mr-auto"
                                            onClick={(e) => {
                                                if (activeTab === 1) {
                                                    e.preventDefault(); // Mencegah submit
                                                    setActiveTab(2); // Pindah ke tab berikutnya
                                                } else {
                                                    console.log("Form submitted");
                                                }
                                            }}
                                        >
                                            {activeTab === 2 ? 'Register' : 'Next'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoreRegistration;