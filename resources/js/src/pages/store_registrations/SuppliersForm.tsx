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
    // Hook untuk navigasi ke halaman lain
    const navigate = useNavigate();

    // Mengambil parameter ID dari URL
    const { id } = useParams();  

    // Query untuk mengambil data supplier berdasarkan ID (hanya jika ID ada)
    const { data } = useGetSingleSuppliersQuery(id, { skip: !id });

    // Mutation untuk memperbarui data supplier
    const [updateSupplier, { isSuccess: isUpdateSuccess, error: errorUpdate }] = useUpdateSuppliersMutation();

    // Mutation untuk menyimpan supplier baru
    const [storeSupplier, {
        data: dataStore, 
        error: errorStore, 
        isSuccess: isSuccessStore 
    }] = useStoreSuppliersMutation();

    /*****************************
     * tools 
     */

    // Hook untuk mendapatkan lokasi URL saat ini
    const location = useLocation();

    // Memecah pathname URL menjadi array dan menyimpan segmen pertama sebagai entity
    const pathnames = location.pathname.split('/').filter((x) => x);
    const entity = pathnames[0];

    // Menggunakan dispatch untuk Redux
    const dispatch = useDispatch();

    // Men-set judul halaman saat komponen dirender
    useEffect(() => {
        dispatch(setPageTitle('File Upload Preview'));
    }, [dispatch]);

    // Fungsi untuk membuat huruf pertama dari string menjadi kapital
    function capitalizeFirstLetter(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /*****************************
     * validation 
     */

    // Skema validasi menggunakan Yup untuk memvalidasi form input
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
            // Validasi format file gambar
            .test("fileType", "Unsupported File Format", (value) =>
                value ? ["image/jpg", "image/jpeg", "image/png"].includes(value.type) : true
            )
            // Validasi ukuran maksimal file gambar
            .test("fileSize", "File Size is too large. Maximum size is 1MB", (value) =>
                value ? value.size <= 1024 * 1024 : true
            ),
    });

    /*****************************
     * form data 
     */

    // Inisialisasi dan konfigurasi Formik untuk menangani form supplier
    const formik = useFormik({
        enableReinitialize: true, // Memperbarui nilai initialValues jika `data` berubah
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
            // Menyiapkan form data untuk dikirim via API (termasuk file)
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

            // Jika user upload foto, tambahkan ke FormData
            if (values.photo) {
                formData.append("photo", values.photo); 
            }

            // Jika form adalah edit (ada id), maka kirim update
            if (id) {
                formData.append("_method", "PUT");
                await updateSupplier({id, data: formData});
            } else {
                // Jika form adalah create, panggil store mutation
                await storeSupplier(formData);
            }
        }
    });

    // Destrukturisasi properti dari Formik agar lebih ringkas dipakai di JSX
    const { values, errors, touched, handleChange, handleSubmit } = formik;

    /*****************************
     * image handler 
     */

    // State untuk menyimpan list image preview
    const [images, setImages] = useState<any>([]);

    // Jumlah maksimal gambar (tidak digunakan secara langsung tapi bisa untuk validasi UI)
    const maxNumber = 69;

    // Fungsi saat user memilih atau mengganti gambar
    const onChange = (imageList: ImageListType, addUpdateIndex: number[] | undefined) => {
        setImages(imageList as never[]);

        if (imageList.length > 0) {
            // Set file gambar ke formik field "photo"
            formik.setFieldValue("photo", imageList[0].file);
        } else {
            formik.setFieldValue("photo", null);
        }
    };

    // Jika ada data lama (edit), tampilkan foto yang sudah ada dari server
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
     * status handler 
     */

    useEffect(() => {
        // Jika create berhasil, tampilkan toast dan redirect ke halaman detail
        if (isSuccessStore) {
            toast.success("Create Successfully");
            navigate(`/${entity}/${dataStore?.id}`);
        }

        // Jika update berhasil, tampilkan toast
        if (isUpdateSuccess) {
            toast.success("Update Successfully");
        }

        // Menampilkan pesan error dari store supplier
        if (errorStore) {
            const errorData = errorStore as any;
            toast.error(errorData.data.message);
        }

        // Menampilkan pesan error dari update supplier
        if (errorUpdate) {
            const errorData = errorStore as any;
            toast.error(errorData.data.message);
        }
    }, [isSuccessStore, isUpdateSuccess, errorStore, errorUpdate]);

    return (
        // Form utama dengan event onSubmit mengarah ke fungsi handleSubmit
        <form onSubmit={handleSubmit}>
            {/* Header bagian atas form */}
            <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
                <h2 className="text-xl">{capitalizeFirstLetter(entity)}</h2>
                <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                    <div className="relative">
                        {/* Tombol submit untuk menyimpan data */}
                        <div className="flex items-center gap-2">
                            <button type="submit" className="btn btn-primary">
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid utama untuk pembagian layout */}
            <div className="grid lg:grid-cols-6 grid-cols-1 gap-6">
                {/* Kolom kiri untuk upload gambar */}
                <div className="col-span-1 lg:col-span-2">
                    <div className="panel" id="single_file">
                        <div className="mb-5">
                            <div className="custom-file-container" data-upload-id="myFirstImage">
                                {/* Label dan tombol clear image */}
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

                                {/* Input file tersembunyi untuk memilih gambar */}
                                <label className="custom-file-container__custom-file"></label>
                                <input
                                    hidden
                                    id="photo"
                                    name="photo"
                                    type="file"
                                    accept="image/*"
                                    // Saat gambar dipilih, simpan ke formik dan tampilkan preview
                                    onChange={(event: any) => {
                                        const file = event.currentTarget.files[0];
                                        formik.setFieldValue("photo", file);

                                        const reader = new FileReader();
                                        reader.onload = (e) => {
                                            setImages([{ dataURL: e.target?.result, file }]);
                                        };
                                        if (file) reader.readAsDataURL(file);
                                    }}
                                    className="custom-file-container__custom-file__custom-file-input"
                                />
                                {/* Validasi error untuk field foto */}
                                {formik.errors.photo && formik.touched.photo && (
                                    <div className="text-red-500 text-sm mt-1">{formik.errors.photo}</div>
                                )}

                                {/* Hidden field untuk batas maksimal file */}
                                <input type="hidden" name="MAX_FILE_SIZE" value="10485760" />

                                {/* Komponen untuk pratinjau dan upload image */}
                                <ImageUploading value={images} onChange={onChange} maxNumber={maxNumber}>
                                    {({ imageList, onImageUpload, onImageRemoveAll, onImageUpdate, onImageRemove, isDragging, dragProps }) => (
                                        <div className="upload__image-wrapper">
                                            {/* Tombol untuk memilih file */}
                                            <button
                                                type="button"
                                                className="custom-file-container__custom-file__custom-file-control"
                                                onClick={onImageUpload}
                                                {...dragProps}
                                                style={isDragging ? { backgroundColor: "#afafaf" } : undefined}
                                            >
                                                Choose File...
                                            </button>

                                            {/* Preview gambar yang telah diunggah */}
                                            {imageList.map((image, index) => (
                                                <div key={index} className="custom-file-container__image-preview relative">
                                                    <img src={image.dataURL} alt="img" className="m-auto" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </ImageUploading>

                                {/* Tampilkan placeholder jika belum ada gambar */}
                                {images.length === 0 ? <img src="/assets/images/file-preview.svg" className="max-w-md w-full m-auto" alt="" /> : ''}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Kolom kanan untuk form input data */}
                <div className="grid lg:grid-cols-1 grid-cols-1 gap-6 col-span-1 lg:col-span-4">
                    <div className="panel" id="forms_grid">
                        <div className="mb-5">
                            <div className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                    {/* Input Nama */}
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
                                        {/* Validasi error */}
                                        {errors.name && touched.name && typeof errors.name === 'string' && (
                                            <span className="text-red-500 block mt-2">{errors.name}</span>
                                        )}
                                    </div>

                                    {/* Input Nama Toko */}
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

                                    {/* Input Email */}
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

                                    {/* Input Telepon */}
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

                                    {/* Input Nama Pemilik Rekening */}
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

                                    {/* Pilihan Bank */}
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

                                    {/* Nomor Rekening */}
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

                                    {/* Cabang Bank */}
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

                                    {/* Tipe (Distributor / Whole Seller) */}
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

                                    {/* Alamat */}
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