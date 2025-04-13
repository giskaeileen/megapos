import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const exportPDFOrderProduct = (data: any, cols: any, filters: any, storeName: any, entity: any) => {
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
    
    doc.text(`Store Name: ${storeName}`, 14, startY);
    startY += 6;
    doc.text(`Date Export: ${exportDate}`, 14, startY);
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

    startY += 6; // Beri jarak sebelum tabel

    let totalGlobal = {
        subTotal: 0,
        totalQty: 0,
        totalAmount: 0
    };

    data.forEach((order: any, index: any) => {
        // Header Order
        doc.setFontSize(12);
        doc.text(`Order #${order.invoice_no}`, 14, startY);
        startY += 6;
        doc.setFontSize(10);
        doc.text(`Date: ${order.order_date}`, 14, startY);
        doc.text(`Status: ${order.order_status}`, 90, startY);
        doc.text(`Total Product: ${order.total_products}`, 160, startY);
        startY += 6;
        doc.text(`Total: ${order.total.toLocaleString()}`, 14, startY);
        doc.text(`Payment Method: ${order.payment_status}`, 90, startY);
        startY += 8;

        // Tabel Produk
        const productColumns = ["No", "Product", "Qty", "Price", "Subtotal"];
        const productRows = order.products.map((product: any, i: any) => {
            totalGlobal.totalQty += product.quantity;
            totalGlobal.totalAmount += product.total;

            return [
                i + 1,
                product?.product?.product_name,
                product.quantity,
                `${product.unitcost.toLocaleString()}`,
                `${product.total.toLocaleString()}`
            ];
        });

        autoTable(doc, {
            startY,
            head: [productColumns],
            body: productRows,
            styles: { 
                fontSize: 8, cellPadding: 2 
            },
            columnStyles: {
                [productColumns.indexOf("Price")]: { halign: "right" },
                [productColumns.indexOf("Subtotal")]: { halign: "right" }
            },
            didParseCell: function (data) {
                if (data.section === "head" && (data.column.index === productColumns.indexOf("Price") || data.column.index === productColumns.indexOf("Subtotal"))) {
                    data.cell.styles.halign = "right"; // Header "Price" dan "Subtotal" rata kanan
                }
            }
        });

        // startY = doc.lastAutoTable.finalY + 10; // Update startY setelah tabel produk
        const typedDoc = doc as jsPDF & { lastAutoTable?: { finalY: number } };
        startY = typedDoc.lastAutoTable?.finalY ? typedDoc.lastAutoTable.finalY + 10 : 30;

        if (index < data.length - 1) {
            doc.line(14, startY, 200, startY); // Garis pemisah antar order
            startY += 10;
        }
    });

    // **Tabel Total Global**
    startY += 10;
    doc.setFontSize(12);
    doc.text("Summary Total", 14, startY);
    startY += 6;

    autoTable(doc, {
        startY,
        head: [["Total Quantity", "Total Amount"]],
        body: [[
            totalGlobal.totalQty,
            `${totalGlobal.totalAmount.toLocaleString()}`
        ]],
        styles: { fontSize: 10, cellPadding: 3 },
    });

    // **Pratinjau PDF di Tab Baru**
    const pdfBlob = doc.output("blob");
    const blobUrl = URL.createObjectURL(pdfBlob);
    window.open(blobUrl);
};

export default exportPDFOrderProduct;