import React, { useEffect, useState } from 'react';
import AddQuotaModal from './AddQuotaModal';
import QuotaProgressBar from './QuotaProgressBar';
import SubscriptionInfoCard from './SubscriptionInfoCard';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { DataTableSortStatus } from 'mantine-datatable';
import { useDeleteUserMutation } from '../../redux/features/user/userApi';
import { deleteConfirmation } from '../../components/tools';
import { setPageTitle } from '../../store/themeConfigSlice';
import { useGetPaymentHistoryQuery } from '../../redux/features/payment-histories/paymentHistoriesApi';
import PaymentHistoryTable from './PaymentHistoryTable';

// ... (keep your existing icons)

interface InitialQuota {
    transactions: number;
    products: number;
    employees: number;
    stores: number;
}

// Icons
const IconInbox = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
    </svg>
);

const IconTag = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A1 1 0 012.293 9.293L9 2.586l6.707 6.707a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

const IconCreditCard = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
        <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
    </svg>
);

const handleAddQuota = async (quota: { additional_transactions: number; additional_products: number; additional_employees: number; additional_stores: number }) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_SERVER_URI_BASE}api/subscription/add-quota`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(quota),
        });

        const { snap_token } = await response.json();

        if ((window as any).snap) {
            (window as any).snap.pay(snap_token, {
                onSuccess: (result: any) => {
                    // alert('Pembayaran berhasil! Kuota telah ditambahkan.');
                },
                onPending: (result: any) => {
                    // alert('Pembayaran tertunda. Silakan selesaikan pembayaran.');
                },
                onError: (error: any) => {
                    // alert('Pembayaran gagal. Silakan coba lagi.');
                },
            });
        }
    } catch (error) {
        console.error('Gagal menambahkan kuota:', error);
        Swal.fire('Error', 'Gagal menambahkan kuota. Silakan coba lagi.', 'error');
    }
};

const CurrentSubscription = () => {
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

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [subscription, setSubscription] = useState<any>(null);
    const [initialQuota, setInitialQuota] = useState<InitialQuota | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const API_URL = `${import.meta.env.VITE_SERVER_URI_BASE}api`;

    // Load Midtrans script
    useEffect(() => {
        const clientKey = import.meta.env.MIDTRANS_CLIENT_KEY;
        const script = document.createElement('script');
        script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
        script.setAttribute('data-client-key', clientKey);
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const [stats, setStats] = useState<any>();

    // First, modify your useEffect to fetch the stats data
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch current subscription
                const subResponse = await fetch(`${API_URL}/subscription/current`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (!subResponse.ok) throw new Error('Gagal mengambil data paket');
                const subData = await subResponse.json();
                setSubscription(subData.subscription);

                // Fetch statistics data
                const statsResponse = await fetch(`${API_URL}/get-onwer-quota`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (statsResponse.ok) {
                    const statsData = await statsResponse.json();
                    setStats(statsData);
                }

                // Fetch last payment history to get initial quota
                const paymentResponse = await fetch(`${API_URL}/payment-history/last`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (paymentResponse.ok) {
                    const paymentData = await paymentResponse.json();
                    if (paymentData.quota_details) {
                        setInitialQuota({
                            transactions: paymentData.quota_details.transactions || 0,
                            products: paymentData.quota_details.products || 0,
                            employees: paymentData.quota_details.employees || 0,
                            stores: paymentData.quota_details.stores || 0,
                        });
                    }
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const paymentNotification = async () => {
            const orderId = searchParams.get('order_id');
            const statusCode = searchParams.get('status_code');
            const transactionStatus = searchParams.get('transaction_status');

            const processedKey = `processed_${orderId}`;
            const alreadyProcessed = localStorage.getItem(processedKey);

            if (orderId && statusCode && transactionStatus && !alreadyProcessed) {
                localStorage.setItem(processedKey, 'true');
                try {
                    const response = await fetch(`${API_URL}/subscription/handle-add-quota`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                        body: JSON.stringify({
                            transaction_time: new Date().toISOString(),
                            transaction_status: transactionStatus,
                            transaction_id: orderId,
                            status_message: 'midtrans payment notification',
                            status_code: statusCode,
                            signature_key: 'abc123...',
                            email: 'email@gmail.com',
                            order_id: orderId,
                            //   gross_amount: calculateTotalPrice(),
                            //   custom_field1: quota.transactions,
                            //   custom_field2: quota.products,
                            //   custom_field3: quota.employees,
                            //   custom_field4: quota.stores,
                        }),
                    });

                    if (response.ok && transactionStatus == 'settlement') {
                        // fetchSubscription();
                        Swal.fire('Success', 'Payment Success', 'success');
                    }
                    navigate('/current-subs', { replace: true });
                } catch (error) {
                    console.error('Payment notification error:', error);
                }
            }
        };

        paymentNotification();
    }, [searchParams, navigate, API_URL]);

    if (loading) return <div className="text-center py-8">Memuat data paket...</div>;
    if (error) return <div className="text-center py-8 text-red-600">{error}</div>;
    if (!subscription) return <div className="text-center py-8">There are no active packages.</div>;

    const totalDays = Math.ceil((new Date(subscription.end_date).getTime() - new Date(subscription.start_date).getTime()) / (1000 * 60 * 60 * 24));

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SubscriptionInfoCard
                    startDate={subscription.start_date}
                    endDate={subscription.end_date}
                    remainingDays={subscription.remaining_days}
                    totalDays={totalDays}
                    onAddQuota={() => setIsModalOpen(true)}
                />

                <div className="panel">
                    <h2 className="text-xl font-semibold mb-4">Quota</h2>
                    <div className="space-y-6">
                        <QuotaProgressBar
                            icon={<IconInbox />}
                            title="Quota Transactions"
                            initial={initialQuota?.transactions || subscription.quota_transactions}
                            used={stats.total_orders}
                            current={subscription.quota_transactions}
                            color="blue"
                        />
                        <QuotaProgressBar
                            icon={<IconTag />}
                            title="Quota Products"
                            initial={initialQuota?.products || subscription.quota_products}
                            used={stats.total_products}
                            current={subscription.quota_products}
                            color="green"
                        />
                        <QuotaProgressBar
                            icon={<IconCreditCard />}
                            title="Quota Employees"
                            initial={initialQuota?.employees || subscription.quota_employees}
                            used={stats.total_employees}
                            current={subscription.quota_employees}
                            color="purple"
                        />
                        <QuotaProgressBar
                            icon={<IconInbox />}
                            title="Quota Stores"
                            initial={initialQuota?.stores || subscription.quota_stores}
                            used={stats.total_stores}
                            current={subscription.quota_stores}
                            color="yellow"
                        />
                    </div>
                </div>
            </div>

            <AddQuotaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddQuota={handleAddQuota} />

            <div className="mt-6">
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
            </div>
        </div>
    );
};

export default CurrentSubscription;