import { Link, NavLink, useLocation, useParams } from 'react-router-dom';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconTrashLines from '../../components/Icon/IconTrashLines';
import IconPlus from '../../components/Icon/IconPlus';
import Dropdown from '../../components/Dropdown';
import IconCaretDown from '../../components/Icon/IconCaretDown';
import { useDeleteCustomerMutation, useGetCustomersQuery } from '../../redux/features/customers/customersApi';
import { capitalizeFirstLetter, deleteConfirmation } from '../../components/tools';

const CustomersList = () => {
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

    // state 
    const [page, setPage] = useState<number>(() => {
        const storedPage = localStorage.getItem(entityPage);
        return storedPage ? parseInt(storedPage, 10) : 1; // Konversi ke number, default ke 1
    });
    // Inisialisasi state untuk pencarian dari localStorage
    const [search, setSearch] = useState(() => {
        return localStorage.getItem(`${entity}_search`) || '';
    });
    // Inisialisasi state sorting dari localStorage
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>(() => {
        const storedSort = localStorage.getItem(`${entitySort}`);
        return storedSort
            ? JSON.parse(storedSort) 
            : { columnAccessor: 'created_at', direction: 'desc' }; 
    });
    const dispatch = useDispatch();
    // State data
    const [items, setItems] = useState<any[]>([]);
    const [total, setTotal] = useState();
    // Inisialisasi mutation delete
    const [deleteCustomer] = useDeleteCustomerMutation();
    // Menyimpan kolom tersembunyi (hide column)
    const [hideCols, setHideCols] = useState<string[]>([]);
    // Menentukan arah RTL
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
    const [selectedColumn, setSelectedColumn] = useState<string>(() => {
        return localStorage.getItem(`${entity}_filter_column`) || '';
    }); // Kolom yang difilter
    const [filterValue, setFilterValue] = useState<string>(() => {
        return localStorage.getItem(`${entity}_filter_value`) || '';
    }); // nilai filter

    // Konfigurasi pagination
    const [pageSize, setPageSize] = useState(10);
    const [initialRecords, setInitialRecords] = useState<any[]>([]);
    const [records, setRecords] = useState(initialRecords);
    const [selectedRecords, setSelectedRecords] = useState<any>([]);

    // Ambil data dari API menggunakan RTK Query
    const { data, refetch } = useGetCustomersQuery(
        { 
            storeId: storeId,
            page, 
            search,
            sort: sortStatus.columnAccessor,
            direction: sortStatus.direction,
            filterColumn: selectedColumn,  
            filterValue: filterValue    
        },
        { refetchOnMountOrArgChange: true } 
    );
    // Kolom-kolom untuk tabel
    const cols = [
        { accessor: 'no', title: 'No' },
        { accessor: 'name', title: 'Name' },
        { accessor: 'photo', title: 'Photo' },
        { accessor: 'email', title: 'Email' },
        { accessor: 'phone', title: 'Phone' },
        { accessor: 'shopname', title: 'Shopname' },
        { accessor: 'city', title: 'City' },
        { accessor: 'created_at', title: 'Created At' },
    ];

    /*****************************
     * search 
     */

    // Menyimpan pencarian ke localStorage setiap kali berubah
    useEffect(() => {
        localStorage.setItem(`${entity}_search`, search);
    }, [search]);

    /*****************************
     * filter 
     */

    // Menyimpan data filter ke localStorage
    useEffect(() => {
        localStorage.setItem(entityFilterColumn, selectedColumn);
        localStorage.setItem(entityFilterValue, filterValue);
    }, [selectedColumn, filterValue]);

    /*****************************
     * sort 
     */

    // Simpan konfigurasi sort ke localStorage saat sortStatus berubah
    useEffect(() => {
        localStorage.setItem(`${entitySort}`, JSON.stringify(sortStatus));
    }, [sortStatus]);

    // Set ulang sortStatus saat komponen pertama kali render
    useEffect(() => {
        const storedSort = localStorage.getItem(`${entitySort}`);
        if (storedSort) {
            setSortStatus(JSON.parse(storedSort));
        }
    }, []);

    /*****************************
     * delete 
     */

    // Hapus data
    const deleteRow = () => {
        deleteConfirmation(selectedRecords, deleteCustomer, refetch, storeId);
    };

    /*****************************
     * page 
     */

    // Atur data awal records saat items berubah
    useEffect(() => {
        setInitialRecords(items)
    }, [items]);

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

    // Mapping data dari API untuk ditampilkan di tabel
    useEffect(() => {
        if (data?.data) {
            const mappedItems = data.data.map((d: any, index: number) => {
                // Buat objek berdasarkan kolom yang telah didefinisikan
                let mappedObject: { [key: string]: any } = {
                    id: d.id,
                };

                cols.forEach(col => {
                    if (col.accessor === 'created_at') {
                        // Format tanggal agar sesuai dengan lokal Indonesia
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
                        // Nomor urut berdasarkan halaman dan index
                       mappedObject[col.accessor] = (index + 1) + ((page - 1) * pageSize)

                    } else if (col.accessor === 'photo') {
                        // Tampilkan foto, jika tidak ada gunakan foto default
                        mappedObject[col.accessor] =  d.photo 
                            ? `${import.meta.env.VITE_SERVER_URI_BASE}storage/${entity}/${d.photo}` 
                            : '/assets/images/profile-2.jpeg' 

                    } else {
                        mappedObject[col.accessor] = d[col.accessor];
                    }
                });

                return mappedObject;
            });

            setItems(mappedItems); // Set data ke state
            setTotal(data.total); // Total item dari response
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
            {/* Header Section */}
            <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
                {/* Title berdasarkan nama entity */}
                <h2 className="text-xl">{capitalizeFirstLetter(entity)}</h2>
                {/* button Delete dan create */}
                <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                    <div className="relative">
                        <div className="flex items-center gap-2">
                            {/* button hapus data */}
                            <button type="button" className="btn btn-danger gap-2" onClick={() => deleteRow()}>
                                <IconTrashLines />
                                Delete
                            </button>
                            {/* Link untuk menuju halaman create data baru */}
                            <Link to={`/${storeId}/${entity}/create`} className="btn btn-primary gap-2">
                                <IconPlus />
                                Add New
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            {/* Panel untuk menampung tabel dan filter */}
            <div className="panel px-0 border-white-light dark:border-[#1b2e4b]">
                <div className="invoice-table">
                    {/* Filter, Dropdown Kolom, dan Search */}
                    <div className="mb-4.5 px-5 flex md:items-center md:flex-row flex-col gap-5">
                        <div className="flex md:items-center md:flex-row flex-col gap-5">
                            {/* Dropdown untuk memilih kolom yang ingin ditampilkan */}
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
                                        {cols
                                            .filter(col => col.accessor !== "photo" ) // Kolom "photo" tidak bisa di-hide
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
                                                            {/* Checkbox untuk toggle kolom */}
                                                            <input
                                                                type="checkbox"
                                                                checked={!hideCols.includes(col.accessor)}
                                                                className="form-checkbox"
                                                                defaultValue={col.accessor}
                                                                onChange={(event: any) => {
                                                                    setHideCols(event.target.value); // Simpan kolom yang disembunyikan
                                                                    showHideColumns(col.accessor); // Fungsi untuk menyembunyikan kolom
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

                        {/* Dropdown Pilih Kolom + Input Filter */}
                        <div className="flex gap-3">
                            {/* Pilihan kolom untuk difilter */}
                            <select 
                                value={selectedColumn} 
                                onChange={(e) => setSelectedColumn(e.target.value)}
                                className="form-select"
                            >
                                <option value="">Column Filter</option>
                                {cols
                                    .filter(col => col.accessor !== "no" && col.accessor !== "photo" && col.accessor !== "created_at") // Hilangkan "No" & "Created At"
                                    .map(col => (
                                        <option key={col.accessor} value={col.accessor}>{col.title}</option>
                                    ))
                                }
                            </select>

                            {/* Inputan nilai filter */}
                            <input 
                                type="text"
                                value={filterValue}
                                onChange={(e) => setFilterValue(e.target.value)}
                                placeholder="Enter value filter"
                                className="form-input"
                            />
                        </div>

                        {/* Pencarian umum */}
                        <div className="ltr:ml-auto rtl:mr-auto">
                            <input type="text" className="form-input w-auto" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                    </div>

                    {/* Tabel Data Customer */}
                    <div className="datatables pagination-padding">
                        <DataTable
                            className="whitespace-nowrap table-hover invoice-table"
                            records={records} // Data yang ditampilkan
                            columns={[
                                {
                                    accessor: 'no',
                                    hidden: hideCols.includes('no'),
                                },
                                {
                                    accessor: 'name',
                                    sortable: true,
                                    hidden: hideCols.includes('name'),
                                    render: ({ name, id, photo}) => {
                                        return (
                                            <div className="flex items-center font-semibold">
                                                {/* Foto Profil */}
                                                <div className="p-0.5 bg-white-dark/30 rounded-full w-max ltr:mr-2 rtl:ml-2">
                                                    <img
                                                        className="h-8 w-8 rounded-full object-cover"
                                                        src={photo}
                                                        alt={name || 'Profile'}
                                                    />
                                                </div>
                                                <div>
                                                    <a
                                                        href={`/${storeId}/${entity}/${id}`}
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
                                    accessor: 'email',
                                    sortable: true,
                                    hidden: hideCols.includes('email'),
                                },
                                {
                                    accessor: 'phone',
                                    sortable: true,
                                    hidden: hideCols.includes('phone'),
                                },
                                {
                                    accessor: 'shopname',
                                    sortable: true,
                                    hidden: hideCols.includes('shopname'),
                                },
                                {
                                    accessor: 'city',
                                    sortable: true,
                                    hidden: hideCols.includes('city'),
                                },
                                {
                                    accessor: 'created_at',
                                    sortable: true,
                                    hidden: hideCols.includes('created_at'),
                                },
                            ]}
                            highlightOnHover // Efek hover pada baris tabel
                            totalRecords={total} // Total data untuk pagination
                            recordsPerPage={pageSize} // Data per halaman
                            page={page} // Halaman saat ini
                            onPageChange={(p) => setPage(p)} // Fungsi saat pindah halaman
                            sortStatus={sortStatus} // Status sorting
                            onSortStatusChange={setSortStatus} // Fungsi ubah sorting
                            selectedRecords={selectedRecords} // Data yang dipilih
                            onSelectedRecordsChange={setSelectedRecords} // Fungsi ubah data yang dipilih
                            paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`} // Format teks pagination
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomersList;