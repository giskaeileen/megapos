import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { setPageTitle } from '../../store/themeConfigSlice';
import { useDispatch } from 'react-redux';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import ImageUploading, { ImageListType } from 'react-images-uploading';
import { useParams } from 'react-router-dom';
import { useGetSingleEmployeeQuery, useStoreEmployeeMutation, useUpdateEmployeeMutation } from '../../redux/features/employees/employeesApi';

const EmployeesForm= () => {
    /*****************************
     * tools 
     */

    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);
    const storeId = pathnames[0];
    const entity = pathnames[1];

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setPageTitle('File Upload Preview'));
    });

    function capitalizeFirstLetter(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /*****************************
     * defenitions 
     */

    const navigate = useNavigate();
    const { id } = useParams();  
    const { data } = useGetSingleEmployeeQuery({storeId, id}, { skip: !id });  // Menarik data jika ID ada
    const [updateEmployee, { isSuccess: isUpdateSuccess, error: errorUpdate }] = useUpdateEmployeeMutation();
    const [storeEmployee, {
        data: dataStore, 
        error: errorStore, 
        isSuccess: isSuccessStore 
    }] = useStoreEmployeeMutation()


    /*****************************
     * validation 
     */

    const schema = Yup.object().shape({
        name: Yup.string()
            .required("Name is required")
            .matches(/^[a-zA-Z\s]*$/, "Name can only contain letters and spaces"),
        email: Yup.string()
            .email("Invalid email address")
            .required("Email is required"),
        phone: Yup.string()
            .required("Phone is required")
            .max(15, "Phone number cannot exceed 15 characters"),
        experience: Yup.string()
            .required("Experience is required")
            .notOneOf(["Choose..."], "Please select a valid experience"),
        salary: Yup.string()
            .required("Salary Number is required")
            .matches(/^[0-9]+$/, "Salary Number must be a valid number"),
        // bank_branch: Yup.string()
        //     .required("Bank Branch is required"),
        city: Yup.string()
            .required("City is required")
            .matches(/^[a-zA-Z\s]*$/, "City can only contain letters and spaces"),
        address: Yup.string()
            .required("Address is required")
            .max(100, "Address must be at most 100 characters"),
        photo: Yup.mixed()
            .test("fileType", "Unsupported File Format", (value) =>
                value ? ["image/jpg", "image/jpeg", "image/png"].includes(value.type) : true
            )
            .test("fileSize", "File Size is too large. Maximum size is 1MB", (value) =>
                value ? value.size <= 1024 * 1024 : true  // 1024 KB = 1 MB
            ),
        password: Yup.string()
            .when("id", {
            is: (id: number) => !!id, // Jika id ada (untuk update)
            then: Yup.string()
                .required("Password is required")
                .min(6, "Password must be at least 6 characters"), 
            otherwise: Yup.string().notRequired(), // Jika tidak ada id (untuk create), password tidak wajib
            }),
        password_confirmation: Yup.string()
            .when("id", {
            is: (id: number) => !!id, // Jika id ada (untuk update)
            then: Yup.string()
                .required("Please confirm your password")
                .oneOf([Yup.ref('password'), null], "Passwords must match"), 
            otherwise: Yup.string().notRequired(), // Jika tidak ada id (untuk create), konfirmasi password tidak wajib
            }),
        });

    /*****************************
     * form data 
     */

    // Menangani formik
    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: data?.name || '',
            email: data?.email || '',
            phone: data?.phone || '',
            experience: data?.experience || '',
            salary: data?.salary || '',
            vacation: data?.vacation || '',
            city: data?.city || '',
            address: data?.address || '',
            photo: null,
            password: '',
            password_confirmation: '',
        },
        validationSchema: schema,
        onSubmit: async (values) => {
            const formData = new FormData();
            formData.append("name", values.name);
            formData.append("email", values.email);
            formData.append("phone", values.phone);
            formData.append("experience", values.experience);
            formData.append("salary", values.salary);
            formData.append("vacation", values.vacation);
            formData.append("city", values.city);
            formData.append("address", values.address);
            formData.append("password", values.password);
            formData.append("password_confirmation", values.password_confirmation);

            if (values.photo) {
                formData.append("photo", values.photo); 
            }

            if (id) {
                formData.append("_method", "PUT");
                await updateEmployee({storeId: storeId, id, data: formData});
            } else {
                await storeEmployee({storeId: storeId, data: formData});
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
            navigate(`/${storeId}/${entity}/${dataStore?.id}`);
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
                                        <label htmlFor="name">Name<span className="text-danger">*</span></label>
                                        <input
                                            id="name"
                                            type="text"
                                            placeholder="Enter Name"
                                            className="form-input"
                                            value={values.name}
                                            onChange={handleChange}
                                        />
                                        {errors.name && touched.name && typeof errors.name === 'string' && (
                                            <span className="text-red-500 block mt-2">{errors.name}</span>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="email">Email<span className="text-danger">*</span></label>
                                        <input
                                            id="email"
                                            type="email"
                                            placeholder="Enter Email"
                                            className="form-input"
                                            value={values.email}
                                            onChange={handleChange}
                                        />
                                        {errors.email && touched.email && typeof errors.email === 'string' && (
                                            <span className="text-red-500 block mt-2">{errors.email}</span>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="phone">Phone<span className="text-danger">*</span></label>
                                        <input
                                            id="phone"
                                            type="text"
                                            placeholder="Enter Phone"
                                            className="form-input"
                                            value={values.phone}
                                            onChange={handleChange}
                                        />
                                        {errors.phone && touched.phone && typeof errors.phone === 'string' && (
                                            <span className="text-red-500 block mt-2">{errors.phone}</span>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="experience">Experience</label>
                                        <select
                                            id="experience"
                                            className="form-select text-white-dark"
                                            value={values.experience}  
                                            onChange={handleChange}
                                        >
                                            <option value="">Choose...</option>
                                            <option value="1 Year">1 Year</option>
                                            <option value="2 Year">2 Year</option>
                                            <option value="3 Year">3 Year</option>
                                            <option value="4 Year">4 Year</option>
                                            <option value="5 Year">5 Year</option>
                                        </select>
                                        {errors.experience && touched.experience && typeof errors.experience === 'string' && (
                                            <span className="text-red-500 block mt-2">{errors.experience}</span>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="salary">Salary<span className="text-danger">*</span></label>
                                        <input
                                            id="salary"
                                            type="number"
                                            placeholder="Enter Account Holder"
                                            className="form-input"
                                            value={values.salary}
                                            onChange={handleChange}
                                        />
                                        {errors.salary && touched.salary && typeof errors.salary === 'string' && (
                                            <span className="text-red-500 block mt-2">{errors.salary}</span>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="vacation">Vacation</label>
                                        <input
                                            id="vacation"
                                            type="text"
                                            placeholder="Enter Account Number"
                                            className="form-input"
                                            value={values.vacation}
                                            onChange={handleChange}
                                        />
                                        {errors.vacation && touched.vacation && typeof errors.vacation === 'string' && (
                                            <span className="text-red-500 block mt-2">{errors.vacation}</span>
                                        )}
                                    </div>

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

                                    <div className="sm:col-span-2">
                                        <label htmlFor="address">Address<span className="text-danger">*</span></label>
                                        <textarea 
                                            id="address" 
                                            rows={3} 
                                            placeholder="Enter Address" 
                                            className="form-textarea" 
                                            value={values.address}
                                            onChange={handleChange}
                                        ></textarea>
                                        {errors.address && touched.address && typeof errors.address === 'string' && (
                                            <span className="text-red-500 block mt-2">{errors.address}</span>
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

export default EmployeesForm;