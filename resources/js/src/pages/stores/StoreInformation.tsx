import React from 'react';
// Import untuk navigasi menggunakan parameter dari URL
import { Link, useParams } from 'react-router-dom';
// Import Redux hooks
import { useDispatch, useSelector } from 'react-redux';
// Import tipe state global dari store
import { IRootState } from '../../store';
// Import action untuk set judul halaman
import { setPageTitle } from '../../store/themeConfigSlice';
// Import useEffect dari React
import { useEffect } from 'react';
// Import ikon-ikon yang digunakan di halaman
import IconPencilPaper from '../../components/Icon/IconPencilPaper';
import IconShoppingBag from '../../components/Icon/IconShoppingBag';
import { useGetSingleStoreQuery } from '../../redux/features/stores/storesApi';
import IconUsersGroup from '../../components/Icon/IconUsersGroup';
import IconBarChart from '../../components/Icon/IconBarChart';
import IconCoffee from '../../components/Icon/IconCoffee';
import IconMail from '../../components/Icon/IconMail';
import IconPhone from '../../components/Icon/IconPhone';
import { useGetEmployeesQuery } from '../../redux/features/employees/employeesApi';
import { useGetOrdersQuery } from '../../redux/features/orders/ordersApi';
import NoRecords from '../../components/Layouts/NoRecords';

// Komponen utama: StoreInformation
const StoreInformation = () => {
    // Ambil slug dari URL (parameter)
    const { slug } = useParams();

    // Ambil data toko berdasarkan slug
    const { data } = useGetSingleStoreQuery(slug, { skip: !slug });

    // Ambil data karyawan berdasarkan id toko
    const { data: employee } = useGetEmployeesQuery({ storeId: slug });

    // Ambil data order berdasarkan id toko dan urutkan berdasarkan created_at terbaru
    const { data: order } = useGetOrdersQuery({
        storeId: slug,
        sort: 'created_at',
        direction: 'desc',
    });

    // Interface untuk tipe Store
    interface Store {
        slug: string;
    }

    // Interface untuk tipe User
    interface User {
        id: number;
        name: string;
        email: string;
        roles: string[];
        permissions: string[];
        stores: Store[];
    }

    // Ambil data user dari localStorage
    const user: User = JSON.parse(localStorage.getItem('user') || '{}');

    // Cek role user saat ini
    const userRoles = user?.roles;
    const hasEmployeeRole = userRoles?.includes('Employee');
    const hasOwnerRole = userRoles?.includes('Owner');
    const hasAdminRole = userRoles?.includes('Admin');

    // Set judul halaman di redux state
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Profile'));
    });

    // Cek apakah halaman menggunakan RTL (Right to Left)
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    // Fungsi untuk menghitung total nilai dari key tertentu pada data order
    const getTotal = (key: any) => {
        return order?.data.reduce((sum: any, row: any) => sum + (parseFloat(row[key]) || 0), 0);
    };

    return (
        <div>
            <div>
                {/* Grid utama: kiri panel profil, kanan data ringkasan dan tabel */}
                <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-5">
                    <div>
                        {/* Panel profil toko */}
                        <div className="panel">
                            <div className="flex items-center justify-between mb-5">
                                <h5 className="font-semibold text-lg dark:text-white-light">Store Profile</h5>
                                {/* Tombol edit hanya tampil jika user bukan karyawan */}
                                {!hasEmployeeRole && (
                                    <Link to={`/stores/${data?.slug}`} className="ltr:ml-auto rtl:mr-auto btn btn-primary p-2 rounded-full">
                                        <IconPencilPaper />
                                    </Link>
                                )}
                            </div>

                            <div className="mb-5">
                                <div className="flex flex-col justify-center items-center">
                                    {/* Tampilkan foto toko atau default */}
                                    <img
                                        src={data?.photo ? `${import.meta.env.VITE_SERVER_URI_BASE}storage/stores/${data.photo}` : '/assets/images/blank_profile.png'}
                                        alt="img"
                                        className="w-24 h-24 rounded-full object-cover mb-5"
                                    />
                                    {/* Nama toko */}
                                    <p className="font-semibold text-primary text-xl">{data?.name}</p>
                                </div>

                                {/* Alamat toko */}
                                <ul className="mt-5 flex flex-col max-w-[200px] m-auto space-y-4 font-semibold">
                                    <li className="flex items-center gap-2 text-center">
                                        <p className="mb-2 text-white-dark">
                                            {[data?.zip, data?.address, data?.city, data?.state, data?.country]
                                                .filter(Boolean)
                                                .join(', ')}
                                        </p>
                                    </li>

                                    {/* Pemilik toko */}
                                    <li className="flex items-center gap-2">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                            <circle cx="12" cy="6" r="4" stroke="currentColor" strokeWidth="1.5" />
                                            <ellipse opacity="0.5" cx="12" cy="17" rx="7" ry="4" stroke="currentColor" strokeWidth="1.5" />
                                        </svg>
                                        {data?.user.name ?? '-'}
                                    </li>

                                    {/* Email pemilik toko */}
                                    <li>
                                        <button className="flex items-center gap-2">
                                            <IconMail className="w-5 h-5 shrink-0" />
                                            <span className="text-primary truncate">{data?.user.email ?? '-'}</span>
                                        </button>
                                    </li>
                                </ul>

                                {/* Ikon menu shortcut */}
                                <ul className="mt-7 flex items-center justify-center gap-2">
                                    <li>
                                        <button className="btn btn-info flex items-center justify-center rounded-full w-10 h-10 p-0">
                                            <IconUsersGroup />
                                        </button>
                                    </li>
                                    <li>
                                        <button className="btn btn-danger flex items-center justify-center rounded-full w-10 h-10 p-0">
                                            <IconShoppingBag />
                                        </button>
                                    </li>
                                    <li>
                                        <button className="btn btn-dark flex items-center justify-center rounded-full w-10 h-10 p-0">
                                            <IconBarChart />
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Panel kanan: statistik & tabel order */}
                    <div className="lg:col-span-2 xl:col-span-3">
                        {/* Statistik ringkasan */}
                        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-6 text-white">
                            {/* Total employee */}
                            <div className="panel bg-gradient-to-r from-primary to-[#41bcae] h-full p-0">
                                <div className="flex items-center justify-between w-full p-5">
                                    <div className="relative">
                                        <div className="text-white bg-[#41bcae] w-11 h-11 rounded-lg flex items-center justify-center">
                                            <IconUsersGroup />
                                        </div>
                                    </div>
                                    <h5 className="font-semibold text-2xl ltr:text-right rtl:text-left">{employee?.total}
                                        <span className="block text-sm font-normal">Total Employee</span>
                                    </h5>
                                </div>
                            </div>

                            {/* Total orders */}
                            <div className="panel bg-gradient-to-r from-secondary to-[#406674] h-full p-0">
                                <div className="flex items-center justify-between w-full p-5">
                                    <div className="relative">
                                        <div className="text-white bg-[#406674] w-11 h-11 rounded-lg flex items-center justify-center">
                                            <IconShoppingBag />
                                        </div>
                                    </div>
                                    <h5 className="font-semibold text-2xl ltr:text-right rtl:text-left">{order?.total}
                                        <span className="block text-sm font-normal">Total Order</span>
                                    </h5>
                                </div>
                            </div>

                            {/* Total sales */}
                            <div className="panel bg-gradient-to-r from-info to-[#6097b9] h-full p-0">
                                <div className="flex items-center justify-between w-full p-5">
                                    <div className="relative">
                                        <div className="text-white bg-[#6097b9] w-11 h-11 rounded-lg flex items-center justify-center">
                                            <IconBarChart />
                                        </div>
                                    </div>
                                    <h5 className="font-semibold text-xl ltr:text-right rtl:text-left">
                                        {getTotal('total')?.toLocaleString()}
                                        <span className="block text-sm font-normal">Total Sales</span>
                                    </h5>
                                </div>
                            </div>
                        </div>

                        {/* Tabel recent orders */}
                        <div className="panel w-full">
                            <div className="flex items-center justify-between mb-5">
                                <h5 className="font-semibold text-lg">Recent Orders</h5>
                            </div>

                            <div className="table-responsive">
                                <table>
                                    <thead>
                                        <tr>
                                            <th className="ltr:rounded-l-md rtl:rounded-r-md">Customer</th>
                                            <th>Total</th>
                                            <th>Order Date</th>
                                            <th>Product</th>
                                            <th className="ltr:rounded-r-md rtl:rounded-l-md">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Cek jika ada data order */}
                                        {order?.data.length !== 0 ? (
                                            order?.data.map((item: any, index: number) => (
                                                <tr key={index} className="text-white-dark hover:text-black dark:hover:text-white-light/90 group">
                                                    <td className="min-w-[150px] text-black dark:text-white">{item.invoice_no}</td>
                                                    <td className="text-primary">{item.total}</td>
                                                    <td>{item.order_date}</td>
                                                    <td>{item.total_products}</td>
                                                    <td>
                                                        <span className="badge bg-success shadow-md dark:group-hover:bg-transparent">{item.payment_status}</span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5}>
                                                    {/* Komponen jika data kosong */}
                                                    <NoRecords />
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoreInformation;
