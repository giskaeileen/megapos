import { saveAs } from "file-saver";
import Papa from "papaparse";

const exportCSVOrderProduct = (orders: any[], columns: any[], filters: any, storeName: string, entity: string) => {
    const exportDate = new Date().toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    // **Header Informasi**
    const infoRows = [
        [`${entity}`],
        [`Store Name: ${storeName}`],
        [`Date Export: ${exportDate}`],
    ];

    if (filters.selectedDateFilter && filters.filterDateValue) {
        infoRows.push([`Date Filter: ${filters.selectedDateFilter} ${filters.filterDateValue}`]);
    }

    if (filters.selectedColumn) {
        infoRows.push([`Column Filter: ${filters.selectedColumn} = ${filters.filterValue}`]);
    }

    if (filters.rangeDateStart || filters.rangeDateEnd) {
        infoRows.push([`Date Range: ${filters.rangeDateStart || "-"} to ${filters.rangeDateEnd || "-"}`]);
    }

    if (filters.rangePriceMin || filters.rangePriceMax) {
        infoRows.push([`Price Range: ${filters.rangePriceMin || "-"} to ${filters.rangePriceMax || "-"}`]);
    }

    infoRows.push([""]); // Baris kosong sebagai pemisah

    // **Header Kolom**
    const tableHeaders = columns.map(col => col.title);

    // **Data Isi Tabel (Memperhitungkan Produk dalam Order)**
    const tableRows: any[] = [];

    orders.forEach((order, orderIndex) => {
        if (!order.products || order.products.length === 0) {
            // Jika order tidak punya produk, tetap tambahkan 1 baris data
            tableRows.push(
                columns.map(col => (col.accessor === "no" ? orderIndex + 1 : order[col.accessor] ?? "-"))
            );
        } else {
            order.products.forEach((product: any, productIndex: number) => {
                tableRows.push(
                    columns.map(col => {
                        if (col.accessor === "no") return orderIndex + 1; // Nomor urut order
                        if (col.accessor === "product_no") return productIndex + 1; // Nomor urut produk dalam order
                        return product[col.accessor] ?? order[col.accessor] ?? "-";
                    })
                );
            });
        }
    });

    // **Total Per Kolom**
    const sumColumns = columns.filter(col => col.isSummable).map(col => col.accessor);
    const totalRow = columns.map(col => {
        if (col.accessor === "no") return "Total";
        if (sumColumns.includes(col.accessor)) {
            return orders.reduce((sum, order) => {
                return sum + (parseFloat(order[col.accessor]) || 0);
            }, 0);
        }
        return "";
    });

    tableRows.push(totalRow);

    // **Gabungkan Data**
    const finalData = [...infoRows, tableHeaders, ...tableRows];

    // **Konversi ke CSV**
    const csvString = Papa.unparse(finalData, { delimiter: ",", quotes: true });

    // **Simpan File**
    const fileName = `Export_${entity}_${exportDate}.csv`;
    const csvBlob = new Blob([csvString], { type: "text/csv;charset=utf-8" });

    saveAs(csvBlob, fileName);
};

export default exportCSVOrderProduct;
