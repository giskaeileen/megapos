import ReactApexChart from "react-apexcharts";
import Dropdown from "../../components/Dropdown";
import IconHorizontalDots from "../../components/Icon/IconHorizontalDots";
import { useSelector } from "react-redux";
import { IRootState } from "../../store";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { formatNumber } from "../../components/tools";
dayjs.extend(weekOfYear);

const ChartReportTopProduct: React.FC<{ allOrders: any[] }> = ({ allOrders }) => {
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    // const [chartData, setChartData] = useState({ categories: [], series: [] });
    interface ChartData {
        categories: string[];
        series: { name: string; data: number[] }[];
    }

    const [chartData, setChartData] = useState<ChartData>({
        categories: [],
        series: [],
    });
    const [filterType, setFilterType] = useState("Weekly");

    const groupBy = (data: any, key: any) => {
        return data.reduce((acc: any, item: any) => {
            const groupKey = key(item);
            if (!acc[groupKey]) {
                acc[groupKey] = { totalProfit: 0, totalRevenue: 0 };
            }
            acc[groupKey].totalProfit += item.pay;
            acc[groupKey].totalRevenue += item.pay;
            return acc;
        }, {});
    };

    const filterData = (orders: any, type: any) => {
        const now = dayjs();
        let filteredOrders = orders.filter((order: any) => {
            const orderDate = dayjs(order.order_date);
            if (type === "Weekly") return orderDate.isAfter(now.subtract(7, "day"));
            if (type === "Monthly") return orderDate.isAfter(now.subtract(1, "month"));
            if (type === "Yearly") return orderDate.isAfter(now.subtract(1, "year"));
            return true;
        });

        let groupedData: Record<string, any> = {};
        let categories: any[] = [];

        if (type === "Weekly") {
            groupedData = groupBy(filteredOrders, (order: any) => dayjs(order.order_date).format("ddd, DD"));
            categories = Object.keys(groupedData);
        } else if (type === "Monthly") {
            // groupedData = groupBy(filteredOrders, (order) => `Week ${dayjs(order.order_date).week()}`);
            groupedData = groupBy(filteredOrders, (order: any) => dayjs(order.order_date).format("ddd, DD"));
            categories = Object.keys(groupedData);
            categories = Object.keys(groupedData);
        } else if (type === "Yearly") {
            groupedData = groupBy(filteredOrders, (order: any) => dayjs(order.order_date).format("MMM YYYY"));
            categories = Object.keys(groupedData);
        }

        const netProfit = categories.map(category => groupedData[category].totalProfit);
        const revenue = categories.map(category => groupedData[category].totalRevenue);

        return {
            categories,
            series: [
                { name: "Net Profit", data: netProfit },
                // { name: "Revenue", data: revenue },
            ]
        };
    };

    useEffect(() => {
        if (allOrders.length > 0) {
            setChartData(filterData(allOrders, filterType));
        }
    }, [allOrders, filterType]);

    const handleChartUpdate = (type: any) => {
        setFilterType(type);
    };

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

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(allOrders.length !== 0) {
            setLoading(false)
        }
    }, [allOrders])

    // =======

    // const donutChart = getDonutChartData(allOrders);

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
        <div className="grid xl:grid-cols-3 gap-6 mb-6">
            <div className="panel p-0 xl:col-span-2">
                <div className="flex items-center justify-between dark:text-white-light mb-2 m-4">
                    <p className="text-lg dark:text-white-light/90">
                        Total Profit <span className="text-primary ml-2">{formatNumber(allOrders.reduce((acc, order) => acc + order.pay, 0))}</span>
                    </p>
                    <div className="dropdown">
                        <Dropdown offset={[0, 1]} placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`} button={<IconHorizontalDots className="text-black/70 dark:text-white/70 hover:!text-primary" />}>
                            <ul className="absolute bg-white dark:bg-gray-800 shadow-md mt-2 rounded-lg">
                                <li><button onClick={() => handleChartUpdate("Weekly")}>Weekly</button></li>
                                <li><button onClick={() => handleChartUpdate("Monthly")}>Monthly</button></li>
                                <li><button onClick={() => handleChartUpdate("Yearly")}>Yearly</button></li>
                            </ul>
                        </Dropdown>
                    </div>
                </div>

                {loading ? (
                    <div className="min-h-[325px] grid place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] ">
                        <span className="animate-spin border-2 border-black dark:border-white !border-l-transparent  rounded-full w-5 h-5 inline-flex"></span>
                    </div>
                ) : (
                    <ReactApexChart 
                        series={columnChart.series} 
                        options={columnChart.options} 
                        className="rounded-lg bg-white dark:bg-black overflow-hidden" 
                        type="bar" 
                        height={300} 
                    />
                )}
            </div>

            <div className="panel p-0">
                <div className="flex items-center justify-between dark:text-white-light mb-2 m-4">
                    <p className="text-lg dark:text-white-light/90">
                        Total Profit <span className="text-primary ml-2">{formatNumber(allOrders.reduce((acc, order) => acc + order.pay, 0))}</span>
                    </p>
                </div>
                {loading ? (
                    <div className="min-h-[325px] grid place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] ">
                        <span className="animate-spin border-2 border-black dark:border-white !border-l-transparent  rounded-full w-5 h-5 inline-flex"></span>
                    </div>
                ) : (
                    <ReactApexChart 
                        series={donutChart.series} 
                        options={donutChart.options} 
                        className="rounded-lg bg-white dark:bg-black overflow-hidden" 
                        type="donut" 
                        height={300} 
                    />
                )}
            </div>
        </div>
    );
};

export default ChartReportTopProduct;
