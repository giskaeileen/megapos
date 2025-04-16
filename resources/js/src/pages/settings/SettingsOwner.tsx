import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { setPageTitle, toggleAnimation, toggleLayout, toggleMenu, toggleNavbar, toggleRTL, toggleSemidark, toggleTheme } from '../../store/themeConfigSlice';
import { useGetSettingsQuery, useGetUserLoginQuery, useSetMultiStoreMutation, useUpdateSettingsMutation } from '../../redux/features/settings/settingsApi';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { userLoggedOut } from '../../redux/features/auth/authSlice';
import Swal from 'sweetalert2';
import { capitalizeFirstLetter } from '../../components/tools';
import ImageUploading, { ImageListType } from 'react-images-uploading';
import { useChangePasswordMutation, useGetProfileQuery, useUpdateProfileMutation } from '../../redux/features/profile/profileApi';
import { useTranslation } from 'react-i18next';
import { useLoadUserQuery } from '../../redux/features/auth/authApi';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../redux/store';

const SettingsOwner = () => {
 /**
 * Komponen Halaman Pengaturan Akun
 * 
 * Komponen ini menangani berbagai pengaturan akun pengguna termasuk:
 * - Pengaturan profil (nama, foto)
 * - Perubahan password
 * - Pengaturan tema antarmuka
 * - Pengaturan multi-toko
 * 
 * Menggunakan Formik untuk manajemen form dan Yup untuk validasi
 */
const { data: dataUser, refetch: loadUser } = useLoadUserQuery(undefined, { 
    // Hook untuk mengambil data user dengan auto-refresh saat komponen dimount
    refetchOnMountOrArgChange: true 
});

const dispatch = useDispatch();
useEffect(() => {
    // Set judul halaman saat komponen dimount
    dispatch(setPageTitle('Account Setting'));
});

// State untuk tab aktif
const [tabs, setTabs] = useState<string>('payment-details');
const toggleTabs = (name: string) => {
    // Fungsi untuk mengganti tab
    setTabs(name);
};

// Hook untuk mengambil data user login
const { data } = useGetUserLoginQuery({});

// Hook untuk mutasi data
const [updateProfile, { isSuccess: isUpdateSuccessProfile, error: errorUpdateProfile }] = useUpdateProfileMutation();
const [changePassword, { isSuccess: isUpdateSuccessChangePassword, error: errorUpdateChangePassword }] = useChangePasswordMutation();
const [setMultiStore, { isSuccess: isUpdateSuccess, error: errorUpdate }] = useSetMultiStoreMutation();

/*****************************
 * Validasi Form Multi Store
 */
const schema = Yup.object().shape({});

/*****************************
 * Form Multi Store
 */
const formik = useFormik({
    enableReinitialize: true,  // Auto update form ketika initialValues berubah
    initialValues: {
        multi_store: data?.user?.multi_store || 0,  // Nilai default dari data user
    },
    validationSchema: schema,
    onSubmit: async (values) => {
        // Handler submit form
        const formData = new FormData();
        formData.append('multi_store', values.multi_store ? '1' : '0');
        await setMultiStore(formData);
    },
});

const { values, errors, touched, handleChange, handleSubmit, setFieldValue } = formik;

/*****************************
 * Handle Logout
 */
const navigate = useNavigate();

const handleLogout = () => {
    // Fungsi untuk logout user
    dispatch(userLoggedOut());
    navigate('/login');
};

// Effect untuk menangani hasil update multi store
useEffect(() => {
    if (isUpdateSuccess) {
        // Tampilkan notifikasi sukses dan logout
        Swal.fire({
            icon: 'success',
            title: 'Update Successful',
            text: 'Your data has been successfully updated. You must login again!',
        }).then(() => {
            handleLogout();
        });
    }
    if (errorUpdate) {
        // Tampilkan error jika update gagal
        const errorData = errorUpdate as any;
        toast.error('error');
    }
}, [isUpdateSuccess, errorUpdate]);

/*****************************
 * Validasi Form Profil
 */
const schema2 = Yup.object().shape({
    name: Yup.string()
        .required('Name is required')
        .matches(/^[a-zA-Z\s]*$/, 'Name can only contain letters and spaces'),
    photo: Yup.mixed()
        .test('fileType', 'Unsupported File Format', (value) => 
            value ? ['image/jpg', 'image/jpeg', 'image/png'].includes(value.type) : true)
        .test('fileSize', 'File Size is too large. Maximum size is 1MB', 
            (value) => (value ? value.size <= 1024 * 1024 : true))
});

/*****************************
 * Form Profil
 */
const { data: profile } = useGetProfileQuery({});

const formik2 = useFormik({
    enableReinitialize: true,
    initialValues: {
        name: profile?.name || '',
        email: profile?.email || '',
        photo: null,
    },
    validationSchema: schema2,
    onSubmit: async (values) => {
        // Handler submit form profil
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

/*****************************
 * Upload Foto Profil
 */
const [images, setImages] = useState<any>([]);
const maxNumber = 69;

const onChange = (imageList: ImageListType, addUpdateIndex: number[] | undefined) => {
    // Handler perubahan gambar
    setImages(imageList as never[]);
    if (imageList.length > 0) {
        formik2.setFieldValue('photo', imageList[0].file);
    } else {
        formik2.setFieldValue('photo', null);
    }
};

// Set gambar profil awal jika ada
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
 * Validasi Form Ganti Password
 */
const schema3 = Yup.object().shape({
    current_password: Yup.string()
        .required('Password is required')
        .min(6, 'Password must be at least 6 characters'),
    new_password: Yup.string()
        .required('New Password is required')
        .min(6, 'New Password must be at least 6 characters'),
    new_password_confirmation: Yup.string()
        .required('Please confirm your password')
        .oneOf([Yup.ref('new_password'), null], 'Passwords must match'),
});

/*****************************
 * Form Ganti Password
 */
const formik3 = useFormik({
    enableReinitialize: true,
    initialValues: {
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    },
    validationSchema: schema3,
    onSubmit: async (values) => {
        // Handler submit form password
        const formData = new FormData();
        formData.append('current_password', values.current_password);
        formData.append('new_password', values.new_password);
        formData.append('new_password_confirmation', values.new_password_confirmation);
        await changePassword(formData);
    },
});

const { values: values3, errors: errors3, touched: touched3, handleChange: handleChange3, handleSubmit: handleSubmit3 } = formik3;

/*****************************
 * Effect untuk Menangani Hasil Mutasi
 */
useEffect(() => {
    // Handle update profil
    if (isUpdateSuccessProfile) {
        toast.success('Update Successfully');
        loadUser(); // Refresh data user
    }
    if (errorUpdateProfile) {
        const errorData = errorUpdateProfile as any;
        if (errorData.data.errors) {
            Object.keys(errorData.data.errors).forEach((key) => {
                formik.setFieldError(key, errorData.data.errors[key][0]);
                toast.error(errorData.data.errors[key][0]);
            });
        }
    }
    
    // Handle ganti password
    if (isUpdateSuccessChangePassword) {
        toast.success('Update Successfully');
    }
    if (errorUpdateChangePassword) {
        const errorData = errorUpdateChangePassword as any;
        toast.error(errorData?.data?.message);
        if (errorData.data.errors) {
            Object.keys(errorData.data.errors).forEach((key) => {
                formik.setFieldError(key, errorData.data.errors[key][0]);
                toast.error(errorData.data.errors[key][0]);
            });
        }
    }
}, [isUpdateSuccessProfile, errorUpdateProfile, isUpdateSuccessChangePassword, errorUpdateChangePassword]);

const { t } = useTranslation();

/*****************************
 * Pengaturan Tema
 */
interface ThemeOption {
    value: string;
    label: string;
    icon: JSX.Element;
}

const themeConfig = useSelector((state: IRootState) => state.themeConfig);

// Opsi tema yang tersedia
const themeOptions: ThemeOption[] = [
    {
        value: 'light',
        label: 'Light',
        icon: (/* Icon SVG untuk tema light */
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        )
    },
    {
        value: 'dark',
        label: 'Dark', 
        icon: (/* Icon SVG untuk tema dark */
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M21.0672 11.8568L20.4253 11.469L21.0672 11.8568ZM12.1432 2.93276L11.7553 2.29085V2.29085L12.1432 2.93276ZM21.25 12C21.25 17.1086 17.1086 21.25 12 21.25V22.75C17.9371 22.75 22.75 17.9371 22.75 12H21.25ZM12 21.25C6.89137 21.25 2.75 17.1086 2.75 12H1.25C1.25 17.9371 6.06294 22.75 12 22.75V21.25ZM2.75 12C2.75 6.89137 6.89137 2.75 12 2.75V1.25C6.06294 1.25 1.25 6.06294 1.25 12H2.75ZM15.5 14.25C12.3244 14.25 9.75 11.6756 9.75 8.5H8.25C8.25 12.5041 11.4959 15.75 15.5 15.75V14.25ZM20.4253 11.469C19.4172 13.1373 17.5882 14.25 15.5 14.25V15.75C18.1349 15.75 20.4407 14.3439 21.7092 12.2447L20.4253 11.469ZM9.75 8.5C9.75 6.41182 10.8627 4.5828 12.531 3.57467L11.7553 2.29085C9.65609 3.5593 8.25 5.86509 8.25 8.5H9.75ZM12 2.75C11.9115 2.75 11.8077 2.71008 11.7324 2.63168C11.6686 2.56527 11.6538 2.50244 11.6503 2.47703C11.6461 2.44587 11.6482 2.35557 11.7553 2.29085L12.531 3.57467C13.0342 3.27065 13.196 2.71398 13.1368 2.27627C13.0754 1.82126 12.7166 1.25 12 1.25V2.75ZM21.7092 12.2447C21.6444 12.3518 21.5541 12.3539 21.523 12.3497C21.4976 12.3462 21.4347 12.3314 21.3683 12.2676C21.2899 12.1923 21.25 12.0885 21.25 12H22.75C22.75 11.2834 22.1787 10.9246 21.7237 10.8632C21.286 10.804 20.7293 10.9658 20.4253 11.469L21.7092 12.2447Z"
                    fill="currentColor"
                />
            </svg>
        )
    },
    {
        value: 'system',
        label: 'System',
        icon: (/* Icon SVG untuk tema system */
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        )
    },
];

// Opsi navigasi
const navOptions = [
    { value: 'horizontal', label: 'Horizontal' },
    { value: 'vertical', label: 'Vertical' },
    { value: 'collapsible-vertical', label: 'Collapsible' },
];

// Opsi layout
const layoutOptions = [
    { value: 'boxed-layout', label: 'Box' },
    { value: 'full', label: 'Full' },
];

// Opsi arah teks
const directionOptions = [
    { value: 'ltr', label: 'LTR' },
    { value: 'rtl', label: 'RTL' },
];

// Opsi navbar
const navbarOptions = [
    { value: 'navbar-sticky', label: 'Sticky' },
    { value: 'navbar-floating', label: 'Floating' },
    { value: 'navbar-static', label: 'Static' },
];

// Opsi animasi
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
            {/* Header section untuk halaman Settings */}
            <div className="flex items-center justify-between mb-5">
                {/* Judul halaman Settings */}
                <h5 className="font-semibold text-lg dark:text-white-light">
                    {t('Settings')} {/* Judul dengan translation */}
                </h5>
            </div>

            {/* Navigation tabs */}
            <div>
                <ul className="sm:flex font-semibold border-b border-[#ebedf2] dark:border-[#191e3a] mb-5 whitespace-nowrap overflow-y-auto">
                    {/*
                    * Tab navigation dengan:
                    * - Tampilan horizontal di desktop (sm:flex)
                    * - Border bottom
                    * - Scroll horizontal jika tidak cukup space
                    */}
                    
                    {/* Tab Profile */}
                    <li className="inline-block">
                        <button
                            onClick={() => toggleTabs('payment-details')}
                            className={`flex gap-2 p-4 border-b border-transparent hover:border-primary hover:text-primary ${
                                tabs === 'payment-details' ? '!border-primary text-primary' : ''
                            }`}
                        >
                            {/* Icon Profile */}
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle opacity="0.5" cx="12" cy="9" r="3" stroke="currentColor" strokeWidth="1.5" />
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                                <path
                                    opacity="0.5"
                                    d="M17.9691 20C17.81 17.1085 16.9247 15 11.9999 15C7.07521 15 6.18991 17.1085 6.03076 20"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                />
                            </svg>

                            {t('Profile')} {/* Label dengan translation */}
                        </button>
                    </li>

                    {/* Tab Change Password */}
                    <li className="inline-block">
                        <button
                            onClick={() => toggleTabs('preferences')}
                            className={`flex gap-2 p-4 border-b border-transparent hover:border-primary hover:text-primary ${
                                tabs === 'preferences' ? '!border-primary text-primary' : ''
                            }`}
                        >
                            {/* Icon Password */}
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    opacity="0.5"
                                    d="M3.17157 18.8284C4.34315 20 6.22876 20 10 20H12L15 19.9991C18.1143 19.99 19.7653 19.8915 20.8284 18.8284C22 17.6569 22 15.7712 22 12C22 8.22876 22 6.34315 20.8284 5.17157C19.7653 4.10848 18.1143 4.01004 15 4.00093L12 4H10C6.22876 4 4.34315 4 3.17157 5.17157C2 6.34315 2 8.22876 2 12C2 15.7712 2 17.6569 3.17157 18.8284Z"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                />
                                <path d="M9 12C9 12.5523 8.55228 13 8 13C7.44772 13 7 12.5523 7 12C7 11.4477 7.44772 11 8 11C8.55228 11 9 11.4477 9 12Z" fill="currentColor" />
                                <path d="M13 12C13 12.5523 12.5523 13 12 13C11.4477 13 11 12.5523 11 12C11 11.4477 11.4477 11 12 11C12.5523 11 13 11.4477 13 12Z" fill="currentColor" />
                                <path d="M15 2V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>

                            {t('Change Password')} {/* Label dengan translation */}
                        </button>
                    </li>

                    {/* Tab Theme Setting */}
                    <li className="inline-block">
                        <button
                            onClick={() => toggleTabs('theme-settings')}
                            className={`flex gap-2 p-4 border-b border-transparent hover:border-primary hover:text-primary ${
                                tabs === 'theme-settings' ? '!border-primary text-primary' : ''
                            }`}
                        >
                            {/* Icon Theme */}
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M9.5 14C11.1569 14 12.5 15.3431 12.5 17C12.5 18.6568 11.1569 20 9.5 20C7.84315 20 6.5 18.6568 6.5 17C6.5 15.3431 7.84315 14 9.5 14Z"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                />
                                <path
                                    d="M14.5 3.99998C12.8431 3.99998 11.5 5.34312 11.5 6.99998C11.5 8.65683 12.8431 9.99998 14.5 9.99998C16.1569 9.99998 17.5 8.65683 17.5 6.99998C17.5 5.34312 16.1569 3.99998 14.5 3.99998Z"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                />
                                <path opacity="0.5" d="M13 17L22 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                <path opacity="0.5" d="M11 7L2 6.9585" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                <path opacity="0.5" d="M2 17L6 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                <path opacity="0.5" d="M22 7L18 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>

                            {t('Theme Setting')} {/* Label dengan translation */}
                        </button>
                    </li>
                </ul>
            </div>

            {/* Conditional rendering untuk tab Profile */}
            {tabs === 'payment-details' ? (
                <div>
                    <form onSubmit={handleSubmit2}>
                        {/* Header section untuk form profil */}
                        <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
                            {/* Judul halaman */}
                            <h2 className="text-xl">{capitalizeFirstLetter('Profile')}</h2>
                            
                            {/* Container tombol submit responsive */}
                            <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                                <div className="relative">
                                    <div className="flex items-center gap-2">
                                        {/* Tombol simpan data profil */}
                                        <button type="submit" className="btn btn-primary">
                                            Save
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Container utama dengan layout grid responsive */}
                        <div className="grid lg:grid-cols-6 grid-cols-1 gap-6">
                            {/* Kolom untuk upload gambar (lebar 2 kolom di desktop) */}
                            <div className="col-span-1 lg:col-span-2">
                                <div className="panel" id="single_file">
                                    <div className="mb-5">
                                        {/* Container untuk upload file */}
                                        <div className="custom-file-container" data-upload-id="myFirstImage">
                                            {/* Label dan tombol clear */}
                                            <div className="label-container">
                                                <label>Upload </label>
                                                <button
                                                    type="button"
                                                    className="custom-file-container__image-clear"
                                                    title="Clear Image"
                                                    onClick={() => {
                                                        setImages([]); // Reset state gambar
                                                    }}
                                                >
                                                    × {/* Icon close */}
                                                </button>
                                            </div>

                                            {/* Input file yang tersembunyi */}
                                            <label className="custom-file-container__custom-file"></label>
                                            <input
                                                hidden
                                                id="photo"
                                                name="photo"
                                                type="file"
                                                accept="image/*" // Hanya menerima file gambar
                                                onChange={(event: any) => {
                                                    const file = event.currentTarget.files[0];
                                                    formik2.setFieldValue('photo', file); // Set nilai formik

                                                    // Membuat preview gambar
                                                    const reader = new FileReader();
                                                    reader.onload = (e) => {
                                                        setImages([{ dataURL: e.target?.result, file }]);
                                                    };
                                                    if (file) reader.readAsDataURL(file);
                                                }}
                                                className="custom-file-container__custom-file__custom-file-input"
                                            />
                                            
                                            {/* Menampilkan error validasi */}
                                            {formik2.errors.photo && formik2.touched.photo && (
                                                <div className="text-red-500 text-sm mt-1">{formik2.errors.photo}</div>
                                            )}
                                            
                                            {/* Batas maksimal ukuran file */}
                                            <input type="hidden" name="MAX_FILE_SIZE" value="10485760" />
                                            
                                            {/* Komponen untuk upload gambar */}
                                            <ImageUploading value={images} onChange={onChange} maxNumber={maxNumber}>
                                                {({ imageList, onImageUpload, onImageRemoveAll, onImageUpdate, onImageRemove, isDragging, dragProps }) => (
                                                    <div className="upload__image-wrapper">
                                                        {/* Tombol untuk memilih file */}
                                                        <button
                                                            type="button"
                                                            className="custom-file-container__custom-file__custom-file-control"
                                                            onClick={onImageUpload}
                                                            {...dragProps}
                                                            style={isDragging ? { backgroundColor: '#afafaf' } : undefined}
                                                        >
                                                            Choose File...
                                                        </button>
                                                        
                                                        {/* Preview gambar yang diupload */}
                                                        {imageList.map((image, index) => (
                                                            <div key={index} className="custom-file-container__image-preview relative">
                                                                <img src={image.dataURL} alt="img" className="m-auto" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </ImageUploading>
                                            
                                            {/* Menampilkan gambar default jika belum ada gambar */}
                                            {images.length === 0 ? (
                                                <img src="/assets/images/file-preview.svg" className="max-w-md w-full m-auto" alt="" />
                                            ) : ''}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Kolom untuk form data (lebar 4 kolom di desktop) */}
                            <div className="grid lg:grid-cols-1 grid-cols-1 gap-6 col-span-1 lg:col-span-4">
                                <div className="panel" id="forms_grid">
                                    <div className="mb-5">
                                        <div className="space-y-5">
                                            {/* Grid untuk input field */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {/* Input Nama */}
                                                <div>
                                                    <label htmlFor="name">
                                                        Name<span className="text-danger">*</span> {/* Wajib diisi */}
                                                    </label>
                                                    <input 
                                                        id="name" 
                                                        type="text" 
                                                        placeholder="Enter Name" 
                                                        className="form-input" 
                                                        value={values2.name} 
                                                        onChange={handleChange2} 
                                                    />
                                                    {/* Menampilkan error validasi */}
                                                    {errors2.name && touched2.name && typeof errors2.name === 'string' && (
                                                        <span className="text-red-500 block mt-2">{errors2.name}</span>
                                                    )}
                                                </div>
                                                
                                                {/* Input Email (readonly) */}
                                                <div>
                                                    <label htmlFor="email">Email</label>
                                                    <input
                                                        id="email"
                                                        type="email"
                                                        className="form-input pointer-events-none bg-[#eee] dark:bg-[#1b2e4b] cursor-not-allowed"
                                                        readOnly // Tidak bisa diubah
                                                        value={values2.email}
                                                    />
                                                    {/* Menampilkan error validasi */}
                                                    {errors2.email && touched2.email && typeof errors2.email === 'string' && (
                                                        <span className="text-red-500 block mt-2">{errors2.email}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            ) : (
                /* Jika bukan tab preferences, render string kosong */
                ''
            )}
            {/* Conditional rendering untuk tab Change Password */}
            {tabs === 'preferences' ? (
                <div className="switch">
                    {/* Form untuk perubahan password */}
                    <form onSubmit={handleSubmit3}>
                        {/* Header section */}
                        <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
                            {/* Judul form */}
                            <h2 className="text-xl">
                                {capitalizeFirstLetter('Change Password')} {/* Judul dengan huruf pertama kapital */}
                            </h2>
                            
                            {/* Container tombol submit responsive */}
                            <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                                <div className="relative">
                                    <div className="flex items-center gap-2">
                                        {/* Tombol submit */}
                                        <button type="submit" className="btn btn-primary">
                                            Save {/* Tombol simpan */}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Grid layout untuk form input */}
                        <div className="grid lg:grid-cols-1 grid-cols-1 gap-6">
                            {/* Panel form */}
                            <div className="panel" id="forms_grid">
                                <div className="mb-5">
                                    <div className="space-y-5">
                                        {/* Grid input fields */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            {/* Input password saat ini */}
                                            <div>
                                                <label htmlFor="current_password">Current Password</label>
                                                <input
                                                    id="current_password"
                                                    type="password"
                                                    placeholder="Enter Current Password"
                                                    className="form-input"
                                                    value={values3.current_password}
                                                    onChange={handleChange3}
                                                />
                                                {/* Menampilkan error validasi */}
                                                {errors3.current_password && touched3.current_password && (
                                                    <span className="text-red-500">{errors3.current_password}</span>
                                                )}
                                            </div>

                                            {/* Input password baru */}
                                            <div>
                                                <label htmlFor="new_password">New Password</label>
                                                <input
                                                    id="new_password"
                                                    type="password"
                                                    placeholder="Enter New Password"
                                                    className="form-input"
                                                    value={values3.new_password}
                                                    onChange={handleChange3}
                                                />
                                                {/* Menampilkan error validasi */}
                                                {errors3.new_password && touched3.new_password && (
                                                    <span className="text-red-500">{errors3.new_password}</span>
                                                )}
                                            </div>

                                            {/* Konfirmasi password baru */}
                                            <div>
                                                <label htmlFor="new_password_confirmation">New Password Confirm</label>
                                                <input
                                                    id="new_password_confirmation"
                                                    type="password"
                                                    placeholder="Enter New PasswordConfirm"
                                                    className="form-input"
                                                    value={values3.new_password_confirmation}
                                                    onChange={handleChange3}
                                                />
                                                {/* Menampilkan error validasi */}
                                                {errors3.new_password_confirmation && touched3.new_password_confirmation && (
                                                    <span className="text-red-500">{errors3.new_password_confirmation}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            ) : (
                /* Jika bukan tab preferences, render string kosong */
                ''
            )}
            {/* Conditional rendering untuk tab setting tema */}
            {tabs === 'theme-settings' ? (
                <div className="switch">
                    {/* Grid utama untuk pengaturan tema, terdiri dari 2 kolom pada layar besar */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

                        {/* Panel untuk memilih skema warna (tema) */}
                        <div className="panel space-y-5">
                            <h5 className="font-semibold text-lg mb-4">Color Scheme</h5>
                            <div className="flex justify-around">
                                {/* Mapping dari pilihan tema */}
                                {themeOptions.map((option) => (
                                    <div key={option.value} className="flex">
                                        <label className="inline-flex cursor-pointer">
                                            {/* Input radio untuk memilih tema */}
                                            <input
                                                type="radio"
                                                className="form-radio ltr:mr-4 rtl:ml-4 cursor-pointer"
                                                name="theme-radio"
                                                checked={themeConfig.theme === option.value}
                                                onChange={() => dispatch(toggleTheme(option.value))}
                                            />
                                            {/* Ikon dan label tema */}
                                            <span className="flex flex-col items-center">
                                                {option.icon}
                                                <span className="mt-2">{option.label}</span>
                                            </span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Panel untuk mengatur mode semi gelap */}
                        <div className="panel space-y-5">
                            <h5 className="font-semibold text-lg mb-4">Dark Mode Settings</h5>
                            <label className="flex items-center justify-between cursor-pointer">
                                <span>Semi Dark (Sidebar & Header)</span>
                                <div className="relative">
                                    {/* Checkbox custom untuk semi dark mode */}
                                    <input
                                        type="checkbox"
                                        className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer"
                                        checked={themeConfig.semidark === true || themeConfig.semidark === 'true'}
                                        onChange={(e) => dispatch(toggleSemidark(e.target.checked))}
                                    />
                                    {/* Tampilan switch toggle */}
                                    <span className="bg-[#ebedf2] dark:bg-dark block h-6 w-12 rounded-full before:absolute before:left-1 before:bg-white dark:before:bg-white-dark before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:bg-primary before:transition-all before:duration-300"></span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Grid tambahan untuk pengaturan lainnya */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                        {/* Panel untuk memilih posisi navigasi */}
                        <div className="panel space-y-5">
                            <h5 className="font-semibold text-lg mb-4">Navigation Position</h5>
                            <div className="space-y-2">
                                {/* Mapping opsi posisi menu */}
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

                        {/* Panel untuk memilih gaya layout */}
                        <div className="panel space-y-5">
                            <h5 className="font-semibold text-lg mb-4">Layout Style</h5>
                            <div className="space-y-2">
                                {/* Mapping opsi layout */}
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

                        {/* Panel untuk memilih arah tampilan (LTR / RTL) */}
                        <div className="panel space-y-5">
                            <h5 className="font-semibold text-lg mb-4">Direction</h5>
                            <div className="space-y-2">
                                {/* Mapping opsi arah RTL atau LTR */}
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

                        {/* Panel untuk memilih tipe navbar */}
                        <div className="panel space-y-5">
                            <h5 className="font-semibold text-lg mb-4">Navbar Type</h5>
                            <div className="space-y-3">
                                {/* Mapping opsi jenis navbar */}
                                {navbarOptions.map((option) => (
                                    <label key={option.value} className="flex items-center justify-between cursor-pointer">
                                        <span>{option.label}</span>
                                        {/* Radio button untuk memilih jenis navbar */}
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

                        {/* Panel untuk memilih animasi transisi router */}
                        <div className="panel space-y-5">
                            <h5 className="font-semibold text-lg mb-4">Router Transition</h5>
                            {/* Select box untuk memilih animasi transisi */}
                            <select
                                className="form-select w-full"
                                value={themeConfig.animation}
                                onChange={(e) => dispatch(toggleAnimation(e.target.value))}
                            >
                                {animationOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Panel untuk mereset semua pengaturan ke default */}
                        <div className="panel space-y-5">
                            <h5 className="font-semibold text-lg mb-4">Reset Settings</h5>
                            <p>Reset semua pengaturan ke nilai default</p>
                            <button
                                type="button"
                                className="btn btn-danger w-full"
                                onClick={() => {
                                    // Reset semua pengaturan ke nilai awal/default
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
            ) : (
                /* Jika bukan tab preferences, render string kosong */
                ''
            )}

        </div>
    );
};

export default SettingsOwner;
