import { FC } from "react";
import ImageUploading, { ImageListType } from 'react-images-uploading';

type Props = {
    setImages: any, // Setter untuk menyimpan gambar yang diunggah
    formik: any, // Objek Formik untuk meng-handle form state dan validasi
    images: any, // Daftar gambar yang sedang ditampilkan
};

// Komponen utama untuk mengunggah gambar produk
const ProductImage: FC<Props> = ({
    setImages,
    formik,
    images,
}) => {
    const maxNumber = 69; // Maksimum jumlah gambar yang bisa diunggah

    // Fungsi yang dipanggil saat gambar ditambahkan/diubah
    const onChange = (imageList: ImageListType, addUpdateIndex: number[] | undefined) => {
        setImages(imageList as never[]); // Set gambar ke state parent
        if (imageList.length > 0) {
            // Simpan file gambar pertama ke formik field
            formik.setFieldValue("product_image", imageList[0].file);
        } else {
            // Kosongkan field jika tidak ada gambar
            formik.setFieldValue("product_image", null);
        }
    };

    return (
        <div className="mb-5">
            <div className="custom-file-container" data-upload-id="myFirstImage">
                {/* Label Upload & button Clear */}
                <div className="label-container">
                    <label>Upload </label>
                    <button
                        type="button"
                        className="custom-file-container__image-clear"
                        title="Clear Image"
                        onClick={() => {
                            setImages([]); // Menghapus semua gambar dari pratinjau
                        }}
                    >
                        ×
                    </button>
                </div>
                {/* Input file utama, hidden karena dikendalikan lewat button */}
                <label className="custom-file-container__custom-file"></label>
                <input
                    hidden
                    id="product_image"
                    name="product_image"
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                        const file = event.currentTarget.files ? event.currentTarget.files[0] : null;
                        formik.setFieldValue("product_image", file); // Set ke formik

                        // Set gambar baru ke pratinjau
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            setImages([{ dataURL: e.target?.result, file }]);
                        };
                        if (file) reader.readAsDataURL(file); // Konversi file ke dataURL
                    }}
                    className="custom-file-container__custom-file__custom-file-input"
                />
                {/* Validasi error jika ada */}
                {formik.errors.product_image && formik.touched.product_image && (
                    <div className="text-red-500 text-sm mt-1">{formik.errors.product_image}</div>
                )}
                {/* Batas maksimum ukuran file (opsional) */}
                <input type="hidden" name="MAX_FILE_SIZE" value="10485760" />
                {/* Komponen unggah gambar dengan pratinjau */}
                <ImageUploading value={images} onChange={onChange} maxNumber={maxNumber}>
                    {({ imageList, onImageUpload, onImageRemoveAll, onImageUpdate, onImageRemove, isDragging, dragProps }) => (
                        <div className="upload__image-wrapper">
                            {/* button unggah gambar */}
                            <button
                                type="button"
                                className="custom-file-container__custom-file__custom-file-control"
                                onClick={onImageUpload}
                                {...dragProps}
                                style={isDragging ? { backgroundColor: "#afafaf" } : undefined}
                            >
                                Choose File...
                            </button>
                            {/* Pratinjau gambar yang dipilih */}
                            {imageList.map((image, index) => (
                                <div key={index} className="custom-file-container__image-preview relative">
                                    <img src={image.dataURL} alt="img" className="m-auto" />
                                </div>
                            ))}
                        </div>
                    )}
                </ImageUploading>
                {/* Tampilkan ilustrasi jika belum ada gambar */}
                {images.length === 0 ? <img src="/assets/images/file-preview.svg" className="max-w-md w-full m-auto" alt="" /> : ''}
            </div>
        </div>
    )
};

export default ProductImage;