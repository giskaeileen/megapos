import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { setPageTitle } from '../../store/themeConfigSlice';
import { useDispatch } from 'react-redux';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { useGetSingleRolesQuery, useStoreRolesMutation, useUpdateRolesMutation } from '../../redux/features/roles/rolesApi';
import { useGetSingleRolePermissionQuery, useUpdateRolePermissionMutation } from '../../redux/features/role_permission/rolePermissionApi';

const RolePermissionForm= () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Mengambil ID dari URL
    // Ambil data role permission jika ID tersedia
    const { data } = useGetSingleRolePermissionQuery(id, { skip: !id });  // Menarik data jika ID ada
    // Hook untuk melakukan update role permission
    const [updateRolePermission, { isSuccess: isUpdateSuccess, error: errorUpdate }] = useUpdateRolePermissionMutation();

    /*****************************
     * validation menggunakan Yup
     */

    const schema = Yup.object().shape({
        name: Yup.string()
            .required("Name is required"),
    });

    /*****************************
     * form data 
     */

    // Ambil ID dari permission yang dimiliki oleh role
    const rolePermissionIds = data?.role?.permissions.map((p: any) => p.id);

    // Menangani formik
    const formik = useFormik({
        enableReinitialize: true, // Supaya Formik update initialValues saat data beruba
        initialValues: {
            name: data?.role.name || '',
            permissions: data?.permissions?.map((permission: any) => ({
                id: permission.id,
                name: permission.name,
                selected: rolePermissionIds.includes(permission.id),
            })),
        },
        validationSchema: schema,
        // Saat form disubmit
        onSubmit: async (values) => {
            // Mengambil permissions yang dipilih, hanya mengirimkan name permission
            const selectedPermissions = values.permissions
                .filter((permission: any) => permission.selected)
                .map((permission: any) => permission.name); // Menggunakan name sebagai value yang dikirimkan

            // Siapkan data untuk dikirim ke backend
            const formData = new FormData();
            formData.append("name", values.name);

            // Kirim permission[] dengan nama permission
            selectedPermissions.forEach((permissionName: any) => {
                formData.append("permissions[]", permissionName); // Kirim data sebagai array
            });

            // Jika sedang dalam mode edit, kirim PUT
            if (id) {
                formData.append("_method", "PUT");
                await updateRolePermission({ id, data: formData });
            }
        },
    });

    const { values, errors, touched, handleChange, handleSubmit } = formik;

    /*****************************
     * status success dan eror
     */

    useEffect(() => {
        if (isUpdateSuccess) {
            toast.success("Update Successfully")
        }
        if (errorUpdate) {
            const errorData = errorUpdate as any;
            toast.error(errorData.data.message);
        }
    }, [ isUpdateSuccess, errorUpdate])

    /*****************************
     * tools 
     */

    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);
    const entity = pathnames[0];

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setPageTitle('File Upload Preview'));
    });

    // Capitalize huruf pertama
    function capitalizeFirstLetter(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Grouping permission berdasarkan nama entitas
    const groupedPermissions = formik.values.permissions
        ? formik.values.permissions.reduce((acc: any, permission: any) => {
            const [action, ...entityParts] = permission.name.split(' '); // Pisahkan berdasarkan spasi
            const entity = entityParts.join(' '); // Gabungkan sisa kata sebagai entity

            acc[entity] = acc[entity] || [];
            acc[entity].push({ ...permission, action });
            return acc;
        }, {})
        : [];

    // Checkbox untuk Select All
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        const updatedPermissions = values.permissions.map((permission: any) => ({
            ...permission,
            selected: isChecked,
        }));
        formik.setFieldValue('permissions', updatedPermissions);
    };

    return (
        <form onSubmit={handleSubmit} >
            {/* Header Form Judul halaman & tombol Save */}
            <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
                <h2 className="text-xl">{capitalizeFirstLetter(entity)}</h2> {/* Menampilkan judul berdasarkan entity, contoh: 'Role' */}
                <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                    <div className="relative">
                        <div className="flex items-center gap-2">
                            <button type="submit" className="btn btn-primary">
                                Save {/* Tombol untuk submit form */}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Form */}
            <div className="grid lg:grid-cols-6 grid-cols-1 gap-6">
                <div className="grid lg:grid-cols-1 grid-cols-1 gap-6 col-span-1 lg:col-span-4">
                    {/* Grid */}
                    <div className="panel" id="forms_grid">
                        <div className="mb-5">
                            <div className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Input Nama Role */}
                                    <div>
                                        <label htmlFor="name">Name</label>
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
                                        {/* Validasi error nama */}
                                        {errors.name && touched.name && typeof errors.name === 'string' && (
                                            <span className="text-red-500 block mt-2">{errors.name}</span>
                                        )}
                                    </div>
                                    {/* Checkbox Select All */}
                                    <div className="grid items-end">
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                onChange={handleSelectAll} // Handler untuk select/deselect semua permission
                                                checked={values.permissions ? values.permissions.every((permission: any) => permission.selected) : false}
                                                className="form-checkbox"
                                            />
                                            <span>Select All</span> {/* Label untuk select all */}
                                        </label>
                                    </div>
                                    {/* Daftar Permissions yang dikelompokkan per entitas */}
                                    <div className="lg:col-span-2">
                                        <label htmlFor="permissions">Permissions</label>
                                        {/* Loop setiap group permission berdasarkan entity */}
                                        {Object.entries(groupedPermissions).map(([entity, permissions]: any) => (
                                        <div key={entity} className="mb-4">
                                            <h3 className="font-bold text-lg">{entity}</h3> {/* Nama entitas */}
                                            <div className="flex items-center gap-4">
                                            {/* Loop checkbox untuk setiap permission */}
                                            {permissions.map((permission: any) => (
                                                <label key={permission.id} className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    name={`permissions[${permission.id}].selected`}
                                                    checked={permission.selected} // Status checked sesuai field `selected`
                                                    onChange={(e) => {
                                                    // Update status selected untuk permission yang diubah
                                                    const updatedPermissions = values.permissions.map((p: any) =>
                                                        p.id === permission.id ? { ...p, selected: e.target.checked } : p
                                                    );
                                                    formik.setFieldValue('permissions', updatedPermissions);
                                                    }}
                                                    className="form-checkbox"
                                                />
                                                <span>{permission.action}</span> {/* Menampilkan nama aksi seperti 'View', 'Edit', dll */}
                                                </label>
                                            ))}
                                            </div>
                                        </div>
                                        ))}
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

export default RolePermissionForm;