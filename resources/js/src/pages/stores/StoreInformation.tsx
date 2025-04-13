import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { setPageTitle } from '../../store/themeConfigSlice';
import { useEffect } from 'react';
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

const StoreInformation = () => {
    const { slug } = useParams();
    const { data } = useGetSingleStoreQuery(slug, { skip: !slug });
    const { data: employee } = useGetEmployeesQuery({ storeId: slug });
    const { data: order } = useGetOrdersQuery({
        storeId: slug,
        sort: 'created_at',
        direction: 'desc',
    });

    interface Store {
        slug: string;
    }

    interface User {
        id: number;
        name: string;
        email: string;
        roles: string[];
        permissions: string[];
        stores: Store[];
    }

    const user: User = JSON.parse(localStorage.getItem('user') || '{}');
    const userRoles = user?.roles;
    const hasEmployeeRole = userRoles?.includes('Employee');
    const hasOwnerRole = userRoles?.includes('Owner');
    const hasAdminRole = userRoles?.includes('Admin');

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Profile'));
    });
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    const getTotal = (key: any) => {
        return order?.data.reduce((sum: any, row: any) => sum + (parseFloat(row[key]) || 0), 0);
    };

    return (
        <div>
            <div>
                <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-5">
                    <div>
                        <div className="panel">
                            <div className="flex items-center justify-between mb-5">
                                <h5 className="font-semibold text-lg dark:text-white-light">Store Profile</h5>
                                {!hasEmployeeRole && <>
                                    <Link to={`/stores/${data?.slug}`} className="ltr:ml-auto rtl:mr-auto btn btn-primary p-2 rounded-full">
                                        <IconPencilPaper />
                                    </Link>
                                </>}
                            </div>
                            <div className="mb-5">
                                <div className="flex flex-col justify-center items-center">
                                    <img
                                        src={data?.photo ? `${import.meta.env.VITE_SERVER_URI_BASE}storage/stores/${data.photo}` : '/assets/images/blank_profile.png'}
                                        alt="img"
                                        className="w-24 h-24 rounded-full object-cover  mb-5"
                                    />
                                    <p className="font-semibold text-primary text-xl">{data?.name}</p>
                                </div>
                                <ul className="mt-5 flex flex-col max-w-[200px] m-auto space-y-4 font-semibold">
                                    <li className="flex items-center gap-2 text-center">
                                        <p className="mb-2 text-white-dark">
                                            {[data?.zip, data?.address, data?.city, data?.state, data?.country]
                                                .filter(Boolean) // Hapus nilai yang kosong/null/undefined
                                                .join(', ')}
                                        </p>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        {/* <IconCoffee className="shrink-0" /> */}
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="12" cy="6" r="4" stroke="currentColor" strokeWidth="1.5" />
                                            <ellipse opacity="0.5" cx="12" cy="17" rx="7" ry="4" stroke="currentColor" strokeWidth="1.5" />
                                        </svg>
                                        {data?.user.name ?? '-'}
                                    </li>
                                    {/* <li className="flex items-center gap-2">
                                    <IconCalendar className="shrink-0" />
                                    Jan 20, 1989
                                </li>
                                <li className="flex items-center gap-2">
                                    <IconMapPin className="shrink-0" />
                                    New York, USA
                                </li> */}
                                    <li>
                                        <button className="flex items-center gap-2">
                                            <IconMail className="w-5 h-5 shrink-0" />
                                            <span className="text-primary truncate">{data?.user.email ?? '-'}</span>
                                        </button>
                                    </li>
                                    {/* <li className="flex items-center gap-2">
                                    <IconPhone />
                                    <span className="whitespace-nowrap" dir="ltr">
                                        {data?.user.no_telp ?? '-'}
                                    </span>
                                </li> */}
                                </ul>
                                <ul className="mt-7 flex items-center justify-center gap-2">
                                    <li>
                                        <button className="btn btn-info flex items-center justify-center rounded-full w-10 h-10 p-0">
                                            {/* <IconTwitter className="w-5 h-5" /> */}
                                            <IconUsersGroup />
                                        </button>
                                    </li>
                                    <li>
                                        <button className="btn btn-danger flex items-center justify-center rounded-full w-10 h-10 p-0">
                                            <IconShoppingBag />
                                            {/* <IconDribbble /> */}
                                        </button>
                                    </li>
                                    <li>
                                        <button className="btn btn-dark flex items-center justify-center rounded-full w-10 h-10 p-0">
                                            <IconBarChart />
                                            {/* <IconGithub /> */}
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 xl:col-span-3">
                        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-6 text-white">
                            <div className="panel bg-gradient-to-r from-primary to-[#41bcae] h-full p-0">
                                <div className="flex items-center justify-between w-full p-5">
                                    <div className="relative">
                                        <div className="text-white dark:text-dark-light bg-[#41bcae] w-11 h-11 rounded-lg flex items-center justify-center">
                                            <IconUsersGroup />
                                        </div>
                                    </div>
                                    <h5 className="font-semibold text-2xl ltr:text-right rtl:text-left dark:text-white-light">
                                        {employee?.total}
                                        <span className="block text-sm font-normal">Total Employee</span>
                                    </h5>
                                </div>
                                {/* <div className="flex items-center px-5 pb-5">
                                <span className="flex items-center text-sm">
                                    <IconTrendingUp className="text-success mr-1" />
                                    <span className="text-success">8.5%</span>
                                    <span className="text-white-dark ml-1">Up from yesterday</span>
                                </span>
                                </div> */}
                            </div>
                            <div className="panel bg-gradient-to-r from-secondary to-[#406674] h-full p-0">
                                <div className="flex items-center justify-between w-full p-5">
                                    <div className="relative">
                                        <div className="text-white dark:text-dark-light bg-[#406674] w-11 h-11 rounded-lg flex items-center justify-center">
                                            <IconShoppingBag />
                                        </div>
                                    </div>
                                    <h5 className="font-semibold text-2xl ltr:text-right rtl:text-left dark:text-white-light">
                                        {order?.total}
                                        <span className="block text-sm font-normal">Total Order</span>
                                    </h5>
                                </div>
                                {/* <div className="flex items-center px-5 pb-5">
                                <span className="flex items-center text-sm">
                                    <IconTrendingUp className="text-success mr-1" />
                                    <span className="text-success">8.5%</span>
                                    <span className="text-white-dark ml-1">Up from yesterday</span>
                                </span>
                                </div> */}
                            </div>
                            <div className="panel bg-gradient-to-r from-info to-[#6097b9] h-full p-0">
                                <div className="flex items-center justify-between w-full p-5">
                                    <div className="relative">
                                        <div className="text-white dark:text-dark-light bg-[#6097b9] w-11 h-11 rounded-lg flex items-center justify-center">
                                            <IconBarChart />
                                        </div>
                                    </div>
                                    <h5 className="font-semibold text-xl ltr:text-right rtl:text-left dark:text-white-light">
                                        {getTotal('total')?.toLocaleString()}
                                        <span className="block text-sm font-normal">Total Sales</span>
                                    </h5>
                                </div>
                                {/* <div className="flex items-center px-5 pb-5">
                                    <span className="flex items-center text-sm">
                                        <IconTrendingUp className="text-danger mr-1 rotate-180" />
                                        <span className="text-danger">8.5%</span>
                                        <span className="text-white-dark ml-1">Down from yesterday</span>
                                    </span>
                                </div> */}
                            </div>
                        </div>

                        <div className="panel w-full">
                            <div className="flex items-center justify-between mb-5">
                                <h5 className="font-semibold text-lg dark:text-white-light">Recent Orders</h5>
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
