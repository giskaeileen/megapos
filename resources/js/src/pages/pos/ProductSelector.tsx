import React from 'react';
import Select from 'react-select';
import { useRef } from 'react';

const ProductSelector = ({ products, selectedOption2, setSelectedOption2, addPos }) => {
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

  const options = formatProductOptions(products);

  const filterOptions = (option, inputValue) => {
    const searchText = inputValue.toLowerCase();
    return (
      option?.data?.sku?.toLowerCase().includes(searchText) ||
      option?.data?.label?.toLowerCase().includes(searchText)
    );
  };

  const formatOptionLabel = ({ label, price, stock, sku }) => (
    <div>
      <div>{label}</div>
      <div style={{ fontSize: '12px', color: '#666' }}>
        {price.toLocaleString()} | {sku} | {stock}
      </div>
    </div>
  );

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

  const selectRef = useRef(null);

  const handleKeyDown = (event) => {
    if (event.key.code === "Enter") {
      event.preventDefault();
      setSelectedOption2(null);
      setTimeout(() => {
        selectRef.current?.focus();
      }, 0);
    }
  };

  const handleSelectChange = (selected) => {
    setSelectedOption2(selected);
    addPos(selected);
  };

  return (
    <div className="mt-2 mb-4 flex gap-2 items-center">
      <div className="w-full">
        <Select
          placeholder="Select Product"
          options={options}
          filterOption={filterOptions}
          formatOptionLabel={formatOptionLabel}
          menuPlacement="top"
          styles={customStyles}
          isClearable={true}
          value={selectedOption2}
          onChange={handleSelectChange}
          onKeyDown={handleKeyDown}
          ref={selectRef}
        />
      </div>
    </div>
  );
};

export default ProductSelector;