import { Link, useLocation } from 'react-router-dom';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { setPageTitle } from '../../store/themeConfigSlice';
import Dropdown from '../../components/Dropdown';
import IconCaretDown from '../../components/Icon/IconCaretDown';
import { useDeleteSuppliersMutation, useGetSuppliersQuery } from '../../redux/features/suppliers/suppliersApi';
import { useGetOrdersQuery, useGetPandingOrdersQuery, useGetTopProductQuery, useLazyGetOrdersQuery, useLazyGetTopProductQuery } from '../../redux/features/orders/ordersApi';
import { capitalizeFirstLetter } from '../../components/tools';
import ChartReport from './ChartReport';
import exportPDF from '../../components/ExportPDF';
import exportXLSX from '../../components/ExportXLSX';
import exportCSV from '../../components/ExportCSV';
import ChartReportTopProduct from './ChartReportTopProduct';

const TopProductReport = () => {
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

    // Menyimpan halaman aktif (default: 1)
    const [page, setPage] = useState<number>(() => {
        const storedPage = localStorage.getItem(entityPage);
        return storedPage ? parseInt(storedPage, 10) : 1; // Konversi ke number, default ke 1
    });
    // Menyimpan teks pencarian
    const [search, setSearch] = useState(() => {
        return localStorage.getItem(`${entity}_search`) || '';
    });
    // Menyimpan status sorting (kolom dan arah sort)
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>(() => {
        const storedSort = localStorage.getItem(`${entitySort}`);
        return storedSort
            ? JSON.parse(storedSort) 
            : { columnAccessor: 'created_at', direction: 'desc' }; 
    });
    const dispatch = useDispatch();
    // Data yang ditampilkan dalam tabel
    const [items, setItems] = useState<any[]>([]);
    const [total, setTotal] = useState();
    const [deleteSupplier] = useDeleteSuppliersMutation();
     // Kolom yang disembunyikan (untuk toggle visibility)
    const [hideCols, setHideCols] = useState<string[]>([]);
    // RTL state untuk dukungan bahasa RTL
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
    // Filter kolom dan nilainya
    const [selectedColumn, setSelectedColumn] = useState<string>(() => {
        return localStorage.getItem(`${entity}_filter_column`) || '';
    }); // Kolom yang difilter
    const [filterValue, setFilterValue] = useState<string>(() => {
        return localStorage.getItem(`${entity}_filter_value`) || '';
    }); // nilai filter

    // Filter berdasarkan tanggal
    const [selectedDateFilter, setSelectedDateFilter] = useState(
        localStorage.getItem(entitySelectedDateFilter) || "daily"
    );
    const [filterDateValue, setFilterDateValue] = useState(
        localStorage.getItem(entityFilterDateValue) || ""
    );
    const [rangeDate, setRangeDate] = useState(
        JSON.parse(localStorage.getItem(entityRangeDate) ?? "{}") || { start: "", end: "" }
    );

    // Filter berdasarkan harga
    const [rangePrice, setRangePrice] = useState(
        JSON.parse(localStorage.getItem(entityRangePrice) ?? "{}") || { min: "", max: "" }
    );

    // Reset nilai filter tanggal ketika filter dipilih ulang
    useEffect(() => {
        setFilterDateValue("")
    }, [selectedDateFilter])

    // data  dari API berdasarkan filter
    const { data, refetch } = useGetTopProductQuery(
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
    // Definisi kolom tabel
    const cols = [
        { accessor: 'no', title: 'No' },
        { accessor: 'product_name', title: 'Product Name' },
        { accessor: 'upc_barcode', title: 'UPC Barcode' },
        { accessor: 'category', title: 'Category' },
        { accessor: 'supplier', title: 'Supplier' },
        { accessor: 'unit', title: 'Unit' },
        { accessor: 'total_sold', title: 'total_sold', isSummable: true },
        { accessor: 'product_image', title: 'Product Image' },
        { accessor: 'description', title: 'Description' },
        { accessor: 'discount_normal', title: 'Discount Normal' },
        { accessor: 'discount_member', title: 'Discount Member' },
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

    useEffect(() => {
        if (data?.data) {
            const mappedItems = data.data.map((d: any, index: number) => {
                // Buat objek berdasarkan kolom yang telah didefinisikan
                let mappedObject: { [key: string]: any } = {
                    id: d.id,
                };

                cols.forEach(col => {
                    if (col.accessor === 'no') {
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

    const [fetchTopProductTrigger] = useLazyGetTopProductQuery(); // Gunakan Lazy Query


    // Fungsi untuk ambil semua data produk (multi-page) dari backend secara looping (pagination)
    const fetchAllOrders = async (params: any, fetchOrders: any) => {
        let allOrders: any[] = []; // Tempat nyimpan hasil semua data
        let currentPage = 1; // Mulai dari halaman pertama
        let lastPage = 1;  // Default total halaman

        try {
            while (currentPage <= lastPage) {
                // Panggil endpoint dengan pagination
                const result = await fetchTopProductTrigger({ ...params, page: currentPage }).unwrap();

                // Tambahkan data yang didapat ke array hasil
                allOrders = [...allOrders, ...result.data];
                lastPage = result.last_page; // Total halaman yang tersedia
                // Lanjut ke halaman berikutnya
                currentPage++;
            }
        } catch (error) {
            // Tangkap error kalau ada masalah saat ambil data
            console.error("Error fetching all orders:", error);
        }

        return allOrders; // Return semua data yang udah dikumpulkan
    };

    const fetchOrders = refetch;

    // State untuk simpan semua data produk
    const [allOrders, setAllOrders] = useState<any[]>([]);

    // Fungsi untuk ambil semua data produk dari API dan simpan ke `allOrders`
    const fetchOrdersData = async () => {
        const orders = await fetchAllOrders(
            { 
                storeId, // ID toko
                search, // Keyword pencarian
                sort: sortStatus.columnAccessor, // Kolom sorting
                direction: sortStatus.direction, // Arah sorting (asc/desc)
                filterColumn: selectedColumn, // Nama kolom filter (jika ada)
                filterValue, // Nilai filter
                selectedDateFilter, // Tipe filter tanggal (daily/monthly/etc)
                filterDateValue, // Nilai spesifik filter tanggal
                rangeDateStart: rangeDate.start, // Tanggal mulai
                rangeDateEnd: rangeDate.end, // Tanggal akhir
                rangePriceMin: rangePrice.min, // Harga minimal
                rangePriceMax: rangePrice.max, // Harga maksimal
            },
            fetchOrders // Inject RTK Query
        );
        setAllOrders(orders);
    };

    useEffect(() => {
        fetchOrdersData();
    }, [data]);


    // Fungsi handle export data dalam berbagai format (PDF, XLSX, CSV)
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

        // Filter kolom yang lagi ditampilkan (hideCols = disembunyikan)
        const visibleCols = cols.filter(col=> !hideCols.includes(col.accessor));

        if (type === "pdf") {
            exportPDF(allOrders, visibleCols, filters, capitalizeFirstLetter(storeId), capitalizeFirstLetter(entity));
        } else if (type === "xlsx") {
            exportXLSX(allOrders, visibleCols, filters, capitalizeFirstLetter(storeId), capitalizeFirstLetter(entity));
        } else if (type === "csv") {
            exportCSV(allOrders, visibleCols, filters, capitalizeFirstLetter(storeId), capitalizeFirstLetter(entity));
        }
    };

    // Fungsi bantu buat ngehitung total nilai dari suatu kolom tertentu
    const getTotal = (key: any) => {
        return records.reduce((sum, row) => sum + (parseFloat(row[key]) || 0), 0);
    };

    return (
        <div>
            {/* Header Section */}
            <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
                {/* Judul halaman / entity (misalnya: Products, Orders, dst) */}
                <h2 className="text-xl">{capitalizeFirstLetter(entity)}</h2>
            </div>

            {/* statistik */}

            {/* Ringkasan Total */}
            <div className="panel p-4 mt-4 mb-4 rounded-md">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Summary</h3>
                <table className="table-responsive">
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Total Sold</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Total</td>
                            {/* Menampilkan total semua produk terjual, pakai toLocaleString biar format angka rapi */}
                            <td>{getTotal("total_sold").toLocaleString()}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Table Section */}
            <div className="panel px-0 border-white-light dark:border-[#1b2e4b]">
                <div className="invoice-table">
                    <div className="mb-4.5 px-5 flex flex-col gap-3">
                        {/* Baris Pertama */}
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 content-between">
                            {/* Dropdown Pilih kolom yang ditampilkan */}
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

                            {/* Filter berdasarkan waktu (daily/monthly/yearly) */}
                            <select
                                value={selectedDateFilter}
                                onChange={(e) => setSelectedDateFilter(e.target.value)}
                                className="form-select w-full"
                            >
                                <option value="daily">Daily</option>
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                            </select>

                            {/* Input tanggal berdasarkan filter yang dipilih */}
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

                            {/* Tombol Export & Search */}
                            <div className="md:col-span-3 flex gap-3 w-full">
                                <div className="flex gap-1 justify-end w-full">
                                    <div className="flex gap-1 justify-end w-full">
                                        {/* button Export CSV, XLSX, PDF */}
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

                                {/* Input search keyword */}
                                <input 
                                    type="text" 
                                    className="form-input w-full" 
                                    placeholder="Search..." 
                                    value={search} 
                                    onChange={(e) => setSearch(e.target.value)} 
                                />
                            </div>
                        </div>

                        {/* Baris Kedua kolom, tanggal, harga */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {/* Filter Kolom */}
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

                            {/* Filter Berdasarkan Rentang Tanggal */}
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

                            {/* Filter Berdasarkan Rentang Jumlah Terjual (Harga) */}
                            <div className="flex gap-3 w-full">
                                <input 
                                    type="number"
                                    value={rangePrice.min}
                                    onChange={(e) => setRangePrice({ ...rangePrice, min: e.target.value })}
                                    placeholder="Range sold min"
                                    className="form-input w-full"
                                />
                                <input 
                                    type="number"
                                    value={rangePrice.max}
                                    onChange={(e) => setRangePrice({ ...rangePrice, max: e.target.value })}
                                    placeholder="Range sold max"
                                    className="form-input w-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* DataTable */}
                    <div className="datatables pagination-padding">
                        <DataTable
                            className="whitespace-nowrap table-hover invoice-table"
                            records={records} // Data yang ditampilkan
                            columns={[
                                // Konfigurasi kolom
                                {
                                    accessor: 'no',
                                    hidden: hideCols.includes('no'),
                                },
                                {
                                    accessor: 'product_name',
                                    sortable: true,
                                    hidden: hideCols.includes('product_name'),
                                },
                                {
                                    accessor: 'upc_barcode',
                                    sortable: true,
                                    hidden: hideCols.includes('upc_barcode'),
                                },
                                {
                                    accessor: 'category',
                                    sortable: true,
                                    hidden: hideCols.includes('category'),
                                },
                                {
                                    accessor: 'supplier',
                                    sortable: true,
                                    hidden: hideCols.includes('supplier'),
                                },
                                {
                                    accessor: 'unit',
                                    sortable: true,
                                    hidden: hideCols.includes('unit'),
                                },
                                {
                                    accessor: 'total_sold',
                                    sortable: true,
                                    hidden: hideCols.includes('total_sold'),
                                },
                                {
                                    accessor: 'description',
                                    sortable: true,
                                    hidden: hideCols.includes('description'),
                                },
                                {
                                    accessor: 'discount_normal',
                                    sortable: true,
                                    hidden: hideCols.includes('discount_normal'),
                                },
                                {
                                    accessor: 'discount_member',
                                    sortable: true,
                                    hidden: hideCols.includes('discount_member'),
                                },
                            ]}
                            highlightOnHover // Efek hover saat mouse di atas baris
                            totalRecords={total} // Total semua data (untuk pagination)
                            recordsPerPage={pageSize} // Jumlah data per halaman
                            page={page} // Halaman aktif
                            onPageChange={(p) => setPage(p)} // Saat pindah halaman
                            sortStatus={sortStatus} // Urutan sort
                            onSortStatusChange={setSortStatus} // update selected
                            paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`} // teks pagination
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopProductReport;