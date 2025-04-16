import { FC } from "react";
import Select from 'react-select';

// Definisi tipe props yang diterima komponen
type Props = {
    attributes: any, // Data array atribut produk yang sedang diatur
    setAttributes: any, // Setter state untuk atribut (tidak digunakan di sini)
    handleRemoveRow: any, // Fungsi untuk menghapus baris atribut tertentu
    handleChange2: any, // Fungsi untuk menangani perubahan atribut (nama atau nilai)
    getOptions: any, // Fungsi untuk mengambil opsi nilai berdasarkan nama atribut
    handleAddRow: any, // Fungsi untuk menambah baris atribut baru
    dataAttributes: any, // Data semua atribut yang tersedia
    data: any, // Data produk secara keseluruhan (tidak digunakan di sini)
};

// Komponen utama: Formulir dinamis untuk mengelola atribut produk
const ProductAttribute: FC<Props> = ({
    attributes,
    handleRemoveRow,
    handleChange2,
    getOptions,
    handleAddRow,
    dataAttributes,
    data
}) => {
    // Mapping data atribut jadi format option untuk select
    const attributeOptions = dataAttributes?.data.map((attr: any) => ({
        value: attr.name,
        label: attr.name,
    }));

    // Debug log untuk melihat data atribut di konsol
    console.log(attributes)

    return (
        <div className="panel" >
            <div className="mb-5">
                <h3 className="text-lg mb-3">Attributes</h3>

                <div className="space-y-5">
                    {/* Looping setiap atribut yang ada */}
                    {attributes.map((attr: any, index: number) => (
                        <div key={index}>
                            <div className="flex justify-between">
                                {/* Label untuk nama opsi */}
                                <label>Option {index + 1}</label>
                                {/* button hapus baris */}
                                <div
                                    onClick={() => handleRemoveRow(index)}
                                    className="text-danger cursor-pointer"
                                >
                                    Remove
                                </div>
                            </div>

                            {/* Grid untuk input nama atribut dan nilainya */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {/* Kolom nama atribut */}
                                <div className="sm:col-span-1">
                                    <label>
                                        Attribute Name
                                        <span className="text-danger">*</span>
                                    </label>
                                    <select
                                        id="attribute_name"
                                        className="form-select"
                                        value={attr.attribute} / Value yang dipilih
                                        onChange={(e) =>
                                            handleChange2(index, "attribute", e.target.value) // Trigger saat atribut berubah
                                        }
                                    >
                                        <option value="">Choose...</option>
                                        {/* List opsi dari dataAttributes */}
                                        {attributeOptions?.map((option: any) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Kolom nilai atribut */}
                                <div className="sm:col-span-2">
                                    <label>
                                        Attribute Value
                                        <span className="text-danger">*</span>
                                    </label>
                                    <Select
                                        placeholder="Select an option"
                                        options={getOptions(attr.attribute)} // Ambil opsi sesuai nama atribut
                                        isMulti // Bisa pilih lebih dari satu
                                        isSearchable={true} // Bisa dicari
                                        value={attr.value} // Nilai yang dipilih
                                        onChange={(selected) =>
                                            handleChange2(index, "value", selected) // Trigger saat nilai berubah
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* button untuk menambah baris atribut baru */}
                    <button
                        type="button"
                        className="btn btn-secondary mt-2"
                        onClick={handleAddRow}
                    >
                        Add Row
                    </button>
                </div>
            </div>
        </div>
    )
};

export default ProductAttribute;