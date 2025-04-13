import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { setPageTitle } from '../../store/themeConfigSlice';
import { useDispatch } from 'react-redux';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import ImageUploading, { ImageListType } from 'react-images-uploading';
import { useParams } from 'react-router-dom';
import { useGetSingleSuppliersQuery, useStoreSuppliersMutation, useUpdateSuppliersMutation } from '../../redux/features/suppliers/suppliersApi';

const SuppliersForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();  
    const { data } = useGetSingleSuppliersQuery(id, { skip: !id });  // Menarik data jika ID ada
    const [updateSupplier, { isSuccess: isUpdateSuccess, error: errorUpdate }] = useUpdateSuppliersMutation();
    const [storeSupplier, {
        data: dataStore, 
        error: errorStore, 
        isSuccess: isSuccessStore 
    }] = useStoreSuppliersMutation()

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
            shopname: Yup.string()
                .required("Shop Name is required")
                .matches(/^[a-zA-Z\s]*$/, "Shop Name can only contain letters and spaces"),
            email: Yup.string()
                .email("Invalid email address")
                .required("Email is required"),
            phone: Yup.string()
                .required("Phone is required")
                .max(15, "Phone number cannot exceed 15 characters"),
            // account_holder: Yup.string()
            //     .matches(/^[a-zA-Z\s]*$/, "Account Holder can only contain letters and spaces"),
            bank_name: Yup.string()
                .required("Bank Name is required")
                .notOneOf(["Choose..."], "Please select a valid bank name"),
            account_number: Yup.string()
                .required("Account Number is required")
                .matches(/^[0-9]+$/, "Account Number must be a valid number"),
            bank_branch: Yup.string()
                .required("Bank Branch is required"),
            city: Yup.string()
                .required("City is required")
                .matches(/^[a-zA-Z\s]*$/, "City can only contain letters and spaces"),
            address: Yup.string()
                .required("Address is required"),  
            type: Yup.string()
                .required("Type is required")  
                .notOneOf(["Choose..."], "Please select a valid type name"),
            photo: Yup.mixed()
                // .required("Image is required")
                .test("fileType", "Unsupported File Format", (value) =>
                    value ? ["image/jpg", "image/jpeg", "image/png"].includes(value.type) : true
                )
                .test("fileSize", "File Size is too large. Maximum size is 1MB", (value) =>
                    value ? value.size <= 1024 * 1024 : true  // 1024 KB = 1 MB
                ),
        });

    /*****************************
     * form data 
     */

    // Menangani formik
    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: data?.name || '',
            shopname: data?.shopname || '',
            username: data?.username || '',
            email: data?.email || '',
            photo: null,
            phone: data?.phone || '',
            account_holder: data?.account_holder || '',
            bank_name: data?.bank_name || '',
            account_number: data?.account_number || '',
            bank_branch: data?.bank_branch || '',
            city: data?.city || '',
            address: data?.address || '',
            type: data?.type|| '',
        },
        validationSchema: schema,
        onSubmit: async (values) => {
            const formData = new FormData();
            formData.append("name", values.name);
            formData.append("shopname", values.shopname);
            formData.append("email", values.email);
            formData.append("phone", values.phone);
            formData.append("account_holder", values.account_holder);
            formData.append("account_number", values.account_number);
            formData.append("bank_name", values.bank_name);
            formData.append("bank_branch", values.bank_branch);
            formData.append("city", values.city);
            formData.append("address", values.address);
            formData.append("type", values.type);

            if (values.photo) {
                formData.append("photo", values.photo); 
            }

            if (id) {
                formData.append("_method", "PUT");
                await updateSupplier({id, data: formData});
            } else {
                await storeSupplier(formData);
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
                dataURL: `${import.meta.env.VITE_SERVER_URI_BASE}storage/${entity}/${data.photo}`,
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
                                        <label htmlFor="name">Shop Name<span className="text-danger">*</span></label>
                                        <input
                                            id="shopname"
                                            type="text"
                                            placeholder="Enter Shop Name"
                                            className="form-input"
                                            value={values.shopname}
                                            onChange={handleChange}
                                        />
                                        {errors.shopname && touched.shopname && typeof errors.shopname === 'string' && (
                                            <span className="text-red-500 block mt-2">{errors.shopname}</span>
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
                                        <label htmlFor="account_holder">Account Holder</label>
                                        <input
                                            id="account_holder"
                                            type="text"
                                            placeholder="Enter Account Holder"
                                            className="form-input"
                                            value={values.account_holder}
                                            onChange={handleChange}
                                        />
                                        {errors.account_holder && touched.account_holder && typeof errors.account_holder === 'string' && (
                                            <span className="text-red-500 block mt-2">{errors.account_holder}</span>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="bank_name">Bank Name</label>
                                        <select
                                            id="bank_name"
                                            className="form-select text-white-dark"
                                            value={values.bank_name}  
                                            onChange={handleChange}
                                        >
                                            <option value="">Choose...</option>
                                            <option value="BRI">BRI</option>
                                            <option value="BNI">BNI</option>
                                            <option value="BCA">BCA</option>
                                            <option value="BSI">BSI</option>
                                            <option value="Mandiri">Mandiri</option>
                                        </select>
                                        {errors.bank_name && touched.bank_name && typeof errors.bank_name === 'string' && (
                                            <span className="text-red-500 block mt-2">{errors.bank_name}</span>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="account_number">Account Number</label>
                                        <input
                                            id="account_number"
                                            type="text"
                                            placeholder="Enter Account Number"
                                            className="form-input"
                                            value={values.account_number}
                                            onChange={handleChange}
                                        />
                                        {errors.account_number && touched.account_number && typeof errors.account_number === 'string' && (
                                            <span className="text-red-500 block mt-2">{errors.account_number}</span>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="bank_branch">Bank Branch</label>
                                        <input
                                            id="bank_branch"
                                            type="text"
                                            placeholder="Enter Bank Branch"
                                            className="form-input"
                                            value={values.bank_branch}
                                            onChange={handleChange}
                                        />
                                        {errors.bank_branch && touched.bank_branch && typeof errors.bank_branch === 'string' && (
                                            <span className="text-red-500 block mt-2">{errors.bank_branch}</span>
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

                                    <div>
                                        <label htmlFor="type">Type<span className="text-danger">*</span></label>
                                        <select
                                            id="type"
                                            className="form-select text-white-dark"
                                            value={values.type}  
                                            onChange={handleChange}
                                        >
                                            <option value="">Choose...</option>
                                            <option value="Distributor">Distributor</option>
                                            <option value="Whole Seller">Whole Seller</option>
                                        </select>
                                        {errors.type && touched.type && typeof errors.type === 'string' && (
                                            <span className="text-red-500 block mt-2">{errors.type}</span>
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
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default SuppliersForm;