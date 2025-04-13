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

const StoreRegistrationsList= () => {
    const { t } = useTranslation();
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);
    const entity = pathnames[0];
    const entityCols = `${pathnames[0]}_cols`; 
    const entityPage = `${pathnames[0]}_page`; 
    const entitySort = `${pathnames[0]}_sort`; 
    const entityFilterColumn = `${pathnames[0]}_filter_column`; 
    const entityFilterValue= `${pathnames[0]}_filter_value`; 
    const [page, setPage] = useState<number>(() => {
        const storedPage = localStorage.getItem(entityPage);
        return storedPage ? parseInt(storedPage, 10) : 1; // Konversi ke number, default ke 1
    });
    const [search, setSearch] = useState(() => {
        return localStorage.getItem(`${entity}_search`) || '';
    });
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>(() => {
        const storedSort = localStorage.getItem(`${entitySort}`);
        return storedSort
            ? JSON.parse(storedSort) 
            : { columnAccessor: 'created_at', direction: 'desc' }; 
    });
    // const [selectedColumn, setSelectedColumn] = useState<string>(""); // Kolom yang difilter
    // const [filterValue, setFilterValue] = useState<string>(""); // Nilai filter
    const [selectedColumn, setSelectedColumn] = useState<string>(() => {
        return localStorage.getItem(`${entity}_filter_column`) || '';
    }); // Kolom yang difilter
    const [filterValue, setFilterValue] = useState<string>(() => {
        return localStorage.getItem(`${entity}_filter_value`) || '';
    }); // nilai filter
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
    const [approveStoreRegistrations] = useApproveStoreRegistrationsMutation();
    const [hideCols, setHideCols] = useState<string[]>([]);
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

    // console.log(selectedColumn)
    // console.log(filterValue)

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
     * approve 
     */

    const approveRow = async () => {
        if (!selectedRecords.length) {
            Swal.fire({
                icon: 'info',
                title: 'No Selection',
                text: 'Please select at least one record to approve.',
                // customClass: 'sweet-alerts',
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
            // customClass: 'sweet-alerts',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // Iterasi dan hapus setiap user
                    // const promises = selectedRecords.map((record:any) => {
                    //         if(record.status !== 'approved'){
                    //             approveStoreRegistrations(record.id).unwrap()
                    //         }
                    //     }
                    // );

                    // // Tunggu semua permintaan selesai
                    // await Promise.all(promises);

                    const promises = selectedRecords
                        .filter((record: any) => record.status !== 'approved')
                        .map((record: any) => approveStoreRegistrations(record.id).unwrap());

                    const results = await Promise.allSettled(promises);
                    // const failed = results.filter(r => r.status === "rejected");

                    // if (failed.length) {
                    //     throw new Error(`${failed.length} records failed to approve.`);
                    // }

                    // Ambil data yang gagal
                    // const failed = results
                    //     .filter(r => r.status === "rejected")
                    //     .map((r, index) => `${r.reason?.data?.message || r.reason?.message || "Unknown error"}`);

                    // if (failed.length) {
                    //     throw new Error(`Some records failed to approve:\n\n${failed.join("\n")}`);
                    // }

                    const failed = results
                        .filter((r) => r.status === "rejected")
                        .map((r) => {
                            if ('reason' in r) {
                                return `${r.reason?.data?.message || r.reason?.message || "Unknown error"}`;
                            }
                            return "Unknown error"; // fallback
                        });

                    if (failed.length) {
                        throw new Error(`Some records failed to approve:\n\n${failed.join("\n")}`);
                    }



                    // Tampilkan pesan sukses
                    Swal.fire({
                        title: 'Approved!',
                        text: 'Selected records have been approved.',
                        icon: 'success',
                        // customClass: 'sweet-alerts',
                    });

                    // refetch data user
                    refetch()
                } catch (error: any) {
                    console.error('Error approving users:', error);
                    Swal.fire({
                        title: 'Error!',
                        // text: 'An error occurred while approving records.',
                        text: error.message || 'An error occurred while approving records.',
                        icon: 'error',
                        // customClass: 'sweet-alerts',
                    });
                }
            }
        });
    };

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

    // useEffect(() => {
    //     if (data?.data) {
    //         const mappedItems = data.data.map((d: any, index: number) => ({
    //             id: d.id,
    //             no: (index + 1) + ((page - 1) * pageSize),
    //             store_name: d.store_name,
    //             country: d.country,
    //             city: d.city,
    //             state: d.state,
    //             zip: d.zip,
    //             street_address: d.street_address,
    //             owner_name: d.owner_name,
    //             owner_email: d.owner_email,
    //             owner_phone: d.owner_phone,
    //             status: d.status,
    //             created_at: new Intl.DateTimeFormat('id-ID', {
    //                 year: 'numeric',
    //                 month: '2-digit',
    //                 day: '2-digit',
    //                 hour: '2-digit',
    //                 minute: '2-digit',
    //                 second: '2-digit',
    //                 timeZone: 'Asia/Jakarta',
    //             }).format(new Date(d.created_at))
    //         }));
    //         setItems(mappedItems);
    //         setTotal(data.total)
    //     }
    // }, [data]);

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

    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

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
            <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
                <h2 className="text-xl">{t(capitalizeFirstLetter(entity))}</h2>
                <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                    <div className="relative">
                        <div className="flex items-center gap-2">
                            <button type="button" className="btn btn-secondary gap-2" onClick={() => approveRow()}>
                                {/* <IconTrashLines /> */}
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle opacity="0.5" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
                                    <path d="M8.5 12.5L10.5 14.5L15.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                {t('Approve')}
                            </button>
                            {/* <Link to={`/${entity}/create`} className="btn btn-primary gap-2">
                                <IconPlus />
                                Add New
                            </Link> */}
                        </div>
                    </div>
                </div>
            </div>
            <div className="panel px-0 border-white-light dark:border-[#1b2e4b]">
                <div className="invoice-table">
                    <div className="mb-4.5 px-5 flex md:items-center md:flex-row flex-col gap-5">
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
                                    <ul className="!min-w-max">
                                        {cols.map((col, i) => {
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

                        {/* Dropdown Pilih Kolom + Input Filter */}
                        <div className="flex gap-3">
                            <select 
                                value={selectedColumn} 
                                onChange={(e) => setSelectedColumn(e.target.value)}
                                className="form-select"
                            >
                                <option value="">Column Filter</option>
                                {cols
                                    .filter(col => col.accessor !== "no" && col.accessor !== "created_at") // Hilangkan "No" & "Created At"
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

                        <div className="ltr:ml-auto rtl:mr-auto">
                            <input type="text" className="form-input w-auto" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                    </div>

                    <div className="datatables pagination-padding">
                        <DataTable
                            className="whitespace-nowrap table-hover invoice-table"
                            records={records}
                            columns={[
                                {
                                    accessor: 'no',
                                    // sortable: true,
                                    hidden: hideCols.includes('no'),
                                },
                                // {
                                //     accessor: 'name',
                                //     sortable: true,
                                //     hidden: hideCols.includes('name'),
                                //     render: ({ name, id, photo}) => {
                                //         return (
                                //             <div className="flex items-center font-semibold">
                                //                 <div className="p-0.5 bg-white-dark/30 rounded-full w-max ltr:mr-2 rtl:ml-2">
                                //                     <img
                                //                         className="h-8 w-8 rounded-full object-cover"
                                //                         src={photo}
                                //                         alt={name || 'Profile'}
                                //                     />
                                //                 </div>
                                //                 <div>
                                //                     <a
                                //                         href={`/${entity}/${id}`}
                                //                         className="hover:underline"
                                //                     >
                                //                         {name}
                                //                     </a>
                                //                 </div>
                                //             </div>
                                //         );
                                //     },
                                // },
                                {
                                    accessor: 'store_name',
                                    sortable: true,
                                    hidden: hideCols.includes('store_name'),
                                },
                                {
                                    accessor: 'country',
                                    sortable: true,
                                    hidden: hideCols.includes('country'),
                                },
                                {
                                    accessor: 'city',
                                    sortable: true,
                                    hidden: hideCols.includes('city'),
                                },
                                {
                                    accessor: 'state',
                                    sortable: true,
                                    hidden: hideCols.includes('state'),
                                },
                                {
                                    accessor: 'zip',
                                    sortable: true,
                                    hidden: hideCols.includes('zip'),
                                },
                                {
                                    accessor: 'street_address',
                                    sortable: true,
                                    hidden: hideCols.includes('street_address'),
                                },
                                {
                                    accessor: 'owner_name',
                                    sortable: true,
                                    hidden: hideCols.includes('owner_name'),
                                },
                                {
                                    accessor: 'owner_email',
                                    sortable: true,
                                    hidden: hideCols.includes('owner_email'),
                                },
                                {
                                    accessor: 'owner_phone',
                                    sortable: true,
                                    hidden: hideCols.includes('owner_phone'),
                                },
                                {
                                    accessor: 'status',
                                    sortable: true,
                                    hidden: hideCols.includes('status'),
                                },
                                {
                                    accessor: 'created_at',
                                    sortable: true,
                                    hidden: hideCols.includes('created_at'),
                                },
                            ]}
                            highlightOnHover
                            totalRecords={total}
                            recordsPerPage={pageSize}
                            page={page}
                            onPageChange={(p) => setPage(p)}
                            sortStatus={sortStatus}
                            onSortStatusChange={setSortStatus}
                            selectedRecords={selectedRecords}
                            onSelectedRecordsChange={setSelectedRecords}
                            paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoreRegistrationsList;