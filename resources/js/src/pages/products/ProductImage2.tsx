import React from 'react';
import { FC } from "react";
import ImageUploading, { ImageListType } from 'react-images-uploading';

type Props = {
    setImages: any,
    formik: any,
    images: any,
};

const ProductImage2: FC<Props> = ({
    setImages,
    formik,
    images,
}) => {
    const maxNumber = 69;
    const onChange = (imageList: ImageListType, addUpdateIndex: number[] | undefined) => {
        setImages(imageList as never[]);
    };

    return (
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
                    id="product_image"
                    name="product_image"
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                        const file = event.currentTarget.files ? event.currentTarget.files[0] : null;
                        formik.setFieldValue("product_image", file);

                        // Set gambar baru ke pratinjau
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            setImages([{ dataURL: e.target?.result, file }]);
                        };
                        if (file) reader.readAsDataURL(file);
                    }}
                    className="custom-file-container__custom-file__custom-file-input"
                />
                {formik.errors.product_image && formik.touched.product_image && (
                    <div className="text-red-500 text-sm mt-1">{formik.errors.product_image}</div>
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
                            {imageList?.map((image, index) => (
                                <div key={index} className="custom-file-container__image-preview relative">
                                    <img src={image.dataURL} alt="img" className="m-auto" />
                                </div>
                            ))}
                        </div>
                    )}
                </ImageUploading>
                {images?.length === 0 ? <img src="/assets/images/file-preview.svg" className="max-w-md w-full m-auto" alt="" /> : ''}
            </div>
        </div>
    )
};

export default ProductImage2;