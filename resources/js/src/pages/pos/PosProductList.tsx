import React from 'react';
import { FC, Fragment, useState } from 'react';
import IconCaretDown from '../../components/Icon/IconCaretDown';
import { formatRupiah } from '../../components/tools';
import NoRecords from '../../components/Layouts/NoRecords';
import { Dialog, Transition } from '@headlessui/react';
import IconX from '../../components/Icon/IconX';
import Pagination from '../../components/Pagination';
import AttributeSelectionModal from './AttributeSelectionModal';

type Props = {
    filteredItems: any;
    handlePageChange: any;
    page: any;
    total: any;
    pageSize: any;
    addPos: any;
};

const PosProductList: FC<Props> = ({ filteredItems, handlePageChange, page, total, pageSize, addPos }) => {
    const [openModal, setOpenModal] = useState<any>(false);
    const [currentVariations, setCurrentVariations] = useState<any[]>([]);
    const [variation, setVariation] = useState<Record<string, any>>({});
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, any>>({});
    const [selectedPrice, setSelectedPrice] = useState(null);
    const [currentVariation, setCurrentVariation] = useState<any>(null);

    const handleAttributeChange = (attributeId: string, value: string | number) => {
        const updatedAttributes: Record<string, string | number> = { ...selectedAttributes, [attributeId]: value };
        setSelectedAttributes(updatedAttributes);

        // Cari variasi yang sesuai dengan atribut yang dipilih
        const matchingVariation = currentVariations.find((variation) =>
            variation.attributes.every(
                (attr: { attribute_value: { attribute_id: string; value: string | number } }) => updatedAttributes[attr.attribute_value.attribute_id] === attr.attribute_value.value
            )
        );

        // Tetapkan harga jika variasi ditemukan
        if (matchingVariation) {
            // setSelectedPrice(matchingVariation.sale_price || matchingVariation.price);
            setSelectedPrice(matchingVariation.price);
            setCurrentVariation(matchingVariation);
        } else {
            setSelectedPrice(null);
        }
    };

    return (
        <div className="mt-5 panel p-0 border-0 overflow-hidden">
            <div className="table-responsive">
                <table className="table-striped table-hover">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Name</th>
                            <th>Discount</th>
                            <th>Price</th>
                            <th className="!text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems && filteredItems?.length !== 0 ? (
                            filteredItems?.map((item: any, index: number) => {
                                //price yang paling kecil
                                const minPrice = item.product_variants.reduce((min: number, variation: any) => {
                                    return variation.price < min ? variation.price : min;
                                }, Infinity);

                                return (
                                    <tr key={item.id}>
                                        <td>{(index + 1) + ((page - 1) * pageSize)}</td>
                                        <td>
                                            {/* <div className="flex items-center w-max">
                                            <div className="w-max">
                                                <img src={ item.product_image
                                                    ? `${import.meta.env.VITE_SERVER_URI_BASE}storage/products/${item.product_image}` 
                                                    : '/assets/images/blank_profile.png'} 
                                                    className="h-8 w-8 rounded-full object-cover ltr:mr-2 rtl:ml-2" 
                                                    alt="avatar" 
                                                />
                                            </div>
                                            <div>{item.product_name}</div>
                                        </div> */}
                                            <div className="flex items-center font-semibold">
                                                <div className="rounded-md w-max ltr:mr-2 rtl:ml-2">
                                                    <img
                                                        className="w-12 h-12 rounded-md overflow-hidden object-cover"
                                                        src={
                                                            // item.product_image
                                                            //     ? `${import.meta.env.VITE_SERVER_URI_BASE}storage/products/${item.product_image}`
                                                            //     : '/assets/images/blank_product.png'
                                                            item.product_image
                                                                ? item.product_image.startsWith('http')
                                                                    ? item.product_image // Jika merupakan URL online, gunakan langsung
                                                                    : `${import.meta.env.VITE_SERVER_URI_BASE}storage/products/${item.product_image}` // Jika merupakan path di server, tambahkan base URL
                                                                : '/assets/images/blank_product.png'
                                                        }
                                                        alt="Product"
                                                    />
                                                </div>
                                                <div>
                                                    <div className="truncate text-wrap line-clamp-2">{item.product_name}</div>
                                                    <div className="truncate text-white-dark max-w-[200px]">{item.description}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap flex gap-2">
                                            {item.discount_member ? <span className="badge bg-info rounded-full">{item.discount_member}%</span> : <></>}
                                            {item.discount_normal ? <span className="badge bg-warning rounded-full">{item.discount_normal}%</span> : <></>}
                                        </td>
                                        <td className="whitespace-nowrap">
                                            {/* {item.selling_price} */}
                                            <div>
                                                {item.discount_normal ? <div className="text-white-dark line-through">{formatRupiah(minPrice)}</div>: <></>}
                                                <div className="text-primary text-base font-bold">
                                                    {formatRupiah(item.discount_normal ? minPrice - (minPrice * item.discount_normal) / 100 : minPrice)}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex gap-4 items-center justify-center">
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-primary"
                                                    // onClick={() => addPos(item)}
                                                    onClick={() => {
                                                        if (item.product_variants.length > 1) {
                                                            setCurrentVariations(item.variations);
                                                            setOpenModal(true);
                                                            setVariation(item);
                                                        } else {
                                                            addPos({ ...item, ...item.variations[0] });
                                                        }
                                                    }}
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={5}>
                                    <NoRecords />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <AttributeSelectionModal
                    openModal={openModal}
                    setOpenModal={setOpenModal}
                    currentVariations={currentVariations}
                    selectedAttributes={selectedAttributes}
                    handleAttributeChange={handleAttributeChange}
                    selectedPrice={selectedPrice}
                    addPos={addPos}
                    variation={variation}
                    setSelectedAttributes={setSelectedAttributes}
                    setSelectedPrice={setSelectedPrice}
                />

                <Pagination currentPage={page} totalItems={total} itemsPerPage={pageSize} onPageChange={handlePageChange} />
            </div>
        </div>
    );
};

export default PosProductList;
