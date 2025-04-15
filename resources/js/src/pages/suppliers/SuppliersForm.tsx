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

    /*****************************
     * tools 
     */
    
    // Mendapatkan lokasi (path) saat ini dan memecahnya untuk mendapatkan storeId dan entity
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);
    const storeId = pathnames[0];  // ID Toko (dari URL)
    const entity = pathnames[1];  // Entitas (misalnya "suppliers") dari URL

    const dispatch = useDispatch();  // Mengambil dispatch dari Redux untuk mengubah state global

    useEffect(() => {
        // Mengupdate judul halaman melalui Redux
        dispatch(setPageTitle('File Upload Preview'));
    });

    // Fungsi untuk mengubah huruf pertama pada string menjadi kapital
    function capitalizeFirstLetter(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /*****************************
     * defenitions 
     */

    const navigate = useNavigate();  // Hook untuk navigasi antar halaman
    const { id } = useParams();  // Mengambil ID dari parameter URL
    const { data } = useGetSingleSuppliersQuery({storeId, id}, { skip: !id });  // Mengambil data supplier berdasarkan storeId dan id
    const [updateSupplier, { isSuccess: isUpdateSuccess, error: errorUpdate }] = useUpdateSuppliersMutation();  // Mutation untuk update supplier
    const [storeSupplier, {
        data: dataStore, 
        error: errorStore, 
        isSuccess: isSuccessStore 
    }] = useStoreSuppliersMutation()  // Mutation untuk menyimpan supplier baru

    /*****************************
     * validation 
     */

    // Skema validasi untuk Formik menggunakan Yup
    const schema = Yup.object().shape({
        name: Yup.string()
            .required("Name is required")  // Nama wajib diisi
            .matches(/^[a-zA-Z\s]*$/, "Name can only contain letters and spaces"),  // Hanya boleh huruf dan spasi
        shopname: Yup.string()
            .required("Shop Name is required")  // Nama toko wajib diisi
            .matches(/^[a-zA-Z\s]*$/, "Shop Name can only contain letters and spaces"),  // Hanya boleh huruf dan spasi
        email: Yup.string()
            .email("Invalid email address")  // Format email harus valid
            .required("Email is required"),  // Email wajib diisi
        phone: Yup.string()
            .required("Phone is required")  // Nomor telepon wajib diisi
            .max(15, "Phone number cannot exceed 15 characters"),  // Maksimal 15 karakter
        bank_name: Yup.string()
            .required("Bank Name is required")  // Nama bank wajib diisi
            .notOneOf(["Choose..."], "Please select a valid bank name"),  // Tidak boleh memilih "Choose..."
        account_number: Yup.string()
            .required("Account Number is required")  // Nomor rekening wajib diisi
            .matches(/^[0-9]+$/, "Account Number must be a valid number"),  // Harus berupa angka
        bank_branch: Yup.string()
            .required("Bank Branch is required"),  // Cabang bank wajib diisi
        city: Yup.string()
            .required("City is required")  // Kota wajib diisi
            .matches(/^[a-zA-Z\s]*$/, "City can only contain letters and spaces"),  // Hanya boleh huruf dan spasi
        address: Yup.string()
            .required("Address is required"),  // Alamat wajib diisi
        type: Yup.string()
            .required("Type is required")  // Jenis supplier wajib diisi
            .notOneOf(["Choose..."], "Please select a valid type name"),  // Tidak boleh memilih "Choose..."
        photo: Yup.mixed()
            .test("fileType", "Unsupported File Format", (value) =>
                value ? ["image/jpg", "image/jpeg", "image/png"].includes(value.type) : true  // Format gambar harus jpg, jpeg, atau png
            )
            .test("fileSize", "File Size is too large. Maximum size is 1MB", (value) =>
                value ? value.size <= 1024 * 1024 : true  // Ukuran file maksimal 1MB
            ),
    });

    /*****************************
     * form data 
     */

    // Menangani formik untuk mengelola form data dan validasi
    const formik = useFormik({
        enableReinitialize: true,  // Mengaktifkan re-inisialisasi data form setiap data berubah
        initialValues: {
            name: data?.name || '',  // Nilai awal untuk nama, dari data yang diambil atau kosong
            shopname: data?.shopname || '',  // Nilai awal untuk nama toko
            username: data?.username || '',  // Nilai awal untuk username
            email: data?.email || '',  // Nilai awal untuk email
            photo: null,  // Foto, null jika tidak ada foto
            phone: data?.phone || '',  // Nilai awal untuk nomor telepon
            account_holder: data?.account_holder || '',  // Nilai awal untuk pemegang rekening
            bank_name: data?.bank_name || '',  // Nilai awal untuk nama bank
            account_number: data?.account_number || '',  // Nilai awal untuk nomor rekening
            bank_branch: data?.bank_branch || '',  // Nilai awal untuk cabang bank
            city: data?.city || '',  // Nilai awal untuk kota
            address: data?.address || '',  // Nilai awal untuk alamat
            type: data?.type || '',  // Nilai awal untuk tipe supplier
        },
        validationSchema: schema,  // Skema validasi dari Yup
        onSubmit: async (values) => {
            // Membuat FormData untuk mengirimkan data dalam format multipart
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
                formData.append("photo", values.photo);  // Menambahkan foto jika ada
            }

            // Jika id ada, lakukan update, jika tidak, simpan supplier baru
            if (id) {
                formData.append("_method", "PUT");
                await updateSupplier({storeId: storeId, id, data: formData});
            } else {
                await storeSupplier({storeId: storeId, data: formData});
            }
        }
    });

    // Menangani perubahan form dan error
    const { values, errors, touched, handleChange, handleSubmit } = formik;

    // Menangani gambar yang di-upload
    const [images, setImages] = useState<any>([]);  // Menyimpan gambar
    const maxNumber = 69;  // Maksimal jumlah gambar

    // Fungsi untuk menangani perubahan gambar yang di-upload
    const onChange = (imageList: ImageListType, addUpdateIndex: number[] | undefined) => {
        setImages(imageList as never[]);  // Mengupdate state gambar
        if (imageList.length > 0) {
            formik.setFieldValue("photo", imageList[0].file);  // Menyimpan gambar pertama ke Formik
        } else {
            formik.setFieldValue("photo", null);  // Menghapus gambar jika tidak ada
        }
    };

    useEffect(() => {
        // Jika data sudah ada dan ada foto, set foto awal
        if (data && data.photo) {
            const initialImage = {
                dataURL: `${import.meta.env.VITE_SERVER_URI_BASE}storage/${entity}/${data.photo}`,  // URL gambar
                file: null,  // File gambar tidak disertakan
            };
            setImages([initialImage]);
        }
    }, [data]);

    /*****************************
     * status 
     */

    useEffect(() => {
        // Menangani status setelah sukses atau gagal
        if (isSuccessStore) {
            toast.success("Create Successfully");  // Menampilkan toast jika berhasil membuat
            navigate(`/${storeId}/${entity}/${dataStore?.id}`);  // Arahkan ke halaman baru
        }
        if (isUpdateSuccess) {
            toast.success("Update Successfully");  // Menampilkan toast jika berhasil update
        }
        if (errorStore) {
            const errorData = errorStore as any;
            toast.error(errorData.data.message);  // Menampilkan pesan error jika gagal
        }
        if (errorUpdate) {
            const errorData = errorUpdate as any;
            toast.error(errorData.data.message);  // Menampilkan pesan error jika gagal update
        }
    }, [isSuccessStore, isUpdateSuccess, errorStore, errorUpdate]);

    return (
        <form onSubmit={handleSubmit} >
            {/* Bagian untuk tombol simpan dan judul */}
            <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
                <h2 className="text-xl">{capitalizeFirstLetter(entity)}</h2> {/* Menampilkan nama entitas dengan huruf pertama kapital */}
                <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                    <div className="relative">
                        <div className="flex items-center gap-2">
                            {/* Tombol untuk menyimpan form */}
                            <button type="submit" className="btn btn-primary">
                                Save 
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bagian untuk form input */}
            <div className="grid lg:grid-cols-6 grid-cols-1 gap-6">
                <div className="col-span-1 lg:col-span-2">
                    <div className="panel" id="single_file">
                        <div className="mb-5">
                            {/* Container untuk upload gambar */}
                            <div className="custom-file-container" data-upload-id="myFirstImage">
                                <div className="label-container">
                                    <label>Upload </label>
                                    {/* Tombol untuk menghapus gambar yang di-upload */}
                                    <button
                                        type="button"
                                        className="custom-file-container__image-clear"
                                        title="Clear Image"
                                        onClick={() => {
                                            setImages([]); // Menghapus gambar yang telah dipilih
                                        }}
                                    >
                                        ×
                                    </button>
                                </div>
                                <label className="custom-file-container__custom-file"></label>
                                {/* Input untuk memilih file gambar */}
                                <input
                                    hidden
                                    id="photo"
                                    name="photo"
                                    type="file"
                                    accept="image/*"
                                    onChange={(event: any) => {
                                        const file = event.currentTarget.files[0];
                                        formik.setFieldValue("photo", file); // Menyimpan gambar ke formik

                                        // Menampilkan pratinjau gambar
                                        const reader = new FileReader();
                                        reader.onload = (e) => {
                                            setImages([{ dataURL: e.target?.result, file }]); // Menampilkan gambar pratinjau
                                        };
                                        if (file) reader.readAsDataURL(file); // Membaca file yang dipilih
                                    }}
                                    className="custom-file-container__custom-file__custom-file-input"
                                />
                                {/* Menampilkan pesan error jika ada kesalahan pada input gambar */}
                                {formik.errors.photo && formik.touched.photo && (
                                    <div className="text-red-500 text-sm mt-1">{formik.errors.photo}</div>
                                )}
                                <input type="hidden" name="MAX_FILE_SIZE" value="10485760" />
                                
                                {/* Menggunakan ImageUploading untuk menangani proses upload gambar */}
                                <ImageUploading value={images} onChange={onChange} maxNumber={maxNumber}>
                                    {({ imageList, onImageUpload, onImageRemoveAll, onImageUpdate, onImageRemove, isDragging, dragProps }) => (
                                        <div className="upload__image-wrapper">
                                            {/* Tombol untuk memilih gambar */}
                                            <button
                                                type="button"
                                                className="custom-file-container__custom-file__custom-file-control"
                                                onClick={onImageUpload}
                                                {...dragProps}
                                                style={isDragging ? { backgroundColor: "#afafaf" } : undefined}
                                            >
                                                Choose File...
                                            </button>
                                            {/* Menampilkan pratinjau gambar yang telah dipilih */}
                                            {imageList.map((image, index) => (
                                                <div key={index} className="custom-file-container__image-preview relative">
                                                    <img src={image.dataURL} alt="img" className="m-auto" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </ImageUploading>
                                {/* Menampilkan gambar default jika belum ada gambar yang dipilih */}
                                {images.length === 0 ? <img src="/assets/images/file-preview.svg" className="max-w-md w-full m-auto" alt="" /> : ''}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bagian untuk input form lainnya */}
                <div className="grid lg:grid-cols-1 grid-cols-1 gap-6 col-span-1 lg:col-span-4">
                    {/* Panel untuk input form */}
                    <div className="panel" id="forms_grid">
                        <div className="mb-5">
                            <div className="space-y-5">
                                {/* Grid untuk input form */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        {/* Input untuk nama */}
                                        <label htmlFor="name">Name<span className="text-danger">*</span></label>
                                        <input
                                            id="name"
                                            type="text"
                                            placeholder="Enter Name"
                                            className="form-input"
                                            value={values.name}
                                            onChange={handleChange} // Menangani perubahan input
                                        />
                                        {/* Menampilkan pesan error jika input nama tidak valid */}
                                        {errors.name && touched.name && typeof errors.name === 'string' && (
                                            <span className="text-red-500 block mt-2">{errors.name}</span>
                                        )}
                                    </div>

                                    {/* Input untuk nama toko */}
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

                                    {/* Input untuk email */}
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

                                    {/* Input untuk nomor telepon */}
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

                                    {/* Input untuk pemegang rekening */}
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

                                    {/* Dropdown untuk memilih nama bank */}
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

                                    {/* Input untuk nomor rekening */}
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

                                    {/* Input untuk cabang bank */}
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

                                    {/* Input untuk kota */}
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

                                    {/* Dropdown untuk memilih jenis supplier */}
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

                                    {/* Input untuk alamat */}
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