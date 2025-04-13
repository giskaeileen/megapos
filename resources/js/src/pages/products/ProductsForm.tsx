import React from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { setPageTitle } from '../../store/themeConfigSlice';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import toast from 'react-hot-toast';
import { useGetCategoriesQuery } from '../../redux/features/categories/categoriesApi';
import { useGetSuppliersQuery } from '../../redux/features/suppliers/suppliersApi';
import { useGetSingleProductQuery, useStoreProductMutation, useUpdateProductMutation } from '../../redux/features/products/productsApi';
import { IRootState } from '../../redux/store';
import 'flatpickr/dist/flatpickr.css';
import ProductImage from './ProductImage';
import ProductInformation from './ProductInformation';
import ProductAttribute from './ProductAttibute';
import ProductVariant from './ProductVarian';
import { useGetAttributesQuery } from '../../redux/features/attributes/attributesApi';

const ProductsForm = () => {
    /*****************************
     * tools
     */

    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);
    const storeId = pathnames[0];
    const entity = pathnames[1];

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setPageTitle('File Upload Preview'));
    });

    function capitalizeFirstLetter(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // date
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    /*****************************
     * defenitions
     */

    const navigate = useNavigate();
    const { id } = useParams();
    const { data } = useGetSingleProductQuery({ storeId, id }, { skip: !id }); // Menarik data jika ID ada
    const [updateProduct, { isSuccess: isUpdateSuccess, error: errorUpdate }] = useUpdateProductMutation();
    const [storeProduct, { data: dataStore, error: errorStore, isSuccess: isSuccessStore }] = useStoreProductMutation();
    const { data: categories } = useGetCategoriesQuery({ storeId: storeId });
    const { data: suppliers } = useGetSuppliersQuery({ storeId: storeId });
    const { data: dataAttributes } = useGetAttributesQuery({ storeId: storeId });

    /*****************************
     * validation
     */

    const schema = Yup.object().shape({});

    /*****************************
     * form data
     */

    console.log(data)

    // Menangani formik
    const formik = useFormik({
        enableReinitialize: true,
        // values
        initialValues: {
            product_name: data?.product_name || '',
            category_id: data?.category_id || '',
            supplier_id: data?.supplier_id || '',
            store_id: storeId,
            unit: data?.unit || '',
            description: data?.description || '',
            product_image: null,
            discount_normal: data?.discount_normal,
            discount_member: data?.discount_member,
            variants:
                data?.product_variants.map((variation: any) => ({
                    id: variation.id,
                    sku: variation.sku,
                    price: variation.price,
                    sale_price: variation.sale_price,
                    quantity: variation.quantity,
                    // images: variation.product_image
                    //     ? [
                    //           {
                    //               dataURL: `${import.meta.env.VITE_SERVER_URI_BASE}storage/products/${variation.product_image}`,
                    //               file: null,
                    //           },
                    //       ]
                    //     : [],
                    images: variation.product_image
                        ? [
                            {
                                dataURL: variation.product_image.startsWith('http')
                                    ? variation.product_image
                                    : `${import.meta.env.VITE_SERVER_URI_BASE}storage/products/${variation.product_image}`,
                                file: null,
                            },
                        ]
                        : [],
                    attributes: variation.product_attributes.map((attr: any) => ({
                        id: attr.id,
                        attribute_value_id: attr.attribute_value_id,
                    })),
                })) || [],
        },
        validationSchema: schema,
        onSubmit: async (values) => {
            const formData = new FormData();
            formData.append('product_name', values.product_name);
            formData.append('category_id', values.category_id);
            formData.append('supplier_id', values.supplier_id);
            formData.append('unit', values.unit);
            if(values.discount_member) {
                formData.append('discount_member', values.discount_member);
            }
            if(values.discount_normal) {
                formData.append('discount_normal', values.discount_normal);
            }
            formData.append('description', values.description);

            // Menambahkan gambar produk utama jika ada
            if (values.product_image) {
                formData.append('product_image', values.product_image);
            }

            // Menambahkan varian
            values.variants.forEach((variant: any, index: number) => {
                // jika isVariant false maka yang dikirim hanya variants index 0
                if (!isVariant && index !== 0) return;

                formData.append(`variants[${index}][id]`, variant.id);
                formData.append(`variants[${index}][sku]`, variant.sku);
                formData.append(`variants[${index}][price]`, variant.price);
                formData.append(`variants[${index}][sale_price]`, variant.sale_price);
                formData.append(`variants[${index}][quantity]`, variant.quantity);
                formData.append(`variants[${index}][price]`, variant.price);
                formData.append(`variants[${index}][variant]`, variant.variant);

                variant.attributes.forEach((attribute: any, attrIndex: number) => {
                    formData.append(`variants[${index}][attributes][${attrIndex}][attribute]`, attribute.attribute);
                    formData.append(`variants[${index}][attributes][${attrIndex}][valueId]`, attribute.valueId);
                    formData.append(`variants[${index}][attributes][${attrIndex}][value]`, attribute.value);
                });

                // Menambahkan gambar varian
                if (variant.images) {
                    variant.images.forEach((image: any, imageIndex: number) => {
                        formData.append(`variants[${index}][images]`, image.file);
                    });
                }
            });

            // Log isi formData
            for (const pair of formData.entries()) {
                console.log(`${pair[0]}: ${pair[1]}`);
            }

            if (id) {
                formData.append('_method', 'PUT');
                await updateProduct({ storeId: storeId, id, data: formData });
            } else {
                await storeProduct({ storeId: storeId, data: formData });
            }
        },
    });

    const { values, errors, touched, handleChange, handleSubmit } = formik;

    // image
    const [images, setImages] = useState<any>([]);

    useEffect(() => {
        if (data?.product_image) {
            const imageUrl = data.product_image.startsWith('http')
                ? data.product_image // Jika URL online, gunakan langsung
                : `${import.meta.env.VITE_SERVER_URI_BASE}storage/products/${data.product_image}`; // Jika path di server, tambahkan base URL

            const initialImage = {
                dataURL: imageUrl,
                file: null,
            };
            setImages([initialImage]);
        }
    }, [data]);

    /*****************************
     * status
     */

    useEffect(() => {
        if (isSuccessStore) {
            toast.success('Create Successfully');
            navigate(`/${storeId}/${entity}/${dataStore?.id}`);
        }
        if (isUpdateSuccess) {
            toast.success('Update Successfully');
        }
        if (errorStore) {
            const errorData = errorStore as any;
            toast.error(errorData.data.message);
        }
        if (errorUpdate) {
            const errorData = errorStore as any;
            // toast.error(errorData.data.message);
            toast.error(errorData);
        }
    }, [isSuccessStore, isUpdateSuccess, errorStore, errorUpdate]);

    // ======== attribute

    // const [attributes, setAttributes] = useState([{ attribute: '', value: [] }]);

    interface AttributeValue {
        value: string;
        label: string;
        valueId: number;
    }

    interface Attribute {
        attribute: string;
        value: AttributeValue[];
    }

    // Tentukan tipe state secara eksplisit
    const [attributes, setAttributes] = useState<Attribute[]>([]);

    // Fungsi untuk mendapatkan nama atribut
    const getAttributeOptions = () => {
        return (
            dataAttributes?.data.map((attr: any) => ({
                value: attr.name,
                label: attr.name,
            })) || []
        );
    };

    // Fungsi untuk mendapatkan nilai atribut berdasarkan nama
    const getOptions = (attributeName: string) => {
        const attribute = dataAttributes?.data.find((attr: any) => attr.name === attributeName);

        return (
            attribute?.values.map((val: any) => ({
                value: val.value,
                label: val.value,
                valueId: val.id,
            })) || []
        );
    };

    // // Fungsi untuk menangani perubahan
    // const handleChange2 = (index: number, field: string, value: any) => {
    //     const updatedAttributes = [...attributes];
    //     updatedAttributes[index][field] = value;
    //     setAttributes(updatedAttributes);
    // };

    const handleChange2 = (index: number, field: string, value: any) => {
        const updatedAttributes = [...attributes];

        if (field in updatedAttributes[index]) { // Pastikan field valid
            updatedAttributes[index][field as keyof typeof updatedAttributes[number]] = value;
        }

        setAttributes(updatedAttributes);
    };

    const handleAddRow = () => {
        setAttributes([...attributes, { attribute: '', value: [] }]);
    };

    const handleRemoveRow = (index: number) => {
        setAttributes(attributes.filter((_, i) => i !== index));
    };

    useEffect(() => {
        if (data && data.product_variants) {
            // Proses data untuk membentuk struktur attributes
            const attributeMap: Record<string, { attribute: string; value: any[] }> = {};

            data.product_variants.forEach((variation: any) => {
                variation.product_attributes.forEach((attr: any) => {
                    const attributeName = `attribute_${attr.attribute_value.attribute_id}`;
                    const attributeValue = attr.attribute_value;
                    console.log(attributeValue)

                    if (!attributeMap[attributeName]) {
                        attributeMap[attributeName] = {
                            // attribute: attributeValue.attribute_id === 1 ? 'Color' : 'Size', // Beri nama berdasarkan attribute_id
                            attribute: attributeValue.attribute.name, 
                            value: [],
                        };
                    }

                    // Hindari duplikasi nilai
                    const isValueExist = attributeMap[attributeName].value.some((val: any) => val.valueId === attributeValue.id);

                    if (!isValueExist) {
                        attributeMap[attributeName].value.push({
                            value: attributeValue.value,
                            label: attributeValue.value,
                            valueId: attributeValue.id,
                        });
                    }
                });
            });

            // Ubah objek menjadi array
            const processedAttributes = Object.values(attributeMap);
            setAttributes(processedAttributes);
        }
    }, [data]);

    useEffect(() => {
        const allCombinations = (values: any[][]): any[] => {
            if (values.length === 0) return [[]];
            const first = values[0];
            const rest = allCombinations(values.slice(1));
            return first.flatMap((value) => rest.map((comb) => [value, ...comb]));
        };

        const attributeValues = attributes
            .filter((attr: any) => attr.value.length > 0)
            .map((attr: any) =>
                attr.value.map((v: any) => ({
                    attribute: attr.attribute,
                    valueId: v.valueId,
                    value: v.value,
                }))
            );

        const combinations = allCombinations(attributeValues);

        const generatedVariants = combinations.map((comb) => ({
            variant: comb.map((item: any) => item.value).join(' / '),
            attributes: comb.map((item: any) => ({
                attribute: item.attribute,
                valueId: item.valueId,
                value: item.value,
            })),
            price: '',
            sale_price: '',
            quantity: '',
            sku: '',
            images: [],
        }));

        // Update variants hanya yang cocok dengan data yang ada
        const updatedVariants = generatedVariants.map((newVariant, index) => {
            // Hanya update dua item pertama atau semua jika exitingVariants lebih sedikit
            if (index < formik.values.variants.length) {
                return {
                    ...formik.values.variants[index], // Keep the existing data for the rest
                    variant: newVariant.variant,
                    attributes: newVariant.attributes,
                };
            } else {
                // Jika generatedVariants lebih banyak, tetap gunakan data baru untuk sisa array
                return {
                    ...newVariant, // set new variant for the remaining items
                };
            }
        });

        // Set all variants, regardless of size difference
        formik.setFieldValue('variants', updatedVariants);
    }, [attributes]);

    const handleVariantChange = (index: number, field: string, value: any, attributeId?: string) => {
        const updatedVariants = [...formik.values.variants];

        if (field === 'attributes') {
            const existingAttributes = updatedVariants[index].attributes || [];
            const attributeIndex = existingAttributes.findIndex((attr: any) => attr.attributeId === attributeId);

            if (attributeIndex > -1) {
                existingAttributes[attributeIndex] = {
                    ...existingAttributes[attributeIndex],
                    valueId: value,
                };
            } else {
                existingAttributes.push({
                    attributeId,
                    valueId: value,
                });
            }

            updatedVariants[index].attributes = existingAttributes;
        } else {
            updatedVariants[index][field] = value;
        }

        formik.setFieldValue('variants', updatedVariants);
    };

    // ===============
    // varians

    const [isVariant, setIsVariant] = useState(false); // State untuk checkbox
    // const [isVariant, setIsVariant] = useState(formik.values.variants.length > 1); // State untuk checkbox

    const handleCheckboxVariantChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsVariant(event.target.checked); // Perbarui state berdasarkan status checkbox
    };

    useEffect(() => {
        if (data && data.product_variants.length > 1) {
            setIsVariant(true);
        } else {
            setIsVariant(false);
        }
    }, [data]);

    // ===============
    // validation 

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
                <h2 className="text-xl">{capitalizeFirstLetter(entity)}</h2>
                <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                    <div className="relative">
                        <div className="flex items-center gap-2">
                            <button type="submit" className="btn btn-primary">
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-6 grid-cols-1 gap-6">
                <div className="col-span-1 lg:col-span-2">
                    <div className="panel" id="single_file">
                        <ProductImage setImages={setImages} formik={formik} images={images} />
                    </div>
                </div>

                <div className="grid lg:grid-cols-1 grid-cols-1 gap-6 col-span-1 lg:col-span-4">
                    <ProductInformation
                        values={values}
                        handleChange={handleChange}
                        errors={errors}
                        touched={touched}
                        categories={categories}
                        suppliers={suppliers}
                        isRtl={isRtl}
                        formik={formik}
                        isVariant={isVariant}
                        handleCheckboxVariantChange={handleCheckboxVariantChange}
                    />

                    {isVariant && (
                        <ProductAttribute
                            attributes={attributes}
                            setAttributes={setAttributes}
                            handleRemoveRow={handleRemoveRow}
                            handleChange2={handleChange2}
                            getOptions={getOptions}
                            handleAddRow={handleAddRow}
                            dataAttributes={dataAttributes}
                            data={data}
                        />
                    )}

                    <ProductVariant handleVariantChange={handleVariantChange} formik={formik} isVariant={isVariant} data={data} />
                </div>
            </div>
        </form>
    );
};

export default ProductsForm;
