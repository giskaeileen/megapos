import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { setPageTitle } from '../../store/themeConfigSlice';
import { useDispatch } from 'react-redux';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import ImageUploading, { ImageListType } from 'react-images-uploading';
import { useParams } from 'react-router-dom';
import { useGetSingleUsersQuery, useStoreUserMutation, useUpdateUserMutation } from '../../redux/features/user/userApi';
// import { useGetRoleQuery } from '../../redux/features/roles/roleApi';
import { useGetRolesQuery } from '../../redux/features/roles/rolesApi';

const UsersForm = () => {
    // Mengambil fungsi navigate untuk navigasi programatik
    const navigate = useNavigate();
    // Mengambil id dari URL parameter
    const { id } = useParams();
    // Mengambil data pengguna berdasarkan ID jika ID ada
    const { data } = useGetSingleUsersQuery(id, { skip: !id });  
    // Mengambil fungsi untuk update data pengguna
    const [updateUser, { isSuccess: isUpdateSuccess, error: errorUpdate }] = useUpdateUserMutation();
    // Mengambil fungsi untuk menyimpan data pengguna baru
    const [storeUser, {
        data: dataStore, 
        error: errorStore, 
        isSuccess: isSuccessStore 
    }] = useStoreUserMutation()
    // Mengambil data role yang ada pada aplikasi
    const { data: role, isLoading: isLoadingRole } = useGetRolesQuery({});

    /*****************************
     * tools 
     */

    // Mendapatkan path URL dan memisahkannya untuk digunakan
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);
    const entity = pathnames[0];

    // Mendapatkan dispatch untuk mengatur state aplikasi
    const dispatch = useDispatch();

    // Mengubah judul halaman menjadi 'File Upload Preview'
    useEffect(() => {
        dispatch(setPageTitle('File Upload Preview'));
    });

    // Fungsi untuk mengubah huruf pertama menjadi kapital
    function capitalizeFirstLetter(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /*****************************
     * validation 
     */

    // Skema validasi menggunakan Yup
    const schema = Yup.object().shape({
        // Validasi untuk nama pengguna
        name: Yup.string()
            .required("Name is required")
            .matches(/^[a-zA-Z\s]*$/, "Name can only contain letters and spaces"),
        // Validasi untuk role pengguna
        role: Yup.string()
            .required("Role is required")
            .notOneOf(["Choose..."], "Please select a valid role"),
        // Validasi untuk username
        username: Yup.string()
            .required("Username is required")
            .matches(/^[a-zA-Z0-9_]*$/, "Username can only contain letters, numbers, and underscores")
            .min(3, "Username must be at least 3 characters")
            .max(20, "Username cannot exceed 20 characters"),
        // Validasi untuk email
        email: Yup.string()
            .email("Invalid email address")
            .required("Email is required"),
        // Validasi untuk password (hanya jika id ada, untuk update)
        password: Yup.string()
            .when("id", {
            is: (id: number) => !!id,
            then: Yup.string()
                .required("Password is required")
                .min(6, "Password must be at least 6 characters"), 
            otherwise: Yup.string().notRequired(),
            }),
        // Validasi untuk konfirmasi password (hanya jika id ada, untuk update)
        password_confirmation: Yup.string()
            .when("id", {
            is: (id: number) => !!id,
            then: Yup.string()
                .required("Please confirm your password")
                .oneOf([Yup.ref('password'), null], "Passwords must match"), 
            otherwise: Yup.string().notRequired(),
            }),
        // Validasi untuk foto (format file harus image)
        photo: Yup.mixed()
            .test("fileType", "Unsupported File Format", (value) =>
            value ? ["image/jpg", "image/jpeg", "image/png"].includes(value.type) : true
            ),
    });

    /*****************************
     * form data 
     */

    // Menginisialisasi form dengan Formik
    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: data?.name || '',
            role: data?.roles && data?.roles.length > 0 ? data?.roles[0]?.name : '',
            username: data?.username || '',
            email: data?.email || '',
            password: '',
            password_confirmation: '',
            photo: null,
        },
        validationSchema: schema,
        onSubmit: async (values) => {
            // Membuat FormData untuk mengirim data
            const formData = new FormData();
            formData.append("name", values.name);
            formData.append("role", values.role);
            formData.append("username", values.username);
            formData.append("email", values.email);
            formData.append("password", values.password);
            formData.append("password_confirmation", values.password_confirmation);

            if (values.photo) {
                formData.append("photo", values.photo); 
            }

            // Jika id ada, lakukan update
            if (id) {
                formData.append("_method", "PUT");
                await updateUser({id, data: formData});
            } else {
                // Jika tidak ada id, lakukan penyimpanan baru
                await storeUser(formData);
            }
        }
    });

    // Mengambil nilai formik dan error yang ada
    const { values, errors, touched, handleChange, handleSubmit } = formik;

    // Menangani gambar untuk upload
    const [images, setImages] = useState<any>([]);

    // Maksimal gambar yang bisa di-upload
    const maxNumber = 69;

    // Fungsi untuk menangani perubahan gambar
    const onChange = (imageList: ImageListType, addUpdateIndex: number[] | undefined) => {
        setImages(imageList as never[]);
        if (imageList.length > 0) {
            formik.setFieldValue("photo", imageList[0].file);
        } else {
            formik.setFieldValue("photo", null);
        }
    };

    useEffect(() => {
        if (data && data.photo) {
            const initialImage = {
                dataURL: `${import.meta.env.VITE_SERVER_URI_BASE}storage/profile/${data.photo}`,
                file: null, 
            };
            setImages([initialImage]);
        }
    }, [data]);

    /*****************************
     * status 
     */

    // Menangani status keberhasilan atau error dari proses penyimpanan atau pembaruan
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
        // Form untuk mengelola data pengguna
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
            <div className="grid lg:grid-cols-6 grid-cols-1 gap-6">
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
                                        formik.setFieldValue("photo", file);

                                        // Set gambar baru ke pratinjau
                                        const reader = new FileReader();
                                        reader.onload = (e) => {
                                            setImages([{ dataURL: e.target?.result, file }]);
                                        };
                                        if (file) reader.readAsDataURL(file);
                                    }}
                                    className="custom-file-container__custom-file__custom-file-input"
                                />
                                {formik.errors.photo && formik.touched.photo && (
                                    <div className="text-red-500 text-sm mt-1">{formik.errors.photo}</div>
                                )}
                                <input type="hidden" name="MAX_FILE_SIZE" value="10485760" />
                                <ImageUploading value={images} onChange={onChange} maxNumber={maxNumber}>
                                    {({ imageList, onImageUpload, onImageRemoveAll, onImageUpdate, onImageRemove, isDragging, dragProps }) => (
                                        <div className="upload__image-wrapper">
                                            <button
                                                type="button"
                                                className="custom-file-container__custom-file__custom-file-control"
                                                onClick={onImageUpload}
                                                {...dragProps}
                                                style={isDragging ? { backgroundColor: "#afafaf" } : undefined}
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

                {/* Form fields */}
                <div className="grid lg:grid-cols-1 grid-cols-1 gap-6 col-span-1 lg:col-span-4">
                    <div className="panel" id="forms_grid">
                        <div className="mb-5">
                            <div className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Field Name */}
                                    <div>
                                        <label htmlFor="name">Name</label>
                                        <input
                                            id="name"
                                            type="text"
                                            placeholder="Enter Name"
                                            className="form-input"
                                            value={values.name}
                                            onChange={handleChange}
                                        />
                                        {errors.name && touched.name && typeof errors.name === 'string' && (
                                            <span className="text-red-500">{errors.name}</span>
                                        )}
                                    </div>

                                    {/* Field Role */}
                                    <div>
                                        <label htmlFor="role">Role</label>
                                        <select
                                            id="role"
                                            className="form-select text-white-dark"
                                            value={values.role}  
                                            onChange={handleChange}
                                        >
                                            <option value="">Choose...</option>
                                            {role?.data?.map((roleItem: any) => (
                                                <option key={roleItem.name} value={roleItem.name}>
                                                    {roleItem.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.role && touched.role && typeof errors.role === 'string' && (
                                            <span className="text-red-500">{errors.role}</span>
                                        )}
                                    </div>

                                    {/* Field Username */}
                                    <div>
                                        <label htmlFor="username">Username</label>
                                        <input
                                            id="username"
                                            type="text"
                                            placeholder="Enter Username"
                                            className="form-input"
                                            value={values.username}
                                            onChange={handleChange}
                                        />
                                        {errors.username && touched.username && typeof errors.username === 'string' && (
                                            <span className="text-red-500">{errors.username}</span>
                                        )}
                                    </div>

                                    {/* Field Email */}
                                    <div>
                                        <label htmlFor="email">Email</label>
                                        <input
                                            id="email"
                                            type="email"
                                            placeholder="Enter Email"
                                            className="form-input"
                                            value={values.email}
                                            onChange={handleChange}
                                        />
                                        {errors.email && touched.email && typeof errors.email === 'string' && (
                                            <span className="text-red-500">{errors.email}</span>
                                        )}
                                    </div>

                                    {/* Field Password */}
                                    <div>
                                        <label htmlFor="password">Password</label>
                                        <input
                                            id="password"
                                            type="password"
                                            placeholder="Enter Password"
                                            className="form-input"
                                            value={values.password}
                                            onChange={handleChange}
                                        />
                                        {errors.password && touched.password && typeof errors.password === 'string' && (
                                            <span className="text-red-500">{errors.password}</span>
                                        )}
                                    </div>

                                    {/* Field Confirm Password */}
                                    <div>
                                        <label htmlFor="password_confirmation">Confirm Password</label>
                                        <input
                                            id="password_confirmation"
                                            type="password"
                                            placeholder="Confirm Password"
                                            className="form-input"
                                            value={values.password_confirmation}
                                            onChange={handleChange}
                                        />
                                        {errors.password_confirmation && touched.password_confirmation && (
                                            <span className="text-red-500">{errors.password_confirmation}</span>
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

export default UsersForm;