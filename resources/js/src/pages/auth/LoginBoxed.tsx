import React from 'react';
import { useNavigate } from 'react-router-dom'; // Untuk navigasi antar halaman
import { useDispatch, useSelector } from 'react-redux'; // Untuk akses dan manipulasi state dari Redux
import { IRootState } from '../../store'; // Interface untuk root state Redux
import { useEffect, useState } from 'react';
import { setPageTitle, toggleRTL } from '../../store/themeConfigSlice'; // Action untuk mengatur tema
import { useFormik } from 'formik'; // Formik untuk manajemen form
import { useLoginMutation } from '../../redux/features/auth/authApi'; // Custom hook untuk login (RTK Query)
import toast from 'react-hot-toast'; // Untuk notifikasi
import * as Yup from 'yup'; // Validasi schema
import { useTranslation } from 'react-i18next'; // i18n untuk translasi multi bahasa
import { userLoggedIn } from '../../redux/features/auth/authSlice'; // Redux action untuk simpan user login

// Skema validasi Yup untuk form login
const schema = Yup.object().shape({
    email: Yup.string().email('Invalid email!').required('Please enter your email'),
    password: Yup.string().required('Please enter your password!').min(6),
});

// Interface untuk struktur objek user
interface User {
    id: number;
    name: string;
    email: string;
    store_id: string;
    roles: string[];
    permissions: string[];
    stores: { slug: string }[];
}

const LoginBoxed = () => {
    const { t } = useTranslation(); // Hook untuk translasi
    const dispatch = useDispatch(); // Hook untuk dispatch Redux action
    // Mengatur judul halaman saat komponen dimount
    useEffect(() => {
        dispatch(setPageTitle('Login Boxed'));
    });
    const navigate = useNavigate(); // Hook untuk navigasi
    // Ambil status tema dan RTL dari Redux store
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    // Fungsi untuk mengubah locale dan arah RTL
    const setLocale = (flag: string) => {
        setFlag(flag);
        if (flag.toLowerCase() === 'ae') {
            dispatch(toggleRTL('rtl'));
        } else {
            dispatch(toggleRTL('ltr'));
        }
    };
    const [flag, setFlag] = useState(themeConfig.locale); // State untuk menyimpan bendera locale

    const submitForm = () => {
        navigate('/'); // Navigasi ke halaman utama
    };

    // =================
    // Mengambil user dari localStorage jika ada
    const user: User = JSON.parse(localStorage.getItem('user') || '{}');

    // Custom hook dari RTK Query untuk login
    const [login, { isSuccess, error }] = useLoginMutation();

    // Inisialisasi formik untuk form login
    const formik = useFormik({
        initialValues: { email: '', password: '' }, // Value awal form
        validationSchema: Yup.object({
            email: Yup.string().email('Invalid email').required('Required'),
            password: Yup.string().required('Required').min(6),
        }),
        onSubmit: async (values, { setSubmitting }) => {
            try {
                // Lakukan request login ke backend
                const response = await login(values).unwrap();
                
                // Dispatch action untuk update Redux state dan localStorage
                // Jika berhasil, simpan token dan user ke Redux dan localStorage
                dispatch(userLoggedIn({
                    token: response.token,
                    user: response.user
                }));

                // Redirect berdasarkan role
                if (response.user.roles.includes('Employee')) {
                    navigate(`/${response.user.stores[0].slug}`);
                } else {
                    navigate('/');
                }
                
                toast.success('Login successful'); // Tampilkan toast sukses
            } catch (error) {
                toast.error(error.data?.message || 'Login failed'); // Tampilkan pesan error jika login gagal
            } finally {
                setSubmitting(false); // Reset status submitting
            }
        },
    });

    // Mengambil data penting dari Formik agar bisa digunakan di form input
    const { errors, touched, values, handleChange, handleSubmit } = formik;

    return (
        <div>
            {/* Background */}
            <div className="absolute inset-0">
                <img src="/assets/images/auth/bg-gradient2.png" alt="image" className="h-full w-full object-cover" />
            </div>

            {/* Container */}
            <div className="relative flex min-h-screen items-center justify-center bg-[url(/assets/images/auth/map.png)] bg-cover bg-center bg-no-repeat px-6 py-10 dark:bg-[#060818] sm:px-16">
                <img src="/assets/images/auth/coming-soon-object1.png" alt="image" className="absolute left-0 top-1/2 h-full max-h-[893px] -translate-y-1/2" />
                <div className="relative w-full max-w-[870px] rounded-md bg-[linear-gradient(45deg,#fff9f9_0%,rgba(255,255,255,0)_25%,rgba(255,255,255,0)_75%,_#fff9f9_100%)] p-2 dark:bg-[linear-gradient(52.22deg,#0E1726_0%,rgba(14,23,38,0)_18.66%,rgba(14,23,38,0)_51.04%,rgba(14,23,38,0)_80.07%,#0E1726_100%)]">
                    <div className="relative flex flex-col justify-center rounded-md bg-white/60 backdrop-blur-lg dark:bg-black/50 px-6 lg:min-h-[758px] py-20">
                        <div className="mx-auto w-full max-w-[440px]">
                            {/* Judul dan deskripsi login */}
                            <div className="mb-10">
                                <h1 className="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl">{t('Login')}</h1>
                                <p className="text-base font-bold leading-normal text-white-dark">{t('Enter your email and password to login')}</p>
                            </div>
                            {/* Form login */}
                            <form className="space-y-5 dark:text-white" onSubmit={handleSubmit}>
                                {/* Input email */}
                                <div>
                                    <label htmlFor="email">{t('Email')}</label>
                                    <div className="relative text-white-dark">
                                        <input id="email" type="email" placeholder={t('Enter Email')} className="form-input placeholder:text-white-dark" value={values.email} onChange={handleChange} />
                                    </div>
                                    {/* Tampilkan error jika email tidak valid */}
                                    {errors.email && touched.email && <span className="text-red-500 pt-2 block">{errors.email}</span>}
                                </div>
                                {/* Input password */}
                                <div>
                                    <label htmlFor="password">{t('Password')}</label>
                                    <div className="relative text-white-dark">
                                        <input
                                            id="password"
                                            type="password"
                                            placeholder={t('Enter Password')}
                                            className="form-input placeholder:text-white-dark"
                                            value={values.password}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    {/* Tampilkan error jika password kosong atau kurang */}
                                    {errors.password && touched.password && <span className="text-red-500 pt-2 block">{errors.password}</span>}
                                </div>
                                {/* button submit */}
                                <button type="submit" className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]">
                                    {t('Login')}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginBoxed;
