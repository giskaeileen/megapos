import { useNavigate, useLocation } from 'react-router-dom'; // Navigasi dan akses URL
import { useEffect, useState } from 'react'; // React hook
import { setPageTitle } from '../../store/themeConfigSlice'; // Action Redux untuk set judul halaman
import { useDispatch } from 'react-redux'; // Dispatch action Redux
import * as Yup from 'yup'; // Validasi form
import { useFormik } from 'formik'; // Manajemen form
import toast from 'react-hot-toast'; // Notifikasi
import { useParams } from 'react-router-dom'; // Mengambil parameter URL
import { useGetSingleCategoryQuery, useStoreCategoryMutation, useUpdateCategoryMutation } from '../../redux/features/categories/categoriesApi'; // API hooks untuk kategori

const CategoriesForm= () => {
    /*****************************
     * tools 
     */

    const location = useLocation(); // Mengambil informasi URL
    const pathnames = location.pathname.split('/').filter((x) => x); // Memisahkan URL berdasarkan '/'
    const storeId = pathnames[0]; // Ambil storeId dari URL
    const entity = pathnames[1]; // Ambil entitas dari URL 

    const dispatch = useDispatch(); // Untuk dispatch action redux


    useEffect(() => {
        dispatch(setPageTitle('File Upload Preview')); // Set judul halaman saat komponen dimount
    });

    // Fungsi untuk mengubah huruf pertama string menjadi kapital
    function capitalizeFirstLetter(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Fungsi untuk membuat slug dari nama kategori
    const generateSlug = (text:any) => {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '') // Hapus karakter non-alphanumeric
            .replace(/\s+/g, '-')        // Ganti spasi dengan tanda hubung
            .replace(/-+/g, '-');        // Ganti tanda hubung berulang dengan satu tanda hubung
    };

    /*****************************
     * defenitions 
     */

    const navigate = useNavigate(); // Untuk redirect halaman
    const { id } = useParams(); // Mengambil ID dari URL (edit)
    // Ambil data kategori jika ID tersedia (edit)
    const { data } = useGetSingleCategoryQuery({storeId, id}, { skip: !id });  // Menarik data jika ID ada
    // Mutation untuk update data kategori
    const [updateCategory, { isSuccess: isUpdateSuccess, error: errorUpdate }] = useUpdateCategoryMutation();
    // Mutation untuk menyimpan kategori baru
    const [storeCategory, {
        data: dataStore, 
        error: errorStore, 
        isSuccess: isSuccessStore 
    }] = useStoreCategoryMutation()

    /*****************************
     * validation 
     */

    // Skema validasi dengan Yup
    const schema = Yup.object().shape({
            name: Yup.string()
                .required("Name is required"),
            slug: Yup.string()
                .required("Slug is required"),
        });

    /*****************************
     * form data 
     */

    // Menangani formik
    const formik = useFormik({
        enableReinitialize: true, // Supaya formik bisa update nilai ketika data berubah (edit)
        initialValues: {
            name: data?.name || '', // Jika edit, isi dengan data lama
            slug: data?.slug|| '',
        },
        validationSchema: schema, // Pakai skema validasi Yup
        onSubmit: async (values) => {
            const formData = new FormData(); // FormData untuk kirim data
            formData.append("name", values.name);
            formData.append("slug", values.slug);

            if (id) {
                // Jika sedang edit, tambahkan _method = PUT
                formData.append("_method", "PUT");
                await updateCategory({storeId: storeId, id, data: formData});  // Kirim update
            } else {
                await storeCategory({storeId: storeId, data: formData}); // Kirim create
            }
        }
    });

    // Destructuring Formik untuk digunakan di form
    const { values, errors, touched, handleChange, handleSubmit } = formik;

    /*****************************
     * status 
     */

    useEffect(() => {
        if (isSuccessStore) {
            // Jika create berhasil
            toast.success("Create Successfully")
            navigate(`/${storeId}/${entity}/${dataStore?.id}`);
        }
        if (isUpdateSuccess) {
            // Jika update berhasil
            toast.success("Update Successfully")
        }
        if (errorStore) {
            // Tampilkan error jika gagal simpan
            const errorData = errorStore as any;
            toast.error(errorData.data.message);
        }
        if (errorUpdate) {
            // Tampilkan error jika gagal update
            const errorData = errorUpdate as any;
            toast.error(errorData.data.message);
        }
    }, [isSuccessStore, isUpdateSuccess, errorStore, errorUpdate])

    return (
        // Form category
        <form onSubmit={handleSubmit} >
            {/* Header form: Judul dan tombol Save */}
            <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
                {/* Judul form, menggunakan capitalizeFirstLetter */}
                <h2 className="text-xl">{capitalizeFirstLetter(entity)}</h2>
                <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                    {/* button Save */}
                    <div className="relative">
                        <div className="flex items-center gap-2">
                            <button type="submit" className="btn btn-primary">
                                Save 
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Layout grid form category */}
            <div className="grid lg:grid-cols-6 grid-cols-1 gap-6">
                <div className="grid lg:grid-cols-1 grid-cols-1 gap-6 col-span-1 lg:col-span-4">
                    {/* Grid */}
                    <div className="panel" id="forms_grid">
                        <div className="mb-5">
                            <div className="space-y-5">
                                {/* Grid untuk field input */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Input Name */}
                                    <div>
                                        <label htmlFor="name">Name<span className="text-danger">*</span></label>
                                        <input
                                            id="name"
                                            type="text"
                                            placeholder="Enter Name"
                                            className="form-input"
                                            value={values.name}
                                            onChange={(e) => {
                                                handleChange(e); // Tetap gunakan handleChange dari Formik
                                                formik.setFieldValue('slug', generateSlug(e.target.value)); // Perbarui slug secara real-time
                                            }}
                                        />
                                        /* Tampilkan error jika ada kesalahan input */}
                                        {errors.name && touched.name && typeof errors.name === 'string' && (
                                            <span className="text-red-500 block mt-2">{errors.name}</span>
                                        )}
                                    </div>

                                    {/* Input Slug (auto-generated dan readOnly) */}
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
                                        {/* Tampilkan error jika ada kesalahan input */}
                                        {errors.slug && touched.slug && typeof errors.slug === 'string' && (
                                            <span className="text-red-500 block mt-2">{errors.slug}</span>
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

export default CategoriesForm;