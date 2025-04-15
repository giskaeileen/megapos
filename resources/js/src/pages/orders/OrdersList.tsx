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
import { useGetOrdersProductQuery, useGetOrdersQuery, useLazyGetOrdersProductQuery, useLazyGetOrdersQuery } from '../../redux/features/orders/ordersApi';
import { capitalizeFirstLetter } from '../../components/tools';
import exportPDF from '../../components/ExportPDF';
import exportXLSX from '../../components/ExportXLSX';
import exportCSV from '../../components/ExportCSV';
import exportPDFOrderProduct from '../../components/ExportPDFOrderProduct';
import exportXLSXOrderProduct from '../../components/ExportXLSXOrderProduct';
import exportCSVOrderProduct from '../../components/ExportCSVOrderProduct';
import IconPrinter from '../../components/Icon/IconPrinter';
import Swal from "sweetalert2";
import { PrintReceipt } from '../../components/PrintInvoice';

const SalesProductReport = () => {
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

    // state 
    const [page, setPage] = useState<number>(() => {
        const storedPage = localStorage.getItem(entityPage);
        return storedPage ? parseInt(storedPage, 10) : 1; // Konversi ke number, default ke 1
    });
    // State pencarian
    const [search, setSearch] = useState(() => {
        return localStorage.getItem(`${entity}_search`) || '';
    });
    // State status sorting default dari localStorage atau default ke created_at desc
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>(() => {
        const storedSort = localStorage.getItem(`${entitySort}`);
        return storedSort
            ? JSON.parse(storedSort) 
            : { columnAccessor: 'created_at', direction: 'desc' }; 
    });
    const dispatch = useDispatch();
    const [items, setItems] = useState<any[]>([]);
    const [total, setTotal] = useState();
    const [deleteSupplier] = useDeleteSuppliersMutation();
    const [hideCols, setHideCols] = useState<string[]>([]);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
    // Filter kolom dan nilai
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

    // Rentang filter berdasarkan tanggal dan harga
    const [rangeDate, setRangeDate] = useState(
        JSON.parse(localStorage.getItem(entityRangeDate) ?? "{}") || { start: "", end: "" }
    );
    const [rangePrice, setRangePrice] = useState(
        JSON.parse(localStorage.getItem(entityRangePrice) ?? "{}") || { min: "", max: "" }
    );

    // data dari API
    const { data, refetch } = useGetOrdersProductQuery(
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
    // Kolom-kolom untuk DataTable
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
        { accessor: 'products', title: 'Products' },
        { accessor: 'created_at', title: 'Created At' },
    ];

    /*****************************
     * search 
     */

    // Simpan perubahan pencarian ke localStorage
    useEffect(() => {
        localStorage.setItem(`${entity}_search`, search);
    }, [search]);

    /*****************************
     * filter 
     */

    // Simpan perubahan filter kolom dan nilai ke localStorage
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

    // Reset filter nilai saat filter jenis berubah
    useEffect(() => {
        setFilterDateValue("")
    }, [selectedDateFilter])

    /*****************************
     * sort 
     */

    // Simpan sorting ke localStorage
    useEffect(() => {
        localStorage.setItem(`${entitySort}`, JSON.stringify(sortStatus));
    }, [sortStatus]);

    // Ambil ulang sorting saat pertama kali render
    useEffect(() => {
        const storedSort = localStorage.getItem(`${entitySort}`);
        if (storedSort) {
            setSortStatus(JSON.parse(storedSort));
        }
    }, []);

    /*****************************
     * page 
     */

    // Data untuk tabel
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

    // Transformasi data yang didapat dari API agar cocok untuk DataTable
    useEffect(() => {
        if (data?.data) {
            const mappedItems = data.data.map((d: any, index: number) => {
                let mappedObject: { [key: string]: any } = {
                    id: d.id,
                    products: d.products || [], // Simpan daftar produk dari order
                };

                // Iterasi kolom dan isi data masing-masing
                cols.forEach(col => {
                    if (col.accessor === 'created_at') {
                        // Format tanggal
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
                        // Hitung nomor urut berdasarkan halaman
                       mappedObject[col.accessor] = (index + 1) + ((page - 1) * pageSize)

                    } else if (col.accessor === 'name_member') {
                        // Ambil nama member jika tersedia
                       mappedObject[col.accessor] = d['member']?.name ?? "-" 

                    } else if (col.accessor === 'photo') {
                        // Format URL foto
                        mappedObject[col.accessor] =  d.photo 
                            ? `${import.meta.env.VITE_SERVER_URI_BASE}storage/profile/${d.photo}` 
                            : '/assets/images/profile-2.jpeg' 

                    } else {
                        // Data default
                        mappedObject[col.accessor] = d[col.accessor] ?? '-';
                    }
                });

                return mappedObject;
            });

            // Set hasil transformasi ke items dan total data
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

    // State untuk menunjukkan apakah proses fetch seluruh order sedang berlangsung
const [isFetchingAll, setIsFetchingAll] = useState(false);
const [allOrders, setAllOrders] = useState<any[]>([]); // State untuk menyimpan semua data order

/**
 * Fungsi untuk mengambil semua data order berdasarkan filter dan pagination.
 * Fungsi ini melakukan fetch secara berulang dari page pertama hingga terakhir.
 */
const fetchAllOrders = async (params: any) => {
    setIsFetchingAll(true);  // Set state menjadi true saat proses fetching dimulai
    let allOrders: any[] = [];
    let currentPage = 1;
    let lastPage = 1;

    try {
        // Fetch pertama untuk mendapatkan total halaman
        const firstResult = await fetchOrdersTrigger({ 
            ...params, 
            page: currentPage 
        }).unwrap();
        
        allOrders = [...firstResult.data];
        lastPage = firstResult.last_page;
        currentPage++;

        // Fungsi untuk memberikan jeda antar request
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        
        // Ambil halaman yang tersisa dengan penundaan
        while (currentPage <= lastPage) {
            await delay(500); // Delay 500ms antar request
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
        setIsFetchingAll(false); // Set state menjadi false saat proses selesai
    }

    return allOrders;
};

/**
 * Fungsi callback untuk mengambil semua data order dan menyimpannya ke state `allOrders`.
 * Fungsi ini akan dipanggil ulang hanya jika dependensinya berubah.
 */
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
    setAllOrders(orders); // Simpan data order yang sudah difetch ke state
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

// ====

    const [fetchOrdersTrigger] = useLazyGetOrdersProductQuery(); // Gunakan Lazy Query

    const fetchOrders = refetch; // Refetch dari query jika dibutuhkan

    /**
     * Fungsi untuk mengekspor data order ke PDF, Excel, atau CSV berdasarkan jenis export.
     */
    const handleExport = async (type: any) => {

        // Filter yang digunakan saat export
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

        // Ambil kolom yang tidak disembunyikan
        const visibleCols = cols.filter(col=> !hideCols.includes(col.accessor));

        // Ekspor sesuai tipe yang dipilih
        if (type === "pdf") {
            exportPDFOrderProduct(allOrders, visibleCols, filters, capitalizeFirstLetter(storeId), capitalizeFirstLetter(entity));
        } else if (type === "xlsx") {
            exportXLSXOrderProduct(allOrders, visibleCols, filters, capitalizeFirstLetter(storeId), capitalizeFirstLetter(entity));
        } else if (type === "csv") {
            exportCSVOrderProduct(allOrders, visibleCols, filters, capitalizeFirstLetter(storeId), capitalizeFirstLetter(entity));
        }
    };

    /**
     * Fungsi utilitas untuk menghitung total nilai dari sebuah key pada array records.
     */
    const getTotal = (key: any) => {
        return records.reduce((sum, row) => sum + (parseFloat(row[key]) || 0), 0);
    };

    // State untuk menyimpan baris yang sedang diperluas (expand)
    const [expandedRow, setExpandedRow] = useState<number | null>(null);

    /**
     * Fungsi untuk mencetak invoice berdasarkan data yang dipilih.
     * Akan memunculkan konfirmasi sebelum mencetak dan memproses tiap item secara paralel.
     */
    const printInvoice = async () => {

        // Validasi jika tidak ada data yang dipilih
        if (!selectedRecords.length) {
            Swal.fire({
                icon: "info",
                title: "No Selection",
                text: "Please select at least one record to print.",
                customClass: {
                    popup: "sweet-alerts", 
                    confirmButton: "btn-confirm", 
                    cancelButton: "btn-cancel", 
                },
            });
            return;
        }

        // Tampilkan alert konfirmasi
        const result = await Swal.fire({
            icon: "warning",
            title: "Are you sure?",
            text: "This data will be print!",
            showCancelButton: true,
            confirmButtonText: "Print",
            cancelButtonText: "Cancel",
            padding: "2em",
            customClass: {
                popup: "sweet-alerts", 
                confirmButton: "btn-confirm", 
                cancelButton: "btn-cancel", 
            },
        });

        if (result.isConfirmed) {
            try {
                // Proses cetak untuk setiap data yang dipilih
                const deletePromises = selectedRecords.map((record: any) => {
                    const { products, ...rest } = record; // Ambil 'products' dan sisanya dari record
                    // Transformasi data 'products' menjadi 'cart' untuk keperluan cetak
                    const transformedCart = products.map(({ product, ...rest }) => ({
                        ...rest,
                        ...product
                    }));
                    console.log({ ...rest, cart: transformedCart}); // Ganti 'products' dengan 'cart'

                    // Cetak nota dengan data yang sudah ditransformasi
                    PrintReceipt({ ...rest, cart: transformedCart})
                });

                // Tunggu semua penghapusan selesai
                await Promise.all(deletePromises);

                // Tampilkan notifikasi sukses
                Swal.fire({
                    title: "Printed!",
                    text: "Selected records have been printed.",
                    icon: "success",
                    customClass: {
                        popup: "sweet-alerts", 
                        confirmButton: "btn-confirm", 
                        cancelButton: "btn-cancel", 
                    },
                });

                // Refresh data setelah delete
                refetch();
            } catch (error) {
                console.error("Error deleting users:", error);
                Swal.fire({
                    title: "Error!",
                    text: "An error occurred while deleting records.",
                    icon: "error",
                    customClass: {
                        popup: "sweet-alerts", 
                        confirmButton: "btn-confirm", 
                        cancelButton: "btn-cancel", 
                    },
                });
            }
        }
    };

    return (
        <div>
            {/* Header Judul dan button Print Invoice */}
            <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
                <h2 className="text-xl">{capitalizeFirstLetter(entity)}</h2>
                <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                    <div className="relative">
                        <div className="flex items-center gap-2">
                            {/* button untuk mencetak invoice */}
                            <button type="button" className="btn btn-info gap-2" onClick={() => printInvoice()}>
                                <IconPrinter />
                                Print Invoice 
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* statistik */}

            {/* Total Summary */}
            <div className="panel p-4 mt-4 mb-4 rounded-md">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Summary</h3>
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
                            {/* Menampilkan total berdasarkan fungsi getTotal */}
                            <td>Total</td>
                            <td>{getTotal("total_products")}</td>
                            <td>{getTotal("sub_total").toLocaleString()}</td>
                            <td>{getTotal("vat").toLocaleString()}</td>
                            <td>{getTotal("total").toLocaleString()}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Panel untuk tabel invoice */}
            <div className="panel px-0 border-white-light dark:border-[#1b2e4b]">
                <div className="invoice-table">
                    <div className="mb-4.5 px-5 flex flex-col gap-3">
                        {/* Baris Pertama */}
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 content-between">
                            {/* Dropdown untuk memilih kolom yang ingin ditampilkan/sembunyikan */}
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
                                    <ul className="!min-w-max">
                                        {/* Daftar checkbox untuk setiap kolom */}
                                        {cols.map((col, i) => (
                                            <li
                                                key={i}
                                                className="flex flex-col"
                                                onClick={(e) => e.stopPropagation()} // Mencegah dropdown tertutup saat klik item
                                            >
                                                <div className="flex items-center px-4 py-1">
                                                    <label className="cursor-pointer mb-0">
                                                        <input
                                                            type="checkbox"
                                                            checked={!hideCols.includes(col.accessor)} // Checkbox aktif jika kolom tidak disembunyikan
                                                            className="form-checkbox"
                                                            defaultValue={col.accessor}
                                                            onChange={(event: any) => {
                                                                setHideCols(event.target.value); // Update daftar kolom yang disembunyikan
                                                                showHideColumns(col.accessor); // Fungsi untuk menyembunyikan/menampilkan kolom
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

                            {/* Select untuk memilih filter waktu harian, bulanan, tahunan */}
                            <select
                                value={selectedDateFilter}
                                onChange={(e) => setSelectedDateFilter(e.target.value)}
                                className="form-select w-full"
                            >
                                <option value="daily">Daily</option>
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                            </select>

                            {/* Input tanggal ketika filter dipilih Daily */}
                            {selectedDateFilter === "daily" && (
                                <input
                                    type="date"
                                    value={filterDateValue}
                                    onChange={(e) => setFilterDateValue(e.target.value)}
                                    className="form-input w-full"
                                />
                            )}

                            {/* Input bulan ketika filter dipilih Monthly */}
                            {selectedDateFilter === "monthly" && (
                                <input
                                    type="month"
                                    value={filterDateValue}
                                    onChange={(e) => setFilterDateValue(e.target.value)}
                                    className="form-input w-full"
                                />
                            )}

                            {/* Input tahun ketika filter dipilih Yearly */}
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

                            {/* Baris atas dengan button export dan search */}
                            <div className="md:col-span-3 flex gap-3 w-full">
                                {/* button export ke berbagai format */}
                                <div className="flex gap-1 justify-end w-full">
                                    <div className="flex gap-1 justify-end w-full">
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

                                {/* Kolom input untuk pencarian */}
                                <input 
                                    type="text" 
                                    className="form-input w-full" 
                                    placeholder="Search..." 
                                    value={search} 
                                    onChange={(e) => setSearch(e.target.value)} 
                                />
                            </div>
                        </div>

                        {/* Baris kedua berisi filter kolom, tanggal, dan harga */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {/* Filter berdasarkan kolom tertentu */}
                            <div className="flex gap-3 w-full">
                                <select 
                                    value={selectedColumn} 
                                    onChange={(e) => setSelectedColumn(e.target.value)}
                                    className="form-select w-full"
                                >
                                    <option value="">Column Filter</option>
                                    {/* Menampilkan kolom yang bisa difilter, kecuali kolom no, photo, dan created_at */}
                                    {cols
                                        .filter(col => col.accessor !== "no" && col.accessor !== "photo" && col.accessor !== "created_at")
                                        .map(col => (
                                            <option key={col.accessor} value={col.accessor}>{col.title}</option>
                                        ))
                                    }
                                </select>
                                {/* Input nilai filter */}
                                <input 
                                    type="text"
                                    value={filterValue}
                                    onChange={(e) => setFilterValue(e.target.value)}
                                    placeholder="Enter value filter"
                                    className="form-input w-full"
                                />
                            </div>

                            {/* Filter rentang tanggal */}
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

                            {/* Filter rentang harga/pembayaran */}
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

                    {/* Tabel */}
                    <div className="datatables pagination-padding">
                        <DataTable
                            className="whitespace-nowrap table-hover invoice-table"
                            records={records} // Data yang akan ditampilkan dalam tabel
                            columns={[
                                // Kolom tabel dengan aksesornya dan opsi disembunyikan jika ada di hideCols
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
                            recordsPerPage={pageSize} // Jumlah data per halaman
                            page={page} // Halaman saat ini
                            onPageChange={(p) => setPage(p)} // Fungsi untuk ganti halaman
                            sortStatus={sortStatus} // Status sorting saat ini
                            selectedRecords={selectedRecords} // Data yang dipilih (checkbox)
                            onSelectedRecordsChange={setSelectedRecords} // Fungsi untuk update data yang dipilih
                            onSortStatusChange={setSortStatus} // Fungsi untuk mengatur sorting
                            paginationText={({ from, to, totalRecords }) =>
                                `Showing ${from} to ${to} of ${totalRecords} entries`
                            } // Teks pagination
                            rowExpansion={{
                                // Ekspansi baris untuk menampilkan detail produk dalam invoice
                                content: ({ record }) => (
                                    <table>
                                        <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Category</th>
                                            <th>Quantity</th>
                                            <th>DC Normal</th>
                                            <th>DC Member</th>
                                            <th>Total</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {/* Menampilkan detail setiap produk dalam invoice */}
                                        {record.products.map((d: any, index: number) => (
                                            <tr key={index}>
                                                <td>{d.product?.product_name}</td>
                                                <td>{d.product?.category?.name ?? "-"}</td>
                                                <td>{d.quantity}</td>
                                                <td>{d.discount_normal}%</td>
                                                <td>{d.discount_member}%</td>
                                                <td>{d.total}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                ),
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesProductReport;