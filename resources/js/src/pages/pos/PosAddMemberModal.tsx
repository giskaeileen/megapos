import { Dialog, Transition } from "@headlessui/react";
import { FC, Fragment } from "react";
import IconX from "../../components/Icon/IconX";
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { setPageTitle } from '../../store/themeConfigSlice';
import { useDispatch } from 'react-redux';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import ImageUploading, { ImageListType } from 'react-images-uploading';
import { useParams } from 'react-router-dom';
import { useGetSingleMembersQuery, useStoreMembersMutation, useUpdateMembersMutation } from '../../redux/features/members/membersApi';

type Props = {
    openAddMemberModal: any,
    setOpenAddMemberModal: any,
    refetch: any,
};

const PosAddMemberModal: FC<Props> = ({
    openAddMemberModal,
    setOpenAddMemberModal,
    refetch,
}) => {

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
    const { data } = useGetSingleMembersQuery({storeId, id}, { skip: !id });  // Menarik data jika ID ada
    const [updateMembers, { isSuccess: isUpdateSuccess, error: errorUpdate }] = useUpdateMembersMutation();
    const [storeMembers, {data: dataStore, error: errorStore, isSuccess: isSuccessStore }] = useStoreMembersMutation()

    /*****************************
     * validation 
     */

    const schema = Yup.object().shape({
        name: Yup.string()
            .required("Name is required")
            .matches(/^[a-zA-Z\s]*$/, "Name can only contain letters and spaces"),
        email: Yup.string()
            .email("Invalid email address"),
        phone: Yup.string()
            .required("Phone is required")
            .max(15, "Phone number cannot exceed 15 characters"),
            // .matches(/^[0-9]{10,15}$/, "Phone number must be between 10 and 15 digits"),
        city: Yup.string()
            .matches(/^[a-zA-Z\s]*$/, "City can only contain letters and spaces"),
        address: Yup.string(),
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
            username: data?.username || '',
            email: data?.email || '',
            photo: null,
            phone: data?.phone || '',
            city: data?.city || '',
            address: data?.address || '',
        },
        validationSchema: schema,
        onSubmit: async (values) => {
            const formData = new FormData();
            formData.append("name", values.name);
            formData.append("email", values.email);
            formData.append("phone", values.phone);
            formData.append("city", values.city);
            formData.append("address", values.address);

            if (values.photo) {
                formData.append("photo", values.photo); 
            }

            if (id) {
                formData.append("_method", "PUT");
                await updateMembers({storeId: storeId, id, data: formData});
            } else {
                await storeMembers({storeId: storeId, data: formData});
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
            // navigate(`/${storeId}/${entity}/${dataStore?.id}`);
            refetch()
            setOpenAddMemberModal(false);
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
        <Transition appear show={openAddMemberModal} as={Fragment}>
            <Dialog as="div" open={openAddMemberModal} onClose={() => setOpenAddMemberModal(false)} className="relative z-[51]">
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-[black]/60" />
                </Transition.Child>
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center px-4 py-8">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-2xl text-black dark:text-white-dark">
                                <button
                                    type="button"
                                    onClick={() => setOpenAddMemberModal(false)}
                                    className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                                >
                                    <IconX />
                                </button>
                                <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                                    Add Member 
                                </div>

                                <div className="p-5">
                                    <form onSubmit={handleSubmit}>
                                        <div className="grid lg:grid-cols-6 grid-cols-1 gap-8">
                                            <div className="col-span-1 lg:col-span-2">
                                                <div className="" id="single_file">
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
                                                <div className="" id="forms_grid">
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
                                                                        <span className="text-red-500 block mt-2">{errors.email}</span>
                                                                    )}
                                                                </div>

                                                                <div>
                                                                    <label htmlFor="city">City</label>
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
                                                                    <label htmlFor="address">Address</label>
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

                                        <div className="flex items-center justify-end flex-wrap gap-4 mb-5">
                                            <button type="submit" className="btn btn-primary">
                                                Save 
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}

export default PosAddMemberModal;