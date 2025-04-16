import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconCaretDown from '../../components/Icon/IconCaretDown';
import { useDeleteStoresMutation, useGetStoresQuery } from '../../redux/features/stores/storesApi';
import IconSearch from '../../components/Icon/IconSearch';

// Komponen utama untuk menampilkan daftar toko milik user
const MyStoresList = () => {
    const location = useLocation();
    // Mengambil path URL dan memisahkannya berdasarkan '/'
    const pathnames = location.pathname.split('/').filter((x) => x);
    const entity = pathnames[0]; // Mendapatkan entitas dari URL
    // Menentukan key untuk localStorage berdasarkan entitas
    const entityCols = `${pathnames[0]}_cols`; 
    const entityPage = `${pathnames[0]}_page`; 
    const entitySort = `${pathnames[0]}_sort`; 

    // State untuk halaman
    const [page, setPage] = useState<number>(() => {
        const storedPage = localStorage.getItem(entityPage);
        return storedPage ? parseInt(storedPage, 10) : 1;
    });

    // State untuk pencarian
    const [search, setSearch] = useState(() => {
        return localStorage.getItem(`${entity}_search`) || '';
    });

    // State untuk sorting
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>(() => {
        const storedSort = localStorage.getItem(`${entitySort}`);
        return storedSort
            ? JSON.parse(storedSort) 
            : { columnAccessor: 'created_at', direction: 'desc' }; 
    });
    // Ambil data dari API menggunakan RTK Query
    const { data, refetch } = useGetStoresQuery(
        { 
            page, 
            search,
            sort: sortStatus.columnAccessor,
            direction: sortStatus.direction,
        },
        { refetchOnMountOrArgChange: true } 
    );
    const dispatch = useDispatch();
    // State untuk menyimpan daftar item dan total data
    const [items, setItems] = useState<any[]>([]);
    const [total, setTotal] = useState();

    // Fungsi delete dari RTK Query
    const [deleteStores] = useDeleteStoresMutation();

    // State untuk kolom yang disembunyikan
    const [hideCols, setHideCols] = useState<string[]>([]);

    /*****************************
     * search 
     */

    useEffect(() => {
        localStorage.setItem(`${entity}_search`, search);
    }, [search]);

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
     * Mengelola paginasi dan penyimpanan halaman ke localStorage 
     */

    const [pageSize, setPageSize] = useState(10);
    const [initialRecords, setInitialRecords] = useState<any[]>([]);
    useEffect(() => {
        setInitialRecords(items)
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
    * Mapping data API ke format item yang ditampilkan
    */

    useEffect(() => {
        if (data?.data) {
            const mappedItems = data.data.map((d: any, index: number) => ({
                id: d.id,
                no: (index + 1) + ((page - 1) * pageSize),
                name: d.name,
                address: d.address,
                photo: d.photo 
                    ? `${import.meta.env.VITE_SERVER_URI_BASE}storage/${entity}/${d.photo}` 
                    : '/assets/images/blank_product.png', 
                created_at: new Intl.DateTimeFormat('id-ID', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    timeZone: 'Asia/Jakarta',
                }).format(new Date(d.created_at))
            }));
            setItems(mappedItems);
            setTotal(data.total)
        }
    }, [data]);

    // Mengatur judul halaman
    useEffect(() => {
        dispatch(setPageTitle('Users'));
    }, [dispatch]);

    /*****************************
     * checkbox hide show
     */

    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    const cols = [
        { accessor: 'no', title: 'No' },
        { accessor: 'name', title: 'Name' },
        { accessor: 'address', title: 'Address' },
        { accessor: 'created_at', title: 'Created At' },
    ];

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

    /*****************************
     * tools 
     */

    // Kapitalisasi huruf pertama
    function capitalizeFirstLetter(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // ====
    // Filter data berdasarkan API
    const [filteredItems, setFilteredItems] = useState<any>(data);
    useEffect(() => {
        setFilteredItems(() => {
            setTotal(data?.total)

            return data?.data
        });
    }, [data]);

    // Fungsi pindah halaman
    const handlePageChange = (newPage: number) => {
        if (total && newPage >= 1 && newPage <= Math.ceil(total / pageSize)) {
            setPage(newPage);
        }
    };

    return (
        <div>
            {/* Header dan input search */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl">My Store</h2>
                <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                    <div className="flex gap-3"></div>
                    <div className="relative">
                        <input type="text" placeholder="Search..." className="form-input py-2 ltr:pr-11 rtl:pl-11 peer" value={search} onChange={(e) => setSearch(e.target.value)} />
                        <button type="button" className="absolute ltr:right-[11px] rtl:left-[11px] top-1/2 -translate-y-1/2 peer-focus:text-primary">
                            <IconSearch className="mx-auto" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Daftar toko dalam bentuk grid */}
            <div className="grid md:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-6 mt-5 w-full">
                {Array.isArray(filteredItems) && filteredItems?.map((d: any, index: number) => {
                    return (
                        <a href={`/${d.slug}`} key={index}>
                            <div className="bg-white dark:bg-[#1c232f] rounded-md overflow-hidden text-center shadow relative" key={d.id}>
                                <div className="bg-white dark:bg-[#1c232f] rounded-md overflow-hidden text-center shadow relative">
                                    <div className="bg-white/40 rounded-t-md bg-center bg-cover p-6 pb-0 bg-" style={{ backgroundImage: `url('/assets/images/notification-bg.png')`, backgroundRepeat: 'no-repeat', width: '100%', height: '100%' }}>
                                    </div>
                                    <div className="p-5">
                                        <div className="flex items-center flex-col sm:flex-row">
                                            <div className="mb-5 w-20 h-20 rounded-full overflow-hidden">
                                                <img src={d.photo ? `${import.meta.env.VITE_SERVER_URI_BASE}storage/stores/${d.photo}` : '/assets/images/blank_product.png'} alt="profile" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 ltr:sm:pl-5 rtl:sm:pr-5 text-center sm:text-left">
                                                <h5 className="text-[#3b3f5c] text-[15px] font-semibold mb-2 dark:text-white-light">{d.name}</h5>
                                                <p className="mb-2 text-white-dark">
                                                    {[d.zip, d.address, d.city, d.state, d.country].filter(Boolean).join(", ")}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </a>
                    );
                })}
            </div>

            {/* Navigasi halaman */}
            <div className="flex m-4 justify-center">
                <ul className="inline-flex items-center space-x-1 rtl:space-x-reverse">
                    <li>
                        <button type="button" onClick={() => handlePageChange(page - 1)} className="flex justify-center font-semibold p-2 rounded-full transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary" disabled={page === 1}>
                            <IconCaretDown className="w-5 h-5 rotate-90 rtl:-rotate-90" />
                        </button>
                    </li>
                    {Array.from({ length: Math.ceil((total ?? 0) / pageSize) }, (_, idx) => (
                        <li key={idx}>
                            <button type="button" onClick={() => handlePageChange(idx + 1)} className={`flex justify-center font-semibold px-3.5 py-2 rounded-full transition ${page === idx + 1 ? "bg-primary text-white" : "bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary"}`}>
                                {idx + 1}
                            </button>
                        </li>
                    ))}
                    <li>
                        <button type="button" onClick={() => handlePageChange(page + 1)} className="flex justify-center font-semibold p-2 rounded-full transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary" disabled={page === Math.ceil((total ?? 0) / pageSize)}>
                            <IconCaretDown className="w-5 h-5 -rotate-90 rtl:rotate-90" />
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default MyStoresList;