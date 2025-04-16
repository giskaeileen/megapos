/**
 * Komponen SubscriptionPage
 * Halaman ini digunakan untuk menampilkan riwayat pembayaran, mengelola kuota langganan, dan melakukan proses pembayaran menggunakan Midtrans.
 */

interface Quota {
    transactions: number; // Kuota transaksi
    products: number; // Kuota produk
    employees: number; // Kuota karyawan
    stores: number; // Kuota toko
}

interface Pricing {
    price_transaction: number; // Harga per transaksi
    price_product: number; // Harga per produk
    price_employee: number; // Harga per karyawan
    price_store: number; // Harga per toko
}

interface Subscription {
    end_date: string; // Tanggal berakhir langganan
    [key: string]: any; // Properti lainnya (dinamis)
}

const SubscriptionPage = () => {
    // Menentukan nama entity berdasarkan path URL
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);
    const entity = pathnames[0];
    const entityCols = `${entity}_cols`;
    const entityPage = `${entity}_page`;
    const entitySort = `${entity}_sort`;
    const entityFilterColumn = `${entity}_filter_column`;
    const entityFilterValue = `${entity}_filter_value`;

    // State untuk pagination, pencarian, dan penyortiran
    const [page, setPage] = useState<number>(() => {
        const storedPage = localStorage.getItem(entityPage);
        return storedPage ? parseInt(storedPage, 10) : 1;
    });
    const [search, setSearch] = useState(() => {
        return localStorage.getItem(`${entity}_search`) || '';
    });
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>(() => {
        const storedSort = localStorage.getItem(`${entitySort}`);
        return storedSort ? JSON.parse(storedSort) : { columnAccessor: 'created_at', direction: 'desc' };
    });

    const dispatch = useDispatch();
    const [items, setItems] = useState<any[]>([]); // Data mentah
    const [total, setTotal] = useState(); // Total data
    const [deleteUser] = useDeleteUserMutation(); // Hook untuk hapus user
    const [hideCols, setHideCols] = useState<string[]>([]); // Kolom yang disembunyikan
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    const [selectedColumn, setSelectedColumn] = useState<string>(() => {
        return localStorage.getItem(`${entity}_filter_column`) || '';
    });
    const [filterValue, setFilterValue] = useState<string>(() => {
        return localStorage.getItem(`${entity}_filter_value`) || '';
    });
    const navigate = useNavigate();

    // Ambil data riwayat pembayaran dari server
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

    // Kolom-kolom tabel
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

    // Menyimpan nilai pencarian di localStorage
    useEffect(() => {
        localStorage.setItem(`${entity}_search`, search);
    }, [search]);

    // Menyimpan nilai filter di localStorage
    useEffect(() => {
        localStorage.setItem(entityFilterColumn, selectedColumn);
        localStorage.setItem(entityFilterValue, filterValue);
    }, [selectedColumn, filterValue]);

    // Menyimpan status sort di localStorage
    useEffect(() => {
        localStorage.setItem(`${entitySort}`, JSON.stringify(sortStatus));
    }, [sortStatus]);

    // Ambil kembali sort status saat component pertama kali dimuat
    useEffect(() => {
        const storedSort = localStorage.getItem(`${entitySort}`);
        if (storedSort) {
            setSortStatus(JSON.parse(storedSort));
        }
    }, []);

    // Fungsi untuk menghapus data
    const deleteRow = () => {
        deleteConfirmation(selectedRecords, deleteUser, refetch);
    };

    // State untuk pagination dan pemilahan data
    const [pageSize, setPageSize] = useState(10);
    const [initialRecords, setInitialRecords] = useState<any[]>([]);
    useEffect(() => {
        setInitialRecords(items);
    }, [items]);
    const [records, setRecords] = useState(initialRecords);
    const [selectedRecords, setSelectedRecords] = useState<any>([]);

    // Menyimpan dan mengambil nilai halaman dari localStorage
    useEffect(() => {
        const storedPage = localStorage.getItem(entityPage);
        if (storedPage) {
            setPage(Number(storedPage));
        }
    }, []);
    useEffect(() => {
        localStorage.setItem(entityPage, String(page));
    }, [page]);

    // Update data yang ditampilkan berdasarkan pagination
    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecords(initialRecords);
    }, [page, pageSize, initialRecords]);

    // Mapping data dari API ke format yang sesuai dengan table
    useEffect(() => {
        if (data?.data) {
            const mappedItems = data.data.map((d: any, index: number) => {
                let mappedObject: { [key: string]: any } = {
                    id: d.id,
                };
                cols.forEach((col) => {
                    if (col.accessor === 'created_at') {
                        mappedObject[col.accessor] = new Intl.DateTimeFormat('id-ID', {
                            year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Asia/Jakarta',
                        }).format(new Date(d[col.accessor]));
                    } else if (col.accessor === 'no') {
                        mappedObject[col.accessor] = index + 1 + (page - 1) * pageSize;
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

    // Set judul halaman
    useEffect(() => {
        dispatch(setPageTitle('Users'));
    }, [dispatch]);

    // Menyimpan kolom yang disembunyikan ke localStorage
    useEffect(() => {
        const storedCols = localStorage.getItem(entityCols);
        if (storedCols) {
            setHideCols(JSON.parse(storedCols));
        }
    }, []);

    const showHideColumns = (col: string) => {
        const updatedCols = hideCols.includes(col)
            ? hideCols.filter((d) => d !== col)
            : [...hideCols, col];
        setHideCols(updatedCols);
        localStorage.setItem(entityCols, JSON.stringify(updatedCols));
    };

    // ================= STATE UNTUK SUBSCRIPTION & KUOTA =================
    const [quota, setQuota] = useState<Quota>({ transactions: 0, products: 0, employees: 0, stores: 0 });
    const [pricing, setPricing] = useState<Pricing>({ price_transaction: 0, price_product: 0, price_employee: 0, price_store: 0 });
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Variabel environment
    const clientKey = import.meta.env.MIDTRANS_CLIENT_KEY;
    const API_URL = `${import.meta.env.VITE_SERVER_URI_BASE}api`;

    // Ambil data kuota dari server
    const fetchQuotaSettings = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/quota-settings`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
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

    // Ambil data harga dari server
    const fetchPricing = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/settings`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
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

    // Ambil data subscription aktif
    const fetchSubscription = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/subscription/current`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
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

    // Memuat seluruh data awal
    useEffect(() => {
        const loadData = async () => {
            await Promise.all([fetchQuotaSettings(), fetchPricing(), fetchSubscription()]);
        };
        loadData();
    }, [fetchQuotaSettings, fetchPricing, fetchSubscription]);

    // Fungsi untuk menyimpan kuota
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

    // Hitung total harga berdasarkan kuota dan harga
    const calculateTotalPrice = useCallback((): number => {
        return quota.transactions * pricing.price_transaction +
            quota.products * pricing.price_product +
            quota.employees * pricing.price_employee +
            (quota.stores > 0 ? (quota.stores - 1) * pricing.price_store : quota.stores * pricing.price_store);
    }, [quota, pricing]);

    // Cek apakah langganan sudah kedaluwarsa
    const isSubscriptionExpired = subscription ? new Date() > new Date(subscription.end_date) : true;

    // Proses pembayaran menggunakan Midtrans
    const handlePayClick = async () => {
        try {
            const response = await fetch(`${API_URL}/payment/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(quota),
            });
            const { snap_token, order_id } = await response.json();

            if (snap_token && (window as any).snap) {
                (window as any).snap.pay(snap_token, {
                    onSuccess: async () => {
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
                            }
                        } catch (error) {
                            console.error('Payment notification error:', error);
                        }
                        Swal.fire('Success', 'Payment successful!', 'success');
                        navigate('/current-subs', { replace: true });
                        fetchSubscription();
                    },
                    onPending: () => Swal.fire('Info', 'Payment pending', 'info'),
                    onError: () => Swal.fire('Error', 'Payment failed', 'error'),
                });
            }
        } catch (error: any) {
            console.error('Payment error:', error);
            Swal.fire('Error', 'Failed to process payment', 'error');
        }
    };

    if (loading) return <div className="text-center py-8">Loading...</div>;

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Form kuota */}
                <QuotaForm onSubmit={handleQuotaSubmit} initialValues={quota} />

                {/* Ringkasan pembayaran */}
                <PaymentSummary quota={quota} pricing={pricing} isSubscriptionExpired={isSubscriptionExpired} calculateTotalPrice={calculateTotalPrice} onPayClick={handlePayClick} />

                {/* Handler notifikasi */}
                <PaymentNotificationHandler API_URL={API_URL} quota={quota} calculateTotalPrice={calculateTotalPrice} fetchSubscription={fetchSubscription} />

                {/* Loader script Midtrans */}
                <MidtransScriptLoader clientKey={clientKey} />
            </div>

            {/* Tabel riwayat pembayaran */}
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