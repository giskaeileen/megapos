import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { setPageTitle } from '../../store/themeConfigSlice';
import { useDispatch } from 'react-redux';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { useGetSingleRolesQuery, useStoreRolesMutation, useUpdateRolesMutation } from '../../redux/features/roles/rolesApi';

const RolesForm= () => {
    const navigate = useNavigate();
    const { id } = useParams();  
    // Ambil data role berdasarkan ID jika mode edit
    const { data } = useGetSingleRolesQuery(id, { skip: !id });  // Menarik data jika ID ada
    // Hook untuk update role
    const [updateRoles, { isSuccess: isUpdateSuccess, error: errorUpdate }] = useUpdateRolesMutation();
    // Hook untuk menyimpan role baru
    const [storeRoles, {
        data: dataStore, 
        error: errorStore, 
        isSuccess: isSuccessStore 
    }] = useStoreRolesMutation()

    /*****************************
     * tools 
     */

    const location = useLocation(); // Ambil path lokasi saat ini
    const pathnames = location.pathname.split('/').filter((x) => x);
    const entity = pathnames[0]; // Ambil nama entity dari path, misalnya "roles"

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setPageTitle('File Upload Preview'));
    });

    // Fungsi utilitas untuk mengkapitalisasi huruf pertama
    function capitalizeFirstLetter(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /*****************************
     * validation 
     */

    const schema = Yup.object().shape({
            name: Yup.string()
                .required("Name is required"),
                // .matches(/^[a-zA-Z\s]*$/, "Name can only contain letters and spaces"),
        });

    /*****************************
     * form data 
     */

    // Menangani formik
    const formik = useFormik({
        enableReinitialize: true, // Biar formik update state saat data berubah
        initialValues: {
            name: data?.name || '', // Isi nama jika ada (edit), atau kosong (create)
        },
        validationSchema: schema, // Atur validasi berdasarkan schema Yup
        onSubmit: async (values) => {
            // Buat FormData untuk dikirim via API
            const formData = new FormData();
            formData.append("name", values.name);

            if (id) {
                // Kalau ada ID berarti edit
                formData.append("_method", "PUT");
                await updateRoles({id, data: formData}); // Kirim ke API update
            } else {
                // Kalau tidak ada ID berarti create
                await storeRoles(formData);
            }
        }
    });

    const { values, errors, touched, handleChange, handleSubmit } = formik;

    /*****************************
     * status 
     */

    useEffect(() => {
        if (isSuccessStore) {
            toast.success("Create Successfully")
            navigate(`/${entity}/${dataStore?.id}`);
        }
        if (isUpdateSuccess) {
            toast.success("Update Successfully")
        }
        if (errorStore) {
            const errorData = errorStore as any;
            toast.error(errorData.data.message);
        }
        if (errorUpdate) {
            const errorData = errorStore as any;
            toast.error(errorData.data.message);
        }
    }, [isSuccessStore, isUpdateSuccess, errorStore, errorUpdate])

    return (
        <form onSubmit={handleSubmit} >
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
            {/* Form input */}
            <div className="grid lg:grid-cols-6 grid-cols-1 gap-6">
                <div className="grid lg:grid-cols-1 grid-cols-1 gap-6 col-span-1 lg:col-span-4">
                    {/* Grid */}
                    <div className="panel" id="forms_grid">
                        <div className="mb-5">
                            <div className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                        {/* Menampilkan pesan error validasi */}
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

export default RolesForm;