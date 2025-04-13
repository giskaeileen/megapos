import React from 'react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import ReactApexChart from 'react-apexcharts';
import Dropdown from '../../components/Dropdown';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconHorizontalDots from '../../components/Icon/IconHorizontalDots';
import IconHome from '../../components/Icon/IconHome';
import IconTrendingUp from '../../components/Icon/IconTrendingUp';
import IconLayoutGrid from '../../components/Icon/IconLayoutGrid';
import IconRefresh from '../../components/Icon/IconRefresh';
import IconChecks from '../../components/Icon/IconChecks';
import { useGetAdminDashQuery } from '../../redux/features/dashboards/dashboadsApi';
import { useGetStoreRegistrationsQuery } from '../../redux/features/stores/storesApi';

const AdminDash = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Sales Admin'));
    });
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    // const [loading] = useState(false);

    const { data } = useGetAdminDashQuery({});

    const { data: storeRegistrationData, refetch } = useGetStoreRegistrationsQuery(
        {
            // page,
            // search,
            sort: 'created_at',
            direction: 'desc',
            // filterColumn: selectedColumn,
            // filterValue: filterValue
        },
        { refetchOnMountOrArgChange: true }
    );

    const [storeData] = useState([
        { date: '25/09/2024', name: 'Store A', owner: 'Luke Ivory', status: 'Pending' },
        { date: '25/09/2024', name: 'Store C', owner: 'Tesar', status: 'Approved' },
        { date: '25/09/2024', name: 'Store D', owner: 'Amkal', status: 'Pending Multiple' },
        { date: '25/09/2024', name: 'Store E', owner: 'Ilham', status: 'Approved' },
        { date: '25/09/2024', name: 'Store F', owner: 'Filardi', status: 'Approved' },
    ]);

    // const [stores] = useState([
    //     { no: 1, name: 'Store A', image: '/assets/images/profile-1.jpeg', daysLeft: '5 Days Left' },
    //     { no: 2, name: 'Store C', image: '/assets/images/profile-2.jpeg', daysLeft: '9 Days Left' },
    //     { no: 3, name: 'Store D', image: '/assets/images/profile-3.jpeg', daysLeft: '12 Days Left' },
    //     { no: 4, name: 'Store E', image: '/assets/images/profile-4.jpeg', daysLeft: '30 Days Left' },
    //     { no: 5, name: 'Store F', image: '/assets/images/profile-5.jpeg', daysLeft: '20 Days Left' },
    // ]);

    //Revenue Chart
    const revenueChart: any = {
        series: [
            {
                name: 'Income',
                data: [16800, 16800, 15500, 17800, 15500, 17000, 19000, 16000, 15000, 17000, 14000, 17000],
            },
            {
                name: 'Expenses',
                data: [16500, 17500, 16200, 17300, 16000, 19500, 16000, 17000, 16000, 19000, 18000, 19000],
            },
        ],
        options: {
            chart: {
                height: 325,
                type: 'area',
                fontFamily: 'Nunito, sans-serif',
                zoom: {
                    enabled: false,
                },
                toolbar: {
                    show: false,
                },
            },

            dataLabels: {
                enabled: false,
            },
            stroke: {
                show: true,
                curve: 'smooth',
                width: 2,
                lineCap: 'square',
            },
            dropShadow: {
                enabled: true,
                opacity: 0.2,
                blur: 10,
                left: -7,
                top: 22,
            },
            colors: isDark ? ['#2196F3', '#E7515A'] : ['#1B55E2', '#E7515A'],
            markers: {
                discrete: [
                    {
                        seriesIndex: 0,
                        dataPointIndex: 6,
                        fillColor: '#1B55E2',
                        strokeColor: 'transparent',
                        size: 7,
                    },
                    {
                        seriesIndex: 1,
                        dataPointIndex: 5,
                        fillColor: '#E7515A',
                        strokeColor: 'transparent',
                        size: 7,
                    },
                ],
            },
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            xaxis: {
                axisBorder: {
                    show: false,
                },
                axisTicks: {
                    show: false,
                },
                crosshairs: {
                    show: true,
                },
                labels: {
                    offsetX: isRtl ? 2 : 0,
                    offsetY: 5,
                    style: {
                        fontSize: '12px',
                        cssClass: 'apexcharts-xaxis-title',
                    },
                },
            },
            yaxis: {
                tickAmount: 7,
                labels: {
                    formatter: (value: number) => {
                        return value / 1000 + 'K';
                    },
                    offsetX: isRtl ? -30 : -10,
                    offsetY: 0,
                    style: {
                        fontSize: '12px',
                        cssClass: 'apexcharts-yaxis-title',
                    },
                },
                opposite: isRtl ? true : false,
            },
            grid: {
                borderColor: isDark ? '#191E3A' : '#E0E6ED',
                strokeDashArray: 5,
                xaxis: {
                    lines: {
                        show: true,
                    },
                },
                yaxis: {
                    lines: {
                        show: false,
                    },
                },
                padding: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                },
            },
            legend: {
                position: 'top',
                horizontalAlign: 'right',
                fontSize: '16px',
                markers: {
                    width: 10,
                    height: 10,
                    offsetX: -2,
                },
                itemMargin: {
                    horizontal: 10,
                    vertical: 5,
                },
            },
            tooltip: {
                marker: {
                    show: true,
                },
                x: {
                    show: false,
                },
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    inverseColors: !1,
                    opacityFrom: isDark ? 0.19 : 0.28,
                    opacityTo: 0.05,
                    stops: isDark ? [100, 100] : [45, 100],
                },
            },
        },
    };

    // =============

    interface Store {
        no: number;
        store_id: number;
        store_name: string;
        owner: string;
        store_address: string;
        created_at: string;
        daysLeft: number;
        image: string;
    }

    interface SubscriptionData {
        owner_id: number;
        owner_image: string;
        owner_name: string;
        owner_email: string;
        subscription_end_date: string;
        remaining_days: number;
        stores: {
            store_id: number;
            store_name: string;
            store_address: string;
            created_at: string;
        }[];
        quota: {
            transactions: number;
            products: number;
            employees: number;
            stores: number;
        };
    }

    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSubscriptionData = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/active-subscriptions');

                if (!response.ok) {
                    throw new Error('Failed to fetch subscription data');
                }

                const data = await response.json();

                if (data.success && data.data.length > 0) {
                    // Transform data to match table structure
                    const transformedStores = data.data.flatMap((owner: SubscriptionData) =>
                        owner.stores.map((store, index) => ({
                            no: index + 1,
                            store_id: store.store_id,
                            store_name: store.store_name,
                            owner: owner.owner_name,
                            store_address: store.store_address,
                            created_at: store.created_at,
                            daysLeft: owner.remaining_days,
                            image: owner.owner_image || '/assets/images/profile-default.png',
                        }))
                    );

                    setStores(transformedStores);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
                console.error('Error fetching subscription data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSubscriptionData();
    }, []);

    console.log(stores)

    if (loading) {
        return <div>Loading subscription data...</div>;
    }

    if (error) {
        return <div className="text-danger">Error: {error}</div>;
    }

    return (
        <div>
            {/* <div className="flex items-center justify-between w-full">
                <h5 className="font-semibold text-lg dark:text-white-light">Dashboard</h5>
            </div> */}
            <div>
                <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-6 text-white">
                    <div className="panel bg-gradient-to-r from-primary to-[#41bcae] h-full p-0">
                        <div className="flex items-center justify-between w-full p-5">
                            <div className="relative">
                                <div className="text-white dark:text-dark-light bg-[#41bcae] w-11 h-11 rounded-lg flex items-center justify-center">
                                    <IconLayoutGrid />
                                </div>
                            </div>
                            <h5 className="font-semibold text-2xl ltr:text-right rtl:text-left dark:text-white-light">
                                {data?.store_registration_total ?? 0}
                                <span className="block text-sm font-normal">Registered Store</span>
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
                                    <IconRefresh />
                                </div>
                            </div>
                            <h5 className="font-semibold text-2xl ltr:text-right rtl:text-left dark:text-white-light">
                                {data?.store_registration_pending_total ?? 0}
                                <span className="block text-sm font-normal">Store Pending</span>
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

                    {/* <div className="panel h-full p-0"> */}
                    <div className="panel bg-gradient-to-r from-info to-[#6097b9] h-full p-0">
                        <div className="flex items-center justify-between w-full p-5">
                            <div className="relative">
                                <div className="text-white dark:text-dark-light bg-[#6097b9] w-11 h-11 rounded-lg flex items-center justify-center">
                                    <IconChecks />
                                </div>
                            </div>
                            <h5 className="font-semibold text-xl ltr:text-right rtl:text-left dark:text-white-light">
                                {data?.store_registration_approve_total ?? 0}
                                <span className="block text-sm font-normal">Store approved</span>
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

                    {/* <div className="panel h-full p-0"> */}
                    <div className="panel bg-gradient-to-r from-dark to-[#3f5f8b] h-full p-0">
                        <div className="flex items-center justify-between w-full p-5">
                            <div className="relative">
                                <div className="text-white dark:text-dark-light bg-[#3f5f8b] w-11 h-11 rounded-lg flex items-center justify-center">
                                    <IconHome />
                                </div>
                            </div>
                            <h5 className="font-semibold text-xl ltr:text-right rtl:text-left dark:text-white-light">
                                {data?.store_total ?? 0}
                                <span className="block text-sm font-normal">Store</span>
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

                {/* <div className="grid xl:grid-cols-1 gap-6 mb-6">
                    <div className="panel h-full xl:col-span-2">
                        <div className="flex items-center justify-between dark:text-white-light mb-5">
                            <h5 className="font-semibold text-lg">Revenue</h5>
                            <div className="dropdown">
                                <Dropdown
                                    offset={[0, 1]}
                                    placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                    button={<IconHorizontalDots className="text-black/70 dark:text-white/70 hover:!text-primary" />}
                                >
                                    <ul>
                                        <li>
                                            <button type="button">Weekly</button>
                                        </li>
                                        <li>
                                            <button type="button">Monthly</button>
                                        </li>
                                        <li>
                                            <button type="button">Yearly</button>
                                        </li>
                                    </ul>
                                </Dropdown>
                            </div>
                        </div>
                        <p className="text-lg dark:text-white-light/90">
                            Total Profit <span className="text-primary ml-2">$10,840</span>
                        </p>
                        <div className="relative">
                            <div className="bg-white dark:bg-black rounded-lg overflow-hidden">
                                {loading ? (
                                    <div className="min-h-[325px] grid place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] ">
                                        <span className="animate-spin border-2 border-black dark:border-white !border-l-transparent  rounded-full w-5 h-5 inline-flex"></span>
                                    </div>
                                ) : (
                                    <ReactApexChart series={revenueChart.series} options={revenueChart.options} type="area" height={325} />
                                )}
                            </div>
                        </div>
                    </div>
                </div> */}

                <div className="grid lg:grid-cols-2 grid-cols-1 gap-6">
                    <div className="panel h-full w-full">
                        <div className="flex items-center justify-between dark:text-white-light mb-5">
                            <h5 className="font-semibold text-lg">Registered Store</h5>
                            {/* <div className="dropdown">
                                <Dropdown
                                    offset={[0, 1]}
                                    placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                    button={<IconHorizontalDots className="text-black/70 dark:text-white/70 hover:!text-primary" />}
                                >
                                    <ul>
                                        <li>
                                            <button type="button">View Report</button>
                                        </li>
                                    </ul>
                                </Dropdown>
                            </div> */}
                        </div>

                        <div className="table-responsive whitespace-nowrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Store</th>
                                        <th>Owner</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {storeRegistrationData?.data.map((store: any, index: number) => (
                                        <tr key={index} className="text-white-dark hover:text-black dark:hover:text-white-light/90 group">
                                            <td>
                                                {new Intl.DateTimeFormat('id-ID', {
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit',
                                                    // hour: '2-digit',
                                                    // minute: '2-digit',
                                                    // second: '2-digit',
                                                    timeZone: 'Asia/Jakarta',
                                                }).format(new Date(store.created_at))}
                                            </td>
                                            <td className="text-black dark:text-white">{store.store_name}</td>
                                            <td className="text-black dark:text-white">{store.owner_name}</td>
                                            <td className="text-black dark:text-white">
                                                <span className={`badge whitespace-nowrap ${store.status === 'Approved' ? 'badge-outline-primary' : 'badge-outline-dark'}`}>{store.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="panel h-full w-full">
                        <div className="flex items-center justify-between dark:text-white-light mb-5">
                            <h5 className="font-semibold text-lg">Subscribe</h5>
                            {/* <div className="dropdown">
                                <Dropdown
                                    offset={[0, 1]}
                                    placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                    button={<IconHorizontalDots className="text-black/70 dark:text-white/70 hover:!text-primary" />}
                                >
                                    <ul>
                                        <li>
                                            <button type="button">View Report</button>
                                        </li>
                                    </ul>
                                </Dropdown>
                            </div> */}
                        </div>

                        {/* <div className="table-responsive">
                            <table>
                                <thead>
                                    <tr className="border-b-0">
                                        <th className="ltr:rounded-l-md rtl:rounded-r-md">No</th>
                                        <th className="ltr:rounded-l-md rtl:rounded-r-md">Store Name</th>
                                        <th>Subscribe</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stores.map((store) => (
                                        <tr key={store.no} className="text-dark hover:text-black dark:hover:text-white-light/90 group">
                                            <td>{store.no}</td>
                                            <td className="min-w-[150px] text-black dark:text-white">
                                                <div className="flex items-center">
                                                    <img className="w-8 h-8 rounded-md ltr:mr-3 rtl:ml-3 object-cover" src={store.image} alt="avatar" />
                                                    <span className="whitespace-nowrap">{store.name}</span>
                                                </div>
                                            </td>
                                            <td className="text-danger dark:text-white">{store.daysLeft}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div> */}

                        <div className="table-responsive">
                            <table>
                                <thead>
                                    <tr className="border-b-0">
                                        <th className="ltr:rounded-l-md rtl:rounded-r-md">No</th>
                                        <th className="ltr:rounded-l-md rtl:rounded-r-md">Store Name</th>
                                        <th className="ltr:rounded-l-md rtl:rounded-r-md">Owner</th>
                                        <th>Days Remaining</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stores.length > 0 ? (
                                        stores.map((store) => (
                                            <tr key={store.store_id} className="text-dark hover:text-black dark:hover:text-white-light/90 group">
                                                <td>{store.no}</td>
                                                <td className="min-w-[150px] text-black dark:text-white">
                                                    <div className="flex items-center">
                                                        {/* <img 
                        className="w-8 h-8 rounded-md ltr:mr-3 rtl:ml-3 object-cover" 
                        src={store.image} 
                        alt={store.store_name} 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/images/profile-default.png';
                        }}
                      /> */}
                                                        <span className="whitespace-nowrap">{store.store_name}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="whitespace-nowrap">{store.owner}</span>
                                                </td>
                                                <td className={store.daysLeft <= 7 ? 'text-danger' : 'text-success dark:text-white'}>{store.daysLeft} days</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="text-center py-4">
                                                No subscription data available
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
    );
};

export default AdminDash;
