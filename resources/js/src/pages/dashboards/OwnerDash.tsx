import React from 'react';
import { useSelector } from 'react-redux';
import Dropdown from '../../components/Dropdown';
import IconBarChart from '../../components/Icon/IconBarChart';
import IconBox from '../../components/Icon/IconBox';
import IconHorizontalDots from '../../components/Icon/IconHorizontalDots';
import IconShoppingBag from '../../components/Icon/IconShoppingBag';
import IconTrendingUp from '../../components/Icon/IconTrendingUp';
import IconUsersGroup from '../../components/Icon/IconUsersGroup';
import { IRootState } from '../../store';
import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Link } from 'react-router-dom';
import IconMultipleForwardRight from '../../components/Icon/IconMultipleForwardRight';
import { useGetOnwerDashQuery, useLazyGetOnwerOrdersDashQuery, useLazyGetOnwerTopProductsDashQuery } from '../../redux/features/dashboards/dashboadsApi';
import ChartReport from '../reports/ChartReport';
import NoRecords from '../../components/Layouts/NoRecords';
import { useLazyGetTopProductQuery } from '../../redux/features/orders/ordersApi';

const OwnerDash = () => {
    // Cek apakah dark mode aktif
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    // Cek apakah mode RTL aktif
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
    // State loading
    const [loading] = useState(false);

    // Mengambil data utama dashboard Owner
    const { data } = useGetOnwerDashQuery({});

    // Konfigurasi Revenue Chart
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

    // Konfigurasi Sales By Category
    const salesByCategory: any = {
        series: [985, 737, 270], // Data jumlah penjualan
        options: {
            chart: {
                type: 'donut',
                height: 460,
                fontFamily: 'Nunito, sans-serif',
            },
            dataLabels: {
                enabled: false,
            },
            stroke: {
                show: true,
                width: 25,
                colors: isDark ? '#0e1726' : '#fff',
            },
            colors: isDark ? ['#5c1ac3', '#e2a03f', '#e7515a', '#e2a03f'] : ['#e2a03f', '#5c1ac3', '#e7515a'],
            legend: {
                position: 'bottom',
                horizontalAlign: 'center',
                fontSize: '14px',
                markers: {
                    width: 10,
                    height: 10,
                    offsetX: -2,
                },
                height: 50,
                offsetY: 20,
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '65%',
                        background: 'transparent',
                        labels: {
                            show: true,
                            name: {
                                show: true,
                                fontSize: '29px',
                                offsetY: -10,
                            },
                            value: {
                                show: true,
                                fontSize: '26px',
                                color: isDark ? '#bfc9d4' : undefined,
                                offsetY: 16,
                                formatter: (val: any) => {
                                    return val;
                                },
                            },
                            total: {
                                show: true,
                                label: 'Total',
                                color: '#888ea8',
                                fontSize: '29px',
                                formatter: (w: any) => {
                                    return w.globals.seriesTotals.reduce(function (a: any, b: any) {
                                        return a + b;
                                    }, 0);
                                },
                            },
                        },
                    },
                },
            },
            labels: ['Apparel', 'Sports', 'Others'],
            states: {
                hover: {
                    filter: {
                        type: 'none',
                        value: 0.15,
                    },
                },
                active: {
                    filter: {
                        type: 'none',
                        value: 0.15,
                    },
                },
            },
        },
    };

    // Inisialisasi lazy query untuk mendapatkan data orders
    const [fetchOrdersTrigger] = useLazyGetOnwerOrdersDashQuery(); // Gunakan Lazy Query

    // Mengambil seluruh order dengan pagination
    const fetchAllOrders = async () => {
        let allOrders: any[] = [];
        let currentPage = 1;
        let lastPage = 1;

        try {
            while (currentPage <= lastPage) {
                const result = await fetchOrdersTrigger({}).unwrap();

                allOrders = [...allOrders, ...result.data];
                lastPage = result.last_page; // Total halaman yang tersedia
                currentPage++;
            }
        } catch (error) {
            console.error('Error fetching all orders:', error);
        }

        return allOrders;
    };

    // Simpan semua order dalam state
    const [allOrders, setAllOrders] = useState<any[]>([]);

    // Panggil fetch order lalu simpan hasilnya
    const fetchOrdersData = async () => {
        const orders = await fetchAllOrders();
        setAllOrders(orders);
    };

    // =====

    // Inisialisasi lazy query untuk mendapatkan top produk
    const [fetchTopProductTrigger] = useLazyGetOnwerTopProductsDashQuery(); // Gunakan Lazy Query

    // Mengambil seluruh top produk dengan pagination
    const fetchAllTopProducts = async () => {
        let allOrders: any[] = [];
        let currentPage = 1;
        let lastPage = 1;

        try {
            while (currentPage <= lastPage) {
                const result = await fetchTopProductTrigger({}).unwrap();

                allOrders = [...allOrders, ...result.data];
                lastPage = result.last_page; // Total halaman yang tersedia
                currentPage++;
            }
        } catch (error) {
            console.error('Error fetching all orders:', error);
        }

        return allOrders;
    };

    // Simpan semua produk teratas dalam state
    const [allTopProducts, setAllTopProducts] = useState<any[]>([]);

    // Panggil fetch produk teratas lalu simpan hasilnya
    const fetchTopProductsData = async () => {
        const orders = await fetchAllTopProducts();
        setAllTopProducts(orders);
    };

    // Memanggil data orders dan top produk saat pertama kali komponen dirender
    useEffect(() => {
        fetchOrdersData();
        fetchTopProductsData();
    }, []);

    return (
        <div>
            {/* Grid 4 kartu statistik */}
            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-6 text-white">
                {/* Card Total Employee - Warna Primary (Hijau) */}
                <div className="panel bg-gradient-to-r from-primary to-[#41bcae] h-full p-0">
                    <div className="flex items-center justify-between w-full p-5">
                        <div className="relative">
                            {/* Icon employee */}
                            <div className="text-white dark:text-dark-light bg-[#41bcae] w-11 h-11 rounded-lg flex items-center justify-center">
                                <IconUsersGroup />
                            </div>
                        </div>
                        {/* Menampilkan jumlah total employee */}
                        <h5 className="font-semibold text-2xl ltr:text-right rtl:text-left dark:text-white-light">
                            {data?.total_employees ?? 0}
                            <span className="block text-sm font-normal">Total Employee</span>
                        </h5>
                    </div>
                </div>

                {/* Card Total Order - Warna Secondary (Hijau Gelap) */}
                <div className="panel bg-gradient-to-r from-secondary to-[#406674] h-full p-0">
                    <div className="flex items-center justify-between w-full p-5">
                        <div className="relative">
                            {/* Icon order */}
                            <div className="text-white dark:text-dark-light bg-[#406674] w-11 h-11 rounded-lg flex items-center justify-center">
                                <IconShoppingBag />
                            </div>
                        </div>
                        {/* Menampilkan jumlah total order */}
                        <h5 className="font-semibold text-2xl ltr:text-right rtl:text-left dark:text-white-light">
                            {data?.total_orders ?? 0}
                            <span className="block text-sm font-normal">Total Order</span>
                        </h5>
                    </div>
                </div>

                {/* Card Total Sales - Warna Info (Biru Langit) */}
                <div className="panel bg-gradient-to-r from-info to-[#6097b9] h-full p-0">
                    <div className="flex items-center justify-between w-full p-5">
                        <div className="relative">
                            {/* Icon chart/sales */}
                            <div className="text-white dark:text-dark-light bg-[#6097b9] w-11 h-11 rounded-lg flex items-center justify-center">
                                <IconBarChart />
                            </div>
                        </div>
                        {/* Menampilkan total penjualan dalam format mata uang */}
                        <h5 className="font-semibold text-xl ltr:text-right rtl:text-left dark:text-white-light">
                            Rp {Number(data?.total_payment || 0).toLocaleString()}
                            <span className="block text-sm font-normal">Total Sales</span>
                        </h5>
                    </div>
                </div>

                {/* Card Total Store - Warna Dark (Biru Gelap Malam) */}
                <div className="panel bg-gradient-to-r from-dark to-[#3f5f8b] h-full p-0">
                    <div className="flex items-center justify-between w-full p-5">
                        <div className="relative">
                            {/* Ikon toko */}
                            <div className="text-white dark:text-dark-light bg-[#3f5f8b] w-11 h-11 rounded-lg flex items-center justify-center">
                                <IconBox />
                            </div>
                        </div>
                        {/* Menampilkan jumlah total store */}
                        <h5 className="font-semibold text-2xl ltr:text-right rtl:text-left dark:text-white-light">
                            {data?.total_stores ?? 0}
                            <span className="block text-sm font-normal">Total Store</span>
                        </h5>
                    </div>
                </div>
            </div>

            {/* Komponen grafik laporan penjualan */}
            <ChartReport allOrders={allOrders} />

            {/* Grid 2 kolom Recent Orders dan Top Selling Product */}
            <div className="grid lg:grid-cols-2 grid-cols-1 gap-6">
                {/* Panel Recent Orders */}
                <div className="panel h-full w-full">
                    <div className="flex items-center justify-between mb-5">
                        <h5 className="font-semibold text-lg dark:text-white-light">Recent Orders</h5>
                    </div>
                    <div className="table-responsive whitespace-nowrap">
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
                                {/* Cek apakah ada data order */}
                                {allOrders?.length !== 0 ? (
                                    // Ambil maksimal 10 data order terbaru
                                    allOrders.slice(0, 10).map((item: any) => (
                                        <tr className="text-white-dark hover:text-black dark:hover:text-white-light/90 group">
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
                                    // Tampilkan komponen NoRecords jika tidak ada data
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

                {/* Panel Top Selling Product */}
                <div className="panel h-full w-full">
                    <div className="flex items-center justify-between mb-5">
                        <h5 className="font-semibold text-lg dark:text-white-light">Top Selling Product</h5>
                    </div>
                    {/* Tabel Top Selling Product */}
                    <div className="table-responsive">
                        <table>
                            <thead>
                                <tr className="border-b-0">
                                    <th className="ltr:rounded-l-md rtl:rounded-r-md">Product</th>
                                    <th>Category</th>
                                    <th>Desciption</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Cek apakah ada data top product */}
                                {allTopProducts?.length !== 0 ? (
                                    // Ambil maksimal 10 produk terlaris
                                    allTopProducts.slice(0, 10).map((item: any) => (
                                        <tr className="text-white-dark hover:text-black dark:hover:text-white-light/90 group">
                                            <td className="min-w-[150px] text-black dark:text-white max-w-[200px] truncate">{item.product_name}</td>
                                            <td className="text-primary">{item.category?? '-'}</td>
                                            <td className="max-w-[150px] truncate">{item.description}</td>
                                        </tr>
                                    ))
                                ) : (
                                    // Tampilkan NoRecords jika tidak ada produk
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
    );
};

export default OwnerDash;
