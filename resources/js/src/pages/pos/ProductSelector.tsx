import React from 'react';
import Select from 'react-select';
import { useRef } from 'react';

/**
 * Komponen untuk memilih produk melalui dropdown menggunakan react-select.
 * Menampilkan produk dan variasinya secara dinamis, serta menambahkan produk ke POS saat dipilih.
 */
const ProductSelector = ({ products, selectedOption2, setSelectedOption2, addPos }) => {
  /**
   * Fungsi untuk memformat produk dan variasinya ke dalam bentuk opsi Select.
   * - Jika ada variasi: setiap variasi dijadikan opsi tersendiri.
   * - Jika tidak ada variasi: produk langsung dijadikan opsi.
   */
  const formatProductOptions = (products) => {
    return products?.data?.flatMap((product) => {
      if (product.product_variants.length > 0) {
        return product.product_variants.map((variant) => ({
          ...product,
          value: variant.id,
          label: `${product.product_name} - ${variant.product_attributes.map((attr) => attr.attribute_value.value).join(", ")}`,
          product: product,
          selectedAttributes: variant.product_attributes.reduce((acc, attr) => {
            acc[attr.attribute_value.attribute_id] = attr.attribute_value.value;
            return acc;
          }, {}),
          price: variant.sale_price,
          stock: variant.quantity,
          sku: variant.sku,
          image: variant.product_image
        }));
      } else {
        return {
          value: product.id,
          label: product.product_name,
          product: product,
          selectedAttributes: {},
          price: product.discount_normal,
          stock: null,
          sku: product.sku,
          image: product.product_image
        };
      }
    }) || [];
  };

  // Format opsi produk yang akan ditampilkan di dropdown
  const options = formatProductOptions(products);

  /**
   * Fungsi untuk filter pencarian berdasarkan label atau SKU.
   * Menyesuaikan cara pencarian di dropdown saat user mengetikkan input.
   */
  const filterOptions = (option, inputValue) => {
    const searchText = inputValue.toLowerCase();
    return (
      option?.data?.sku?.toLowerCase().includes(searchText) ||
      option?.data?.label?.toLowerCase().includes(searchText)
    );
  };

  /**
   * Fungsi untuk menampilkan label opsi secara custom.
   * Menampilkan nama produk, harga, SKU, dan stok.
   */
  const formatOptionLabel = ({ label, price, stock, sku }) => (
    <div>
      <div>{label}</div>
      <div style={{ fontSize: '12px', color: '#666' }}>
        {price.toLocaleString()} | {sku} | {stock}
      </div>
    </div>
  );

  // Styling khusus untuk komponen react-select
  const customStyles = {
    control: (base) => ({
      ...base,
      borderRadius: "9999px",
      padding: "5px 10px",
      border: "1px solid #ccc",
      boxShadow: "none",
      "&:hover": { borderColor: "#888" },
    }),
    menu: (base) => ({ ...base, borderRadius: "10px" }),
    option: (base, { isFocused }) => ({
      ...base,
      backgroundColor: isFocused ? "#f0f0f0" : "white",
      color: "#333",
    }),
  };

  // Ref untuk fokus ulang ke input setelah memilih produk
  const selectRef = useRef(null);

  /**
   * Menangani penekanan tombol Enter agar bisa reset input dan fokus kembali.
   */
  const handleKeyDown = (event) => {
    if (event.key.code === "Enter") {
      event.preventDefault();
      setSelectedOption2(null);
      setTimeout(() => {
        selectRef.current?.focus();
      }, 0);
    }
  };

  /**
   * Menangani saat produk dipilih dari dropdown:
   * - Set produk terpilih
   * - Tambahkan ke daftar POS
   */
  const handleSelectChange = (selected) => {
    setSelectedOption2(selected);
    addPos(selected);
  };

  return (
    <div className="mt-2 mb-4 flex gap-2 items-center">
      <div className="w-full">
      <Select
          placeholder="Select Product"
          options={options} // Opsi produk hasil format
          filterOption={filterOptions} // Custom filter berdasarkan SKU dan nama
          formatOptionLabel={formatOptionLabel} // Custom tampilan label opsi
          menuPlacement="top"
          styles={customStyles} // Styling react-select
          isClearable={true} // Bisa clear input
          value={selectedOption2} // Nilai yang sedang dipilih
          onChange={handleSelectChange} // Event saat memilih
          onKeyDown={handleKeyDown} // Event saat tekan tombol
          ref={selectRef} // Untuk fokus ulang
        />
      </div>
    </div>
  );
};

export default ProductSelector;