// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";

// const exportPDF = (data: any, cols: any, filters: any, storeName: any, entity: any) => {
//     const doc = new jsPDF();
//     doc.text(entity, 14, 14);

//     let startY = 24; // Awal posisi Y untuk teks filter

//     const exportDate = new Date().toLocaleDateString("id-ID", {
//         year: "numeric",
//         month: "long",
//         day: "numeric"
//     });

//     // **Menampilkan Informasi Filter di PDF**
//     doc.setFontSize(10);
    
//     // Tambahkan Nama Toko
//     doc.text(`Nama Toko: ${storeName}`, 14, startY);
//     startY += 6;

//     // Tambahkan Judul Laporan
//     doc.text(`Tanggal Export: ${exportDate}`, 14, startY);
//     startY += 6;

//     if (filters.selectedDateFilter && filters.filterDateValue) {
//         doc.text(`Date Filter: ${filters.selectedDateFilter || "-"} ${filters.filterDateValue || ""}`, 14, startY);
//         startY += 6;
//     }

//     if (filters.selectedColumn) {
//         doc.text(`Column Filter: ${filters.selectedColumn ? filters.selectedColumn + " = " + filters.filterValue : "None"}`, 14, startY);
//         startY += 6;
//     }

//     if (filters.rangeDateStart || filters.rangeDateEnd) {
//         doc.text(`Date Range: ${filters.rangeDateStart || "-"} to ${filters.rangeDateEnd || "-"}`, 14, startY);
//         startY += 6;
//     }

//     if (filters.rangePriceMin || filters.rangePriceMax) {
//         doc.text(`Price Range: ${filters.rangePriceMin || "-"} to ${filters.rangePriceMax || "-"}`, 14, startY);
//         startY += 6;
//     }

//     // Ambil header tabel dari cols
//     const tableColumn = cols
//         // .filter(col => col.accessor !== "created_at")
//         .map((col: any) => col.title);

//     // Identifikasi kolom yang bisa dijumlahkan
//     const sumColumns = cols.filter((col: any) => col.isSummable).map((col: any) => col.accessor);

//     // Ambil data dari data dengan kolom yang sesuai dari cols
//     const tableRows = data.map((row: any, index: number) => {
//         return cols
//             // .filter(col => col.accessor !== "created_at")
//             .map((col: any) => {
//                 if (col.accessor === "no") return index + 1; // Nomor urut
//                 return row[col.accessor] ?? "-"; // Isi data sesuai accessor
//             });
//     });

//     // Hitung total per kolom
//     const totalRow = cols
//         // .filter(col => col.accessor !== "created_at")
//         .map((col: any) => {
//             if (col.accessor === "no") return "Total"; // Label di kolom pertama
//             if (sumColumns.includes(col.accessor)) {
//                 return data.reduce((sum: any, row: any) => sum + (parseFloat(row[col.accessor]) || 0), 0);
//             }
//             return ""; // Biarkan kosong jika tidak bisa di-total
//         });

//     // Tambahkan totalRow ke tableRows
//     tableRows.push(totalRow);

//     // **Tampilkan Tabel**
//     autoTable(doc, {
//         startY: startY + 6,
//         head: [tableColumn],
//         body: tableRows,
//         styles: { fontSize: 8, cellPadding: 2 },
//     });

//     // **Pratinjau PDF di Tab Baru**
//     const pdfBlob = doc.output("blob");
//     const blobUrl = URL.createObjectURL(pdfBlob);
//     window.open(blobUrl);
// };

// export default exportPDF;


import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const exportPDF = (data: any, cols: any, filters: any, storeName: any, entity: any) => {
    const doc = new jsPDF();
    doc.text(entity, 14, 14);

    let startY = 24; // Awal posisi Y untuk teks filter

    const exportDate = new Date().toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });

    // **Menampilkan Informasi Filter di PDF**
    doc.setFontSize(10);
    
    // Tambahkan Nama Toko
    doc.text(`Store Name: ${storeName}`, 14, startY);
    startY += 6;

    // Tambahkan Judul Laporan
    doc.text(`Export Date: ${exportDate}`, 14, startY);
    startY += 6;

    if (filters.selectedDateFilter && filters.filterDateValue) {
        doc.text(`Date Filter: ${filters.selectedDateFilter || "-"} ${filters.filterDateValue || ""}`, 14, startY);
        startY += 6;
    }

    if (filters.selectedColumn) {
        doc.text(`Column Filter: ${filters.selectedColumn ? filters.selectedColumn + " = " + filters.filterValue : "None"}`, 14, startY);
        startY += 6;
    }

    if (filters.rangeDateStart || filters.rangeDateEnd) {
        doc.text(`Date Range: ${filters.rangeDateStart || "-"} to ${filters.rangeDateEnd || "-"}`, 14, startY);
        startY += 6;
    }

    if (filters.rangePriceMin || filters.rangePriceMax) {
        doc.text(`Price Range: ${filters.rangePriceMin || "-"} to ${filters.rangePriceMax || "-"}`, 14, startY);
        startY += 6;
    }

    // Ambil header tabel dari cols
    const tableColumn = cols.map((col: any) => col.title);

    // Identifikasi kolom yang harus diformat
    const formattedColumns = ["sub_total", "total", "pay"];

    // Ambil data dari data dengan format yang sesuai
    const tableRows = data.map((row: any, index: number) => {
        return cols.map((col: any) => {
            if (col.accessor === "no") return index + 1; // Nomor urut
            if (formattedColumns.includes(col.accessor)) {
                return (row[col.accessor] ?? 0).toLocaleString(); // Format angka ke IDR
            }
            return row[col.accessor] ?? "-"; // Isi data sesuai accessor
        });
    });

    // Hitung total per kolom
    const totalRow = cols.map((col: any) => {
        if (col.accessor === "no") return "Total"; // Label di kolom pertama
        if (formattedColumns.includes(col.accessor)) {
            return data
                .reduce((sum: number, row: any) => sum + (parseFloat(row[col.accessor]) || 0), 0)
                .toLocaleString();
        }
        return ""; // Biarkan kosong jika tidak bisa di-total
    });

    // Tambahkan totalRow ke tableRows
    tableRows.push(totalRow);

    // **Tampilkan Tabel dengan AutoTable**
    autoTable(doc, {
        startY: startY + 6,
        head: [tableColumn],
        body: tableRows,
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
            // [cols.findIndex((col: any) => formattedColumns.includes(col.accessor))]: { halign: "right" }
            [tableColumn.indexOf("Sub Total")]: { halign: "right" },
            [tableColumn.indexOf("Total")]: { halign: "right" },
            [tableColumn.indexOf("Pay")]: { halign: "right" }
        }
    });

    // **Pratinjau PDF di Tab Baru**
    const pdfBlob = doc.output("blob");
    const blobUrl = URL.createObjectURL(pdfBlob);
    window.open(blobUrl);
};

export default exportPDF;
