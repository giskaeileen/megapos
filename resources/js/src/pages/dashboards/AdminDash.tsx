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
    // Mengatur judul halaman
    useEffect(() => {
        dispatch(setPageTitle('Sales Admin'));
    });
    // Mengambil status tema gelap
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    // Mengecek apakah layout dalam mode RTL (Right-to-Left)
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    // Mengambil data dari dashboard admin
    const { data } = useGetAdminDashQuery({});

    // Mengambil data registrasi toko dan melakukan refetch
    const { data: storeRegistrationData, refetch } = useGetStoreRegistrationsQuery(
        {
            sort: 'created_at',
            direction: 'desc',
        },
        { refetchOnMountOrArgChange: true }
    );

    // Data toko statis sementara (dummy data)
    const [storeData] = useState([
        { date: '25/09/2024', name: 'Store A', owner: 'Luke Ivory', status: 'Pending' },
        { date: '25/09/2024', name: 'Store C', owner: 'Tesar', status: 'Approved' },
        { date: '25/09/2024', name: 'Store D', owner: 'Amkal', status: 'Pending Multiple' },
        { date: '25/09/2024', name: 'Store E', owner: 'Ilham', status: 'Approved' },
        { date: '25/09/2024', name: 'Store F', owner: 'Filardi', status: 'Approved' },
    ]);

    // KonfigurasiRevenue Chart (pendapatan dan pengeluaran)
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
            // Warna disesuaikan dengan mode tema
            colors: isDark ? ['#2196F3', '#E7515A'] : ['#1B55E2', '#E7515A'],
            markers: {
                // Penanda khusus pada titik data tertentu
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

    // Tipe data untuk struktur toko yang akan ditampilkan di tabel
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

    // Tipe data untuk struktur data subscription dari endpoint
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

    // State untuk menyimpan daftar toko, status loading dan error
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch data subscription
    useEffect(() => {
        const fetchSubscriptionData = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/active-subscriptions');

                // Jika response gagal
                if (!response.ok) {
                    throw new Error('Failed to fetch subscription data');
                }

                const data = await response.json();

                // Jika sukses dan ada data
                if (data.success && data.data.length > 0) {
                    // Mengubah data agar sesuai dengan struktur tabel
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
                // Menangani error jika terjadi
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
                console.error('Error fetching subscription data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSubscriptionData();
    }, []);

    // Debug log (sementara)
    console.log(stores)

    // Tampilkan loading state
    if (loading) {
        return <div>Loading subscription data...</div>;
    }

    // Tampilkan error jika ada
    if (error) {
        return <div className="text-danger">Error: {error}</div>;
    }

    return (
        <div>
            <div>
                {/* Grid statistik */}
                <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-6 text-white">
                    {/* Card Total registered store */}
                    <div className="panel bg-gradient-to-r from-primary to-[#41bcae] h-full p-0">
                        <div className="flex items-center justify-between w-full p-5">
                            {/* Icon */}
                            <div className="relative">
                                <div className="text-white dark:text-dark-light bg-[#41bcae] w-11 h-11 rounded-lg flex items-center justify-center">
                                    <IconLayoutGrid />
                                </div>
                            </div>
                            {/* Total registered store */}
                            <h5 className="font-semibold text-2xl ltr:text-right rtl:text-left dark:text-white-light">
                                {data?.store_registration_total ?? 0}
                                <span className="block text-sm font-normal">Registered Store</span>
                            </h5>
                        </div>
                    </div>

                    {/* Card store pending */}
                    <div className="panel bg-gradient-to-r from-secondary to-[#406674] h-full p-0">
                        <div className="flex items-center justify-between w-full p-5">
                            {/* Icon */}
                            <div className="relative">
                                <div className="text-white dark:text-dark-light bg-[#406674] w-11 h-11 rounded-lg flex items-center justify-center">
                                    <IconRefresh />
                                </div>
                            </div>
                            {/* Total Store Pending */}
                            <h5 className="font-semibold text-2xl ltr:text-right rtl:text-left dark:text-white-light">
                                {data?.store_registration_pending_total ?? 0}
                                <span className="block text-sm font-normal">Store Pending</span>
                            </h5>
                        </div>
                    </div>

                    {/* Card store approved */}
                    <div className="panel bg-gradient-to-r from-info to-[#6097b9] h-full p-0">
                        <div className="flex items-center justify-between w-full p-5">
                            {/* Icon */}
                            <div className="relative">
                                <div className="text-white dark:text-dark-light bg-[#6097b9] w-11 h-11 rounded-lg flex items-center justify-center">
                                    <IconChecks />
                                </div>
                            </div>
                            {/* Total store approved */}
                            <h5 className="font-semibold text-xl ltr:text-right rtl:text-left dark:text-white-light">
                                {data?.store_registration_approve_total ?? 0}
                                <span className="block text-sm font-normal">Store approved</span>
                            </h5>
                        </div>
                    </div>

                    {/* Card total store */}
                    <div className="panel bg-gradient-to-r from-dark to-[#3f5f8b] h-full p-0">
                        <div className="flex items-center justify-between w-full p-5">
                            {/* Icon */}
                            <div className="relative">
                                <div className="text-white dark:text-dark-light bg-[#3f5f8b] w-11 h-11 rounded-lg flex items-center justify-center">
                                    <IconHome />
                                </div>
                            </div>
                            {/* Total store */}
                            <h5 className="font-semibold text-xl ltr:text-right rtl:text-left dark:text-white-light">
                                {data?.store_total ?? 0}
                                <span className="block text-sm font-normal">Store</span>
                            </h5>
                        </div>
                    </div>
                </div>

                {/* Grid tabel */}
                <div className="grid lg:grid-cols-2 grid-cols-1 gap-6">
                    {/* Panel Registered Store */}
                    <div className="panel h-full w-full">
                        <div className="flex items-center justify-between dark:text-white-light mb-5">
                            <h5 className="font-semibold text-lg">Registered Store</h5>
                        </div>

                        {/* Tabel Store yang Terdaftar */}
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
                                    {/* Mapping data store registration */}
                                    {storeRegistrationData?.data.map((store: any, index: number) => (
                                        <tr key={index} className="text-white-dark hover:text-black dark:hover:text-white-light/90 group">
                                            {/* Tanggal Pendaftaran */}
                                            <td>
                                                {new Intl.DateTimeFormat('id-ID', {
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit',
                                                    timeZone: 'Asia/Jakarta',
                                                }).format(new Date(store.created_at))}
                                            </td>
                                            {/* Nama Store */}
                                            <td className="text-black dark:text-white">{store.store_name}</td>
                                            {/* Nama Pemilik */}
                                            <td className="text-black dark:text-white">{store.owner_name}</td>
                                            {/* Status (Approved / Pending) */}
                                            <td className="text-black dark:text-white">
                                                <span className={`badge whitespace-nowrap ${store.status === 'Approved' ? 'badge-outline-primary' : 'badge-outline-dark'}`}>{store.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Panel Subscribe */}
                    <div className="panel h-full w-full">
                        <div className="flex items-center justify-between dark:text-white-light mb-5">
                            <h5 className="font-semibold text-lg">Subscribe</h5>
                        </div>

                        {/* Tabel Subscribe */}
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
                                    {/* Jika data subscription tersedia */}
                                    {stores.length > 0 ? (
                                        stores.map((store) => (
                                            <tr key={store.store_id} className="text-dark hover:text-black dark:hover:text-white-light/90 group">
                                                <td>{store.no}</td>
                                                <td className="min-w-[150px] text-black dark:text-white">
                                                    <div className="flex items-center">
                                                        <span className="whitespace-nowrap">{store.store_name}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="whitespace-nowrap">{store.owner}</span>
                                                </td>
                                                {/* Hari tersisa sebelum berakhir langganan */}
                                                <td className={store.daysLeft <= 7 ? 'text-danger' : 'text-success dark:text-white'}>{store.daysLeft} days</td>
                                            </tr>
                                        ))
                                    ) : (
                                        // Tampilkan pesan jika tidak ada data
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
