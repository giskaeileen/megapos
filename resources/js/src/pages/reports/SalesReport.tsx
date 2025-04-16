import React, { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { setPageTitle } from '../../store/themeConfigSlice';
import Dropdown from '../../components/Dropdown';
import IconCaretDown from '../../components/Icon/IconCaretDown';
import { useDeleteSuppliersMutation } from '../../redux/features/suppliers/suppliersApi';
import { useGetOrdersQuery, useLazyGetOrdersQuery } from '../../redux/features/orders/ordersApi';
import { capitalizeFirstLetter } from '../../components/tools';
import ChartReport from './ChartReport';
import exportPDF from '../../components/ExportPDF';
import exportXLSX from '../../components/ExportXLSX';
import exportCSV from '../../components/ExportCSV';

const SalesReport = () => {
    // entity localstorage
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);
    const storeId = pathnames[0];
    const entity = pathnames[1];
    const entityCols = `${entity}_cols`; 
    const entityPage = `${entity}_page`; 
    const entitySort = `${entity}_sort`; 
    const entityFilterColumn = `${entity}_filter_column`; 
    const entityFilterValue= `${entity}_filter_value`; 
    const entitySelectedDateFilter = `${entity}_selected_date_filter`; 
    const entityFilterDateValue= `${entity}_filter_date_value`; 
    const entityRangeDate = `${entity}_range_date`; 
    const entityRangePrice = `${entity}_range_price`; 

    // Pagination
    const [page, setPage] = useState<number>(() => {
        const storedPage = localStorage.getItem(entityPage);
        return storedPage ? parseInt(storedPage, 10) : 1; // Konversi ke number, default ke 1
    });
    // Pencarian
    const [search, setSearch] = useState(() => {
        return localStorage.getItem(`${entity}_search`) || '';
    });
    // Sorting
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>(() => {
        const storedSort = localStorage.getItem(`${entitySort}`);
        return storedSort
            ? JSON.parse(storedSort) 
            : { columnAccessor: 'created_at', direction: 'desc' }; 
    });
    const dispatch = useDispatch();

    // Data dan item
    const [items, setItems] = useState<any[]>([]);
    const [total, setTotal] = useState();
    const [deleteSupplier] = useDeleteSuppliersMutation();
    // Kolom tersembunyi
    const [hideCols, setHideCols] = useState<string[]>([]);
    // RTL support
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
    // Filter kolom teks
    const [selectedColumn, setSelectedColumn] = useState<string>(() => {
        return localStorage.getItem(`${entity}_filter_column`) || '';
    }); // Kolom yang difilter
    const [filterValue, setFilterValue] = useState<string>(() => {
        return localStorage.getItem(`${entity}_filter_value`) || '';
    }); // nilai filter

    // Filter tanggal
    const [selectedDateFilter, setSelectedDateFilter] = useState(
        localStorage.getItem(entitySelectedDateFilter) || "daily"
    );
    const [filterDateValue, setFilterDateValue] = useState(
        localStorage.getItem(entityFilterDateValue) || ""
    );
    // Filter harga
    const [rangeDate, setRangeDate] = useState(
        JSON.parse(localStorage.getItem(entityRangeDate) ?? "{}") || { start: "", end: "" }
    );

    const [rangePrice, setRangePrice] = useState(
        JSON.parse(localStorage.getItem(entityRangePrice) ?? "{}") || { min: "", max: "" }
    );

    // Reset filterDateValue saat filter tanggal berubah
    useEffect(() => {
        setFilterDateValue("")
    }, [selectedDateFilter])

    // data 
    const { data, refetch } = useGetOrdersQuery(
        { 
            storeId, 
            page, 
            search,
            sort: sortStatus.columnAccessor,
            direction: sortStatus.direction,
            filterColumn: selectedColumn,  
            filterValue: filterValue,    
            selectedDateFilter,
            filterDateValue,
            rangeDateStart: rangeDate.start,
            rangeDateEnd: rangeDate.end,
            rangePriceMin: rangePrice.min,
            rangePriceMax: rangePrice.max,
        },
        { refetchOnMountOrArgChange: true } 
    );
    // Daftar kolom untuk datatable
    const cols = [
        { accessor: 'no', title: 'No' },
        { accessor: 'order_date', title: 'Order Date' },
        { accessor: 'order_status', title: 'Order Status' },
        { accessor: 'total_products', title: 'Total Products', isSummable: true },
        { accessor: 'sub_total', title: 'Sub Total', isSummable: true },
        { accessor: 'vat', title: 'Vat', isSummable: true },
        { accessor: 'invoice_no', title: 'Invoice No' },
        { accessor: 'total', title: 'Total', isSummable: true },
        { accessor: 'payment_status', title: 'Payment Status' },
        { accessor: 'pay', title: 'Pay', isSummable: true },
        { accessor: 'due', title: 'Due', isSummable: true },
        { accessor: 'pay_return', title: 'Pay Return' },
        { accessor: 'bank', title: 'Bank' },
        { accessor: 'no_rekening', title: 'No Rekening' },
        { accessor: 'name_rekening', title: 'Name Rekening' },
        { accessor: 'name_member', title: 'Name Member' },
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

    // Simpan filterDateValue
    useEffect(() => {
        localStorage.setItem(entityFilterDateValue, filterDateValue);
    }, [filterDateValue]);

    // Simpan rangeDate
    useEffect(() => {
        localStorage.setItem(entityRangeDate, JSON.stringify(rangeDate));
    }, [rangeDate]);

    // Simpan rangePrice
    useEffect(() => {
        localStorage.setItem(entityRangePrice, JSON.stringify(rangePrice));
    }, [rangePrice]);

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
     * page 
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
     * items 
     */

    // Mapping hasil query ke format tabel
    useEffect(() => {
        if (data?.data) {
            const mappedItems = data.data.map((d: any, index: number) => {
                // Buat objek berdasarkan kolom yang telah didefinisikan
                let mappedObject: { [key: string]: any } = {
                    id: d.id,
                };

                cols.forEach(col => {
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
                       mappedObject[col.accessor] = (index + 1) + ((page - 1) * pageSize)

                    } else if (col.accessor === 'photo') {
                        mappedObject[col.accessor] =  d.photo 
                            ? `${import.meta.env.VITE_SERVER_URI_BASE}storage/profile/${d.photo}` 
                            : '/assets/images/profile-2.jpeg' 

                    } else {
                        mappedObject[col.accessor] = d[col.accessor] ?? '-';
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

    // ======

// Export semua data (dengan pagination manual)
const [isFetchingAll, setIsFetchingAll] = useState(false);
const [allOrders, setAllOrders] = useState<any[]>([]);

const fetchAllOrders = async (params: any) => {
    setIsFetchingAll(true);
    let allOrders: any[] = [];
    let currentPage = 1;
    let lastPage = 1;

    try {
        // Pengambilan pertama untuk mendapatkan total halaman
        const firstResult = await fetchOrdersTrigger({ 
            ...params, 
            page: currentPage 
        }).unwrap();
        
        allOrders = [...firstResult.data];
        lastPage = firstResult.last_page;
        currentPage++;

        // Tambahkan delay antar permintaan
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        
        // Fetch remaining pages with delay
        while (currentPage <= lastPage) {
            await delay(500); // 500ms delay antar permintaan
            const result = await fetchOrdersTrigger({ 
                ...params, 
                page: currentPage 
            }).unwrap();
            
            allOrders = [...allOrders, ...result.data];
            currentPage++;
        }
    } catch (error) {
        console.error("Error fetching all orders:", error);
    } finally {
        setIsFetchingAll(false);
    }

    return allOrders;
};

const fetchOrdersData = useCallback(async () => {
    const orders = await fetchAllOrders({
        storeId, 
        search,
        sort: sortStatus.columnAccessor,
        direction: sortStatus.direction,
        filterColumn: selectedColumn,  
        filterValue,    
        selectedDateFilter,
        filterDateValue,
        rangeDateStart: rangeDate.start,
        rangeDateEnd: rangeDate.end,
        rangePriceMin: rangePrice.min,
        rangePriceMax: rangePrice.max,
    });
    setAllOrders(orders);
}, [
    storeId, 
    search,
    sortStatus,
    selectedColumn,
    filterValue,
    selectedDateFilter,
    filterDateValue,
    rangeDate,
    rangePrice
]);

// =======

    const [fetchOrdersTrigger] = useLazyGetOrdersQuery(); // Gunakan Lazy Query

    const fetchOrders = refetch;

    useEffect(() => {
        fetchOrdersData();
    }, [data]);


    // Handle untuk ekspor data berdasarkan tipe file
    const handleExport = async (type: any) => {

        const filters = {
            selectedDateFilter,
            filterDateValue,
            selectedColumn,
            filterValue,
            rangeDateStart: rangeDate.start,
            rangeDateEnd: rangeDate.end,
            rangePriceMin: rangePrice.min,
            rangePriceMax: rangePrice.max,
        };

        const visibleCols = cols.filter(col=> !hideCols.includes(col.accessor));

        if (type === "pdf") {
            exportPDF(allOrders, visibleCols, filters, capitalizeFirstLetter(storeId), capitalizeFirstLetter(entity));
        } else if (type === "xlsx") {
            exportXLSX(allOrders, visibleCols, filters, capitalizeFirstLetter(storeId), capitalizeFirstLetter(entity));
        } else if (type === "csv") {
            exportCSV(allOrders, visibleCols, filters, capitalizeFirstLetter(storeId), capitalizeFirstLetter(entity));
        }
    };

    /**
     * Fungsi utilitas untuk menghitung total berdasarkan key tertentu dari records yang sedang ditampilkan
     */
    const getTotal = (key: any) => {
        return records.reduce((sum, row) => sum + (parseFloat(row[key]) || 0), 0);
    };

    return (
        <div>
            {/* Header dan Judul */}
            <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
                {/* Menampilkan nama entity dengan huruf kapital di awal */}
                <h2 className="text-xl">{capitalizeFirstLetter(entity)}</h2>
            </div>

            {/* Komponen Chart untuk menampilkan statistik penjualan */}
            <ChartReport allOrders={allOrders} />

            {/* Ringkasan Total */}
            <div className="panel p-4 mt-4 mb-4 rounded-md">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Summary</h3>
                {/* <table className="w-full border-collapse text-sm bg-white rounded-md"> */}
                <table className="table-responsive">
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Total Product</th>
                            <th>Subtotal</th>
                            <th>VAT</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {/* Menampilkan total semua kolom dalam format currency */}
                            <td>Total</td>
                            <td>{getTotal("total_products")}</td>
                            <td>{getTotal("sub_total").toLocaleString()}</td>
                            <td>{getTotal("vat").toLocaleString()}</td>
                            <td>{getTotal("total").toLocaleString()}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Panel utama untuk filter dan tabel */}
            <div className="panel px-0 border-white-light dark:border-[#1b2e4b]">
                <div className="invoice-table">
                    <div className="mb-4.5 px-5 flex flex-col gap-3">
                        {/* Baris Pertama Filter Kolom, Tanggal, Export, Search */}
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 content-between">
                            {/* Dropdown untuk memilih kolom yang ditampilkan */}
                            <div className="dropdown w-full">
                                <Dropdown
                                    placement={`${isRtl ? 'bottom-end' : 'bottom-start'}`}
                                    btnClassName="!flex items-center border font-semibold border-white-light dark:border-[#253b5c] rounded-md px-4 py-2 text-sm dark:bg-[#1b2e4b] dark:text-white-dark w-full"
                                    button={
                                        <>
                                            <span className="ltr:mr-1 rtl:ml-1">Columns</span>
                                            <IconCaretDown className="w-5 h-5" />
                                        </>
                                    }
                                >
                                    <ul className="!min-w-[140px]">
                                        {cols.map((col, i) => (
                                            <li
                                                key={i}
                                                className="flex flex-col"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <div className="flex items-center px-4 py-1">
                                                    <label className="cursor-pointer mb-0">
                                                        <input
                                                            type="checkbox"
                                                            checked={!hideCols.includes(col.accessor)}
                                                            className="form-checkbox"
                                                            defaultValue={col.accessor}
                                                            onChange={(event: any) => {
                                                                setHideCols(event.target.value);
                                                                showHideColumns(col.accessor);
                                                            }}
                                                        />
                                                        <span className="ltr:ml-2 rtl:mr-2">{col.title}</span>
                                                    </label>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </Dropdown>
                            </div>

                            {/* Pilihan filter berdasarkan harian, bulanan, atau tahunan */}
                            <select
                                value={selectedDateFilter}
                                onChange={(e) => setSelectedDateFilter(e.target.value)}
                                className="form-select w-full"
                            >
                                <option value="daily">Daily</option>
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                            </select>

                            {/* Input untuk filter berdasarkan tanggal/bulan/tahun */}
                            {selectedDateFilter === "daily" && (
                                <input
                                    type="date"
                                    value={filterDateValue}
                                    onChange={(e) => setFilterDateValue(e.target.value)}
                                    className="form-input w-full"
                                />
                            )}

                            {selectedDateFilter === "monthly" && (
                                <input
                                    type="month"
                                    value={filterDateValue}
                                    onChange={(e) => setFilterDateValue(e.target.value)}
                                    className="form-input w-full"
                                />
                            )}

                            {selectedDateFilter === "yearly" && (
                                <input
                                    type="number"
                                    value={filterDateValue}
                                    onChange={(e) => setFilterDateValue(e.target.value)}
                                    placeholder="Enter Year (e.g. 2024)"
                                    className="form-input w-full"
                                    min="1900"
                                    max="2100"
                                />
                            )}

                            {/* button Export dan Search Bar */}
                            <div className="md:col-span-3 flex gap-3 w-full">
                                <div className="flex gap-1 justify-end w-full">
                                    <div className="flex gap-1 justify-end w-full">
                                        {/* button Export */}
                                        <button type="button" className="btn btn-primary btn-sm m-1" onClick={() => handleExport("csv")}>
                                            CSV
                                        </button>
                                        <button type="button" className="btn btn-primary btn-sm m-1" onClick={() => handleExport("xlsx")}>
                                            XLSX
                                        </button>
                                        <button type="button" className="btn btn-primary btn-sm m-1" onClick={() => handleExport("pdf")}>
                                            PDF
                                        </button>
                                    </div>
                                </div>

                                {/* Search bar */}
                                <input 
                                    type="text" 
                                    className="form-input w-full" 
                                    placeholder="Search..." 
                                    value={search} 
                                    onChange={(e) => setSearch(e.target.value)} 
                                />
                            </div>
                        </div>

                        {/* Baris Kedua Filter Kolom, Tanggal Range, Harga Range */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {/* Filter berdasarkan kolom tertentu */}
                            <div className="flex gap-3 w-full">
                                <select 
                                    value={selectedColumn} 
                                    onChange={(e) => setSelectedColumn(e.target.value)}
                                    className="form-select w-full"
                                >
                                    <option value="">Column Filter</option>
                                    {cols
                                        .filter(col => col.accessor !== "no" && col.accessor !== "photo" && col.accessor !== "created_at")
                                        .map(col => (
                                            <option key={col.accessor} value={col.accessor}>{col.title}</option>
                                        ))
                                    }
                                </select>
                                <input 
                                    type="text"
                                    value={filterValue}
                                    onChange={(e) => setFilterValue(e.target.value)}
                                    placeholder="Enter value filter"
                                    className="form-input w-full"
                                />
                            </div>

                            {/* Filter berdasarkan rentang tanggal */}
                            <div className="flex gap-3 w-full">
                                <input 
                                    type="date"
                                    value={rangeDate.start}
                                    onChange={(e) => setRangeDate({ ...rangeDate, start: e.target.value })}
                                    placeholder="Range date start"
                                    className="form-input w-full"
                                />
                                <input 
                                    type="date"
                                    value={rangeDate.end}
                                    onChange={(e) => setRangeDate({ ...rangeDate, end: e.target.value })}
                                    placeholder="Range date end"
                                    className="form-input w-full"
                                />
                            </div>

                            {/* Filter berdasarkan rentang harga */}
                            <div className="flex gap-3 w-full">
                                <input 
                                    type="number"
                                    value={rangePrice.min}
                                    onChange={(e) => setRangePrice({ ...rangePrice, min: e.target.value })}
                                    placeholder="Range pay min"
                                    className="form-input w-full"
                                />
                                <input 
                                    type="number"
                                    value={rangePrice.max}
                                    onChange={(e) => setRangePrice({ ...rangePrice, max: e.target.value })}
                                    placeholder="Range pay max"
                                    className="form-input w-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tabel Data Penjualan */}
                    <div className="datatables pagination-padding">
                        <DataTable
                            className="whitespace-nowrap table-hover invoice-table"
                            records={records} // Data transaksi
                            columns={[
                                // Daftar kolom tabel
                                {
                                    accessor: 'no',
                                    // sortable: true,
                                    hidden: hideCols.includes('no'),
                                },
                                {
                                    accessor: 'order_date',
                                    sortable: true,
                                    hidden: hideCols.includes('order_date'),
                                },
                                {
                                    accessor: 'order_status',
                                    sortable: true,
                                    hidden: hideCols.includes('order_status'),
                                },
                                {
                                    accessor: 'total_products',
                                    sortable: true,
                                    hidden: hideCols.includes('total_products'),
                                },
                                {
                                    accessor: 'sub_total',
                                    sortable: true,
                                    hidden: hideCols.includes('sub_total'),
                                },
                                {
                                    accessor: 'vat',
                                    sortable: true,
                                    hidden: hideCols.includes('vat'),
                                },
                                {
                                    accessor: 'invoice_no',
                                    sortable: true,
                                    hidden: hideCols.includes('invoice_no'),
                                },
                                {
                                    accessor: 'total',
                                    sortable: true,
                                    hidden: hideCols.includes('total'),
                                },
                                {
                                    accessor: 'payment_status',
                                    sortable: true,
                                    hidden: hideCols.includes('payment_status'),
                                },
                                {
                                    accessor: 'pay',
                                    sortable: true,
                                    hidden: hideCols.includes('pay'),
                                },
                                {
                                    accessor: 'due',
                                    sortable: true,
                                    hidden: hideCols.includes('due'),
                                },
                                {
                                    accessor: 'pay_return',
                                    sortable: true,
                                    hidden: hideCols.includes('pay_return'),
                                },
                                {
                                    accessor: 'bank',
                                    sortable: true,
                                    hidden: hideCols.includes('bank'),
                                },
                                {
                                    accessor: 'no_rekening',
                                    sortable: true,
                                    hidden: hideCols.includes('no_rekening'),
                                },
                                {
                                    accessor: 'name_rekening',
                                    sortable: true,
                                    hidden: hideCols.includes('name_rekening'),
                                },
                                {
                                    accessor: 'name_member',
                                    sortable: true,
                                    hidden: hideCols.includes('name_member'),
                                },
                                {
                                    accessor: 'created_at',
                                    sortable: true,
                                    hidden: hideCols.includes('created_at'),
                                },
                            ]}
                            highlightOnHover // Efek hover saat mouse di atas baris
                            totalRecords={total} // Total jumlah data
                            recordsPerPage={pageSize} // jumlah data per halaman
                            page={page} // halaman saat ini
                            onPageChange={(p) => setPage(p)} // update halaman ketika pindah
                            sortStatus={sortStatus} // data yang dipilih (checkbox)
                            onSortStatusChange={setSortStatus} // update selected
                            paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`} // teks pagination
                        />
                    </div>
                </div>
            </div>


        </div>
    );
};

export default SalesReport;