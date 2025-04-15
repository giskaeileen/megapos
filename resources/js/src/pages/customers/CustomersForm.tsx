import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { setPageTitle } from '../../store/themeConfigSlice';
import { useDispatch } from 'react-redux';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import ImageUploading, { ImageListType } from 'react-images-uploading';
import { useParams } from 'react-router-dom';
import { useGetSingleCustomersQuery, useStoreCustomerMutation, useUpdateCustomerMutation } from '../../redux/features/customers/customersApi';

const CustomersForm = () => {
    /*****************************
     * tools 
     */

    const location = useLocation(); // Hook untuk mengetahui lokasi URL saat ini
    const pathnames = location.pathname.split('/').filter((x) => x); // Pisahkan path URL menjadi array
    const storeId = pathnames[0]; // Ambil storeId dari URL
    const entity = pathnames[1]; // Ambil entitas dari URL

    const dispatch = useDispatch(); // Inisialisasi dispatch Redux

    useEffect(() => {
        dispatch(setPageTitle('File Upload Preview')); // Set judul halaman
    });

    // Fungsi untuk kapitalisasi huruf pertama
    function capitalizeFirstLetter(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /*****************************
     * defenitions 
     */

    const navigate = useNavigate(); // Untuk berpindah halaman
    const { id } = useParams();  // Ambil parameter ID dari URL
    // Query untuk ambil data customer jika ada ID
    const { data } = useGetSingleCustomersQuery({storeId, id}, { skip: !id });  // Menarik data jika ID ada
    // Mutasi untuk update dan store customer
    const [updateCustomer, { isSuccess: isUpdateSuccess, error: errorUpdate }] = useUpdateCustomerMutation();
    const [storeCustomer, {data: dataStore, error: errorStore, isSuccess: isSuccessStore }] = useStoreCustomerMutation()

    /*****************************
     * validation 
     */

    // Skema validasi Yup
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
            // .matches(/^[0-9]{10,15}$/, "Phone number must be between 10 and 15 digits"),
        account_holder: Yup.string()
            .matches(/^[a-zA-Z\s]*$/, "Account Holder can only contain letters and spaces"),
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
        photo: Yup.mixed()
            // File type validation untuk gambar
            .test("fileType", "Unsupported File Format", (value) =>
                value ? ["image/jpg", "image/jpeg", "image/png"].includes(value.type) : true
            )
            // File size validation max 1MB
            .test("fileSize", "File Size is too large. Maximum size is 1MB", (value) =>
                value ? value.size <= 1024 * 1024 : true  // 1024 KB = 1 MB
            ),
    });

    /*****************************
     * form data 
     */

    // Menangani formik
    const formik = useFormik({
        enableReinitialize: true, // Re-inisialisasi jika nilai awal berubah
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
        },
        validationSchema: schema,
        onSubmit: async (values) => {
            // Buat FormData agar bisa kirim file
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

            // Tambahkan file gambar jika ada
            if (values.photo) {
                formData.append("photo", values.photo); 
            }

             // Update jika ID ada, kalau tidak, buat baru
            if (id) {
                formData.append("_method", "PUT");
                await updateCustomer({storeId: storeId, id, data: formData});
            } else {
                await storeCustomer({storeId: storeId, data: formData});
            }
        }
    });

    const { values, errors, touched, handleChange, handleSubmit } = formik;

    // image
    const [images, setImages] = useState<any>([]); // State untuk gambar preview
    const maxNumber = 69;  // Limit jumlah gambar

    // Fungsi saat gambar diubah atau diupload
    const onChange = (imageList: ImageListType, addUpdateIndex: number[] | undefined) => {
    setImages(imageList as never[]);
        if (imageList.length > 0) {
            formik.setFieldValue("photo", imageList[0].file); // Set field Formik
        } else {
            formik.setFieldValue("photo", null);
        }
    };

    // Jika data customer memiliki gambar, set gambar awal
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
            toast.success("Create Successfully") // Notifikasi sukses create
            navigate(`/${storeId}/${entity}/${dataStore?.id}`);
        }
        if (isUpdateSuccess) {
            toast.success("Update Successfully") // Notifikasi sukses update
        }
        if (errorStore) {
            const errorData = errorStore as any;
            toast.error(errorData.data.message); // Notifikasi error saat create
        }
        if (errorUpdate) {
            const errorData = errorStore as any;
            toast.error(errorData.data.message); // Notifikasi error saat update
        }
    }, [isSuccessStore, isUpdateSuccess, errorStore, errorUpdate])

    return (
        // Form customer dengan handler `handleSubmit` ketika form disubmit
        <form onSubmit={handleSubmit} >
            {/* Header dan button save */}
            <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
                <h2 className="text-xl">{capitalizeFirstLetter(entity)}</h2>
                <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                    <div className="relative">
                        <div className="flex items-center gap-2">
                            {/* button save */}
                            <button type="submit" className="btn btn-primary">
                                Save 
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Grid */}
            <div className="grid lg:grid-cols-6 grid-cols-1 gap-6">
                {/* Kolom untuk upload gambar */}
                <div className="col-span-1 lg:col-span-2">
                    <div className="panel" id="single_file">
                        <div className="mb-5">
                            <div className="custom-file-container" data-upload-id="myFirstImage">
                                <div className="label-container">
                                    <label>Upload </label>
                                    {/* button untuk menghapus gambar yang dipilih */}
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
                                {/* Input file tersembunyi, dikontrol oleh ImageUploading */}
                                <label className="custom-file-container__custom-file"></label>
                                <input
                                    hidden
                                    id="photo"
                                    name="photo"
                                    type="file"
                                    accept="image/*"
                                    onChange={(event: any) => {
                                        const file = event.currentTarget.files[0];
                                        formik.setFieldValue("photo", file); // Simpan file ke formik

                                        // Set gambar baru ke pratinjau
                                        const reader = new FileReader();
                                        reader.onload = (e) => {
                                            setImages([{ dataURL: e.target?.result, file }]);
                                        };
                                        if (file) reader.readAsDataURL(file);
                                    }}
                                    className="custom-file-container__custom-file__custom-file-input"
                                />
                                {/* Validasi formik jika ada error */}
                                {formik.errors.photo && formik.touched.photo && (
                                    <div className="text-red-500 text-sm mt-1">{formik.errors.photo}</div>
                                )}
                                <input type="hidden" name="MAX_FILE_SIZE" value="10485760" />
                                {/* Komponen untuk manajemen upload gambar */}
                                <ImageUploading value={images} onChange={onChange} maxNumber={maxNumber}>
                                    {({ imageList, onImageUpload, onImageRemoveAll, onImageUpdate, onImageRemove, isDragging, dragProps }) => (
                                        <div className="upload__image-wrapper">
                                            {/* button pilih file */}
                                            <button
                                                type="button"
                                                className="custom-file-container__custom-file__custom-file-control"
                                                onClick={onImageUpload}
                                                {...dragProps}
                                                style={isDragging ? { backgroundColor: "#afafaf" } : undefined}
                                            >
                                                Choose File...
                                            </button>
                                            {/* Tampilkan pratinjau gambar yang dipilih */}
                                            {imageList.map((image, index) => (
                                                <div key={index} className="custom-file-container__image-preview relative">
                                                    <img src={image.dataURL} alt="img" className="m-auto" />
                                                    {/* <button onClick={() => onImageRemove(index)}>Remove</button> */}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </ImageUploading>
                                {/* Gambar default jika belum ada gambar di-upload */}
                                {images.length === 0 ? <img src="/assets/images/file-preview.svg" className="max-w-md w-full m-auto" alt="" /> : ''}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-1 grid-cols-1 gap-6 col-span-1 lg:col-span-4">
                    {/* Grid */}
                    <div className="panel" id="forms_grid">
                        <div className="mb-5">
                            <div className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Nama */}
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

                                    {/* Nama toko */}
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

                                    {/* Email */}
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

                                    {/* Nomor telepon */}
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

                                    {/* Nama pemilik rekening */}
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

                                    {/* Pilihan nama bank */}
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

                                    {/* Nomor rekening */}
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

                                    {/* Cabang bank */}
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

                                    {/* Kota */}
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

                                    {/* Alamat (textarea) */}
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

export default CustomersForm;