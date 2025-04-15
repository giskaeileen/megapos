import React from 'react';
import { useEffect, useState } from 'react';
import { setPageTitle, toggleAnimation, toggleLayout, toggleMenu, toggleNavbar, toggleRTL, toggleSemidark, toggleTheme } from '../../store/themeConfigSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useGetSettingsQuery, useUpdateSettingsMutation } from '../../redux/features/settings/settingsApi';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { useChangePasswordMutation, useGetProfileQuery, useUpdateProfileMutation } from '../../redux/features/profile/profileApi';
import { capitalizeFirstLetter } from '../../components/tools';
import ImageUploading, { ImageListType } from 'react-images-uploading';
import { useTranslation } from 'react-i18next';
import { IRootState } from '../../redux/store';

/**
 * Struktur data individual setting item.
 */
interface Setting {
    key: string;
    value: string | number | null;
}

/** Struktur nilai form untuk pengaturan sistem */
interface SettingsFormValues {
    mail_mailer: string;
    mail_host: string;
    mail_port: string;
    mail_username: string;
    mail_password: string;
    mail_encryption: string;
    mail_from_address: string;
    mail_from_name: string;
    quota_transactions: number;
    quota_products: number;
    quota_employees: number;
    quota_stores: number;
    [key: string]: string | number; // Index signature untuk dynamic keys
}

// Schema validasi
const schema = Yup.object().shape({
    mail_mailer: Yup.string().required('Mail driver is required'),
    mail_host: Yup.string().required('Mail host is required'),
    mail_port: Yup.string().required('Mail port is required'),
    mail_username: Yup.string().required('Mail username is required'),
    mail_password: Yup.string().required('Mail password is required'),
    mail_encryption: Yup.string().required('Encryption is required'),
    mail_from_address: Yup.string().email('Invalid email address').required('From address is required'),
    mail_from_name: Yup.string().required('From name is required'),
    quota_transactions: Yup.number().min(1, 'Must be at least 1').required('Transaction quota is required'),
    quota_products: Yup.number().min(1, 'Must be at least 1').required('Product quota is required'),
    quota_employees: Yup.number().min(1, 'Must be at least 1').required('Employee quota is required'),
    quota_stores: Yup.number().min(1, 'Must be at least 1').required('Store quota is required'),
});

// Nilai default untuk form pengaturan
const initialFormValues: SettingsFormValues = {
    mail_mailer: '',
    mail_host: '',
    mail_port: '',
    mail_username: '',
    mail_password: '',
    mail_encryption: '',
    mail_from_address: '',
    mail_from_name: '',
    quota_transactions: 0,
    quota_products: 0,
    quota_employees: 0,
    quota_stores: 0,
};

/**
 * Komponen utama untuk halaman pengaturan
 */
const Settings = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Account Setting'));
    });
    const [tabs, setTabs] = useState<string>('home');
    // Fungsi untuk mengganti tab aktif
    const toggleTabs = (name: string) => {
        setTabs(name);
    };

    const { data } = useGetSettingsQuery({}); // Menarik data jika ID ada
    const [updateSettings, { isSuccess: isUpdateSuccess, error: errorUpdate }] = useUpdateSettingsMutation();

    /*****************************
     * validation
     */

    const schema = Yup.object().shape({});

    /*****************************
     * form data
     */

    // Fungsi untuk mengubah array settings menjadi object
    const transformSettingsToObject = (settings: Setting[]): SettingsFormValues => {
        return settings.reduce((acc, cur) => {
            // Konversi nilai untuk field number
            if (['quota_transactions', 'quota_products', 'quota_employees', 'quota_stores'].includes(cur.key)) {
                acc[cur.key] = cur.value !== null ? Number(cur.value) : 0;
            } else {
                acc[cur.key] = cur.value ?? '';
            }
            return acc;
        }, {} as SettingsFormValues);
    };

    // Handler untuk update settings
    const handleUpdateSettings = async (values: SettingsFormValues) => {
        try {
            // Buat array dari promises untuk update semua settings sekaligus
            const updatePromises = Object.entries(values).map(([key, value]) => updateSettings({ key, value }).unwrap());

            await Promise.all(updatePromises);

            toast.success('Settings updated successfully');
        } catch (error) {
            console.error('Failed to update settings:', error);
            toast.error('Failed to update settings');
        }
    };

    // Inisialisasi Formik
    const formik = useFormik<SettingsFormValues>({
        enableReinitialize: true,
        initialValues: data ? transformSettingsToObject(data) : initialFormValues,
        validationSchema: schema,
        onSubmit: handleUpdateSettings,
    });

    const { values, errors, touched, handleChange, handleSubmit } = formik;

    /*****************************
     * form config 2
     */

    // Schema validasi untuk form profile
    const schema2 = Yup.object().shape({
        name: Yup.string()
            .required('Name is required')
            .matches(/^[a-zA-Z\s]*$/, 'Name can only contain letters and spaces'),
        photo: Yup.mixed()
            .test('fileType', 'Unsupported File Format', (value) => (value ? ['image/jpg', 'image/jpeg', 'image/png'].includes(value.type) : true))
            .test(
                'fileSize',
                'File Size is too large. Maximum size is 1MB',
                (value) => (value ? value.size <= 1024 * 1024 : true) // 1024 KB = 1 MB
            ),
    });

    const { data: profile } = useGetProfileQuery({});
    const [updateProfile, { isSuccess: isUpdateSuccessProfile, error: errorUpdateProfile }] = useUpdateProfileMutation();

    // Menangani formik
    const formik2 = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: profile?.name || '',
            photo: null,
        },
        validationSchema: schema2,
        onSubmit: async (values) => {
            const formData = new FormData();
            formData.append('name', values.name);

            if (values.photo) {
                formData.append('photo', values.photo);
            }

            formData.append('_method', 'PUT');
            await updateProfile(formData);
        },
    });

    const { values: values2, errors: errors2, touched: touched2, handleChange: handleChange2, handleSubmit: handleSubmit2 } = formik2;

    // State untuk image upload
    const [images, setImages] = useState<any>([]);
    const maxNumber = 69;

    // Handler untuk perubahan gambar
    const onChange = (imageList: ImageListType, addUpdateIndex: number[] | undefined) => {
        setImages(imageList as never[]);
        if (imageList.length > 0) {
            formik2.setFieldValue('photo', imageList[0].file);
        } else {
            formik2.setFieldValue('photo', null);
        }
    };

    // Set initial image jika profile photo ada
    useEffect(() => {
        if (profile && profile.photo) {
            const initialImage = {
                dataURL: `${import.meta.env.VITE_SERVER_URI_BASE}storage/profile/${profile.photo}`,
                file: null,
            };
            setImages([initialImage]);
        }
    }, [profile]);

    /*****************************
     * form config 3
     */

    // Schema validasi untuk form perubahan password
    const [changePassword, { isSuccess: isUpdateSuccessChangePassword, error: errorUpdateChangePassword }] = useChangePasswordMutation();

    const schema3 = Yup.object().shape({
        current_password: Yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
        new_password: Yup.string().required('New Password is required').min(6, 'New Password must be at least 6 characters'),
        new_password_confirmation: Yup.string()
            .required('Please confirm your password')
            .oneOf([Yup.ref('new_password'), null], 'Passwords must match'),
    });

    // Formik configuration untuk perubahan password
    const formik3 = useFormik({
        enableReinitialize: true,
        initialValues: {
            current_password: '',
            new_password: '',
            new_password_confirmation: '',
        },
        validationSchema: schema3,
        onSubmit: async (values) => {
            const formData = new FormData();
            formData.append('current_password', values.current_password);
            formData.append('new_password', values.new_password);
            formData.append('new_password_confirmation', values.new_password_confirmation);

            await changePassword(formData);
        },
    });

    const { values: values3, errors: errors3, touched: touched3, handleChange: handleChange3, handleSubmit: handleSubmit3 } = formik3;

    /*****************************
     * status
     */

    // Effect untuk menangani status update
    useEffect(() => {
        if (isUpdateSuccessProfile) {
            toast.success('Update Successfully');
        }
        if (errorUpdateProfile) {
            const errorData = errorUpdateProfile as any;
            if (errorData.data.errors) {
                Object.keys(errorData.data.errors).forEach((key) => {
                    formik.setFieldError(key, errorData.data.errors[key][0]); // Ambil pesan pertama
                    toast.error(errorData.data.errors[key][0]);
                });
            }
        }
        if (isUpdateSuccessChangePassword) {
            toast.success('Update Successfully');
        }
        if (errorUpdateChangePassword) {
            const errorData = errorUpdateChangePassword as any;
            toast.error(errorData?.data?.message);
            if (errorData.data.errors) {
                Object.keys(errorData.data.errors).forEach((key) => {
                    formik.setFieldError(key, errorData.data.errors[key][0]); // Ambil pesan pertama
                    toast.error(errorData.data.errors[key][0]);
                });
            }
        }
    }, [isUpdateSuccessProfile, errorUpdateProfile, isUpdateSuccessChangePassword, errorUpdateChangePassword]);

    const { t } = useTranslation();

    // ===============
    // ===============
    // ===============

    // Interface untuk opsi tema
    interface ThemeOption {
        value: string;
        label: string;
        icon: JSX.Element;
    }

    // Opsi tema yang tersedia
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);

    // Theme options
    const themeOptions: ThemeOption[] = [
        {
            value: 'light',
            label: 'Light',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* SVG untuk tema light */}
                    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M12 2V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M12 20V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M4 12L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M22 12L20 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path opacity="0.5" d="M19.7778 4.22266L17.5558 6.25424" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path opacity="0.5" d="M4.22217 4.22266L6.44418 6.25424" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path opacity="0.5" d="M6.44434 17.5557L4.22211 19.7779" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path opacity="0.5" d="M19.7778 19.7773L17.5558 17.5551" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            ),
        },
        {
            value: 'dark',
            label: 'Dark',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* SVG untuk tema dark */}
                    <path
                        d="M21.0672 11.8568L20.4253 11.469L21.0672 11.8568ZM12.1432 2.93276L11.7553 2.29085V2.29085L12.1432 2.93276ZM21.25 12C21.25 17.1086 17.1086 21.25 12 21.25V22.75C17.9371 22.75 22.75 17.9371 22.75 12H21.25ZM12 21.25C6.89137 21.25 2.75 17.1086 2.75 12H1.25C1.25 17.9371 6.06294 22.75 12 22.75V21.25ZM2.75 12C2.75 6.89137 6.89137 2.75 12 2.75V1.25C6.06294 1.25 1.25 6.06294 1.25 12H2.75ZM15.5 14.25C12.3244 14.25 9.75 11.6756 9.75 8.5H8.25C8.25 12.5041 11.4959 15.75 15.5 15.75V14.25ZM20.4253 11.469C19.4172 13.1373 17.5882 14.25 15.5 14.25V15.75C18.1349 15.75 20.4407 14.3439 21.7092 12.2447L20.4253 11.469ZM9.75 8.5C9.75 6.41182 10.8627 4.5828 12.531 3.57467L11.7553 2.29085C9.65609 3.5593 8.25 5.86509 8.25 8.5H9.75ZM12 2.75C11.9115 2.75 11.8077 2.71008 11.7324 2.63168C11.6686 2.56527 11.6538 2.50244 11.6503 2.47703C11.6461 2.44587 11.6482 2.35557 11.7553 2.29085L12.531 3.57467C13.0342 3.27065 13.196 2.71398 13.1368 2.27627C13.0754 1.82126 12.7166 1.25 12 1.25V2.75ZM21.7092 12.2447C21.6444 12.3518 21.5541 12.3539 21.523 12.3497C21.4976 12.3462 21.4347 12.3314 21.3683 12.2676C21.2899 12.1923 21.25 12.0885 21.25 12H22.75C22.75 11.2834 22.1787 10.9246 21.7237 10.8632C21.286 10.804 20.7293 10.9658 20.4253 11.469L21.7092 12.2447Z"
                        fill="currentColor"
                    />
                </svg>
            ),
        },
        {
            value: 'system',
            label: 'System',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* SVG untuk tema system */}
                    <path
                        opacity="0.5"
                        d="M7.142 18.9706C5.18539 18.8995 3.99998 18.6568 3.17157 17.8284C2 16.6569 2 14.7712 2 11C2 7.22876 2 5.34315 3.17157 4.17157C4.34315 3 6.22876 3 10 3H14C17.7712 3 19.6569 3 20.8284 4.17157C22 5.34315 22 7.22876 22 11C22 14.7712 22 16.6569 20.8284 17.8284C20.0203 18.6366 18.8723 18.8873 17 18.965"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                    <path
                        d="M9.94955 16.0503C10.8806 15.1192 11.3461 14.6537 11.9209 14.6234C11.9735 14.6206 12.0261 14.6206 12.0787 14.6234C12.6535 14.6537 13.119 15.1192 14.0501 16.0503C16.0759 18.0761 17.0888 19.089 16.8053 19.963C16.7809 20.0381 16.7506 20.1112 16.7147 20.1815C16.2973 21 14.8648 21 11.9998 21C9.13482 21 7.70233 21 7.28489 20.1815C7.249 20.1112 7.21873 20.0381 7.19436 19.963C6.91078 19.089 7.92371 18.0761 9.94955 16.0503Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                    />
                </svg>
            ),
        },
    ];

    // Navigation options
    const navOptions = [
        { value: 'horizontal', label: 'Horizontal' },
        { value: 'vertical', label: 'Vertical' },
        { value: 'collapsible-vertical', label: 'Collapsible' },
    ];

    // Layout options
    const layoutOptions = [
        { value: 'boxed-layout', label: 'Box' },
        { value: 'full', label: 'Full' },
    ];

    // Direction options
    const directionOptions = [
        { value: 'ltr', label: 'LTR' },
        { value: 'rtl', label: 'RTL' },
    ];

    // Navbar options
    const navbarOptions = [
        { value: 'navbar-sticky', label: 'Sticky' },
        { value: 'navbar-floating', label: 'Floating' },
        { value: 'navbar-static', label: 'Static' },
    ];

    // Animation options
    const animationOptions = [
        { value: '', label: 'None' },
        { value: 'animate__fadeIn', label: 'Fade' },
        { value: 'animate__fadeInDown', label: 'Fade Down' },
        { value: 'animate__fadeInUp', label: 'Fade Up' },
        { value: 'animate__fadeInLeft', label: 'Fade Left' },
        { value: 'animate__fadeInRight', label: 'Fade Right' },
        { value: 'animate__slideInDown', label: 'Slide Down' },
        { value: 'animate__slideInLeft', label: 'Slide Left' },
        { value: 'animate__slideInRight', label: 'Slide Right' },
        { value: 'animate__zoomIn', label: 'Zoom In' },
    ];

    return (
        <div>
            {/* Bagian Header */}
            <div className="flex items-center justify-between mb-5">
                <h5 className="font-semibold text-lg dark:text-white-light">{t('Settings')}</h5>
            </div>

            {/* Navigasi Tab */}
            <div>
                <ul className="sm:flex font-semibold border-b border-[#ebedf2] dark:border-[#191e3a] mb-5 whitespace-nowrap overflow-y-auto">
                    {/* Tab Pengaturan Umum */}
                    <li className="inline-block">
                        <button
                            onClick={() => toggleTabs('home')}
                            className={`flex gap-2 p-4 border-b border-transparent hover:border-primary hover:text-primary ${tabs === 'home' ? '!border-primary text-primary' : ''}`}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                {/* Ikon SVG untuk tab Umum */}
                            </svg>
                            {t('General')}
                        </button>
                    </li>

                    {/* Tab Pengaturan Profil */}
                    <li className="inline-block">
                        <button
                            onClick={() => toggleTabs('payment-details')}
                            className={`flex gap-2 p-4 border-b border-transparent hover:border-primary hover:text-primary ${tabs === 'payment-details' ? '!border-primary text-primary' : ''}`}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                {/* Ikon SVG untuk tab Profil */}
                            </svg>
                            {t('Profile')}
                        </button>
                    </li>

                    {/* Tab Ganti Password */}
                    <li className="inline-block">
                        <button
                            onClick={() => toggleTabs('preferences')}
                            className={`flex gap-2 p-4 border-b border-transparent hover:border-primary hover:text-primary ${tabs === 'preferences' ? '!border-primary text-primary' : ''}`}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                {/* Ikon SVG untuk tab Password */}
                            </svg>
                            {t('Change Password')}
                        </button>
                    </li>

                    {/* Tab Pengaturan Tema */}
                    <li className="inline-block">
                        <button
                            onClick={() => toggleTabs('theme-settings')}
                            className={`flex gap-2 p-4 border-b border-transparent hover:border-primary hover:text-primary ${tabs === 'theme-settings' ? '!border-primary text-primary' : ''}`}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                {/* Ikon SVG untuk tab Tema */}
                            </svg>
                            {t('Theme Setting')}
                        </button>
                    </li>
                </ul>
            </div>

            {/* Konten Tab */}
            
            {/* Konten Pengaturan Umum */}
            {tabs === 'home' ? (
                <div className="space-y-8">
                    <form onSubmit={handleSubmit}>
                        <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
                            <h2 className="text-xl">{t('General')}</h2>
                            <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                                <div className="relative">
                                    <div className="flex items-center gap-2">
                                        <button type="submit" className="btn btn-primary">
                                            {t('Save')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bagian Pengaturan Email */}
                        <div className="panel">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-xl font-semibold">{t('Email Settings')}</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Pengaturan Server Mail */}
                                <div className="space-y-5">
                                    <h3 className="text-lg font-medium text-primary">{t('Mail Server')}</h3>

                                    {/* Input Mail Driver */}
                                    <div>
                                        <label htmlFor="mail_mailer" className="block mb-2">
                                            {t('Mail Driver')} <span className="text-danger">*</span>
                                        </label>
                                        <select id="mail_mailer" className="form-select" value={values.mail_mailer} onChange={handleChange}>
                                            <option value="smtp">SMTP</option>
                                            <option value="sendmail">Sendmail</option>
                                            <option value="mailgun">Mailgun</option>
                                            <option value="ses">Amazon SES</option>
                                        </select>
                                    </div>

                                    {/* Input Mail Host */}
                                    <div>
                                        <label htmlFor="mail_host" className="block mb-2">
                                            {t('Mail Host')} <span className="text-danger">*</span>
                                        </label>
                                        <input id="mail_host" type="text" className="form-input" value={values.mail_host} onChange={handleChange} />
                                        {errors.mail_host && touched.mail_host && typeof errors.mail_host === 'string' && <div className="text-danger mt-1">{errors.mail_host}</div>}
                                    </div>

                                    {/* Input Mail Port */}
                                    <div>
                                        <label htmlFor="mail_port" className="block mb-2">
                                            {t('Mail Port')} <span className="text-danger">*</span>
                                        </label>
                                        <input id="mail_port" type="text" className="form-input" value={values.mail_port} onChange={handleChange} />
                                        {errors.mail_port && touched.mail_port && typeof errors.mail_port === 'string' && <div className="text-danger mt-1">{errors.mail_port}</div>}
                                    </div>

                                    {/* Pilihan Enkripsi */}
                                    <div>
                                        <label htmlFor="mail_encryption" className="block mb-2">
                                            {t('Encryption')} <span className="text-danger">*</span>
                                        </label>
                                        <select id="mail_encryption" className="form-select" value={values.mail_encryption} onChange={handleChange}>
                                            <option value="tls">TLS</option>
                                            <option value="ssl">SSL</option>
                                            <option value="">None</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Pengaturan Akun Mail */}
                                <div className="space-y-5">
                                    <h3 className="text-lg font-medium text-primary">{t('Mail Account')}</h3>

                                    {/* Input Username Mail */}
                                    <div>
                                        <label htmlFor="mail_username" className="block mb-2">
                                            {t('Mail Username')} <span className="text-danger">*</span>
                                        </label>
                                        <input id="mail_username" type="text" className="form-input" value={values.mail_username} onChange={handleChange} />
                                        {errors.mail_username && touched.mail_username && typeof errors.mail_username === 'string' && <div className="text-danger mt-1">{errors.mail_username}</div>}
                                    </div>

                                    {/* Input Password Mail */}
                                    <div>
                                        <label htmlFor="mail_password" className="block mb-2">
                                            {t('Mail Password')} <span className="text-danger">*</span>
                                        </label>
                                        <input id="mail_password" type="password" className="form-input" value={values.mail_password} onChange={handleChange} />
                                        {errors.mail_password && touched.mail_password && typeof errors.mail_password === 'string' && <div className="text-danger mt-1">{errors.mail_password}</div>}
                                    </div>
                                </div>

                                {/* Pengaturan Pengirim Mail */}
                                <div className="space-y-5">
                                    <h3 className="text-lg font-medium text-primary">{t('Mail From')}</h3>

                                    {/* Input Alamat Pengirim */}
                                    <div>
                                        <label htmlFor="mail_from_address" className="block mb-2">
                                            {t('From Address')} <span className="text-danger">*</span>
                                        </label>
                                        <input id="mail_from_address" type="email" className="form-input" value={values.mail_from_address} onChange={handleChange} />
                                        {errors.mail_from_address && touched.mail_from_address && typeof errors.mail_from_address === 'string' && (
                                            <div className="text-danger mt-1">{errors.mail_from_address}</div>
                                        )}
                                    </div>

                                    {/* Input Nama Pengirim */}
                                    <div>
                                        <label htmlFor="mail_from_name" className="block mb-2">
                                            {t('From Name')} <span className="text-danger">*</span>
                                        </label>
                                        <input id="mail_from_name" type="text" className="form-input" value={values.mail_from_name} onChange={handleChange} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bagian Pengaturan Kuota */}
                        <div className="panel mt-8">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-xl font-semibold">{t('Price Quota Subscription')}</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Input Kuota Transaksi */}
                                <div>
                                    <label htmlFor="quota_transactions" className="block mb-2">
                                        {t('Price Transaction')} <span className="text-danger">*</span>
                                    </label>
                                    <input id="quota_transactions" type="number" min="1" className="form-input" value={values.quota_transactions} onChange={handleChange} />
                                    {errors.quota_transactions && touched.quota_transactions && typeof errors.quota_transactions === 'string' && (
                                        <div className="text-danger mt-1">{errors.quota_transactions}</div>
                                    )}
                                </div>

                                {/* Input Kuota Produk */}
                                <div>
                                    <label htmlFor="quota_products" className="block mb-2">
                                        {t('Price Product')} <span className="text-danger">*</span>
                                    </label>
                                    <input id="quota_products" type="number" min="1" className="form-input" value={values.quota_products} onChange={handleChange} />
                                    {errors.quota_products && touched.quota_products && typeof errors.quota_products === 'string' && <div className="text-danger mt-1">{errors.quota_products}</div>}
                                </div>

                                {/* Input Kuota Karyawan */}
                                <div>
                                    <label htmlFor="quota_employees" className="block mb-2">
                                        {t('Price Employee')} <span className="text-danger">*</span>
                                    </label>
                                    <input id="quota_employees" type="number" min="1" className="form-input" value={values.quota_employees} onChange={handleChange} />
                                    {errors.quota_employees && touched.quota_employees && typeof errors.quota_employees === 'string' && (
                                        <div className="text-danger mt-1">{errors.quota_employees}</div>
                                    )}
                                </div>

                                {/* Input Kuota Toko */}
                                <div>
                                    <label htmlFor="quota_stores" className="block mb-2">
                                        {t('Price Store')} <span className="text-danger">*</span>
                                    </label>
                                    <input id="quota_stores" type="number" min="1" className="form-input" value={values.quota_stores} onChange={handleChange} />
                                    {errors.quota_stores && touched.quota_stores && typeof errors.quota_stores === 'string' && <div className="text-danger mt-1">{errors.quota_stores}</div>}
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            ) : null}

            {/* Konten Pengaturan Profil */}
            {tabs === 'payment-details' ? (
                <div>
                    <form onSubmit={handleSubmit2}>
                        <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
                            <h2 className="text-xl">{t('Profile')}</h2>
                            <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                                <div className="relative">
                                    <div className="flex items-center gap-2">
                                        <button type="submit" className="btn btn-primary">
                                            {t('Save')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="grid lg:grid-cols-6 grid-cols-1 gap-6">
                            {/* Bagian Upload Foto Profil */}
                            <div className="col-span-1 lg:col-span-2">
                                <div className="panel" id="single_file">
                                    <div className="mb-5">
                                        <div className="custom-file-container" data-upload-id="myFirstImage">
                                            <div className="label-container">
                                                <label>Upload </label>
                                                <button
                                                    type="button"
                                                    className="custom-file-container__image-clear"
                                                    title="Clear Image"
                                                    onClick={() => {
                                                        setImages([]);
                                                    }}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                            <label className="custom-file-container__custom-file"></label>
                                            <input
                                                hidden
                                                id="photo"
                                                name="photo"
                                                type="file"
                                                accept="image/*"
                                                onChange={(event: any) => {
                                                    const file = event.currentTarget.files[0];
                                                    formik2.setFieldValue('photo', file);

                                                    // Set gambar baru untuk pratinjau
                                                    const reader = new FileReader();
                                                    reader.onload = (e) => {
                                                        setImages([{ dataURL: e.target?.result, file }]);
                                                    };
                                                    if (file) reader.readAsDataURL(file);
                                                }}
                                                className="custom-file-container__custom-file__custom-file-input"
                                            />
                                            {formik2.errors.photo && formik2.touched.photo && <div className="text-red-500 text-sm mt-1">{formik2.errors.photo}</div>}
                                            <input type="hidden" name="MAX_FILE_SIZE" value="10485760" />
                                            <ImageUploading value={images} onChange={onChange} maxNumber={maxNumber}>
                                                {({ imageList, onImageUpload, onImageRemoveAll, onImageUpdate, onImageRemove, isDragging, dragProps }) => (
                                                    <div className="upload__image-wrapper">
                                                        <button
                                                            type="button"
                                                            className="custom-file-container__custom-file__custom-file-control"
                                                            onClick={onImageUpload}
                                                            {...dragProps}
                                                            style={isDragging ? { backgroundColor: '#afafaf' } : undefined}
                                                        >
                                                            Choose File...
                                                        </button>
                                                        {imageList.map((image, index) => (
                                                            <div key={index} className="custom-file-container__image-preview relative">
                                                                <img src={image.dataURL} alt="img" className="m-auto" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </ImageUploading>
                                            {images.length === 0 ? <img src="/assets/images/file-preview.svg" className="max-w-md w-full m-auto" alt="" /> : ''}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Form Data Profil */}
                            <div className="grid lg:grid-cols-1 grid-cols-1 gap-6 col-span-1 lg:col-span-4">
                                <div className="panel" id="forms_grid">
                                    <div className="mb-5">
                                        <div className="space-y-5">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label htmlFor="name">
                                                        {t('Name')}
                                                        <span className="text-danger">*</span>
                                                    </label>
                                                    <input id="name" type="text" placeholder={t('Enter Name')} className="form-input" value={values2.name} onChange={handleChange2} />
                                                    {errors2.name && touched2.name && typeof errors2.name === 'string' && <span className="text-red-500 block mt-2">{errors2.name}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            ) : null}

            {/* Konten Ganti Password */}
            {tabs === 'preferences' ? (
                <div className="switch">
                    <form onSubmit={handleSubmit3}>
                        <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
                            <h2 className="text-xl">{t('Change Password')}</h2>
                            <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                                <div className="relative">
                                    <div className="flex items-center gap-2">
                                        <button type="submit" className="btn btn-primary">
                                            {t('Save')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="grid lg:grid-cols-1 grid-cols-1 gap-6">
                            <div className="panel" id="forms_grid">
                                <div className="mb-5">
                                    <div className="space-y-5">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            {/* Input Password Saat Ini */}
                                            <div>
                                                <label htmlFor="current_password">{t('Current Password')}</label>
                                                <input
                                                    id="current_password"
                                                    type="password"
                                                    placeholder={t('Enter Current Password')}
                                                    className="form-input"
                                                    value={values3.current_password}
                                                    onChange={handleChange3}
                                                />
                                                {errors3.current_password && touched3.current_password && <span className="text-red-500">{errors3.current_password}</span>}
                                            </div>

                                            {/* Input Password Baru */}
                                            <div>
                                                <label htmlFor="new_password">{t('New Password')}</label>
                                                <input
                                                    id="new_password"
                                                    type="password"
                                                    placeholder={t('Enter New Password')}
                                                    className="form-input"
                                                    value={values3.new_password}
                                                    onChange={handleChange3}
                                                />
                                                {errors3.new_password && touched3.new_password && <span className="text-red-500">{errors3.new_password}</span>}
                                            </div>

                                            {/* Konfirmasi Password Baru */}
                                            <div>
                                                <label htmlFor="new_password_confirmation">{t('New Password Confirm')}</label>
                                                <input
                                                    id="new_password_confirmation"
                                                    type="password"
                                                    placeholder={t('Enter New Password Confirm')}
                                                    className="form-input"
                                                    value={values3.new_password_confirmation}
                                                    onChange={handleChange3}
                                                />
                                                {errors3.new_password_confirmation && touched3.new_password_confirmation && <span className="text-red-500">{errors3.new_password_confirmation}</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            ) : null}

            {/* Konten Pengaturan Tema */}
            {tabs === 'theme-settings' ? (
                <div className="switch">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                        {/* Panel Pemilihan Tema */}
                        <div className="panel space-y-5">
                            <h5 className="font-semibold text-lg mb-4">Color Scheme</h5>
                            <div className="flex justify-around">
                                {themeOptions.map((option) => (
                                    <div key={option.value} className="flex">
                                        <label className="inline-flex cursor-pointer">
                                            <input
                                                type="radio"
                                                className="form-radio ltr:mr-4 rtl:ml-4 cursor-pointer"
                                                name="theme-radio"
                                                checked={themeConfig.theme === option.value}
                                                onChange={() => dispatch(toggleTheme(option.value))}
                                            />
                                            <span className="flex flex-col items-center">
                                                {option.icon}
                                                <span className="mt-2">{option.label}</span>
                                            </span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Toggle Mode Semi Gelap */}
                        <div className="panel space-y-5">
                            <h5 className="font-semibold text-lg mb-4">Dark Mode Settings</h5>
                            <label className="flex items-center justify-between cursor-pointer">
                                <span>Semi Dark (Sidebar & Header)</span>
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer"
                                        checked={themeConfig.semidark === true || themeConfig.semidark === 'true'}
                                        onChange={(e) => dispatch(toggleSemidark(e.target.checked))}
                                    />
                                    <span className="bg-[#ebedf2] dark:bg-dark block h-6 w-12 rounded-full before:absolute before:left-1 before:bg-white dark:before:bg-white-dark before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:bg-primary before:transition-all before:duration-300"></span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* Posisi Navigasi */}
                        <div className="panel space-y-5">
                            <h5 className="font-semibold text-lg mb-4">Navigation Position</h5>
                            <div className="space-y-2">
                                {navOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        className={`w-full btn ${themeConfig.menu === option.value ? 'btn-primary' : 'btn-outline-primary'}`}
                                        onClick={() => dispatch(toggleMenu(option.value))}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Gaya Layout */}
                        <div className="panel space-y-5">
                            <h5 className="font-semibold text-lg mb-4">Layout Style</h5>
                            <div className="space-y-2">
                                {layoutOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        className={`w-full btn ${themeConfig.layout === option.value ? 'btn-primary' : 'btn-outline-primary'}`}
                                        onClick={() => dispatch(toggleLayout(option.value))}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Arah Tampilan */}
                        <div className="panel space-y-5">
                            <h5 className="font-semibold text-lg mb-4">Direction</h5>
                            <div className="space-y-2">
                                {directionOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        className={`w-full btn ${themeConfig.rtlClass === option.value ? 'btn-primary' : 'btn-outline-primary'}`}
                                        onClick={() => dispatch(toggleRTL(option.value))}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Jenis Navbar */}
                        <div className="panel space-y-5">
                            <h5 className="font-semibold text-lg mb-4">Navbar Type</h5>
                            <div className="space-y-3">
                                {navbarOptions.map((option) => (
                                    <label key={option.value} className="flex items-center justify-between cursor-pointer">
                                        <span>{option.label}</span>
                                        <input
                                            type="radio"
                                            name="navbar-type"
                                            className="form-radio"
                                            checked={themeConfig.navbar === option.value}
                                            onChange={() => dispatch(toggleNavbar(option.value))}
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Transisi Router */}
                        <div className="panel space-y-5">
                            <h5 className="font-semibold text-lg mb-4">Router Transition</h5>
                            <select className="form-select w-full" value={themeConfig.animation} onChange={(e) => dispatch(toggleAnimation(e.target.value))}>
                                {animationOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Reset Pengaturan */}
                        <div className="panel space-y-5">
                            <h5 className="font-semibold text-lg mb-4">Reset Settings</h5>
                            <p>Reset all settings to default values</p>
                            <button
                                type="button"
                                className="btn btn-danger w-full"
                                onClick={() => {
                                    // Fungsi reset ke pengaturan default
                                    dispatch(toggleTheme('light'));
                                    dispatch(toggleMenu('vertical'));
                                    dispatch(toggleLayout('full'));
                                    dispatch(toggleRTL('ltr'));
                                    dispatch(toggleNavbar('navbar-sticky'));
                                    dispatch(toggleAnimation(''));
                                    dispatch(toggleSemidark(false));
                                }}
                            >
                                Reset to Default
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default Settings;
