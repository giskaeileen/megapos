import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const exportXLSXOrderProduct = (data: any, cols: any, filters: any, storeName: any, entity: any) => {
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

    // **Header Order**
    const orderHeaders = ["No", "Invoice No", "Order Date", "Status", "Total Products", "Total Amount", "Payment Method"];

    // **Header Produk**
    const productHeaders = ["", "Product Name", "Quantity", "Unit Price", "Subtotal"];

    // **Data Order dan Produk**
    let tableRows: any[] = [];

    data.forEach((order: any, index: number) => {
        // Tambahkan Order
        tableRows.push([
            index + 1,
            order.invoice_no,
            order.order_date,
            order.order_status,
            order.total_products,
            order.total,
            order.payment_status
        ]);

        // Tambahkan Produk di bawah Order
        order.products.forEach((product: any) => {
            tableRows.push([
                "", // Kosong untuk memisahkan dengan order
                product.product.product_name,
                product.quantity,
                product.unitcost,
                product.total
            ]);
        });

        tableRows.push([""]); // Baris kosong untuk pemisah antara order
    });

    // **Total Global**
    const totalGlobalRow = [
        "Summary Total",
        "",
        "",
        "",
        data.reduce((sum: number, order: any) => sum + order.total_products, 0),
        data.reduce((sum: number, order: any) => sum + order.total, 0),
        ""
    ];

    tableRows.push(totalGlobalRow);

    // **Gabungkan Semua Data**
    const finalData = [...infoRows, orderHeaders, ...tableRows];

    // **Buat Workbook & Sheet**
    const ws = XLSX.utils.aoa_to_sheet(finalData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Export");

    // **Simpan File**
    const fileName = `Export_${entity}_${exportDate}.xlsx`;
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const excelBlob = new Blob([excelBuffer], { type: "application/octet-stream" });

    saveAs(excelBlob, fileName);
};

export default exportXLSXOrderProduct;
