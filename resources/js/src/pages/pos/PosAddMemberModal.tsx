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

// Tipe properti komponen
// openAddMemberModal: kontrol visibilitas modal
// setOpenAddMemberModal: setter untuk visibilitas modal
// refetch: fungsi untuk menarik ulang data member

/**
 * Komponen modal untuk menambah atau mengedit data member (POS)
 */
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

    const location = useLocation(); // Mendapatkan lokasi URL saat ini
    const pathnames = location.pathname.split('/').filter((x) => x);
    const storeId = pathnames[0]; // Mengambil storeId dari URL
    const entity = pathnames[1]; // Mengambil entity dari URL

    const dispatch = useDispatch();

    // Mengatur judul halaman
    useEffect(() => {
        dispatch(setPageTitle('File Upload Preview'));
    });

    // Kapitalisai huruf pertama
    function capitalizeFirstLetter(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /*****************************
     * defenitions 
     */

    const navigate = useNavigate();
    const { id } = useParams();  
    // Query untuk ambil data single member jika ID tersedia
    const { data } = useGetSingleMembersQuery({storeId, id}, { skip: !id });  // Menarik data jika ID ada
    // Mutation untuk update data member
    const [updateMembers, { isSuccess: isUpdateSuccess, error: errorUpdate }] = useUpdateMembersMutation();
    // Mutation untuk store (create) member baru
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
        city: Yup.string()
            .matches(/^[a-zA-Z\s]*$/, "City can only contain letters and spaces"),
        address: Yup.string(),
        photo: Yup.mixed()
            // Validasi format file gambar
            .test("fileType", "Unsupported File Format", (value) =>
                value ? ["image/jpg", "image/jpeg", "image/png"].includes(value.type) : true
            )
            // Validasi ukuran file maksimal 1MB
            .test("fileSize", "File Size is too large. Maximum size is 1MB", (value) =>
                value ? value.size <= 1024 * 1024 : true  // 1024 KB = 1 MB
            ),
    });

    /*****************************
     * form data 
     */

    // Menangani formik
    const formik = useFormik({
        enableReinitialize: true, // Formik akan mengupdate nilai awal jika props berubah
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

            // Tambah foto jika ada
            if (values.photo) {
                formData.append("photo", values.photo); 
            }

            // Jika ID ada maka update, kalau tidak maka create
            if (id) {
                formData.append("_method", "PUT");
                await updateMembers({storeId: storeId, id, data: formData});
            } else {
                await storeMembers({storeId: storeId, data: formData});
            }
        }
    });

    const { values, errors, touched, handleChange, handleSubmit } = formik;

    /*****************************
     * Upload dan preview gambar
     */

    // image
    const [images, setImages] = useState<any>([]);
    const maxNumber = 69;

    // Handle saat gambar diubah
    const onChange = (imageList: ImageListType, addUpdateIndex: number[] | undefined) => {
    setImages(imageList as never[]);
        if (imageList.length > 0) {
            formik.setFieldValue("photo", imageList[0].file);
        } else {
            formik.setFieldValue("photo", null);
        }
    };

     // Jika data ada dan ada gambar, tampilkan gambar sebelumnya untuk edi
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
            refetch() // Refresh data setelah tambah
            setOpenAddMemberModal(false); // Tutup modal
        }
        if (isUpdateSuccess) {
            toast.success("Update Successfully")
        }
        if (errorStore) {
            const errorData = errorStore as any;
            toast.error(errorData.data.message); // Tampilkan error
        }
        if (errorUpdate) {
            const errorData = errorStore as any;
            toast.error(errorData.data.message); // Tampilkan error
        }
    }, [isSuccessStore, isUpdateSuccess, errorStore, errorUpdate])

    return (
        <Transition appear show={openAddMemberModal} as={Fragment}>
            <Dialog as="div" open={openAddMemberModal} onClose={() => setOpenAddMemberModal(false)} className="relative z-[51]">
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-[black]/60" />
                    {/* Background overlay dengan animasi masuk/keluar */}
                </Transition.Child>
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center px-4 py-8">
                        {/* Panel dialog utama dengan animasi scaling */}
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
                                {/* Tombol close di pojok kanan atas */}
                                <button
                                    type="button"
                                    onClick={() => setOpenAddMemberModal(false)}
                                    className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                                >
                                    <IconX />
                                </button>
                                {/* Header dialog */}
                                <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                                    Add Member 
                                </div>

                                {/* Form */}
                                <div className="p-5">
                                    <form onSubmit={handleSubmit}>
                                        <div className="grid lg:grid-cols-6 grid-cols-1 gap-8">
                                            {/* Kolom unggah gambar */}
                                            <div className="col-span-1 lg:col-span-2">
                                                <div className="" id="single_file">
                                                    <div className="mb-5">
                                                        <div className="custom-file-container" data-upload-id="myFirstImage">
                                                            <div className="label-container">
                                                                <label>Upload </label>
                                                                {/* Tombol untuk menghapus gambar yang diunggah */}
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
                                                            {/* Input file untuk upload gambar */}
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
                                                            {/* Validasi jika ada error pada upload gambar */}
                                                            {formik.errors.photo && formik.touched.photo && (
                                                                <div className="text-red-500 text-sm mt-1">{formik.errors.photo}</div>
                                                            )}
                                                            {/* Batas maksimal ukuran file (10MB) */}
                                                            <input type="hidden" name="MAX_FILE_SIZE" value="10485760" />
                                                            <ImageUploading value={images} onChange={onChange} maxNumber={maxNumber}>
                                                                {({ imageList, onImageUpload, onImageRemoveAll, onImageUpdate, onImageRemove, isDragging, dragProps }) => (
                                                                    <div className="upload__image-wrapper">
                                                                        {/* Tombol upload file */}
                                                                        <button
                                                                            type="button"
                                                                            className="custom-file-container__custom-file__custom-file-control"
                                                                            onClick={onImageUpload}
                                                                            {...dragProps}
                                                                            style={isDragging ? { backgroundColor: "#afafaf" } : undefined}
                                                                        >
                                                                            Choose File...
                                                                        </button>
                                                                        {/* Preview gambar */}
                                                                        {imageList.map((image, index) => (
                                                                            <div key={index} className="custom-file-container__image-preview relative">
                                                                                <img src={image.dataURL} alt="img" className="m-auto" />
                                                                                {/* <button onClick={() => onImageRemove(index)}>Remove</button> */}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </ImageUploading>
                                                            {/* Gambar default jika belum ada gambar diunggah */}
                                                            {images.length === 0 ? <img src="/assets/images/file-preview.svg" className="max-w-md w-full m-auto" alt="" /> : ''}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Kolom form data member */}
                                            <div className="grid lg:grid-cols-1 grid-cols-1 gap-6 col-span-1 lg:col-span-4">
                                                {/* Grid */}
                                                <div className="" id="forms_grid">
                                                    <div className="mb-5">
                                                        <div className="space-y-5">
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                {/* Input nama */}
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

                                                                {/* Input nomor telepon */}
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

                                                                {/* Input email */}
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

                                                                {/* Input kota */}
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

                                                                {/* Input alamat (textarea) */}
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

                                        {/* button submit */}
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