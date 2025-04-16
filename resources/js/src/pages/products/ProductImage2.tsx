import React from 'react';
import { FC } from "react";
import ImageUploading, { ImageListType } from 'react-images-uploading';

type Props = {
    setImages: any, // Fungsi setter untuk menyimpan array gambar ke state parent
    formik: any, // Objek Formik untuk handle state form & validasi
    images: any, // Array gambar yang ditampilkan
};

// Komponen upload gambar produk dengan pratinjau menggunakan ImageUploading
const ProductImage2: FC<Props> = ({
    setImages,
    formik,
    images,
}) => {
    const maxNumber = 69;// Jumlah maksimal gambar yang dapat diunggah

    // Fungsi dipanggil saat gambar ditambahkan, dihapus, atau diperbarui
    const onChange = (imageList: ImageListType, addUpdateIndex: number[] | undefined) => {
        setImages(imageList as never[]); // Update array gambar ke state parent
    };

    return (
        <div className="mb-5">
            <div className="custom-file-container" data-upload-id="myFirstImage">
                {/* Label Upload dan Tombol Clear */}
                <div className="label-container">
                    <label>Upload </label>
                    <button
                        type="button"
                        className="custom-file-container__image-clear"
                        title="Clear Image"
                        onClick={() => {
                            setImages([]); // Kosongkan daftar gambar
                        }}
                    >
                        ×
                    </button>
                </div>
                {/* Input file disembunyikan karena pakai tombol custom */}
                <label className="custom-file-container__custom-file"></label>
                <input
                    hidden
                    id="product_image"
                    name="product_image"
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                        // Ambil file yang dipilih
                        const file = event.currentTarget.files ? event.currentTarget.files[0] : null;
                        formik.setFieldValue("product_image", file);

                        // Set gambar baru ke pratinjau
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            setImages([{ dataURL: e.target?.result, file }]); // Tampilkan pratinjau
                        };
                        if (file) reader.readAsDataURL(file); // Baca file
                    }}
                    className="custom-file-container__custom-file__custom-file-input"
                />
                {/* Tampilkan pesan error jika field divalidasi dan error */}
                {formik.errors.product_image && formik.touched.product_image && (
                    <div className="text-red-500 text-sm mt-1">{formik.errors.product_image}</div>
                )}
                {/* Batas maksimum ukuran file */}
                <input type="hidden" name="MAX_FILE_SIZE" value="10485760" />
                {/* Komponen ImageUploading (perpustakaan untuk drag & drop + preview gambar) */}
                <ImageUploading value={images} onChange={onChange} maxNumber={maxNumber}>
                    {({ imageList, onImageUpload, onImageRemoveAll, onImageUpdate, onImageRemove, isDragging, dragProps }) => (
                        <div className="upload__image-wrapper">
                            {/* Tombol unggah file dengan efek drag */}
                            <button
                                type="button"
                                className="custom-file-container__custom-file__custom-file-control"
                                onClick={onImageUpload}
                                {...dragProps}
                                style={isDragging ? { backgroundColor: "#afafaf" } : undefined}
                            >
                                Choose File...
                            </button>
                             {/* Tampilkan daftar gambar yang sudah diunggah */}
                            {imageList?.map((image, index) => (
                                <div key={index} className="custom-file-container__image-preview relative">
                                    <img src={image.dataURL} alt="img" className="m-auto" />
                                </div>
                            ))}
                        </div>
                    )}
                </ImageUploading>
                {/* Jika belum ada gambar yang dipilih, tampilkan ilustrasi default */}
                {images?.length === 0 ? <img src="/assets/images/file-preview.svg" className="max-w-md w-full m-auto" alt="" /> : ''}
            </div>
        </div>
    )
};

export default ProductImage2;