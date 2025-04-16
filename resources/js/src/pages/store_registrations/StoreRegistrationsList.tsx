import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { setPageTitle } from '../../store/themeConfigSlice';
import Dropdown from '../../components/Dropdown';
import IconCaretDown from '../../components/Icon/IconCaretDown';
import Swal from 'sweetalert2';
import { useApproveStoreRegistrationsMutation, useGetStoreRegistrationsQuery } from '../../redux/features/stores/storesApi';
import { capitalizeFirstLetter } from '../../components/tools';
import { useTranslation } from 'react-i18next';

/**
 * Komponen untuk menampilkan daftar pendaftaran toko
 * Fitur utama:
 * - Menampilkan data pendaftaran toko dalam tabel
 * - Approve pendaftaran toko
 * - Filter dan sorting data
 * - Kolom yang bisa dihide/show
 */
const StoreRegistrationsList = () => {
    // Inisialisasi i18n untuk multi bahasa
    const { t } = useTranslation();
    
    // Mengambil path URL untuk menentukan entity
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);
    const entity = pathnames[0];
    const entityCols = `${pathnames[0]}_cols`; 
    const entityPage = `${pathnames[0]}_page`; 
    const entitySort = `${pathnames[0]}_sort`; 
    const entityFilterColumn = `${pathnames[0]}_filter_column`; 
    const entityFilterValue = `${pathnames[0]}_filter_value`; 

    // State untuk pagination
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

    // State untuk filter kolom
    const [selectedColumn, setSelectedColumn] = useState<string>(() => {
        return localStorage.getItem(`${entity}_filter_column`) || '';
    });

    // State untuk nilai filter
    const [filterValue, setFilterValue] = useState<string>(() => {
        return localStorage.getItem(`${entity}_filter_value`) || '';
    });

    // Fetch data pendaftaran toko dari API
    const { data, refetch } = useGetStoreRegistrationsQuery(
        { 
            page, 
            search,
            sort: sortStatus.columnAccessor,
            direction: sortStatus.direction,
            filterColumn: selectedColumn,  
            filterValue: filterValue    
        },
        { refetchOnMountOrArgChange: true } 
    );

    const dispatch = useDispatch();
    const [items, setItems] = useState<any[]>([]);
    const [total, setTotal] = useState();
    
    // Mutation untuk approve pendaftaran toko
    const [approveStoreRegistrations] = useApproveStoreRegistrationsMutation();
    
    // State untuk kolom yang dihide
    const [hideCols, setHideCols] = useState<string[]>([]);

    // Definisi kolom tabel
    const cols = [
        { accessor: 'no', title: t('No') },
        { accessor: 'store_name', title: t('Store Name') },
        { accessor: 'country', title: t('Country') },
        { accessor: 'city', title: t('City') },
        { accessor: 'state', title: t('State') },
        { accessor: 'zip', title: t('ZIP') },
        { accessor: 'street_address', title: t('Street Address') },
        { accessor: 'owner_name', title: t('Owner Name') },
        { accessor: 'owner_email', title: t('Owner Email') },
        { accessor: 'owner_phone', title: t('Owner Phone') },
        { accessor: 'status', title: t('Status') },
        { accessor: 'created_at', title: t('Created At') },
    ];

    /*****************************
     * Efek untuk pencarian
     *****************************/
    useEffect(() => {
        localStorage.setItem(`${entity}_search`, search);
    }, [search]);

    /*****************************
     * Efek untuk filter
     *****************************/
    useEffect(() => {
        localStorage.setItem(entityFilterColumn, selectedColumn);
        localStorage.setItem(entityFilterValue, filterValue);
    }, [selectedColumn, filterValue]);

    /*****************************
     * Efek untuk sorting
     *****************************/
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
     * Fungsi untuk approve data
     *****************************/
    const approveRow = async () => {
        if (!selectedRecords.length) {
            Swal.fire({
                icon: 'info',
                title: 'No Selection',
                text: 'Please select at least one record to approve.',
            });
            return;
        }

        Swal.fire({
            icon: 'warning',
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            showCancelButton: true,
            confirmButtonText: 'Approve',
            cancelButtonText: 'Cancel',
            padding: '2em',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const promises = selectedRecords
                        .filter((record: any) => record.status !== 'approved')
                        .map((record: any) => approveStoreRegistrations(record.id).unwrap());

                    const results = await Promise.allSettled(promises);

                    const failed = results
                        .filter((r) => r.status === "rejected")
                        .map((r) => {
                            if ('reason' in r) {
                                return `${r.reason?.data?.message || r.reason?.message || "Unknown error"}`;
                            }
                            return "Unknown error";
                        });

                    if (failed.length) {
                        throw new Error(`Some records failed to approve:\n\n${failed.join("\n")}`);
                    }

                    Swal.fire({
                        title: 'Approved!',
                        text: 'Selected records have been approved.',
                        icon: 'success',
                    });

                    refetch();
                } catch (error: any) {
                    console.error('Error approving users:', error);
                    Swal.fire({
                        title: 'Error!',
                        text: error.message || 'An error occurred while approving records.',
                        icon: 'error',
                    });
                }
            }
        });
    };

    /*****************************
     * Pagination
     *****************************/
    const [pageSize, setPageSize] = useState(10);
    const [initialRecords, setInitialRecords] = useState<any[]>([]);
    useEffect(() => {
        setInitialRecords(items)
    }, [items]);
    const [records, setRecords] = useState(initialRecords);
    const [selectedRecords, setSelectedRecords] = useState<any>([]);

    useEffect(() => {
        const storedPage = localStorage.getItem(entityPage);
        if (storedPage) {
            setPage(Number(storedPage));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(entityPage, String(page));
    }, [page]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecords(initialRecords);
    }, [page, pageSize, initialRecords]);

    /*****************************
     * Mapping data items
     *****************************/
    useEffect(() => {
        if (data?.data) {
            const mappedItems = data.data.map((d: any, index: number) => {
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

    /*****************************
     * Fungsi untuk hide/show kolom
     *****************************/
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

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

    return (
        <div>
            {/* Header section */}
            <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
                <h2 className="text-xl">{t(capitalizeFirstLetter(entity))}</h2>
                <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                    <div className="relative">
                        <div className="flex items-center gap-2">
                            {/* Tombol Approve */}
                            <button type="button" className="btn btn-secondary gap-2" onClick={() => approveRow()}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle opacity="0.5" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
                                    <path d="M8.5 12.5L10.5 14.5L15.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                {t('Approve')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Panel utama */}
            <div className="panel px-0 border-white-light dark:border-[#1b2e4b]">
                <div className="invoice-table">
                    {/* Toolbar dengan filter dan pencarian */}
                    <div className="mb-4.5 px-5 flex md:items-center md:flex-row flex-col gap-5">
                        <div className="flex md:items-center md:flex-row flex-col gap-5">
                            {/* Dropdown untuk hide/show kolom */}
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
                                    <ul className="!min-w-max">
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
                                                            onChange={() => showHideColumns(col.accessor)}
                                                        />
                                                        <span className="ltr:ml-2 rtl:mr-2">{col.title}</span>
                                                    </label>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </Dropdown>
                            </div>
                        </div>

                        {/* Filter kolom */}
                        <div className="flex gap-3">
                            <select 
                                value={selectedColumn} 
                                onChange={(e) => setSelectedColumn(e.target.value)}
                                className="form-select"
                            >
                                <option value="">Column Filter</option>
                                {cols
                                    .filter(col => col.accessor !== "no" && col.accessor !== "created_at")
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
                                className="form-input"
                            />
                        </div>

                        {/* Pencarian global */}
                        <div className="ltr:ml-auto rtl:mr-auto">
                            <input 
                                type="text" 
                                className="form-input w-auto" 
                                placeholder="Search..." 
                                value={search} 
                                onChange={(e) => setSearch(e.target.value)} 
                            />
                        </div>
                    </div>

                    {/* Tabel data */}
                    <div className="datatables pagination-padding">
                        <DataTable
                            className="whitespace-nowrap table-hover invoice-table"
                            records={records}
                            columns={cols.map(col => ({
                                accessor: col.accessor,
                                sortable: true,
                                hidden: hideCols.includes(col.accessor),
                                title: col.title
                            }))}
                            highlightOnHover // Efek hover saat mouse di atas baris
                            totalRecords={total} // Total jumlah data
                            recordsPerPage={pageSize} // jumlah data per halaman
                            page={page} // halaman saat ini
                            onPageChange={(p) => setPage(p)} // update halaman ketika pindah
                            sortStatus={sortStatus} // Status sorting saat ini
                            onSortStatusChange={setSortStatus} // Fungsi untuk mengatur sorting
                            selectedRecords={selectedRecords} // data yang dipilih (checkbox)
                            onSelectedRecordsChange={setSelectedRecords} // update selected
                            paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`} // teks pagination
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoreRegistrationsList;