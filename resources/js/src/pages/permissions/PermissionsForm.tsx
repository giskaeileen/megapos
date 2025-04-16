import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { setPageTitle } from '../../store/themeConfigSlice';
import { useDispatch } from 'react-redux';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { useGetSingleRolesQuery, useStoreRolesMutation, useUpdateRolesMutation } from '../../redux/features/roles/rolesApi';
import { useGetSinglePermissionsQuery, useStorePermissionsMutation, useUpdatePermissionsMutation } from '../../redux/features/permissions/permissionsApi';

const PermissionsForm= () => {
    const navigate = useNavigate(); // Untuk navigasi ke halaman lain
    const { id } = useParams();  // Ambil ID dari URL
    // Mengambil data permission berdasarkan ID jika ada
    const { data } = useGetSinglePermissionsQuery(id, { skip: !id });  // Menarik data jika ID ada
    // Mutation untuk update data permission
    const [updatePermissions, { isSuccess: isUpdateSuccess, error: errorUpdate }] = useUpdatePermissionsMutation();
    // Mutation untuk menyimpan data baru permission
    const [storePermissions, {
        data: dataStore, 
        error: errorStore, 
        isSuccess: isSuccessStore 
    }] = useStorePermissionsMutation()

    /*****************************
     * tools 
     */

    const location = useLocation(); // Untuk mendapatkan lokasi path URL saat ini
    const pathnames = location.pathname.split('/').filter((x) => x); // Memecah URL berdasarkan '/'
    const entity = pathnames[0]; // Mengambil nama entitas dari URL, misal: "permissions"

    const dispatch = useDispatch();

    // Mengatur judul halaman
    useEffect(() => {
        dispatch(setPageTitle('File Upload Preview'));
    });

    // Fungsi utilitas untuk membuat huruf pertama menjadi kapital
    function capitalizeFirstLetter(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /*****************************
     * validation 
     */

    const schema = Yup.object().shape({
            name: Yup.string()
                .required("Name is required"), // Wajib diisi
        });

    /*****************************
     * form data 
     */

    // Menangani formik
    const formik = useFormik({
        enableReinitialize: true, // Aktifkan reinitialisasi saat `data` berubah
        initialValues: {
            name: data?.name || '', // Set nilai awal dari data yang didapat
        },
        validationSchema: schema, // Validasi Yup
        onSubmit: async (values) => {
            const formData = new FormData(); // Buat objek FormData
            formData.append("name", values.name); // Tambahkan field name

            // Jika sedang edit, kirim PUT method
            if (id) {
                formData.append("_method", "PUT");
                await updatePermissions({id, data: formData});
            } else {
                // Jika create baru
                await storePermissions(formData);
            }
        }
    });

    const { values, errors, touched, handleChange, handleSubmit } = formik;

    /*****************************
     * status 
     */

    useEffect(() => {
        // Jika berhasil menyimpan (create)
        if (isSuccessStore) {
            toast.success("Create Successfully") // Tampilkan notifikasi sukses
            navigate(`/${entity}/${dataStore?.id}`); // Arahkan ke halaman detail
        }
        // Jika berhasil update
        if (isUpdateSuccess) {
            toast.success("Update Successfully")
        }
        // Tangani error saat store
        if (errorStore) {
            const errorData = errorStore as any;
            toast.error(errorData.data.message);
        }
        // Tangani error saat update
        if (errorUpdate) {
            const errorData = errorStore as any;
            toast.error(errorData.data.message);
        }
    }, [isSuccessStore, isUpdateSuccess, errorStore, errorUpdate])

    return (
        <form onSubmit={handleSubmit} >
            {/* Header form */}
            <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
                <h2 className="text-xl">{capitalizeFirstLetter(entity)}</h2>
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
            {/* Body form */}
            <div className="grid lg:grid-cols-6 grid-cols-1 gap-6">
                <div className="grid lg:grid-cols-1 grid-cols-1 gap-6 col-span-1 lg:col-span-4">
                    {/* Grid */}
                    <div className="panel" id="forms_grid">
                        <div className="mb-5">
                            <div className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Input Nama Permission */}
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
                                            }}
                                        />
                                        {/* Menampilkan pesan error jika validasi gagal */}
                                        {errors.name && touched.name && typeof errors.name === 'string' && (
                                            <span className="text-red-500 block mt-2">{errors.name}</span>
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

export default PermissionsForm;