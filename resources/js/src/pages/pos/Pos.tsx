import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';

import Cart from './Cart';
import PosProductList from './PosProductList';
import PosProductGrid from './PosProductGrid';
import CategorySlider from './CategorySlider';
import ViewToggle from './ViewToggle';
import SearchBar from './SearchBar';
import { useGetPosQuery, useUpdateStatusOrderMutation } from '../../redux/features/pos/posApi';
import { useGetCategoriesQuery } from '../../redux/features/categories/categoriesApi';
import { capitalizeFirstLetter } from '../../components/tools';
import { IRootState } from '../../redux/store';

const CART_KEY = 'cart';

const Pos: React.FC = () => {
    const [customer, setCustomer] = useState();

    // Routing and state management
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);

    // Extract storeId from URL
    const pathnames = location.pathname.split('/').filter((x) => x);
    const storeId = pathnames[0];
    const entity = pathnames[1];

    // Local storage keys
    const entityLayout = `${entity}_layout`;
    const entityPage = `${entity}_page`;
    const entityCategory = `${entity}_category`;

    // State initialization with localStorage
    const [isOpen, setIsOpen] = useState<boolean>(() => {
        return localStorage.getItem('isCartOpen') === 'true';
    });

    const [value, setValue] = useState<string>(() => {
        return localStorage.getItem(entityLayout) || 'list';
    });

    const [page, setPage] = useState<number>(() => {
        const storedPage = localStorage.getItem(entityPage);
        return storedPage ? parseInt(storedPage, 10) : 1;
    });

    const [selectedCategory, setSelectedCategory] = useState<string>(() => {
        return localStorage.getItem(entityCategory) || '';
    });

    const [search, setSearch] = useState(() => {
        return localStorage.getItem(`${entity}_search`) || '';
    });

    // Cart state
    const [dataCart, setDataCart] = useState<any[]>(() => {
        try {
            const storedCart = localStorage.getItem(CART_KEY);
            return storedCart ? JSON.parse(storedCart) : [];
        } catch (error) {
            return [];
        }
    });

    const [quantity, setQuantity] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);

    // API hooks
    const [updateStatusOrder] = useUpdateStatusOrderMutation();
    const { data: categories } = useGetCategoriesQuery({ storeId });
    const { data, refetch } = useGetPosQuery(
        {
            storeId,
            page,
            search,
            ...(selectedCategory && { category: selectedCategory }),
        },
        { refetchOnMountOrArgChange: true }
    );

    const [filteredItems, setFilteredItems] = useState<any>(data?.products?.data);
    const [pageSize, setPageSize] = useState(12);
    const [total, setTotal] = useState(data?.products?.total);

    // Effects for localStorage persistence
    useEffect(() => {
        localStorage.setItem('isCartOpen', JSON.stringify(isOpen));
    }, [isOpen]);

    useEffect(() => {
        localStorage.setItem(entityLayout, value);
    }, [value, entityLayout]);

    useEffect(() => {
        localStorage.setItem(entityPage, String(page));
    }, [page, entityPage]);

    useEffect(() => {
        localStorage.setItem(`${entity}_search`, search);
    }, [search, entity]);

    useEffect(() => {
        if (selectedCategory === undefined || selectedCategory === null) {
            localStorage.removeItem(entityCategory);
        } else {
            localStorage.setItem(entityCategory, String(selectedCategory));
        }
    }, [selectedCategory, entityCategory]);

    useEffect(() => {
        const updateOrderStatus = async () => {
            const orderId = searchParams.get('order_id');
            const statusCode = searchParams.get('status_code');
            const transactionStatus = searchParams.get('transaction_status');

            // Buat unique key untuk menyimpan status proses
            const processedKey = `order_processed_${orderId}`;
            const alreadyProcessed = localStorage.getItem(processedKey);

            if (orderId && statusCode && transactionStatus && !alreadyProcessed) {
                try {
                    // Tandai order ini sudah diproses
                    localStorage.setItem(processedKey, 'true');

                    const formData = new FormData();
                    formData.append('id', orderId);
                    formData.append('_method', 'PUT');

                    await updateStatusOrder({ storeId, data: formData });

                    setDataCart([]);

                    if (statusCode === '200' && transactionStatus === 'settlement') {
                        localStorage.removeItem('cart');
                        setTotalPrice(0);
                        Swal.fire('Success', 'Payment Success', 'success');
                    }

                    navigate(`/${storeId}/pos`, { replace: true });
                } catch (error) {
                    console.error('Failed to update order status:', error);
                    // Jika gagal, hapus flag processed agar bisa dicoba lagi
                    localStorage.removeItem(processedKey);
                }
            }
        };

        updateOrderStatus();
    }, [searchParams, navigate, storeId, updateStatusOrder]);

    // Update filtered items when data changes
    useEffect(() => {
        setFilteredItems(data?.products?.data);
        setTotal(data?.products?.total);
    }, [data]);

    // Cart functions
    const getCartFromLocalStorage = (): any[] => {
        const cart = localStorage.getItem(CART_KEY);
        return cart ? JSON.parse(cart) : [];
    };

    const saveCartToLocalStorage = (cart: any[]) => {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    };

    const addPos = (data: any) => {
        const cart = getCartFromLocalStorage();
        const existingProduct = cart.find((item: any) => item.id === data.id && JSON.stringify(item.attribute) === JSON.stringify(data.selectedAttributes));

        if (existingProduct) {
            existingProduct.qty += 1;
        } else {
            cart.push({
                id: data.id,
                product_id: data.product_id,
                name: data.product_name,
                product_image: data.product_image,
                price: data.price,
                discount_normal: data.discount_normal,
                discount_member: data.discount_member,
                attribute: data.selectedAttributes,
                qty: 1,
            });
        }

        saveCartToLocalStorage(cart);
        setDataCart(cart);
        updateSummary(cart);
    };

    const handleQtyChange = (item: any, newQty: number) => {
        if (newQty < 0 || newQty > 100) return;

        const cart = getCartFromLocalStorage();
        let updatedCart;

        if (newQty === 0) {
            updatedCart = cart.filter((cartItem: any) => cartItem.id !== item.id || JSON.stringify(cartItem.attribute) !== JSON.stringify(item.attribute));
            setTotalPrice(0);
        } else {
            updatedCart = cart.map((cartItem: any) => (cartItem.id === item.id && JSON.stringify(cartItem.attribute) === JSON.stringify(item.attribute) ? { ...cartItem, qty: newQty } : cartItem));
        }

        saveCartToLocalStorage(updatedCart);
        setDataCart(updatedCart);
    };

    const updateSummary = (cart: any[]) => {
        if (!Array.isArray(cart)) return;

        const totalQuantity = cart.reduce((sum, item) => sum + item.qty, 0);
        const totalAmount = cart.reduce((sum, item) => sum + (item.discount_normal ? item.price - (item.price * item.discount_normal) / 100 : item.price) * item.qty, 0);

        setQuantity(totalQuantity);
        setTotalPrice(totalAmount);
    };

    useEffect(() => {
        if (dataCart?.length > 0) {
            updateSummary(dataCart);
        }
    }, [dataCart]);

    const toggleSidebar = () => {
        const newValue = !isOpen;
        setIsOpen(newValue);
        localStorage.setItem('isCartOpen', JSON.stringify(newValue));
    };

    const handlePageChange = (newPage: number) => {
        if (total && newPage >= 1 && newPage <= Math.ceil(total / pageSize)) {
            setPage(newPage);
        }
    };

    const handleCategoryClick = (category: string) => {
        setSelectedCategory((prev) => (prev === category ? '' : category));
    };

    return (
        <div className="flex transition-all duration-300">
            <div className={`flex gap-5 relative sm:h-[calc(100vh_-_150px)] h-full overflow-y-auto flex-grow transition-all duration-300 ${isOpen ? 'mr-[400px]' : 'mr-0'}`}>
                <div className="w-full">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <h2 className="text-xl">Point Of Sale</h2>
                        <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                            <ViewToggle value={value} setValue={setValue} />
                            <SearchBar search={search} setSearch={setSearch} />
                        </div>
                    </div>

                    {categories?.data?.length > 0 && (
                        <CategorySlider categories={categories.data} selectedCategory={selectedCategory} handleCategoryClick={handleCategoryClick} themeConfig={themeConfig} />
                    )}

                    {value === 'list' ? (
                        <PosProductList filteredItems={filteredItems} handlePageChange={handlePageChange} page={page} total={total} pageSize={pageSize} addPos={addPos} />
                    ) : (
                        <PosProductGrid filteredItems={filteredItems} handlePageChange={handlePageChange} page={page} total={total} pageSize={pageSize} addPos={addPos} isOpen={isOpen} />
                    )}
                </div>
            </div>

            <Cart
                isOpen={isOpen}
                toggleSidebar={toggleSidebar}
                dataCart={dataCart}
                handleQtyChange={handleQtyChange}
                storeId={storeId}
                setDataCart={setDataCart}
                addPos={addPos}
                customer={customer}
                setCustomer={setCustomer}
                setTotalPrice={setTotalPrice}
                totalPrice={totalPrice}
            />
        </div>
    );
};

export default Pos;
