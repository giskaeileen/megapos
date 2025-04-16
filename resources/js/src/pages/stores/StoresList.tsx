import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconTrashLines from '../../components/Icon/IconTrashLines';
import IconPlus from '../../components/Icon/IconPlus';
import Dropdown from '../../components/Dropdown';
import IconCaretDown from '../../components/Icon/IconCaretDown';
import { useDeleteStoresMutation, useGetStoresQuery } from '../../redux/features/stores/storesApi';
import { capitalizeFirstLetter, deleteConfirmation } from '../../components/tools';

const StoresList = () => {
    // Ambil lokasi saat ini dari react-router
    const location = useLocation();
    // Pecah pathname menjadi array berdasarkan '/'
    const pathnames = location.pathname.split('/').filter((x) => x);
    // Ambil entity dari URL, misalnya: /stores -> entity = 'stores'
    const entity = pathnames[0];
    // Nama-nama key untuk localStorage terkait entitas ini
    const entityCols = `${pathnames[0]}_cols`; 
    const entityPage = `${pathnames[0]}_page`; 
    const entitySort = `${pathnames[0]}_sort`; 
    const entityFilterColumn = `${pathnames[0]}_filter_column`; 
    const entityFilterValue= `${pathnames[0]}_filter_value`; 

    // ==============================
    // STATE
    // ==============================

    // State untuk halaman saat ini, nilai awal dari localStorage atau default 1
    const [page, setPage] = useState<number>(() => {
        const storedPage = localStorage.getItem(entityPage);
        return storedPage ? parseInt(storedPage, 10) : 1;
    });

    // State untuk input pencarian (search)
    const [search, setSearch] = useState(() => {
        return localStorage.getItem(`${entity}_search`) || '';
    });

    // State untuk status sorting, disimpan dalam localStorage dalam bentuk objek JSON
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>(() => {
        const storedSort = localStorage.getItem(`${entitySort}`);
        return storedSort
            ? JSON.parse(storedSort) 
            : { columnAccessor: 'created_at', direction: 'desc' };
    });

    // State untuk nama kolom yang difilter
    const [selectedColumn, setSelectedColumn] = useState<string>(() => {
        return localStorage.getItem(`${entity}_filter_column`) || '';
    });

    // State untuk nilai dari filter
    const [filterValue, setFilterValue] = useState<string>(() => {
        return localStorage.getItem(`${entity}_filter_value`) || '';
    });

    // Inisialisasi dispatch Redux
    const dispatch = useDispatch();

    // Data utama dan total record
    const [items, setItems] = useState<any[]>([]);
    const [total, setTotal] = useState();

    // Fungsi untuk delete data, menggunakan RTK Query mutation
    const [deleteStores] = useDeleteStoresMutation();

    // State untuk menyimpan kolom yang disembunyikan
    const [hideCols, setHideCols] = useState<string[]>([]);

    // Cek apakah RTL (right-to-left) aktif dari Redux
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    // ==============================
    // PAGINATION DAN SELEKSI
    // ==============================

    // Ukuran halaman untuk pagination
    const [pageSize, setPageSize] = useState(10);
    // Menyimpan semua data awal dari API
    const [initialRecords, setInitialRecords] = useState<any[]>([]);
    // Data yang ditampilkan di tabel saat ini
    const [records, setRecords] = useState(initialRecords);
    // Data yang dipilih oleh user
    const [selectedRecords, setSelectedRecords] = useState<any>([]);

    // ==============================
    // AMBIL DATA DARI API
    // ==============================

    const { data, refetch } = useGetStoresQuery(
        { 
            page, 
            search,
            sort: sortStatus.columnAccessor,
            direction: sortStatus.direction,
            filterColumn: selectedColumn,  
            filterValue: filterValue    
        },
        { refetchOnMountOrArgChange: true } // data akan di-refresh jika argumen berubah
    );

    // ==============================
    // KOLOM UNTUK DATATABLE
    // ==============================

    const cols = [
        { accessor: 'no', title: 'No' },
        { accessor: 'photo', title: 'Photo' },
        { accessor: 'name', title: 'Name' },
        { accessor: 'slug', title: 'Slug' },
        { accessor: 'country', title: 'Country' },
        { accessor: 'state', title: 'State' },
        { accessor: 'city', title: 'City' },
        { accessor: 'zip', title: 'ZIP' },
        { accessor: 'address', title: 'Address' },
        { accessor: 'created_at', title: 'Created At' },
    ];

    // ==============================
    // EFEK UNTUK SIMPAN KE LOCAL STORAGE
    // ==============================

    // Simpan input search ke localStorage saat berubah
    useEffect(() => {
        localStorage.setItem(`${entity}_search`, search);
    }, [search]);

    // Simpan kolom & nilai filter ke localStorage saat berubah
    useEffect(() => {
        localStorage.setItem(entityFilterColumn, selectedColumn);
        localStorage.setItem(entityFilterValue, filterValue);
    }, [selectedColumn, filterValue]);

    // Simpan status sorting ke localStorage saat berubah
    useEffect(() => {
        localStorage.setItem(`${entitySort}`, JSON.stringify(sortStatus));
    }, [sortStatus]);

    // Saat component mount, ambil sorting dari localStorage (jika ada)
    useEffect(() => {
        const storedSort = localStorage.getItem(`${entitySort}`);
        if (storedSort) {
            setSortStatus(JSON.parse(storedSort));
        }
    }, []);

    // ==============================
    // DELETE FUNCTION
    // ==============================

    // Fungsi hapus data dengan konfirmasi
    const deleteRow = () => {
        deleteConfirmation(selectedRecords, deleteStores, refetch);
    };

    // ==============================
    // PAGINATION DAN RECORDS
    // ==============================

    // Simpan semua data awal ke dalam state saat 'items' berubah
    useEffect(() => {
        setInitialRecords(items)
    }, [items]);

    // Saat pertama kali render, ambil halaman terakhir dari localStorage
    useEffect(() => {
        const storedPage = localStorage.getItem(entityPage);
        if (storedPage) {
            setPage(Number(storedPage));
        }
    }, []);

    // Simpan nomor halaman ke localStorage saat page berubah
    useEffect(() => {
        localStorage.setItem(entityPage, String(page));
    }, [page]);

    // Update tampilan record sesuai page dan pageSize
    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecords(initialRecords);
    }, [page, pageSize, initialRecords]);

    // ==============================
    // HANDLE DATA DARI API
    // ==============================

    useEffect(() => {
        if (data?.data) {
            const mappedItems = data.data.map((d: any, index: number) => {
                // Inisialisasi objek kosong per item
                let mappedObject: { [key: string]: any } = {
                    id: d.id,
                };

                // Mapping setiap kolom
                cols.forEach(col => {
                    if (col.accessor === 'created_at') {
                        // Format tanggal ke format Indonesia
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
                        // Nomor urutan global, bukan hanya per halaman
                        mappedObject[col.accessor] = (index + 1) + ((page - 1) * pageSize)
                    } else if (col.accessor === 'photo') {
                        // Tampilkan foto jika ada, jika tidak tampilkan placeholder
                        mappedObject[col.accessor] =  d.photo 
                            ? `${import.meta.env.VITE_SERVER_URI_BASE}storage/${entity}/${d.photo}` 
                            : '/assets/images/blank_product.png' 
                    } else {
                        // Data biasa langsung dari API
                        mappedObject[col.accessor] = d[col.accessor];
                    }
                });

                return mappedObject;
            });

            // Set hasil mapping ke state
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

    return (
        <div>
            {/* Header dengan judul entity dan tombol aksi */}
            <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
                {/* Judul berdasarkan entity di URL */}
                <h2 className="text-xl">{capitalizeFirstLetter(entity)}</h2>
                <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                    <div className="relative">
                        <div className="flex items-center gap-2">
                            {/* Tombol untuk nonaktifkan data terpilih */}
                            <button type="button" className="btn btn-danger gap-2" onClick={() => deleteRow()}>
                                <IconTrashLines />
                                Nonactive 
                            </button>
                            {/* Tombol untuk menambahkan data baru */}
                            <Link to={`/${entity}/create`} className="btn btn-primary gap-2">
                                <IconPlus />
                                Add New
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Panel utama untuk tabel */}
            <div className="panel px-0 border-white-light dark:border-[#1b2e4b]">
                <div className="invoice-table">

                    {/* Filter, search, dan kolom tersembunyi */}
                    <div className="mb-4.5 px-5 flex md:items-center md:flex-row flex-col gap-5">
                        <div className="flex md:items-center md:flex-row flex-col gap-5">

                            {/* Dropdown untuk mengatur kolom yang ditampilkan */}
                            <div className="dropdown">
                                <Dropdown
                                    placement={`${isRtl ? 'bottom-end' : 'bottom-start'}`}
                                    btnClassName="!flex items-center border font-semibold border-white-light dark:border-[#253b5c] rounded-md px-4 py-2 text-sm dark:bg-[#1b2e4b] dark:text-white-dark"
                                    button={
                                        <>
                                            <span className="ltr:mr-1 rtl:ml-1">Columns</span>
                                            <IconCaretDown className="w-5 h-5" />
                                        </>
                                    }
                                >
                                    <ul className="!min-w-[140px]">
                                        {/* Tampilkan daftar kolom kecuali "slug" dan "photo" */}
                                        {cols
                                            .filter(col => 
                                                col.accessor !== "slug" && 
                                                col.accessor !== "photo"
                                            )
                                            .map((col, i) => {
                                            return (
                                                <li
                                                    key={i}
                                                    className="flex flex-col"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                    }}
                                                >
                                                    <div className="flex items-center px-4 py-1">
                                                        <label className="cursor-pointer mb-0">
                                                            {/* Checkbox untuk menyembunyikan/menampilkan kolom */}
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
                                            );
                                        })}
                                    </ul>
                                </Dropdown>
                            </div>
                        </div>

                        {/* Dropdown untuk memilih kolom filter dan input untuk nilai filter */}
                        <div className="flex gap-3">
                            <select 
                                value={selectedColumn} 
                                onChange={(e) => setSelectedColumn(e.target.value)}
                                className="form-select"
                            >
                                <option value="">Column Filter</option>
                                {/* Hanya tampilkan kolom yang bisa difilter */}
                                {cols
                                    .filter(col => 
                                        col.accessor !== "no" && 
                                        col.accessor !== "photo" && 
                                        col.accessor !== "slug" && 
                                        col.accessor !== "created_at"
                                    )
                                    .map(col => (
                                        <option key={col.accessor} value={col.accessor}>{col.title}</option>
                                    ))
                                }
                            </select>

                            {/* Input teks untuk nilai filter */}
                            <input 
                                type="text"
                                value={filterValue}
                                onChange={(e) => setFilterValue(e.target.value)}
                                placeholder="Enter value filter"
                                className="form-input"
                            />
                        </div>

                        {/* Input pencarian data */}
                        <div className="ltr:ml-auto rtl:mr-auto">
                            <input type="text" className="form-input w-auto" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                    </div>

                    {/* Komponen tabel utama */}
                    <div className="datatables pagination-padding">
                        <DataTable
                            className="whitespace-nowrap table-hover invoice-table"
                            records={records} // Data yang akan ditampilkan di tabel
                            columns={[
                                {
                                    accessor: 'no',
                                    hidden: hideCols.includes('no'),
                                },
                                {
                                    accessor: 'name',
                                    sortable: true,
                                    hidden: hideCols.includes('name'),
                                    render: ({ name, slug, photo}) => {
                                        return (
                                            <div className="flex items-center font-semibold">
                                                <div className="p-0.5 bg-white-dark/30 rounded-md w-max ltr:mr-2 rtl:ml-2">
                                                    <img 
                                                        className="w-8 h-8 rounded-md overflow-hidden object-cover" 
                                                        src={photo}
                                                        alt={name || 'Profile'}
                                                    />
                                                </div>
                                                <div>
                                                    {/* Tautan ke detail entity berdasarkan slug */}
                                                    <a
                                                        href={`/${entity}/${slug}`}
                                                        className="hover:underline"
                                                    >
                                                        {name}
                                                    </a>
                                                </div>
                                            </div>
                                        );
                                    },
                                },
                                {
                                    accessor: 'country',
                                    sortable: true,
                                    hidden: hideCols.includes('country'),
                                },
                                {
                                    accessor: 'state',
                                    sortable: true,
                                    hidden: hideCols.includes('state'),
                                },
                                {
                                    accessor: 'city',
                                    sortable: true,
                                    hidden: hideCols.includes('city'),
                                },
                                {
                                    accessor: 'zip',
                                    sortable: true,
                                    hidden: hideCols.includes('zip'),
                                },
                                {
                                    accessor: 'address',
                                    sortable: true,
                                    hidden: hideCols.includes('address'),
                                },
                                {
                                    accessor: 'created_at',
                                    sortable: true,
                                    hidden: hideCols.includes('created_at'),
                                },
                            ]}
                            highlightOnHover // Highlight baris saat di-hover
                            totalRecords={total} // Total data untuk pagination
                            recordsPerPage={pageSize} // Jumlah data per halaman
                            page={page} // Halaman aktif
                            onPageChange={(p) => setPage(p)} // Fungsi saat pindah halaman
                            sortStatus={sortStatus} // Status urutan
                            onSortStatusChange={setSortStatus} // Fungsi ubah urutan
                            selectedRecords={selectedRecords} // Data yang sedang dipilih
                            onSelectedRecordsChange={setSelectedRecords} // Fungsi saat memilih data
                            paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`} // Teks pagination
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoresList;