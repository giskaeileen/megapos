import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { setPageTitle } from '../../store/themeConfigSlice';
import { useDispatch } from 'react-redux';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { useGetSingleStoreQuery, useStoreStoresMutation, useUpdateStoresMutation } from '../../redux/features/stores/storesApi';
import FormImage from '../../components/FormImage';
import { generateSlug } from '../../components/tools';
import { useLoadUserQuery } from '../../redux/features/auth/authApi';

const StoresForm= () => {
// Import hook untuk navigasi dan parameter URL
const navigate = useNavigate();
const { id } = useParams();  // Mengambil ID dari URL

// Mengambil data store berdasarkan ID (hanya dijalankan jika ada ID)
const { data } = useGetSingleStoreQuery(id, { skip: !id });

// Hook mutation untuk update store
const [updateStores, { data:dataUpdate, isSuccess: isUpdateSuccess, error: errorUpdate }] = useUpdateStoresMutation();

// Hook mutation untuk membuat store baru
const [storeStores , {
    data: dataStore, 
    error: errorStore, 
    isSuccess: isSuccessStore 
}] = useStoreStoresMutation();

// Refetch user (dipanggil ulang setelah sukses menyimpan)
const { refetch: loadUser } = useLoadUserQuery(undefined, { refetchOnMountOrArgChange: true });
// const [loadUser] = useLazyLoadUserQuery() // alternatif lain (tidak digunakan)

// ===============================
// * TOOLS 
// ===============================

// Mengambil informasi lokasi URL saat ini
const location = useLocation();

// Memecah URL path menjadi array, lalu ambil entity dari bagian pertama path
const pathnames = location.pathname.split('/').filter((x) => x);
const entity = pathnames[0]; // Misal: store, user, dll

// Dispatch Redux
const dispatch = useDispatch();

// Set judul halaman di state global (untuk layout misalnya)
useEffect(() => {
    dispatch(setPageTitle('File Upload Preview'));
}, []);  // Kosong berarti hanya dijalankan sekali saat komponen mount

// Fungsi untuk kapitalisasi huruf pertama (contoh: untuk label)
function capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ===============================
// * VALIDATION (YUP)
// ===============================

// Skema validasi menggunakan Yup
const schema = Yup.object().shape({
    name: Yup.string()
        .required("Name is required"),
        // .matches(/^[a-zA-Z\s]*$/, "Name can only contain letters and spaces"),
    address: Yup.string()
        .required("Address is required"),  
    photo: Yup.mixed()
        // .required("Image is required")
        .test("fileType", "Unsupported File Format", (value) =>
            value ? ["image/jpg", "image/jpeg", "image/png"].includes(value.type) : true
        )
        .test("fileSize", "File Size is too large. Maximum size is 1MB", (value) =>
            value ? value.size <= 1024 * 1024 : true  // 1024 KB = 1 MB
        ),
});

// ===============================
// * FORM DATA (FORMIK)
// ===============================

// Inisialisasi dan konfigurasi Formik
const formik = useFormik({
    enableReinitialize: true, // Memperbarui nilai awal jika 'data' berubah
    initialValues: {
        name: data?.name || '',
        slug: data?.slug || '',
        country: data?.country || '',
        state: data?.state || '',
        city: data?.city || '',
        zip: data?.zip || '',
        address: data?.address || '',
        photo: null, // Gambar belum dipilih
    },
    validationSchema: schema, // Validasi menggunakan Yup
    onSubmit: async (values) => {
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("slug", values.slug);
        formData.append("country", values.country);
        formData.append("state", values.state);
        formData.append("city", values.city);
        formData.append("zip", values.zip);
        formData.append("address", values.address);

        if (values.photo) {
            formData.append("photo", values.photo); // Hanya tambahkan jika ada foto
        }

        if (id) {
            // Update data jika ada ID
            formData.append("_method", "PUT");
            await updateStores({id, data: formData});
        } else {
            // Buat baru jika tidak ada ID
            await storeStores(formData);
        }
    }
});

// Destructuring fungsi dari formik agar mudah dipakai
const { values, errors, touched, handleChange, handleSubmit } = formik;

// ===============================
// * IMAGE PREVIEW 
// ===============================

// State untuk menyimpan gambar preview
const [images, setImages] = useState<any>([]);

// Jika ada data & ada foto dari database, tampilkan sebagai preview
useEffect(() => {
    if (data && data.photo) {
        const initialImage = {
            dataURL: `${import.meta.env.VITE_SERVER_URI_BASE}storage/${entity}/${data.photo}`, // Path lengkap gambar dari server
            file: null, 
        };
        setImages([initialImage]); // Set ke state images
    }
}, [data]);  // Berjalan saat data dari server berubah

// ===============================
// * STATUS HANDLER
// ===============================

// Menangani hasil dari aksi sukses atau gagal
useEffect(() => {
    // Jika berhasil create store baru
    if (isSuccessStore) {
        toast.success("Create Successfully");
        loadUser();  // Perbarui data user
        navigate(`/${entity}/${dataStore?.slug}`); // Navigasi ke halaman detail store
    }

    // Jika berhasil update store
    if (isUpdateSuccess) {
        toast.success("Update Successfully");
        loadUser();
        navigate(`/${entity}/${dataUpdate?.slug}`);
    }

    // Jika gagal saat create
    if (errorStore) {
        const errorData = errorStore as any;
        toast.error(errorData.data.message);
    }

    // Jika gagal saat update
    if (errorUpdate) {
        const errorData = errorUpdate as any;
        toast.error(errorData.data.message);
    }
}, [isSuccessStore, isUpdateSuccess, errorStore, errorUpdate]);  // Semua status sebagai dependency

    return (
    // Form utama yang akan memanggil handleSubmit dari Formik saat disubmit
    <form onSubmit={handleSubmit} >
        {/* Header form: judul dan tombol simpan */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
            {/* Menampilkan judul dari halaman, dikapitalisasi dari entity */}
            <h2 className="text-xl">{capitalizeFirstLetter(entity)}</h2>

            {/* Tombol simpan */}
            <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                <div className="relative">
                    <div className="flex items-center gap-2">
                        <button type="submit" className="btn btn-primary">
                            Save 
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Layout grid utama untuk form dan gambar */}
        <div className="grid lg:grid-cols-6 grid-cols-1 gap-6">
            {/* Kolom untuk upload gambar */}
            <div className="col-span-1 lg:col-span-2">
                <div className="panel" id="single_file">
                    {/* Komponen custom untuk upload & preview gambar */}
                    <FormImage setImages={setImages} formik={formik} images={images} />
                </div>
            </div>

            {/* Kolom untuk form isian */}
            <div className="grid lg:grid-cols-1 grid-cols-1 gap-6 col-span-1 lg:col-span-4">
                <div className="panel" id="forms_grid">
                    <div className="mb-5">
                        <div className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* FIELD: Name */}
                                <div>
                                    <label htmlFor="name">Name<span className="text-danger">*</span></label>
                                    <input
                                        id="name"
                                        type="text"
                                        placeholder="Enter Name"
                                        className="form-input"
                                        value={values.name}
                                        // Saat input berubah, update nilai dan juga generate slug otomatis
                                        onChange={(e) => {
                                            handleChange(e); // Formik handle
                                            formik.setFieldValue('slug', generateSlug(e.target.value)); // Buat slug otomatis
                                        }}
                                    />
                                    {/* Menampilkan error jika ada kesalahan dan field sudah disentuh */}
                                    {errors.name && touched.name && typeof errors.name === 'string' && (
                                        <span className="text-red-500 block mt-2">{errors.name}</span>
                                    )}
                                </div>

                                {/* FIELD: Slug (auto generate, tidak bisa diubah manual) */}
                                <div>
                                    <label htmlFor="slug">Slug<span className="text-danger">*</span></label>
                                    <input
                                        id="slug"
                                        type="text"
                                        placeholder="Enter Slug"
                                        className="form-input pointer-events-none bg-[#eee] dark:bg-[#1b2e4b] cursor-not-allowed"
                                        readOnly
                                        value={values.slug}
                                    />
                                    {errors.slug && touched.slug && typeof errors.slug === 'string' && (
                                        <span className="text-red-500 block mt-2">{errors.slug}</span>
                                    )}
                                </div>

                                {/* FIELD: Country */}
                                <div>
                                    <label htmlFor="country">Country<span className="text-danger">*</span></label>
                                    <input
                                        id="country"
                                        type="text"
                                        placeholder="Enter Country"
                                        className="form-input"
                                        value={values.country}
                                        onChange={handleChange}
                                    />
                                    {errors.country && touched.country && typeof errors.country === 'string' && (
                                        <span className="text-red-500 block mt-2">{errors.country}</span>
                                    )}
                                </div>

                                {/* FIELD: State */}
                                <div>
                                    <label htmlFor="state">State<span className="text-danger">*</span></label>
                                    <input
                                        id="state"
                                        type="text"
                                        placeholder="Enter State"
                                        className="form-input"
                                        value={values.state}
                                        onChange={handleChange}
                                    />
                                    {errors.state && touched.state && typeof errors.state === 'string' && (
                                        <span className="text-red-500 block mt-2">{errors.state}</span>
                                    )}
                                </div>

                                {/* FIELD: City */}
                                <div>
                                    <label htmlFor="city">City<span className="text-danger">*</span></label>
                                    <input
                                        id="city"
                                        type="text"
                                        placeholder="Enter City"
                                        className="form-input"
                                        value={values.city}
                                        onChange={handleChange}
                                    />
                                    {errors.city && touched.city && typeof errors.city === 'string' && (
                                        <span className="text-red-500 block mt-2">{errors.city}</span>
                                    )}
                                </div>

                                {/* FIELD: ZIP Code */}
                                <div>
                                    <label htmlFor="zip">ZIP<span className="text-danger">*</span></label>
                                    <input
                                        id="zip"
                                        type="text"
                                        placeholder="Enter ZIP"
                                        className="form-input"
                                        value={values.zip}
                                        onChange={handleChange}
                                    />
                                    {errors.zip && touched.zip && typeof errors.zip === 'string' && (
                                        <span className="text-red-500 block mt-2">{errors.zip}</span>
                                    )}
                                </div>

                                {/* FIELD: Address */}
                                <div>
                                    <label htmlFor="address">Address<span className="text-danger">*</span></label>
                                    <input
                                        id="address"
                                        type="text"
                                        placeholder="Enter Address"
                                        className="form-input"
                                        value={values.address}
                                        onChange={handleChange}
                                    />
                                    {errors.address && touched.address && typeof errors.address === 'string' && (
                                        <span className="text-red-500 block mt-2">{errors.address}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </form>

    );
};

export default StoresForm;