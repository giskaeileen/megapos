// export const PrintReceipt = (orderData: any) => {
//     const iframe = document.createElement("iframe");
//     iframe.style.position = "absolute";
//     iframe.style.width = "0px";
//     iframe.style.height = "0px";
//     iframe.style.border = "none";
//     document.body.appendChild(iframe);

//     const doc = iframe.contentWindow?.document;
//     if (!doc) return;

//     doc.write(`
//         <html>
//             <head>
//                 <title>Struk Pembayaran</title>
//                 <style>
//                     body {
//                         font-family: Arial, sans-serif;
//                         width: 80mm;
//                         padding: 10px;
//                     }
//                     .receipt-container {
//                         // border: 1px solid #ddd;
//                         padding: 10px;
//                         text-align: center;
//                     }
//                     h2 {
//                         margin-bottom: 5px;
//                     }
//                     .details {
//                         text-align: left;
//                         margin-bottom: 10px;
//                     }
//                     .details div {
//                         margin: 3px 0;
//                     }
//                     table {
//                         width: 100%;
//                         border-collapse: collapse;
//                         margin-bottom: 10px;
//                     }
//                     th, td {
//                         border-bottom: 1px dashed #000;
//                         padding: 5px;
//                         text-align: left;
//                         font-size: 12px;
//                     }
//                     th {
//                         text-align: right;
//                     }
//                     .total {
//                         font-size: 14px;
//                         font-weight: bold;
//                         text-align: right;
//                     }
//                     .thank-you {
//                         margin-top: 10px;
//                         font-size: 12px;
//                         text-align: center;
//                     }
//                     @media print {
//                         body {
//                             width: auto;
//                             margin: 0;
//                         }
//                     }
//                 </style>
//             </head>
//             <body>
//                 <div class="receipt-container">
//                     <h2>Nama Toko</h2>
//                     <p>Jl. Contoh No. 123, Kota, Negara</p>
//                     <hr />

//                     <div class="details">
//                         <div><b>Metode Pembayaran:</b> ${orderData.payment_status}</div>
//                         <div><b>Jumlah Produk:</b> ${orderData.total_products}</div>
//                         <div><b>Subtotal:</b> Rp${orderData.sub_total?.toLocaleString()}</div>
//                         <div><b>Total:</b> Rp${orderData.total?.toLocaleString()}</div>
//                     </div>

//                     <table>
//                         <thead>
//                             <tr>
//                                 <th>Item</th>
//                                 <th>Qty</th>
//                                 <th>Harga</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             ${orderData.cart.map((item: any) => `
//                                 <tr>
//                                     <td>${item.name}</td>
//                                     <td>${item.qty}</td>
//                                     <td>Rp${item.price?.toLocaleString()}</td>
//                                 </tr>
//                             `).join("")}
//                         </tbody>
//                     </table>

//                     <div class="total">
//                         Total: Rp${orderData.total?.toLocaleString()}
//                     </div>

//                     <div class="thank-you">
//                         Terima kasih telah berbelanja! <br />
//                         Semoga hari Anda menyenangkan.
//                     </div>
//                 </div>

//                 <script>
//                     window.onload = function() {
//                         window.print();
//                         setTimeout(() => {
//                             window.parent.document.body.removeChild(window.frameElement);
//                         }, 100);
//                     };
//                 </script>
//             </body>
//         </html>
//     `);

//     doc.close();
// };



// export const PrintReceipt = (orderData: any) => {
//     const iframe = document.createElement("iframe");
//     iframe.style.position = "absolute";
//     iframe.style.width = "0px";
//     iframe.style.height = "0px";
//     iframe.style.border = "none";
//     document.body.appendChild(iframe);

//     const doc = iframe.contentWindow?.document;
//     if (!doc) return;

//     doc.write(`
//         <html>
//             <head>
//                 <title>Payment Receipt</title>
//                 <style>
//                     body {
//                         font-family: Arial, sans-serif;
//                         width: 80mm;
//                         padding: 10px;
//                     }
//                     .receipt-container {
//                         text-align: center;
//                     }
//                     .header {
//                         text-align: center;
//                         margin-bottom: 10px;
//                     }
//                     .header img {
//                         width: 50px;
//                         height: 50px;
//                         margin-bottom: 5px;
//                     }
//                     .header h2 {
//                         margin: 5px 0;
//                         font-size: 16px;
//                     }
//                     .header p {
//                         font-size: 12px;
//                         margin: 0;
//                     }
//                     .details {
//                         text-align: left;
//                         margin-bottom: 10px;
//                     }
//                     .details div {
//                         margin: 3px 0;
//                     }
//                     table {
//                         width: 100%;
//                         border-collapse: collapse;
//                         margin-bottom: 10px;
//                     }
//                     th, td {
//                         border-bottom: 1px dashed #000;
//                         padding: 5px;
//                         text-align: left;
//                         font-size: 12px;
//                     }
//                     th {
//                         text-align: right;
//                     }
//                     .total {
//                         font-size: 14px;
//                         font-weight: bold;
//                         text-align: right;
//                     }
//                     .thank-you {
//                         margin-top: 10px;
//                         font-size: 12px;
//                         text-align: center;
//                     }
//                     @media print {
//                         body {
//                             width: auto;
//                             margin: 0;
//                         }
//                     }
//                 </style>
//             </head>
//             <body>
//                 <div class="receipt-container">
//                     <div class="header">
//                         <img src="your-logo-url.png" alt="POS Logo" />
//                         <h2>MyPOS System</h2>
//                         <p>ABC Store</p>
//                         <p>123 Sample St, City, Country</p>
//                         <hr />
//                     </div>

//                     <div class="details">
//                         <div><b>Payment Method:</b> ${orderData.payment_status}</div>
//                         <div><b>Total Items:</b> ${orderData.total_products}</div>
//                         <div><b>Subtotal:</b> Rp${orderData.sub_total?.toLocaleString()}</div>
//                         <div><b>Total:</b> Rp${orderData.total?.toLocaleString()}</div>
//                     </div>

//                     <table>
//                         <thead>
//                             <tr>
//                                 <th>Item</th>
//                                 <th>Qty</th>
//                                 <th>Price</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             ${orderData.cart.map((item: any) => `
//                                 <tr>
//                                     <td>${item.name ?? item.product_name}</td>
//                                     <td>${item.qty ?? item.quantity}</td>
//                                     <td>Rp${item.price?.toLocaleString() ?? item.unitcost?.toLocaleString()}</td>
//                                 </tr>
//                             `).join("")}
//                         </tbody>
//                     </table>

//                     <div class="total">
//                         Total: Rp${orderData.total?.toLocaleString()}
//                     </div>

//                     <div class="thank-you">
//                         Thank you for shopping with us! <br />
//                         Have a great day.
//                     </div>
//                 </div>

//                 <script>
//                     window.onload = function() {
//                         window.print();
//                         setTimeout(() => {
//                             window.parent.document.body.removeChild(window.frameElement);
//                         }, 100);
//                     };
//                 </script>
//             </body>
//         </html>
//     `);

//     doc.close();
// };


// export const PrintReceipt = (orderData: any) => {
//     interface Store {
//         slug: string;
//     }
//     interface User {
//         id: number;
//         photo: string;
//         name: string;
//         email: string;
//         roles: string[];
//         permissions: string[];
//         stores: Store[],
//     }
//     const user: User = JSON.parse(localStorage.getItem("user") || "{}");

//     console.log(user);

//     const iframe = document.createElement("iframe");
//     iframe.style.position = "absolute";
//     iframe.style.width = "0px";
//     iframe.style.height = "0px";
//     iframe.style.border = "none";
//     document.body.appendChild(iframe);

//     const doc = iframe.contentWindow?.document;
//     if (!doc) return;

//     doc.write(`
//         <html>
//             <head>
//                 <title>Payment Receipt</title>
//                 <style>
//                     body {
//                         font-family: Arial, sans-serif;
//                         width: 80mm;
//                         padding: 10px;
//                         text-align: center;
//                     }
//                     .receipt-container {
//                         padding: 10px;
//                     }
//                     .logo {
//                         max-width: 50px;
//                         margin-bottom: 5px;
//                     }
//                     h2 {
//                         margin: 5px 0;
//                         font-size: 18px;
//                     }
//                     .address {
//                         font-size: 12px;
//                         margin-bottom: 10px;
//                     }
//                     .details {
//                         text-align: left;
//                         margin-bottom: 10px;
//                         font-size: 12px;
//                     }
//                     .details div {
//                         margin: 3px 0;
//                     }
//                     table {
//                         width: 100%;
//                         border-collapse: collapse;
//                         margin-bottom: 10px;
//                         font-size: 12px;
//                     }
//                     th, td {
//                         border-bottom: 1px dashed #000;
//                         padding: 5px;
//                         text-align: left;
//                     }
//                     .total {
//                         font-size: 14px;
//                         font-weight: bold;
//                         text-align: right;
//                         margin-top: 10px;
//                     }
//                     .thank-you {
//                         margin-top: 10px;
//                         font-size: 12px;
//                         font-style: italic;
//                     }
//                     @media print {
//                         body {
//                             width: auto;
//                             margin: 0;
//                         }
//                     }

//                     .header {
//                         display: flex;
//                         align-items: center;
//                         justify-content: space-between;
//                         margin-bottom: 10px;
//                         text-align: left;
//                         font-size: 12px;
//                     }
//                 </style>
//             </head>
//             <body>
//                 <div class="receipt-container">
//                     <div class="header">
//                         <div class="store-info">
//                             <h2>MEGAPOS</h2>
//                             <div><b>${user?.stores[0]?.name}</b></div>
//                             <div>
//                                 ${[
//                                     user?.stores[0]?.zip, 
//                                     user?.stores[0]?.address, 
//                                     user?.stores[0]?.city, 
//                                     user?.stores[0]?.state, 
//                                     user?.stores[0]?.country
//                                 ]
//                                 .filter(Boolean) // Hapus nilai yang kosong/null/undefined
//                                 .join(", ")}
//                             </div>
//                         </div>
//                         <img src="/assets/images/logo.png" alt="Logo" class="logo" />
//                     </div>
//                     <hr>

//                     <div class="details">
//                         <div><b>Payment Method:</b> ${orderData.payment_status}</div>
//                         <div><b>Total Items:</b> ${orderData.total_products}</div>
//                         <!-- <div><b>Subtotal:</b> Rp${orderData.sub_total?.toLocaleString()}</div> -->
//                         <div><b>Total:</b> Rp${orderData.total?.toLocaleString()}</div>
//                     </div>

//                     <table>
//                         <thead>
//                             <tr>
//                                 <th>Item</th>
//                                 <th>Qty</th>
//                                 <th>Price</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             ${orderData.cart.map((item: any) => `
//                                 <tr>
//                                     <td>${item.name ?? item.product_name}</td>
//                                     <td>${item.qty ?? item.quantity}</td>
//                                     <td>Rp${item.price?.toLocaleString() ?? item.unitcost?.toLocaleString()}</td>
//                                 </tr>
//                             `).join("")}
//                         </tbody>
//                     </table>

//                     <div class="total">
//                         Total: Rp${orderData.total?.toLocaleString()}
//                     </div>

//                     <div class="thank-you">
//                         Thank you for your purchase! <br />
//                         Have a great day.
//                     </div>
//                 </div>

//                 <script>
//                     window.onload = function() {
//                         window.print();
//                         setTimeout(() => {
//                             window.parent.document.body.removeChild(window.frameElement);
//                         }, 100);
//                     };
//                 </script>
//             </body>
//         </html>
//     `);

//     doc.close();
// };



export const PrintReceipt = (orderData: any) => {
    interface Store {
        slug: string;
        name?: string;
        zip?: string;
        address?: string;
        city?: string;
        state?: string;
        country?: string;
    }
    interface User {
        id: number;
        photo: string;
        name: string;
        email: string;
        roles: string[];
        permissions: string[];
        stores: Store[];
    }

    const user: User = JSON.parse(localStorage.getItem("user") || "{}");

    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.write(`
        <html>
            <head>
                <title>Payment Receipt</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        width: 80mm;
                        padding: 10px;
                        text-align: center;
                    }
                    .receipt-container {
                        padding: 10px;
                    }
                    .logo {
                        max-width: 50px;
                        margin-left: 10px;
                    }
                    h2 {
                        margin: 5px 0;
                        font-size: 18px;
                    }
                    .address {
                        font-size: 12px;
                        margin-bottom: 10px;
                    }
                    .details {
                        text-align: left;
                        margin-bottom: 10px;
                        font-size: 12px;
                    }
                    .details div {
                        margin: 3px 0;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 10px;
                        font-size: 12px;
                    }
                    th, td {
                        border-bottom: 1px dashed #000;
                        padding: 5px;
                        text-align: left;
                    }
                    td:nth-child(3), th:nth-child(3) {
                        text-align: right;
                        white-space: nowrap;
                    }
                    .total {
                        font-size: 14px;
                        font-weight: bold;
                        text-align: right;
                        margin-top: 10px;
                    }
                    .thank-you {
                        margin-top: 10px;
                        font-size: 12px;
                        font-style: italic;
                    }
                    @media print {
                        body {
                            width: auto;
                            margin: 0;
                        }
                    }
                    .header {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        margin-bottom: 10px;
                        font-size: 12px;
                        gap: 24px;
                    }
                    .store-info {
                        text-align: left;
                        flex-grow: 1;
                    }
                </style>
            </head>
            <body>
                <div class="receipt-container">
                    <div class="header">
                        <div class="store-info">
                            <h2>MEGAPOS</h2>
                            <div><b>${user?.stores[0]?.name ?? "Unknown Store"}</b></div>
                            <div>
                                ${[
                                    user?.stores[0]?.zip, 
                                    user?.stores[0]?.address, 
                                    user?.stores[0]?.city, 
                                    user?.stores[0]?.state, 
                                    user?.stores[0]?.country
                                ]
                                .filter(Boolean) 
                                .join(", ")}
                            </div>
                        </div>
                        <img src="/assets/images/logo.png" alt="Logo" class="logo" />
                    </div>
                    <hr>

                    <div class="details">
                        <div><b>Payment Method:</b> ${orderData?.payment_status == "Cash" || orderData?.payment_status == "Cash Back" ? "Cash" : orderData?.payment_status ?? "N/A"}</div>
                        <div><b>Total Items:</b> ${orderData?.total_products ?? 0}</div>
                        <div><b>Total:</b> ${orderData?.total?.toLocaleString() ?? "0"}</div>
                        <div><b>Pay Return:</b> ${orderData?.pay_return?.toLocaleString() ?? "-"}</div>
                        ${orderData?.name_member ? `<div><b>Customer:</b> ${orderData.name_member}</div>` : "" }
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Qty</th>
                                <th>Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${orderData?.cart?.map((item: any) => `
                                <tr>
                                    <td>${item.name ?? item.product_name ?? "Unknown"}</td>
                                    <td>${item.qty ?? item.quantity ?? 0}</td>
                                    <td style="text-align: right; white-space: nowrap;">
                                        ${item.price?.toLocaleString() ?? item.unitcost?.toLocaleString() ?? "0"}
                                    </td>
                                </tr>
                            `).join("") ?? ""}
                        </tbody>
                    </table>

                    <div class="total" style="text-align: right;">
                        Total: ${orderData?.total?.toLocaleString() ?? "0"}
                    </div>

                    <div class="thank-you">
                        Thank you for your purchase! <br />
                        Have a great day.
                    </div>
                </div>

                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(() => {
                            window.parent.document.body.removeChild(window.frameElement);
                        }, 100);
                    };
                </script>
            </body>
        </html>
    `);

    doc.close();
};
