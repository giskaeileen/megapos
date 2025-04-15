import ReactApexChart from "react-apexcharts";
import Dropdown from "../../components/Dropdown";
import IconHorizontalDots from "../../components/Icon/IconHorizontalDots";
import { useSelector } from "react-redux";
import { IRootState } from "../../store";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { formatNumber } from "../../components/tools";

// Extend dayjs agar bisa menghitung minggu dalam tahun
dayjs.extend(weekOfYear);

// Komponen ChartReport menerima prop allOrders berupa array
const ChartReport: React.FC<{ allOrders: any[] }> = ({ allOrders }) => {
    // Ambil nilai tema dari redux (dark mode)
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    // Cek apakah layout RTL (Right to Left)
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    // Interface untuk struktur data chart
    interface ChartData {
        categories: string[];
        series: { name: string; data: number[] }[];
    }

    // State untuk data chart kolom
    const [chartData, setChartData] = useState<ChartData>({
        categories: [],
        series: [],
    });
    // State untuk tipe filter data (mingguan, bulanan, tahunan)
    const [filterType, setFilterType] = useState("Weekly");

    // Fungsi untuk mengelompokkan data berdasarkan kunci tertentu
    const groupBy = (data: any, key: any) => {
        return data.reduce((acc: any, item: any) => {
            const groupKey = key(item); // Ambil kunci grup dari fungsi callback
            if (!acc[groupKey]) {
                acc[groupKey] = { totalProfit: 0, totalRevenue: 0 };
            }
            acc[groupKey].totalProfit += item.pay;
            acc[groupKey].totalRevenue += item.pay;
            return acc;
        }, {});
    };

    // Fungsi untuk memfilter dan mengelompokkan data sesuai tipe (Weekly, Monthly, Yearly)
    const filterData = (orders: any, type: any) => {
        const now = dayjs();
        // Filter order berdasarkan waktu
        let filteredOrders = orders.filter((order: any) => {
            const orderDate = dayjs(order.order_date);
            if (type === "Weekly") return orderDate.isAfter(now.subtract(7, "day"));
            if (type === "Monthly") return orderDate.isAfter(now.subtract(1, "month"));
            if (type === "Yearly") return orderDate.isAfter(now.subtract(1, "year"));
            return true;
        });

        // Mapping nilai chart
        let groupedData: Record<string, any> = {}; // Objek hasil grup
        let categories: any[] = []; // Label kategori

        // Pengelompokan berdasarkan filterType
        if (type === "Weekly") {
            groupedData = groupBy(filteredOrders, (order: any) => dayjs(order.order_date).format("ddd, DD"));
            categories = Object.keys(groupedData);
        } else if (type === "Monthly") {
            groupedData = groupBy(filteredOrders, (order: any) => dayjs(order.order_date).format("ddd, DD"));
            categories = Object.keys(groupedData);
            categories = Object.keys(groupedData);
        } else if (type === "Yearly") {
            groupedData = groupBy(filteredOrders, (order: any) => dayjs(order.order_date).format("MMM YYYY"));
            categories = Object.keys(groupedData);
        }

        // Mapping nilai chart    
        const netProfit = categories.map(category => groupedData[category].totalProfit);
        const revenue = categories.map(category => groupedData[category].totalRevenue);

        return {
            categories,
            series: [
                { name: "Net Profit", data: netProfit },
            ]
        };
    };

    // Jalankan saat data orders atau filterType berubah
    useEffect(() => {
        if (allOrders.length > 0) {
            setChartData(filterData(allOrders, filterType));
        }
    }, [allOrders, filterType]);

    // Ubah tipe filter chart (Weekly, Monthly, Yearly)
    const handleChartUpdate = (type: any) => {
        setFilterType(type);
    };

    // Konfigurasi chart bar
    const columnChart = {
        series: chartData.series,
        options: {
            chart: { height: 300, type: "bar" as const, zoom: { enabled: false }, toolbar: { show: false } },
            colors: ["#457B9D", "#E63946"],
            dataLabels: { enabled: false },
            stroke: { show: true, width: 2, colors: ["transparent"] },
            plotOptions: { bar: { horizontal: false, columnWidth: "55%", endingShape: "rounded" } },
            grid: { borderColor: "#e0e6ed", xaxis: { lines: { show: false } } },
            xaxis: { categories: chartData.categories, axisBorder: { color: "#e0e6ed" } },
            yaxis: { labels: { formatter: (val: any) => formatNumber(val) } }, // Format angka pada Y-Axis
            tooltip: { theme: "light", y: { formatter: (val: any) => formatNumber(val) } }, // Format angka di Tooltip
        },
    };

    // State loading chart
    const [loading, setLoading] = useState(true);

    // Hilangkan loading setelah allOrders tersedia
    useEffect(() => {
        if(allOrders) {
            setLoading(false)
        }
    }, [allOrders])

    // =======

    // Fungsi untuk membentuk data chart donat berdasarkan payment_status
    const getDonutChartData = (orders: any) => {
        // Kelompokkan orders berdasarkan kategori
        const categoryTotals = orders.reduce((acc: Record<string, number>, order: any) => {
            const category = order.payment_status || "Unknown"; // Pastikan ada kategori
            acc[category] = (acc[category] || 0) + order.pay; // Tambahkan total profit
            return acc;
        }, {});

        // Ubah ke format ApexCharts
        const categories = Object.keys(categoryTotals);
        const values = Object.values(categoryTotals).map(Number); // Pastikan bertipe number[]

        return {
            series: values, // Data utama dalam bentuk angka
            options: {
                chart: {
                    height: 300,
                    type: "donut" as const, // Pastikan tipe sesuai dengan ApexCharts
                    zoom: { enabled: false },
                    toolbar: { show: false },
                },
                stroke: { show: false },
                labels: categories, // Label kategori
                colors: ["#2A9D8F", "#457B9D", "#F4A261", "#E63946"],
                responsive: [
                    {
                        breakpoint: 480,
                        options: {
                            chart: { width: 200 },
                        },
                    },
                ],
                legend: { position: "bottom" as const }, // FIXED: Tambahkan `as const`
                tooltip: {
                    y: {
                        formatter: (val: number) => formatNumber(val), // Pastikan val bertipe number
                    },
                },
            },
        };
    };

    const donutChart = getDonutChartData(allOrders);

    return (
        // Layout grid untuk menampung 2 jenis chart: chart batang dan chart donat
        <div className="grid xl:grid-cols-3 gap-6 mb-6">
            {/* Chart batang (bar chart) untuk total profit berdasarkan filter waktu */}
            <div className="panel p-0 xl:col-span-2">
                {/* Header panel bar chart */}
                <div className="flex items-center justify-between dark:text-white-light mb-2 m-4">
                    {/* Judul dan total profit */}
                    <p className="text-lg dark:text-white-light/90">
                        Total Profit 
                        {/* Menampilkan total keseluruhan profit dari semua order */}
                        <span className="text-primary ml-2">{formatNumber(allOrders.reduce((acc, order) => acc + order.pay, 0))}</span>
                    </p>
                    {/* Dropdown filter: Weekly, Monthly, Yearly */}
                    <div className="dropdown">
                        <Dropdown offset={[0, 1]} placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`} button={<IconHorizontalDots className="text-black/70 dark:text-white/70 hover:!text-primary" />}>
                            <ul className="absolute bg-white dark:bg-gray-800 shadow-md mt-2 rounded-lg">
                                {/* Tombol untuk ganti filter chart berdasarkan waktu */}
                                <li><button onClick={() => handleChartUpdate("Weekly")}>Weekly</button></li>
                                <li><button onClick={() => handleChartUpdate("Monthly")}>Monthly</button></li>
                                <li><button onClick={() => handleChartUpdate("Yearly")}>Yearly</button></li>
                            </ul>
                        </Dropdown>
                    </div>
                </div>

                {/* Loader tampil saat data masih dimuat */}
                {loading ? (
                    <div className="min-h-[325px] grid place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] ">
                        <span className="animate-spin border-2 border-black dark:border-white !border-l-transparent  rounded-full w-5 h-5 inline-flex"></span>
                    </div>
                ) : (
                    // Komponen chart batang menggunakan ApexCharts
                    <ReactApexChart 
                        series={columnChart.series} // Data series (Net Profit)
                        options={columnChart.options} // Konfigurasi chart
                        className="rounded-lg bg-white dark:bg-black overflow-hidden" 
                        type="bar" // Jenis chart
                        height={300} // Tinggi chart
                    />
                )}
            </div>

            {/* Chart donat (donut chart) untuk pembagian total profit berdasarkan status pembayaran */}
            <div className="panel p-0">
                {/* Header panel donut chart */}
                <div className="flex items-center justify-between dark:text-white-light mb-2 m-4">
                    {/* Judul dan total profit */}
                    <p className="text-lg dark:text-white-light/90">
                        Total Profit {/* Menampilkan total keseluruhan profit dari semua order */}
                        <span className="text-primary ml-2">{formatNumber(allOrders.reduce((acc, order) => acc + order.pay, 0))}</span>
                    </p>
                </div>
                {/* Loader tampil saat data masih dimuat */}
                {loading ? (
                    <div className="min-h-[325px] grid place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] ">
                        {/* Animasi loading */}
                        <span className="animate-spin border-2 border-black dark:border-white !border-l-transparent  rounded-full w-5 h-5 inline-flex"></span>
                    </div>
                ) : (
                    // Komponen chart donat menggunakan ApexCharts 
                    <ReactApexChart 
                        series={donutChart.series} // Data series berdasarkan status pembayaran
                        options={donutChart.options} // Konfigurasi chart
                        className="rounded-lg bg-white dark:bg-black overflow-hidden" 
                        type="donut" // Jenis chart
                        height={300} // Tinggi chart
                    />
                )}
            </div>
        </div>
    );
};

export default ChartReport;
