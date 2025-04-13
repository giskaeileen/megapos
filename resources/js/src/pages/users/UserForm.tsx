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

const UsersForm= () => {
    const navigate = useNavigate();
    const { id } = useParams();  
    const { data } = useGetSingleUsersQuery(id, { skip: !id });  // Menarik data jika ID ada
    const [updateUser, { isSuccess: isUpdateSuccess, error: errorUpdate }] = useUpdateUserMutation();
    const [storeUser, {
        data: dataStore, 
        error: errorStore, 
        isSuccess: isSuccessStore 
    }] = useStoreUserMutation()
    const { data: role, isLoading: isLoadingRole } = useGetRolesQuery({}); 

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

    function capitalizeFirstLetter(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /*****************************
     * validation 
     */

    const schema = Yup.object().shape({
        name: Yup.string()
            .required("Name is required")
            .matches(/^[a-zA-Z\s]*$/, "Name can only contain letters and spaces"),
        role: Yup.string()
            .required("Role is required")
            .notOneOf(["Choose..."], "Please select a valid role"),
        username: Yup.string()
            .required("Username is required")
            .matches(/^[a-zA-Z0-9_]*$/, "Username can only contain letters, numbers, and underscores")
            .min(3, "Username must be at least 3 characters")
            .max(20, "Username cannot exceed 20 characters"),
        email: Yup.string()
            .email("Invalid email address")
            .required("Email is required"),
        password: Yup.string()
            .when("id", {
            is: (id: number) => !!id, // Jika id ada (untuk update)
            then: Yup.string()
                .required("Password is required")
                .min(6, "Password must be at least 6 characters"), 
            otherwise: Yup.string().notRequired(), // Jika tidak ada id (untuk create), password tidak wajib
            }),
        // Validasi password_confirmation hanya jika id ada
        password_confirmation: Yup.string()
            .when("id", {
            is: (id: number) => !!id, // Jika id ada (untuk update)
            then: Yup.string()
                .required("Please confirm your password")
                .oneOf([Yup.ref('password'), null], "Passwords must match"), 
            otherwise: Yup.string().notRequired(), // Jika tidak ada id (untuk create), konfirmasi password tidak wajib
            }),
        photo: Yup.mixed()
            // .required("Image is required")
            .test("fileType", "Unsupported File Format", (value) =>
            value ? ["image/jpg", "image/jpeg", "image/png"].includes(value.type) : true
            ),
    });

    /*****************************
     * form data 
     */

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

            if (id) {
                formData.append("_method", "PUT");
                await updateUser({id, data: formData});
            } else {
                await storeUser(formData);
            }
        }
    });

    const { values, errors, touched, handleChange, handleSubmit } = formik;

    // image
    const [images, setImages] = useState<any>([]);
    const maxNumber = 69;

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
                                                    {/* <button onClick={() => onImageRemove(index)}>Remove</button> */}
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

                {/* <div className="pt-5 grid lg:grid-cols-2 grid-cols-1 gap-6"> */}
                <div className="grid lg:grid-cols-1 grid-cols-1 gap-6 col-span-1 lg:col-span-4">
                    {/* Grid */}
                    <div className="panel" id="forms_grid">
                        <div className="mb-5">
                            <div className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                                    <div>
                                        <label htmlFor="role">Role</label>
                                        <select
                                            id="role"
                                            className="form-select text-white-dark"
                                            value={values.role}  // Set nilai yang sesuai dengan formik values
                                            onChange={handleChange}  // Tangani perubahan nilai
                                        >
                                            <option value="">Choose...</option>
                                            {role?.data?.map((roleItem: any) => (
                                                <option key={roleItem.name} value={roleItem.name}>
                                                    {roleItem.name}  {/* Menampilkan nama role */}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.role && touched.role && typeof errors.role === 'string' && (
                                            <span className="text-red-500">{errors.role}</span>
                                        )}
                                    </div>

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
                                        {errors.password && touched.password && (
                                            <span className="text-red-500">{errors.password}</span>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="password_confirmation">Password Confirm</label>
                                        <input
                                            id="password_confirmation"
                                            type="password"
                                            placeholder="Enter Password Confirm"
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