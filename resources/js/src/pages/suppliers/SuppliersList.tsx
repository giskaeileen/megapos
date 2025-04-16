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
import { useDeleteSuppliersMutation, useGetSuppliersQuery } from '../../redux/features/suppliers/suppliersApi';
import { capitalizeFirstLetter, deleteConfirmation } from '../../components/tools';

const SuppliersList = () => {
    // entity localstorage
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x); // Memisahkan dan menghapus bagian kosong pada URL path
    const storeId = pathnames[0]; // storeId berada pada index pertama
    const entity = pathnames[1]; // entity berada pada index kedua
    const entityCols = `${entity}_cols`; // Nama untuk menyimpan kolom yang disembunyikan
    const entityPage = `${entity}_page`; // Nama untuk menyimpan halaman yang aktif
    const entitySort = `${entity}_sort`; // Nama untuk menyimpan status pengurutan
    const entityFilterColumn = `${entity}_filter_column`; // Nama untuk menyimpan kolom yang difilter
    const entityFilterValue = `${entity}_filter_value`; // Nama untuk menyimpan nilai filter

    // state 
    // Menyimpan nilai halaman dari localStorage atau default ke halaman pertama
    const [page, setPage] = useState<number>(() => {
        const storedPage = localStorage.getItem(entityPage); // Mengambil halaman dari localStorage
        return storedPage ? parseInt(storedPage, 10) : 1; // Jika ada, gunakan nilai tersebut, jika tidak, set default 1
    });
    const [search, setSearch] = useState(() => {
        return localStorage.getItem(`${entity}_search`) || ''; // Menyimpan nilai pencarian dari localStorage atau default ke kosong
    });
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>(() => {
        const storedSort = localStorage.getItem(`${entitySort}`); // Mengambil status pengurutan dari localStorage
        return storedSort
            ? JSON.parse(storedSort) // Jika ada, konversi JSON menjadi objek
            : { columnAccessor: 'created_at', direction: 'desc' }; // Default ke pengurutan berdasarkan `created_at`
    });
    const dispatch = useDispatch(); // Hook untuk dispatch aksi Redux
    const [items, setItems] = useState<any[]>([]); // Menyimpan data item yang ditampilkan
    const [total, setTotal] = useState(); // Menyimpan jumlah total data
    const [deleteSupplier] = useDeleteSuppliersMutation(); // Hook untuk melakukan penghapusan supplier
    const [hideCols, setHideCols] = useState<string[]>([]); // Menyimpan kolom yang disembunyikan
    const [selectedColumn, setSelectedColumn] = useState<string>(() => {
        return localStorage.getItem(`${entity}_filter_column`) || ''; // Menyimpan kolom yang sedang difilter
    });
    const [filterValue, setFilterValue] = useState<string>(() => {
        return localStorage.getItem(`${entity}_filter_value`) || ''; // Menyimpan nilai filter
    });
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false; // Mengecek apakah tema RTL diaktifkan

    // page
    const [pageSize, setPageSize] = useState(10); // Menyimpan ukuran halaman
    const [initialRecords, setInitialRecords] = useState<any[]>([]); // Menyimpan data awal yang dimuat
    const [records, setRecords] = useState(initialRecords); // Menyimpan data yang akan ditampilkan
    const [selectedRecords, setSelectedRecords] = useState<any>([]); // Menyimpan data yang dipilih

    // data 
    // Hook untuk mengambil data dari API berdasarkan parameter pencarian, pengurutan, dan filter
    const { data, refetch } = useGetSuppliersQuery(
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

    // Menyusun kolom yang digunakan dalam tabel
    const cols = [
        { accessor: 'no', title: 'No' },
        { accessor: 'name', title: 'Name' },
        { accessor: 'email', title: 'Email' },
        { accessor: 'phone', title: 'Phone' },
        { accessor: 'address', title: 'Address' },
        { accessor: 'shopname', title: 'Shopname' },
        { accessor: 'photo', title: 'Photo' },
        { accessor: 'type', title: 'Type' },
        { accessor: 'account_holder', title: 'Account Holder' },
        { accessor: 'account_number', title: 'Account Number' },
        { accessor: 'bank_name', title: 'Bank Name' },
        { accessor: 'bank_branch', title: 'Bank Branch' },
        { accessor: 'city', title: 'City' },
        { accessor: 'created_at', title: 'Created At' },
    ];

    /*****************************
     * search 
     */

    useEffect(() => {
        localStorage.setItem(`${entity}_search`, search); // Menyimpan nilai pencarian ke localStorage
    }, [search]);

    /*****************************
     * filter 
     */

    useEffect(() => {
        localStorage.setItem(entityFilterColumn, selectedColumn); // Menyimpan kolom yang difilter
        localStorage.setItem(entityFilterValue, filterValue); // Menyimpan nilai filter
    }, [selectedColumn, filterValue]);

    /*****************************
     * sort 
     */

    useEffect(() => {
        localStorage.setItem(`${entitySort}`, JSON.stringify(sortStatus)); // Menyimpan status pengurutan ke localStorage
    }, [sortStatus]);

    useEffect(() => {
        const storedSort = localStorage.getItem(`${entitySort}`); // Mengambil status pengurutan dari localStorage
        if (storedSort) {
            setSortStatus(JSON.parse(storedSort)); // Jika ada, gunakan status pengurutan yang disimpan
        }
    }, []);

    /*****************************
     * delete 
     */

    // Fungsi untuk menghapus data
    const deleteRow = () => {
        deleteConfirmation(selectedRecords, deleteSupplier, refetch, storeId); // Mengonfirmasi dan menghapus data supplier yang dipilih
    };

    /*****************************
     * page 
     */

    // Mengupdate data awal saat items berubah
    useEffect(() => {
        setInitialRecords(items);
    }, [items]);

    // Mengambil halaman yang disimpan saat komponen pertama kali dirender
    useEffect(() => {
        const storedPage = localStorage.getItem(entityPage); 
        if (storedPage) {
            setPage(Number(storedPage)); // Mengatur halaman yang disimpan
        }
    }, []);

    // Menyimpan halaman yang aktif ke localStorage
    useEffect(() => {
        localStorage.setItem(entityPage, String(page)); // Menyimpan nilai halaman
    }, [page]);

    // Mengupdate data `records` saat halaman atau ukuran halaman berubah
    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecords(initialRecords); // Menyesuaikan data yang akan ditampilkan
    }, [page, pageSize, initialRecords]);

    /*****************************
     * items 
     */

    // Mengolah data yang diterima dari API dan memetakan data ke format yang sesuai untuk tabel
    useEffect(() => {
        if (data?.data) {
            const mappedItems = data.data.map((d: any, index: number) => {
                let mappedObject: { [key: string]: any } = {
                    id: d.id,
                };

                // Proses pengolahan setiap kolom
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
                        }).format(new Date(d[col.accessor])); // Format tanggal dan waktu
                    } else if (col.accessor === 'no') {
                        mappedObject[col.accessor] = (index + 1) + ((page - 1) * pageSize); // Menambahkan nomor urut
                    } else if (col.accessor === 'photo') {
                        mappedObject[col.accessor] =  d.photo 
                            ? `${import.meta.env.VITE_SERVER_URI_BASE}storage/${entity}/${d.photo}` // Menyusun URL gambar jika ada
                            : '/assets/images/blank_profile.png'; // Menampilkan gambar default jika tidak ada foto
                    } else {
                        mappedObject[col.accessor] = d[col.accessor]; // Menyimpan nilai kolom
                    }
                });

                return mappedObject;
            });

            setItems(mappedItems); // Menyimpan data yang telah dipetakan
            setTotal(data.total); // Menyimpan jumlah total data
        }
    }, [data, page, pageSize]);

    // Mengatur judul halaman
    useEffect(() => {
        dispatch(setPageTitle('Users')); // Menyimpan judul halaman 'Users'
    }, [dispatch]);

    /*****************************
     * checkbox hide show
     */

    // Memuat kolom yang disembunyikan dari localStorage saat komponen pertama kali dirender
    useEffect(() => {
        const storedCols = localStorage.getItem(entityCols); 
        if (storedCols) {
            setHideCols(JSON.parse(storedCols)); // Menyimpan kolom yang disembunyikan
        }
    }, []);

    // Fungsi untuk menambah atau menghapus kolom yang disembunyikan
    const showHideColumns = (col: string) => {
        const updatedCols = hideCols.includes(col)
            ? hideCols.filter((d) => d !== col) // Menghapus kolom dari daftar yang disembunyikan
            : [...hideCols, col]; // Menambahkan kolom ke daftar yang disembunyikan

        setHideCols(updatedCols); // Mengupdate status kolom yang disembunyikan

        // Menyimpan status kolom yang disembunyikan ke localStorage
        localStorage.setItem(entityCols, JSON.stringify(updatedCols));
    };

    return (
    <div>
        {/* Bagian Header untuk menampilkan nama entity dan tombol aksi */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
            {/* Judul Halaman */}
            <h2 className="text-xl">{capitalizeFirstLetter(entity)}</h2>
            
            {/* Tombol Aksi (Hapus dan Tambah Baru) */}
            <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                <div className="relative">
                    <div className="flex items-center gap-2">
                        {/* Tombol Hapus */}
                        <button type="button" className="btn btn-danger gap-2" onClick={() => deleteRow()}>
                            <IconTrashLines />
                            Delete
                        </button>
                        {/* Tombol Tambah Baru */}
                        <Link to={`/${storeId}/${entity}/create`} className="btn btn-primary gap-2">
                            <IconPlus />
                            Add New
                        </Link>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Panel untuk tabel */}
        <div className="panel px-0 border-white-light dark:border-[#1b2e4b]">
            {/* Tabel untuk menampilkan data */}
            <div className="invoice-table">
                <div className="mb-4.5 px-5 flex md:items-center md:flex-row flex-col gap-5">
                    {/* Dropdown untuk memilih kolom */}
                    <div className="flex md:items-center md:flex-row flex-col gap-5">
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
                                {/* Daftar kolom yang dapat dipilih untuk ditampilkan */}
                                <ul className="!min-w-[140px]">
                                    {cols
                                        .filter(col => col.accessor !== "photo") // Menghilangkan kolom "Photo"
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
                                                        <input
                                                            type="checkbox"
                                                            checked={!hideCols.includes(col.accessor)} // Jika kolom tidak tersembunyi, checkbox dicentang
                                                            className="form-checkbox"
                                                            defaultValue={col.accessor}
                                                            onChange={(event: any) => {
                                                                setHideCols(event.target.value); // Update status hideCols
                                                                showHideColumns(col.accessor); // Menyembunyikan/menampilkan kolom
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
                        {/* Dropdown untuk memilih kolom yang ingin difilter */}
                        <select 
                            value={selectedColumn} 
                            onChange={(e) => setSelectedColumn(e.target.value)}
                            className="form-select"
                        >
                            <option value="">Column Filter</option>
                            {cols
                                .filter(col => col.accessor !== "no" && col.accessor !== "photo" && col.accessor !== "created_at") // Menghilangkan "No" & "Created At"
                                .map(col => (
                                    <option key={col.accessor} value={col.accessor}>{col.title}</option>
                                ))
                            }
                        </select>

                        {/* Input untuk mencari/filter berdasarkan nilai */}
                        <input 
                            type="text"
                            value={filterValue}
                            onChange={(e) => setFilterValue(e.target.value)} // Menyimpan nilai filter yang dipilih
                            placeholder="Enter value filter"
                            className="form-input"
                        />
                    </div>

                    {/* Input untuk pencarian data */}
                    <div className="ltr:ml-auto rtl:mr-auto">
                        <input type="text" className="form-input w-auto" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                </div>

                {/* Tabel Data */}
                <div className="datatables pagination-padding">
                    <DataTable
                        className="whitespace-nowrap table-hover invoice-table"
                        records={records} // Menampilkan data yang sudah di-mapping sebelumnya
                        columns={[
                            {
                                accessor: 'no',
                                hidden: hideCols.includes('no'), // Menyembunyikan kolom "No" jika ada di hideCols
                            },
                            {
                                accessor: 'name',
                                sortable: true, // Kolom ini bisa di-sort
                                hidden: hideCols.includes('name'), // Menyembunyikan kolom "Name" jika ada di hideCols
                                render: ({ name, id, photo}) => {
                                    return (
                                        <div className="flex items-center font-semibold">
                                            {/* Menampilkan foto profile */}
                                            <div className="p-0.5 bg-white-dark/30 rounded-full w-max ltr:mr-2 rtl:ml-2">
                                                <img
                                                    className="h-8 w-8 rounded-full object-cover"
                                                    src={photo}
                                                    alt={name || 'Profile'}
                                                />
                                            </div>
                                            {/* Nama yang dapat diklik */}
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
                            // Kolom-kolom lainnya didefinisikan serupa
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
                                accessor: 'address',
                                sortable: true,
                                hidden: hideCols.includes('address'),
                            },
                            {
                                accessor: 'shopname',
                                sortable: true,
                                hidden: hideCols.includes('shopname'),
                            },
                            {
                                accessor: 'type',
                                sortable: true,
                                hidden: hideCols.includes('type'),
                            },
                            {
                                accessor: 'account_holder',
                                sortable: true,
                                hidden: hideCols.includes('account_holder'),
                            },
                            {
                                accessor: 'account_number',
                                sortable: true,
                                hidden: hideCols.includes('account_number'),
                            },
                            {
                                accessor: 'bank_name',
                                sortable: true,
                                hidden: hideCols.includes('bank_name'),
                            },
                            {
                                accessor: 'bank_branch',
                                sortable: true,
                                hidden: hideCols.includes('bank_branch'),
                            },
                            {
                                accessor: 'created_at',
                                sortable: true,
                                hidden: hideCols.includes('created_at'),
                            },
                        ]}
                        highlightOnHover
                        totalRecords={total} // Menampilkan total jumlah data
                        recordsPerPage={pageSize} // Jumlah data per halaman
                        page={page} // Halaman yang sedang aktif
                        onPageChange={(p) => setPage(p)} // Menangani perubahan halaman
                        sortStatus={sortStatus} // Status pengurutan
                        onSortStatusChange={setSortStatus} // Menangani perubahan urutan
                        selectedRecords={selectedRecords} // Menangani record yang dipilih
                        onSelectedRecordsChange={setSelectedRecords} // Menangani perubahan record yang dipilih
                        paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`} // Menampilkan teks pagination
                    />
                </div>
            </div>
        </div>
    </div>

    );
};

export default SuppliersList;