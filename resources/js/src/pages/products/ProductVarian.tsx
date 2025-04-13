import React from 'react';
import { FC, useEffect, useState } from "react";
import ProductImage2 from "./ProductImage2";

type Props = {
    handleVariantChange: any,
    formik: any,
    isVariant: any,
    data: any,
};

const ProductVariant: FC<Props> = ({
    handleVariantChange,
    formik,
    isVariant,
}) => {
    const [collapsed, setCollapsed] = useState(
        formik.values.variants.map((_: any, index: any) => index !== 0) // true untuk selain indeks 0
    );

    // const [variantsToRender, setVariantsToRender] = useState(isVariant ? formik.values.variants : [formik.values.variants[0]])

    const toggleCollapse = (index: number) => {
        setCollapsed((prev: any) =>
            prev.map((isCollapsed: any, i: any) => (i === index ? !isCollapsed : isCollapsed))
        );
    };

    // Jika isVariant false, hanya render varian indeks 0
    const variantsToRender = isVariant ? formik.values.variants : [formik.values.variants[0]];

    return (
        <div className="panel">
            <div className="mb-5">
                {variantsToRender.map((variant: any, index: number) => (
                    <div key={index}>
                        <div className="mb-4">
                            {/* Header Varian */}
                            {isVariant ? (
                                <div className="flex justify-between items-center">
                                    <h4 className="text-lg">{variant.variant}</h4>
                                    <button
                                        type="button"
                                        className="text-gray-500 hover:text-gray-700"
                                        onClick={() => toggleCollapse(index)}
                                    >
                                        {collapsed[index] ? (
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M19 15L12 9L5 15" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        ) : (
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M19 9L12 15L5 9" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>

                                        )}
                                    </button>
                                </div>
                            ) : (
                                <h4 className="text-lg">Product information</h4>
                            )}
                        </div>

                        {/* Konten Varian */}
                        {!collapsed[index] && (
                            <div className="mb-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label>Price</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={formik.values.variants[index]?.price || ""}
                                            onChange={(e) => handleVariantChange(index, "price", e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label>Sale Price</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={formik.values.variants[index]?.sale_price || ""}
                                            onChange={(e) => handleVariantChange(index, "sale_price", e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label>Quantity</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={formik.values.variants[index]?.quantity || ""}
                                            onChange={(e) => handleVariantChange(index, "quantity", e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label>SKU</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={formik.values.variants[index]?.sku || ""}
                                            onChange={(e) => handleVariantChange(index, "sku", e.target.value)}
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <ProductImage2
                                            setImages={(images: any) => handleVariantChange(index, "images", images)}
                                            formik={formik}
                                            images={formik.values.variants[index]?.images || null}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Garis Pemisah */}
                        {isVariant && index < formik.values.variants.length - 1 && (
                            <hr
                                className="my-6 border-gray-300"
                                style={{
                                    marginLeft: '-1.25rem',
                                    marginRight: '-1.25rem',
                                    width: 'calc(100% + 2.5rem)',
                                }}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductVariant;