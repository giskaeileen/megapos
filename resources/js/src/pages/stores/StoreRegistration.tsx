import { useEffect, useState } from "react";
import IconHome from "../../components/Icon/IconHome";
import IconUser from "../../components/Icon/IconUser";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useRegistrationStoreMutation } from "../../redux/features/stores/storesApi";
import toast from "react-hot-toast";
import { generateSlug } from "../../components/tools";
import { useTranslation } from "react-i18next";

const schema = Yup.object().shape({
    store_name: Yup.string()
        .max(255, "Nama toko tidak boleh lebih dari 255 karakter")
        .required("Nama toko wajib diisi"),
    slug: Yup.string().required("Slug toko wajib diisi"),
    country: Yup.string().required("Negara wajib diisi"),
    city: Yup.string().required("Kota wajib diisi"),
    state: Yup.string().required("Provinsi wajib diisi"),
    zip: Yup.string().required("Kode pos wajib diisi"),
    street_address: Yup.string().required("Alamat wajib diisi"),
    owner_name: Yup.string()
        .max(255, "Nama pemilik tidak boleh lebih dari 255 karakter")
        .required("Nama pemilik wajib diisi"),
    owner_email: Yup.string()
        .email("Format email tidak valid")
        .required("Email pemilik wajib diisi"),
    owner_phone: Yup.string()
        .max(15, "Nomor telepon tidak boleh lebih dari 15 karakter")
        .required("Nomor telepon wajib diisi"),
});

const StoreRegistration = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState(1); // Mengganti nama state lebih deskriptif
    const [registrationStore, { data, error, isSuccess }] = useRegistrationStoreMutation()

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: { 
            store_name: "", 
            slug: "", 
            country: "", 
            city: "", 
            state: "", 
            zip: "", 
            street_address: "", 
            owner_name: "", 
            owner_email: "", 
            owner_phone: "" 
        },
        validationSchema: schema,
        onSubmit: async (values) => {
            console.log(values)
            await registrationStore(values)
        },
    });

    const { errors, touched, values, handleChange, handleSubmit } = formik

    // useEffect(() => {
    //     if (isSuccess) {
    //         toast.success("Registration Successfully")
    //     }
    //     if (error) {
    //         const errorData = error as any;
    //         toast.error(errorData.data.message);
    //         // if ("data" in error) {
    //         //     const errorData = error as any
    //         //     toast.error(errorData.data.message)
    //         // }
    //     }
    // }, [isSuccess, error])

    useEffect(() => {
        if (isSuccess) {
            toast.success("Registration Successfully");
        }
        if (error) {
            const errorData = error as any;
            // toast.error(errorData.data.message);

            // Jika error dari backend berupa validasi, update Formik errors
            if (errorData.data.errors) {
                Object.keys(errorData.data.errors).forEach((key) => {
                    formik.setFieldError(key, errorData.data.errors[key][0]); // Ambil pesan pertama
                });
            }
        }
    }, [isSuccess, error]);

    return (
        <div>
            <div className="absolute inset-0">
                <img src="/assets/images/auth/bg-gradient2.png" alt="image" className="h-full w-full object-cover" />
            </div>
            <div className="relative flex min-h-screen items-center justify-center bg-[url(/assets/images/auth/map.png)] bg-cover bg-center bg-no-repeat px-6 py-10 dark:bg-[#060818] sm:px-16">
                <img src="/assets/images/auth/coming-soon-object1.png" alt="image" className="absolute left-0 top-1/2 h-full max-h-[893px] -translate-y-1/2" />
                {/* <img src="/assets/images/auth/coming-soon-object2.png" alt="image" className="absolute left-24 top-0 h-40 md:left-[30%]" />
                <img src="/assets/images/auth/coming-soon-object3.png" alt="image" className="absolute right-0 top-0 h-[300px]" />
                <img src="/assets/images/auth/polygon-object.svg" alt="image" className="absolute bottom-0 end-[28%]" /> */}
                <div className="relative w-full max-w-[1100px] rounded-md bg-[linear-gradient(45deg,#fff9f9_0%,rgba(255,255,255,0)_25%,rgba(255,255,255,0)_75%,_#fff9f9_100%)] p-2 dark:bg-[linear-gradient(52.22deg,#0E1726_0%,rgba(14,23,38,0)_18.66%,rgba(14,23,38,0)_51.04%,rgba(14,23,38,0)_80.07%,#0E1726_100%)]">
                    <div className="relative flex flex-col justify-center rounded-md bg-white/60 backdrop-blur-lg dark:bg-black/50 px-6 lg:min-h-[758px] py-20">
                        <div className="mx-auto w-full max-w-[640px]">
                            <div className="inline-block w-full">
                                <div className="relative z-[1]">
                                    <div
                                        className={`${activeTab === 1 ? 'w-[25%]' : 'w-[75%]'} 
                                            bg-primary h-1 absolute ltr:left-0 rtl:right-0 top-[30px] m-auto -z-[1] transition-[width]`}
                                    ></div>

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

                                <form className="space-y-5 dark:text-white" onSubmit={handleSubmit} >
                                    <div>
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
                                                            {/* <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                                                <IconUser fill={true} />
                                                            </span> */}
                                                        </div>
                                                        {errors.store_name&& touched.store_name&& (
                                                            <span className="text-red-500 mt-2 block">{errors.store_name}</span>
                                                        )}
                                                    </div>

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
                                                            {/* <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                                                <IconUser fill={true} />
                                                            </span> */}
                                                        </div>
                                                        {errors.country && touched.country && (
                                                            <span className="text-red-500 mt-2 block">{errors.country}</span>
                                                        )}
                                                    </div>

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
                                                            {/* <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                                                <IconUser fill={true} />
                                                            </span> */}
                                                        </div>
                                                        {errors.state && touched.state && (
                                                            <span className="text-red-500 mt-2 block">{errors.state}</span>
                                                        )}
                                                    </div>

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
                                                            {/* <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                                                <IconUser fill={true} />
                                                            </span> */}
                                                        </div>
                                                        {errors.city && touched.city && (
                                                            <span className="text-red-500 mt-2 block">{errors.city}</span>
                                                        )}
                                                    </div>

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
                                                            {/* <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                                                <IconUser fill={true} />
                                                            </span> */}
                                                        </div>
                                                        {errors.zip && touched.zip && (
                                                            <span className="text-red-500 mt-2 block">{errors.zip}</span>
                                                        )}
                                                    </div>

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
                                                            {/* <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                                                <IconUser fill={true} />
                                                            </span> */}
                                                        </div>
                                                        {errors.street_address && touched.street_address && (
                                                            <span className="text-red-500 mt-2 block">{errors.street_address}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {activeTab === 2 && (
                                            <div className="space-y-5 dark:text-white">
                                                <div className="mb-10">
                                                    <h1 className="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl">Owner</h1>
                                                    <p className="text-base font-bold leading-normal text-white-dark">
                                                        {t('Enter your name, email, and phone to register owner')}
                                                    </p>
                                                </div>
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
                                                        {/* <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                                            <IconUser fill={true} />
                                                        </span> */}
                                                    </div>
                                                    {errors.owner_name && touched.owner_name && (
                                                        <span className="text-red-500 mt-2 block">{errors.owner_name}</span>
                                                    )}
                                                </div>
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
                                                        {/* <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                                            <IconUser fill={true} />
                                                        </span> */}
                                                    </div>
                                                    {errors.owner_email && touched.owner_email && (
                                                        <span className="text-red-500 mt-2 block">{errors.owner_email}</span>
                                                    )}
                                                </div>
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
                                                        {/* <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                                            <IconUser fill={true} />
                                                        </span> */}
                                                    </div>
                                                    {errors.owner_phone && touched.owner_phone && (
                                                        <span className="text-red-500 mt-2 block">{errors.owner_phone}</span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
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