import { saveAs } from "file-saver";
import Papa from "papaparse";

const exportCSV = (data: any, cols: any, filters: any, storeName: any, entity: any) => {
    const exportDate = new Date().toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    // **Header Informasi**
    const infoRows = [
        [`${entity}`],
        [`Nama Toko: ${storeName}`],
        [`Tanggal Export: ${exportDate}`],
    ];

    if (filters.selectedDateFilter && filters.filterDateValue) {
        infoRows.push([
            `Date Filter: ${filters.selectedDateFilter} ${filters.filterDateValue}`,
        ]);
    }

    if (filters.selectedColumn) {
        infoRows.push([
            `Column Filter: ${filters.selectedColumn} = ${filters.filterValue}`,
        ]);
    }

    if (filters.rangeDateStart || filters.rangeDateEnd) {
        infoRows.push([
            `Date Range: ${filters.rangeDateStart || "-"} to ${filters.rangeDateEnd || "-"}`,
        ]);
    }

    if (filters.rangePriceMin || filters.rangePriceMax) {
        infoRows.push([
            `Price Range: ${filters.rangePriceMin || "-"} to ${filters.rangePriceMax || "-"}`,
        ]);
    }

    infoRows.push([""]); // Baris kosong sebagai pemisah

    // **Header Kolom**
    const tableHeaders = cols
        // .filter(col => col.accessor !== "created_at")
        .map((col: any) => col.title);

    // **Data Isi Tabel**
    const tableRows = data.map((row: any, index: any) =>
        cols
            // .filter(col => col.accessor !== "created_at")
            .map((col: any) => (col.accessor === "no" ? index + 1 : row[col.accessor] ?? "-"))
    );

    // **Total Per Kolom**
    const sumColumns = cols.filter((col: any) => col.isSummable).map((col: any) => col.accessor);
    const totalRow = cols
        // .filter(col => col.accessor !== "created_at")
        .map((col: any) => {
            if (col.accessor === "no") return "Total";
            if (sumColumns.includes(col.accessor)) {
                return data.reduce(
                    (sum: any, row: any) => sum + (parseFloat(row[col.accessor]) || 0),
                    0
                );
            }
            return "";
        });

    tableRows.push(totalRow);

    // **Gabungkan Data**
    const finalData = [...infoRows, tableHeaders, ...tableRows];

    // **Konversi ke CSV**
    const csvString = Papa.unparse(finalData, { delimiter: "," });

    // **Simpan File**
    const fileName = `Export_${entity}_${exportDate}.csv`;
    const csvBlob = new Blob([csvString], { type: "text/csv;charset=utf-8" });

    saveAs(csvBlob, fileName);
};

export default exportCSV;
