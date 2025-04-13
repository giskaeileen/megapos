// import ReactApexChart from "react-apexcharts";
// import Dropdown from "../../components/Dropdown";
// import IconHorizontalDots from "../../components/Icon/IconHorizontalDots";
// import { useSelector } from "react-redux";
// import { IRootState } from "../../store";
// import { useState } from "react";

// const ChartReport = () => {
//     const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
//     const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

//     const weeklyData = {
//         categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
//         series: [
//             { name: 'Net Profit', data: [12, 18, 22, 15, 30, 25, 28] },
//             { name: 'Revenue', data: [20, 25, 30, 28, 40, 35, 38] }
//         ]
//     };

//     const monthlyData = {
//         categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
//         series: [
//             { name: 'Net Profit', data: [44, 55, 57, 56, 61, 58, 63, 60, 66, 70, 75, 80] },
//             { name: 'Revenue', data: [76, 85, 101, 98, 87, 105, 91, 114, 94, 110, 120, 130] }
//         ]
//     };

//     const yearlyData = {
//         categories: ['2018', '2019', '2020', '2021', '2022', '2023', '2024'],
//         series: [
//             { name: 'Net Profit', data: [500, 600, 750, 800, 950, 1100, 1200] },
//             { name: 'Revenue', data: [800, 900, 1050, 1200, 1300, 1500, 1600] }
//         ]
//     };

//     const [chartData, setChartData] = useState(monthlyData);

//     const handleChartUpdate = (type: "Weekly" | "Monthly" | "Yearly") => {
//         if (type === "Weekly") {
//             setChartData(weeklyData);
//         } else if (type === "Monthly") {
//             setChartData(monthlyData);
//         } else {
//             setChartData(yearlyData);
//         }
//     };

//     const columnChart = {
//         series: chartData.series,
//         options: {
//             chart: {
//                 height: 300,
//                 type: "bar",
//                 zoom: { enabled: false },
//                 toolbar: { show: false },
//             },
//             colors: ["#457B9D", "#E63946"],
//             dataLabels: { enabled: false },
//             stroke: { show: true, width: 2, colors: ["transparent"] },
//             plotOptions: {
//                 bar: {
//                     horizontal: false,
//                     columnWidth: "55%",
//                     endingShape: "rounded",
//                 },
//             },
//             grid: { borderColor: "#e0e6ed", xaxis: { lines: { show: false } } },
//             xaxis: {
//                 categories: chartData.categories,
//                 axisBorder: { color: "#e0e6ed" },
//             },
//             yaxis: {
//                 labels: { offsetX: 0 },
//             },
//             tooltip: {
//                 theme: "light",
//                 y: { formatter: (val: any) => val },
//             },
//         },
//     };

//     return (
//         <div className="grid xl:grid-cols-3 gap-6 mb-6">
//             <div className="panel p-0 xl:col-span-2">
//                 <div className="flex items-center justify-between dark:text-white-light mb-2 m-4">
//                     <p className="text-lg dark:text-white-light/90">
//                         Total Profit <span className="text-primary ml-2">$10,840</span>
//                     </p>
//                     <div className="dropdown">
//                         <Dropdown
//                             offset={[0, 1]}
//                             placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
//                             button={<IconHorizontalDots className="text-black/70 dark:text-white/70 hover:!text-primary" />}
//                         >
//                             <ul className="absolute bg-white dark:bg-gray-800 shadow-md mt-2 rounded-lg">
//                                 <li>
//                                     <button onClick={() => handleChartUpdate("Weekly")}>Weekly</button>
//                                 </li>
//                                 <li>
//                                     <button onClick={() => handleChartUpdate("Monthly")}>Monthly</button>
//                                 </li>
//                                 <li>
//                                     <button onClick={() => handleChartUpdate("Yearly")}>Yearly</button>
//                                 </li>
//                             </ul>
//                         </Dropdown>
//                     </div>
//                 </div>
//                 <ReactApexChart 
//                     series={columnChart.series} 
//                     options={columnChart.options} 
//                     className="rounded-lg bg-white dark:bg-black overflow-hidden" 
//                     type="bar" 
//                     height={300} 
//                 />
//             </div>
//         </div>
//     )
// }

// export default ChartReport;


// import ReactApexChart from "react-apexcharts";
// import Dropdown from "../../components/Dropdown";
// import IconHorizontalDots from "../../components/Icon/IconHorizontalDots";
// import { useSelector } from "react-redux";
// import { IRootState } from "../../store";
// import { useState, useEffect } from "react";

// const ChartReport = ({ allOrders }) => {
//     const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
//     const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

//     // State untuk data chart
//     const [chartData, setChartData] = useState({
//         categories: [],
//         series: [],
//     });

//     // Transformasi data dari `allOrders`
//     const transformDataForChart = (orders) => {
//         const categories = [];
//         const netProfit = [];
//         const revenue = [];

//         orders.forEach(order => {
//             // categories.push(order.date); // Sesuaikan dengan field tanggal di allOrders
//             // netProfit.push(order.net_profit); // Sesuaikan dengan field profit
//             // revenue.push(order.revenue); // Sesuaikan dengan field revenue

//             categories.push(order.order_date); // Sesuaikan dengan field tanggal di allOrders
//             netProfit.push(order.pay); // Sesuaikan dengan field profit
//             revenue.push(order.pay); // Sesuaikan dengan field revenue
//         });

//         return {
//             categories,
//             series: [
//                 { name: "Net Profit", data: netProfit },
//                 { name: "Revenue", data: revenue },
//             ]
//         };
//     };

//     // Perbarui chart saat `allOrders` berubah
//     useEffect(() => {
//         if (allOrders.length > 0) {
//             setChartData(transformDataForChart(allOrders));
//         }
//     }, [allOrders]);

//     console.log(chartData)

//     const columnChart = {
//         series: chartData.series,
//         options: {
//             chart: {
//                 height: 300,
//                 type: "bar",
//                 zoom: { enabled: false },
//                 toolbar: { show: false },
//             },
//             colors: ["#457B9D", "#E63946"],
//             dataLabels: { enabled: false },
//             stroke: { show: true, width: 2, colors: ["transparent"] },
//             plotOptions: {
//                 bar: {
//                     horizontal: false,
//                     columnWidth: "55%",
//                     endingShape: "rounded",
//                 },
//             },
//             grid: { borderColor: "#e0e6ed", xaxis: { lines: { show: false } } },
//             xaxis: {
//                 categories: chartData.categories,
//                 axisBorder: { color: "#e0e6ed" },
//             },
//             yaxis: {
//                 labels: { offsetX: 0 },
//             },
//             tooltip: {
//                 theme: "light",
//                 y: { formatter: (val: any) => val },
//             },
//         },
//     };

//     return (
//         <div className="grid xl:grid-cols-3 gap-6 mb-6">
//             <div className="panel p-0 xl:col-span-2">
//                 <div className="flex items-center justify-between dark:text-white-light mb-2 m-4">
//                     <p className="text-lg dark:text-white-light/90">
//                         Total Profit <span className="text-primary ml-2">${allOrders.reduce((acc, order) => acc + order.net_profit, 0)}</span>
//                     </p>
//                 </div>
//                 <ReactApexChart 
//                     series={columnChart.series} 
//                     options={columnChart.options} 
//                     className="rounded-lg bg-white dark:bg-black overflow-hidden" 
//                     type="bar" 
//                     height={300} 
//                 />
//             </div>
//         </div>
//     )
// }

// export default ChartReport;


// import ReactApexChart from "react-apexcharts";
// import Dropdown from "../../components/Dropdown";
// import IconHorizontalDots from "../../components/Icon/IconHorizontalDots";
// import { useSelector } from "react-redux";
// import { IRootState } from "../../store";
// import { useState, useEffect } from "react";

// const ChartReport = ({ allOrders }) => {
//     const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
//     const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

//     const [chartData, setChartData] = useState({ categories: [], series: [] });
//     const [filterType, setFilterType] = useState("Weekly");


//     const filterData = (orders, type) => {
//         const filteredOrders = orders.filter(order => {
//             const orderDate = new Date(order.order_date);
//             const now = new Date();

//             if (type === "Weekly") {
//                 console.log('halo')
//                 return orderDate >= new Date(now.setDate(now.getDate() - 7));
//             } else if (type === "Monthly") {
//                 return orderDate >= new Date(now.setMonth(now.getMonth() - 1));
//             } else if (type === "Yearly") {
//                 return orderDate >= new Date(now.setFullYear(now.getFullYear() - 1));
//             }
//             return true;
//         });

//         // console.log(filteredOrders)

//         const categories = filteredOrders.map(order => order.order_date);
//         const netProfit = filteredOrders.map(order => order.pay);
//         const revenue = filteredOrders.map(order => order.pay);

//         return {
//             categories,
//             series: [
//                 { name: "Net Profit", data: netProfit },
//                 { name: "Revenue", data: revenue },
//             ]
//         };
//     };

//     useEffect(() => {
//         if (allOrders.length > 0) {
//             setChartData(filterData(allOrders, filterType));
//         }
//     }, [allOrders, filterType]);

//     const handleChartUpdate = (type) => {
//         setFilterType(type);
//     };

//     console.log(chartData)

//     const columnChart = {
//         series: chartData.series,
//         options: {
//             chart: { height: 300, type: "bar", zoom: { enabled: false }, toolbar: { show: false } },
//             colors: ["#457B9D", "#E63946"],
//             dataLabels: { enabled: false },
//             stroke: { show: true, width: 2, colors: ["transparent"] },
//             plotOptions: { bar: { horizontal: false, columnWidth: "55%", endingShape: "rounded" } },
//             grid: { borderColor: "#e0e6ed", xaxis: { lines: { show: false } } },
//             xaxis: { categories: chartData.categories, axisBorder: { color: "#e0e6ed" } },
//             yaxis: { labels: { offsetX: 0 } },
//             tooltip: { theme: "light", y: { formatter: (val) => val } },
//         },
//     };

//     return (
//         <div className="grid xl:grid-cols-3 gap-6 mb-6">
//             <div className="panel p-0 xl:col-span-2">
//                 <div className="flex items-center justify-between dark:text-white-light mb-2 m-4">
//                     <p className="text-lg dark:text-white-light/90">
//                         Total Profit <span className="text-primary ml-2">${allOrders.reduce((acc, order) => acc + order.net_profit, 0)}</span>
//                     </p>
//                     <div className="dropdown">
//                         <Dropdown offset={[0, 1]} placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`} button={<IconHorizontalDots className="text-black/70 dark:text-white/70 hover:!text-primary" />}>
//                             <ul className="absolute bg-white dark:bg-gray-800 shadow-md mt-2 rounded-lg">
//                                 <li><button onClick={() => handleChartUpdate("Weekly")}>Weekly</button></li>
//                                 <li><button onClick={() => handleChartUpdate("Monthly")}>Monthly</button></li>
//                                 <li><button onClick={() => handleChartUpdate("Yearly")}>Yearly</button></li>
//                             </ul>
//                         </Dropdown>
//                     </div>
//                 </div>
//                 <ReactApexChart series={columnChart.series} options={columnChart.options} className="rounded-lg bg-white dark:bg-black overflow-hidden" type="bar" height={300} />
//             </div>
//         </div>
//     );
// };

// export default ChartReport;


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

// const ChartReport = ({ allOrders }) => {
const ChartReport: React.FC<{ allOrders: any[] }> = ({ allOrders }) => {
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
        if(allOrders) {
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

export default ChartReport;
