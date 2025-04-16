import { FC } from "react";
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';

type Props = {
    values: any, // Nilai form dari Formik
    handleChange: any, // Fungsi untuk menangani perubahan input
    errors: any, // Objek error dari Formik
    touched: any, // Objek touched dari Formik
    categories: any, // Data kategori produk
    suppliers: any, // Data supplier
    isRtl: any, // Penanda jika layout RTL (Right to Left)
    formik: any, // Objek Formik secara keseluruhan
    isVariant: any, // Boolean apakah produk punya varian
    handleCheckboxVariantChange: any, // Fungsi untuk toggle checkbox varian produk
};

/**
 * Komponen ProductInformation
 * Menampilkan form informasi produk seperti nama, kategori, supplier, dll.
 */
const ProductInformation: FC<Props> = ({
    values,
    handleChange,
    errors,
    touched,
    categories,
    suppliers,
    isRtl,
    formik,
    isVariant,
    handleCheckboxVariantChange,
}) => {
    return (
        <div className="panel">
            <div className="mb-5">
                <div className="space-y-5">
                    {/* Grid layout 2 kolom saat sm screen ke atas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Input Nama Produk */}
                        <div>
                            <label htmlFor="product_name">Name<span className="text-danger">*</span></label>
                            <input
                                id="product_name"
                                type="text"
                                placeholder="Enter Name"
                                className="form-input"
                                value={values.product_name}
                                onChange={handleChange}
                            />
                            {/* Validasi Error */}
                            {errors.product_name && touched.product_name && (
                                <span className="text-red-500 block mt-2">{errors.product_name}</span>
                            )}
                        </div>

                        {/* Select Kategori */}
                        <div>
                            <label htmlFor="category_id">Category</label>
                            <select
                                id="category_id"
                                className="form-select text-white-dark"
                                value={values.category_id}  // Set nilai yang sesuai dengan formik values
                                onChange={handleChange}  // Tangani perubahan nilai
                            >
                                <option value="">Choose...</option>
                                {/* Loop semua kategori */}
                                {categories?.data?.map((item: any) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}  {/* Menampilkan nama role */}
                                    </option>
                                ))}
                            </select>
                            {/* Validasi Error */}
                            {errors.category_id && touched.category_id && (
                                <span className="text-red-500">{errors.category_id}</span>
                            )}
                        </div>

                        {/* Select Supplier */}
                        <div>
                            <label htmlFor="supplier_id">Supplier</label>
                            <select
                                id="supplier_id"
                                className="form-select text-white-dark"
                                value={values.supplier_id}  // Set nilai yang sesuai dengan formik values
                                onChange={handleChange}  // Tangani perubahan nilai
                            >
                                <option value="">Choose...</option>
                                {/* Loop semua supplier */}
                                {suppliers?.data?.map((item: any) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}  {/* Menampilkan nama role */}
                                    </option>
                                ))}
                            </select>
                            {/* Validasi Error */}
                            {errors.supplier_id && touched.supplier_id && (
                                <span className="text-red-500">{errors.supplier_id}</span>
                            )}
                        </div>

                        {/* Input Satuan */}
                        <div>
                            <label htmlFor="unit">Unit<span className="text-danger">*</span></label>
                            <input
                                id="unit"
                                type="text"
                                placeholder="Enter Unit"
                                className="form-input"
                                value={values.unit}
                                onChange={handleChange}
                            />
                            {/* Validasi Error */}
                            {errors.unit && touched.unit && (
                                <span className="text-red-500 block mt-2">{errors.unit}</span>
                            )}
                        </div>

                        {/* Input Diskon Normal */}
                        <div>
                            <label htmlFor="discount_normal">Discount Normal</label>
                            <input
                                id="discount_normal"
                                type="number"
                                placeholder="Enter Discount Normal"
                                className="form-input"
                                value={values.discount_normal}
                                onChange={handleChange}
                            />
                            {/* Validasi Error */}
                            {errors.discount_normal && touched.discount_normal && (
                                <span className="text-red-500 block mt-2">{errors.discount_normal}</span>
                            )}
                        </div>

                        {/* Input Diskon Member */}
                        <div>
                            <label htmlFor="discount_member">Discount Member</label>
                            <input
                                id="discount_member"
                                type="number"
                                placeholder="Enter Discount Member"
                                className="form-input"
                                value={values.discount_member}
                                onChange={handleChange}
                            />
                            {/* Validasi Error */}
                            {errors.discount_member && touched.discount_member && (
                                <span className="text-red-500 block mt-2">{errors.discount_member}</span>
                            )}
                        </div>

                        {/* Textarea Deskripsi */}
                        <div className="sm:col-span-2">
                            <label htmlFor="description">Description<span className="text-danger">*</span></label>
                            <textarea 
                                id="description" 
                                rows={3} 
                                placeholder="Enter Description" 
                                className="form-textarea" 
                                value={values.description}
                                onChange={handleChange}
                            ></textarea>
                            {/* Validasi Error */}
                            {errors.description && touched.description && (
                                <span className="text-red-500 block mt-2">{errors.description}</span>
                            )}
                        </div>

                        {/* Checkbox Produk memiliki varian */}
                        <div>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="form-checkbox"
                                    checked={isVariant}
                                    onChange={handleCheckboxVariantChange} 
                                />
                                <span className=" text-white-dark">Product Varians</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default ProductInformation;