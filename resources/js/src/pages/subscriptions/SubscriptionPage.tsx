import React from 'react';
import { useEffect, useState, useCallback } from 'react';
import QuotaForm from './QuotaForm';
import PaymentSummary from './PaymentSummary';
import PaymentNotificationHandler from './PaymentNotificationHandler';
import MidtransScriptLoader from './MidtransScriptLoader';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import PaymentHistoryTable from './PaymentHistoryTable';
import { useLocation } from 'react-router-dom';
import { DataTableSortStatus } from 'mantine-datatable';
import { useDispatch, useSelector } from 'react-redux';
import { useDeleteUserMutation } from '../../redux/features/user/userApi';
import { IRootState } from '../../redux/store';
import { useGetPaymentHistoryQuery } from '../../redux/features/payment-histories/paymentHistoriesApi';
import { deleteConfirmation } from '../../components/tools';
import { setPageTitle } from '../../store/themeConfigSlice';
import { useSearchParams, useNavigate } from 'react-router-dom';

interface Quota {
    transactions: number;
    products: number;
    employees: number;
    stores: number;
}

interface Pricing {
    price_transaction: number;
    price_product: number;
    price_employee: number;
    price_store: number;
}

interface Subscription {
    end_date: string;
    [key: string]: any;
}

const SubscriptionPage = () => {
    // entity localstorage
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);
    const entity = pathnames[0];
    const entityCols = `${entity}_cols`;
    const entityPage = `${entity}_page`;
    const entitySort = `${entity}_sort`;
    const entityFilterColumn = `${entity}_filter_column`;
    const entityFilterValue = `${entity}_filter_value`;

    // state
    const [page, setPage] = useState<number>(() => {
        const storedPage = localStorage.getItem(entityPage);
        return storedPage ? parseInt(storedPage, 10) : 1; // Konversi ke number, default ke 1
    });
    const [search, setSearch] = useState(() => {
        return localStorage.getItem(`${entity}_search`) || '';
    });
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>(() => {
        const storedSort = localStorage.getItem(`${entitySort}`);
        return storedSort ? JSON.parse(storedSort) : { columnAccessor: 'created_at', direction: 'desc' };
    });
    const dispatch = useDispatch();
    const [items, setItems] = useState<any[]>([]);
    const [total, setTotal] = useState();
    const [deleteUser] = useDeleteUserMutation();
    const [hideCols, setHideCols] = useState<string[]>([]);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
    const [selectedColumn, setSelectedColumn] = useState<string>(() => {
        return localStorage.getItem(`${entity}_filter_column`) || '';
    }); // Kolom yang difilter
    const [filterValue, setFilterValue] = useState<string>(() => {
        return localStorage.getItem(`${entity}_filter_value`) || '';
    }); // nilai filter
    const navigate = useNavigate();

    //page

    //data
    const { data, refetch } = useGetPaymentHistoryQuery(
        {
            page,
            search,
            sort: sortStatus.columnAccessor,
            direction: sortStatus.direction,
            filterColumn: selectedColumn,
            filterValue: filterValue,
        },
        { refetchOnMountOrArgChange: true }
    );
    const cols = [
        { accessor: 'no', title: 'No' },
        { accessor: 'order_id', title: 'Order ID' },
        { accessor: 'amount', title: 'Amount' },
        { accessor: 'status', title: 'Status' },
        { accessor: 'payment_method', title: 'Payment Method' },
        { accessor: 'transaction_id', title: 'Transaction ID' },
        { accessor: 'quota_details', title: 'Quota Details' },
        { accessor: 'transaction_time', title: 'Transaction Time' },
        { accessor: 'created_at', title: 'Created At' },
    ];

    /*****************************
     * search
     */

    useEffect(() => {
        localStorage.setItem(`${entity}_search`, search);
    }, [search]);

    /*****************************
     * filter
     */

    useEffect(() => {
        localStorage.setItem(entityFilterColumn, selectedColumn);
        localStorage.setItem(entityFilterValue, filterValue);
    }, [selectedColumn, filterValue]);

    /*****************************
     * sort
     */

    useEffect(() => {
        localStorage.setItem(`${entitySort}`, JSON.stringify(sortStatus));
    }, [sortStatus]);

    useEffect(() => {
        const storedSort = localStorage.getItem(`${entitySort}`);
        if (storedSort) {
            setSortStatus(JSON.parse(storedSort));
        }
    }, []);

    /*****************************
     * delete
     */

    const deleteRow = () => {
        deleteConfirmation(selectedRecords, deleteUser, refetch);
    };

    /*****************************
     * page
     */

    const [pageSize, setPageSize] = useState(10);
    const [initialRecords, setInitialRecords] = useState<any[]>([]);
    useEffect(() => {
        setInitialRecords(items);
    }, [items]);
    const [records, setRecords] = useState(initialRecords);
    const [selectedRecords, setSelectedRecords] = useState<any>([]);

    // Muat data awal dari localStorage saat komponen pertama kali dirender
    useEffect(() => {
        const storedPage = localStorage.getItem(entityPage);
        if (storedPage) {
            setPage(Number(storedPage));
        }
    }, []);

    // Simpan nilai `page` ke localStorage saat berubah
    useEffect(() => {
        localStorage.setItem(entityPage, String(page));
    }, [page]);

    // Perbarui data `records` setiap kali `page` atau `pageSize` berubah
    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecords(initialRecords);
    }, [page, pageSize, initialRecords]);

    /*****************************
     * items
     */

    useEffect(() => {
        if (data?.data) {
            const mappedItems = data.data.map((d: any, index: number) => {
                // Buat objek berdasarkan kolom yang telah didefinisikan
                let mappedObject: { [key: string]: any } = {
                    id: d.id,
                };

                cols.forEach((col) => {
                    if (col.accessor === 'created_at') {
                        mappedObject[col.accessor] = new Intl.DateTimeFormat('id-ID', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            timeZone: 'Asia/Jakarta',
                        }).format(new Date(d[col.accessor]));
                    } else if (col.accessor === 'no') {
                        mappedObject[col.accessor] = index + 1 + (page - 1) * pageSize;
                    } else if (col.accessor === 'photo') {
                        mappedObject[col.accessor] = d.photo ? `${import.meta.env.VITE_SERVER_URI_BASE}storage/profile/${d.photo}` : '/assets/images/profile-2.jpeg';
                    } else if (col.accessor === 'role') {
                        mappedObject[col.accessor] = d?.roles && d?.roles.length > 0 ? d?.roles[0]?.name : '';
                    } else {
                        mappedObject[col.accessor] = d[col.accessor];
                    }
                });

                return mappedObject;
            });

            setItems(mappedItems);
            setTotal(data.total);
        }
    }, [data, page, pageSize]);

    // Mengatur judul halaman
    useEffect(() => {
        dispatch(setPageTitle('Users'));
    }, [dispatch]);

    /*****************************
     * checkbox hide show
     */

    // Memuat data dari localStorage saat komponen pertama kali dirender
    useEffect(() => {
        const storedCols = localStorage.getItem(entityCols);
        if (storedCols) {
            setHideCols(JSON.parse(storedCols));
        }
    }, []);

    // Fungsi untuk mengatur kolom yang disembunyikan
    const showHideColumns = (col: string) => {
        const updatedCols = hideCols.includes(col)
            ? hideCols.filter((d) => d !== col) // Hapus kolom dari daftar
            : [...hideCols, col]; // Tambahkan kolom ke daftar

        setHideCols(updatedCols);

        // Simpan data terbaru ke localStorage
        localStorage.setItem(entityCols, JSON.stringify(updatedCols));
    };

    // ===================
    // ===================
    // ===================
    // ===================
    // State management
    const [quota, setQuota] = useState<Quota>({
        transactions: 0,
        products: 0,
        employees: 0,
        stores: 0,
    });

    const [pricing, setPricing] = useState<Pricing>({
        price_transaction: 0,
        price_product: 0,
        price_employee: 0,
        price_store: 0,
    });

    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Constants
    const clientKey = import.meta.env.MIDTRANS_CLIENT_KEY;
    const API_URL = `${import.meta.env.VITE_SERVER_URI_BASE}api`;

    // Data fetching functions
    const fetchQuotaSettings = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/quota-settings`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch quota settings');

            const data = await response.json();
            setQuota({
                transactions: data.quota_transactions || 0,
                products: data.quota_products || 0,
                employees: data.quota_employees || 0,
                stores: data.quota_stores || 0,
            });
        } catch (error) {
            console.error('Failed to fetch quota settings:', error);
            Swal.fire('Error', 'Failed to load quota settings', 'error');
        }
    }, [API_URL]);

    const fetchPricing = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/settings`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch pricing');

            const settingsData = await response.json();
            const settingsObject = settingsData.reduce((acc: Record<string, string>, setting: any) => {
                acc[setting.key] = setting.value;
                return acc;
            }, {});

            setPricing({
                price_transaction: parseFloat(settingsObject.quota_transactions) || 0,
                price_product: parseFloat(settingsObject.quota_products) || 0,
                price_employee: parseFloat(settingsObject.quota_employees) || 0,
                price_store: parseFloat(settingsObject.quota_stores) || 0,
            });
        } catch (error) {
            console.error('Failed to fetch pricing:', error);
            Swal.fire('Error', 'Failed to load pricing', 'error');
        }
    }, [API_URL]);

    const fetchSubscription = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/subscription/current`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch subscription');

            const data = await response.json();
            setSubscription(data.subscription);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    // Initial data loading
    useEffect(() => {
        const loadData = async () => {
            await Promise.all([fetchQuotaSettings(), fetchPricing(), fetchSubscription()]);
        };

        loadData();
    }, [fetchQuotaSettings, fetchPricing, fetchSubscription]);

    // Handle quota submission
    const handleQuotaSubmit = async (newQuota: Quota) => {
        try {
            const response = await fetch(`${API_URL}/subscription/save-quota`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    quota_transactions: newQuota.transactions,
                    quota_products: newQuota.products,
                    quota_employees: newQuota.employees,
                    quota_stores: newQuota.stores,
                }),
            });

            if (!response.ok) throw new Error('Failed to save quota');
            setQuota(newQuota);
            toast.success('Save successfully');
        } catch (error) {
            console.error('Failed to save quota:', error);
            Swal.fire('Error', 'Failed to save quota', 'error');
        }
    };

    // Calculate total price
    const calculateTotalPrice = useCallback((): number => {
        return quota.transactions * pricing.price_transaction + quota.products * pricing.price_product + quota.employees * pricing.price_employee + (quota.stores > 0 ? (quota.stores - 1) * pricing.price_store : quota.stores * pricing.price_store);
    }, [quota, pricing]);

    // Check if subscription is expired
    const isSubscriptionExpired = subscription ? new Date() > new Date(subscription.end_date) : true;

    // Handle payment
    const handlePayClick = async () => {
        try {
            const response = await fetch(`${API_URL}/payment/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    quota_transactions: quota.transactions,
                    quota_products: quota.products,
                    quota_employees: quota.employees,
                    quota_stores: quota.stores,
                }),
            });

            const { snap_token, order_id, } = await response.json();

            if (snap_token && (window as any).snap) {
                (window as any).snap.pay(snap_token, {
                    onSuccess: async (result: any) => {
                        // === ini untuk server
                        try {
                            const response = await fetch(`${API_URL}/payment/notification`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                                },
                                body: JSON.stringify({
                                    transaction_time: new Date().toISOString(),
                                    transaction_status: 'settlement',
                                    transaction_id: order_id,
                                    status_message: 'midtrans payment notification',
                                    status_code: "200",
                                    signature_key: 'abc123...',
                                    email: 'email@gmail.com',
                                    order_id: order_id,
                                    gross_amount: calculateTotalPrice(),
                                    custom_field1: quota.transactions,
                                    custom_field2: quota.products,
                                    custom_field3: quota.employees,
                                    custom_field4: quota.stores,
                                }),
                            });

                            if (response.ok) {
                                fetchSubscription();
                                // Swal.fire('Success', 'Payment Success', 'success');
                            }

                        } catch (error) {
                            console.error('Payment notification error:', error);
                        }       

                        Swal.fire('Success', 'Payment successful!', 'success');
                        navigate('/current-subs', { replace: true });
                        fetchSubscription();
                    },
                    onPending: (result: any) => {
                        Swal.fire('Info', 'Payment pending', 'info');
                    },
                    onError: (error: any) => {
                        Swal.fire('Error', 'Payment failed', 'error');
                    },
                });
            }
        } catch (error: any) {
            console.error('Payment error:', error);
            Swal.fire('Error', 'Failed to process payment', 'error');
        }
    };

    if (loading) return <div className="text-center py-8">Loading...</div>;
    //   if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Quota Form Section */}
                <QuotaForm onSubmit={handleQuotaSubmit} initialValues={quota} />

                {/* Payment Summary Section */}
                <PaymentSummary quota={quota} pricing={pricing} isSubscriptionExpired={isSubscriptionExpired} calculateTotalPrice={calculateTotalPrice} onPayClick={handlePayClick} />

                {/* Payment Notification Handler */}
                <PaymentNotificationHandler API_URL={API_URL} quota={quota} calculateTotalPrice={calculateTotalPrice} fetchSubscription={fetchSubscription} />

                {/* Midtrans Script Loader */}
                <MidtransScriptLoader clientKey={clientKey} />
            </div>

            <PaymentHistoryTable
                data={records}
                totalRecords={total}
                page={page}
                pageSize={pageSize}
                sortStatus={sortStatus}
                hideCols={hideCols}
                isRtl={isRtl}
                onPageChange={setPage}
                onSortStatusChange={setSortStatus}
                onSelectedRecordsChange={setSelectedRecords}
                selectedColumn={selectedColumn}
                filterValue={filterValue}
                onColumnChange={setSelectedColumn}
                onFilterChange={setFilterValue}
                search={search}
                onSearchChange={setSearch}
                onToggleColumn={showHideColumns}
            />
        </>
    );
};

export default SubscriptionPage;
