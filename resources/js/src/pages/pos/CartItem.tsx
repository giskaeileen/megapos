import React from 'react';
import { formatRupiah } from "../../components/tools";
import IconMinus from "../../components/Icon/IconMinus";
import IconPlus from "../../components/Icon/IconPlus";

const CartItem = ({ item, selectedOption, handleQtyChange }) => {
  return (
    <tr>
      <td className="!px-0">
        <div className="flex gap-4 items-center justify-center">
          <div className="relative">
            <div className="inline-flex flex-col w-[38px]">
              <button
                type="button"
                className="bg-secondary-light flex justify-center items-center rounded-t-xl p-1 font-semibold border border-b-0"
                onClick={() => handleQtyChange(item, item.qty - 1)}
              >
                <IconMinus className="w-4" />
              </button>
              <input 
                type="text" 
                className="form-input rounded-none text-center py-1 px-2" 
                min="0" 
                max="25" 
                readOnly 
                value={item.qty}
              />
              <button
                type="button"
                className="bg-secondary-light flex justify-center items-center rounded-b-xl p-1 font-semibold border border-t-0"
                onClick={() => handleQtyChange(item, item.qty + 1)}
              >
                <IconPlus className="w-4" />
              </button>
            </div>
          </div>
        </div>
      </td>

      <td>
        <div className="flex items-center !justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-32">
              <img 
                src={item.product_image
                  ? item.product_image.startsWith('http')
                    ? item.product_image
                    : `${import.meta.env.VITE_SERVER_URI_BASE}storage/products/${item.product_image}`
                  : '/assets/images/blank_product.png'
                } 
                className="w-16 h-16 rounded-md overflow-hidden object-cover" 
                alt="img" 
              />
            </div>
            <div>
              <div className="text-base font-bold line-clamp-2">{item.name}</div>
              <div>
                {item.attribute && Object.entries(item.attribute).map(([key, value]) => (
                  <span key={key} className="badge bg-info rounded-full mr-1 text-[.7rem] p-1.5 py-0">{value as string}</span> 
                ))}
              </div>
              <div>
                {(item.discount_normal || (selectedOption && item.discount_member)) && (
                  <div className="text-white-dark line-through">{formatRupiah(item.price)}</div>
                )}
                <div className="text-primary text-base font-bold">
                  {formatRupiah(
                    selectedOption && item.discount_member
                      ? item.price - (item.price * item.discount_member) / 100
                      : item.discount_normal
                        ? item.price - (item.price * item.discount_normal) / 100
                        : item.price
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
};

export default CartItem;