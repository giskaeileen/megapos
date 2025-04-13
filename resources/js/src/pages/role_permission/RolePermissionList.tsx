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
import Swal from 'sweetalert2';
import { useDeleteRolesMutation, useGetRolesQuery } from '../../redux/features/roles/rolesApi';
import { useGetRolePermissionsQuery } from '../../redux/features/role_permission/rolePermissionApi';

const RolePermissionList = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);
    const entity = pathnames[0];
    const entityCols = `${pathnames[0]}_cols`; 
    const entityPage = `${pathnames[0]}_page`; 
    const entitySort = `${pathnames[0]}_sort`; 

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
            : { columnAccessor: 'name', direction: 'asc' }; 
    });
    const { data, refetch } = useGetRolePermissionsQuery(
        { 
            page, 
            search,
            sort: sortStatus.columnAccessor,
            direction: sortStatus.direction,
        },
        { refetchOnMountOrArgChange: true } 
    );
    const dispatch = useDispatch();
    const [items, setItems] = useState<any[]>([]);
    const [total, setTotal] = useState();
    const [deleteRoles] = useDeleteRolesMutation();
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
     * delete 
     */

    const deleteRow = async () => {
        if (!selectedRecords.length) {
            Swal.fire({
                icon: 'info',
                title: 'No Selection',
                text: 'Please select at least one record to delete.',
                // customClass: 'sweet-alerts',
            });
            return;
        }

        Swal.fire({
            icon: 'warning',
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            padding: '2em',
            // customClass: 'sweet-alerts',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // Iterasi dan hapus setiap user
                    const deletePromises = selectedRecords.map((record:any) =>
                        deleteRoles(record.id).unwrap()
                    );

                    // Tunggu semua permintaan selesai
                    await Promise.all(deletePromises);

                    // Tampilkan pesan sukses
                    Swal.fire({
                        title: 'Deleted!',
                        text: 'Selected records have been deleted.',
                        icon: 'success',
                        // customClass: 'sweet-alerts',
                    });

                    // refetch data user
                    refetch()
                } catch (error) {
                    console.error('Error deleting users:', error);
                    Swal.fire({
                        title: 'Error!',
                        text: 'An error occurred while deleting records.',
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

    useEffect(() => {
        if (data?.data) {
            const mappedItems = data.data.map((d: any, index: number) => ({
                id: d.id,
                no: (index + 1) + ((page - 1) * pageSize),
                name: d.name,
                permissions: d.permissions,
                // created_at: new Intl.DateTimeFormat('id-ID', {
                //     year: 'numeric',
                //     month: '2-digit',
                //     day: '2-digit',
                //     hour: '2-digit',
                //     minute: '2-digit',
                //     second: '2-digit',
                //     timeZone: 'Asia/Jakarta',
                // }).format(new Date(d.created_at))
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
        { accessor: 'permissions', title: 'Permissions' },
        // { accessor: 'created_at', title: 'Created At' },
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

    function capitalizeFirstLetter(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    return (
        <div>
            <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
                <h2 className="text-xl">{capitalizeFirstLetter(entity)}</h2>
                <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                    <div className="relative">
                        <div className="flex items-center gap-2">
                            <button type="button" className="btn btn-danger gap-2" onClick={() => deleteRow()}>
                                <IconTrashLines />
                                Delete
                            </button>
                            <Link to={`/${entity}/create`} className="btn btn-primary gap-2">
                                <IconPlus />
                                Add New
                            </Link>
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

                        <div className="ltr:ml-auto rtl:mr-auto">
                            <input type="text" className="form-input w-auto" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                    </div>

                    <div className="datatables pagination-padding">
                        <DataTable
                            className="whitespace-nowrap table-hover invoice-table align-start-table"
                            records={records}
                            columns={[
                                {
                                    accessor: 'no',
                                    hidden: hideCols.includes('no'),
                                },
                                {
                                    accessor: 'name',
                                    sortable: true,
                                    hidden: hideCols.includes('name'),
                                    render: ({ name, id}) => {
                                        return (
                                            <div className="flex items-center font-semibold">
                                                <div>
                                                    <a
                                                        href={`/${entity}/${id}`}
                                                        className="hover:underline"
                                                    >
                                                        {name}
                                                    </a>
                                                </div>
                                            </div>
                                        );
                                    },
                                },
                                // {
                                //     accessor: 'permissions',
                                //     sortable: true,
                                //     hidden: hideCols.includes('permissions'),
                                //     render: ({ permissions, id}) => {
                                //         return (
                                //             <div className="flex items-center font-semibold gap-2">
                                //                 {permissions.map((item: any) => (
                                //                     <span key={item.id} className="badge bg-secondary rounded-full">
                                //                         {item.name}
                                //                     </span>
                                //                 ))}
                                //             </div>
                                //         );
                                //     },
                                // },
                                {
                                    accessor: 'permissions',
                                    sortable: true,
                                    hidden: hideCols.includes('permissions'),
                                    render: ({ permissions }: { permissions: { id: number; name: string }[] }) => {
                                        // Proses data permissions menjadi format terkelompok
                                        // const groupedPermissions = permissions.reduce((acc: Record<string, string[]>, item: any) => {
                                        //     const [action, entity] = item.name.split(' '); // Pisahkan entity dan action
                                        //     if (!acc[entity]) {
                                        //         acc[entity] = [];
                                        //     }
                                        //     acc[entity].push(action); // Kelompokkan berdasarkan entity
                                        //     return acc;
                                        // }, {});
                                        const groupedPermissions = permissions.reduce((acc: Record<string, string[]>, item: any) => {
                                            const [action, ...entityParts] = item.name.split(' '); // Pisahkan entity dan action
                                            const entity = entityParts.join(' '); // Gabungkan sisa kata sebagai entity

                                            // if (!acc[entity]) {
                                            //     acc[entity] = [];
                                            // }
                                            acc[entity] = acc[entity] || [];
                                            acc[entity].push(action); // Kelompokkan berdasarkan entity
                                            return acc;
                                        }, {});

                                        return (
                                            <div className="font-semibold space-y-2">
                                                {Object.entries(groupedPermissions).map(([entity, actions]) => (
                                                    <div key={entity}>
                                                        <div>{entity}</div>
                                                        <div className="flex gap-2">
                                                            {actions.map((action) => (
                                                                <span key={action} className="badge bg-secondary rounded-full">
                                                                    {action}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    },
                                },

                                // {
                                //     accessor: 'created_at',
                                //     sortable: true,
                                //     hidden: hideCols.includes('created_at'),
                                // },
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

export default RolePermissionList;