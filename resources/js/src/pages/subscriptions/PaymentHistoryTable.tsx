import React, { useState } from 'react';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useDisclosure } from '@mantine/hooks';
import { Collapse } from '@mantine/core';
import Dropdown from '../../components/Dropdown';
import IconCaretDown from '../../components/Icon/IconCaretDown';
import { formatRupiah } from '../../components/tools';

// Mendefinisikan interface atau tipe props yang dibutuhkan oleh komponen PaymentHistoryTable
interface PaymentHistoryTableProps {
    data: any[]; // Data tabel yang akan ditampilkan
    totalRecords: number; // Total jumlah data (untuk keperluan pagination)
    page: number; // Halaman saat ini
    pageSize: number; // Jumlah data per halaman
    sortStatus: DataTableSortStatus; // Status urutan kolom (naik/turun)
    hideCols: string[]; // Daftar kolom yang disembunyikan
    isRtl: boolean; // Apakah layout menggunakan right-to-left (misal: bahasa Arab)
    onPageChange: (page: number) => void; // Fungsi untuk menangani perubahan halaman
    onSortStatusChange: (sortStatus: DataTableSortStatus) => void; // Fungsi untuk menangani perubahan sorting
    onSelectedRecordsChange: (records: any[]) => void; // Fungsi untuk menangani perubahan data yang dipilih
    selectedColumn: string; // Kolom yang sedang difilter
    filterValue: string; // Nilai filter saat ini
    onColumnChange: (column: string) => void; // Fungsi untuk mengganti kolom filter
    onFilterChange: (value: string) => void; // Fungsi untuk mengganti nilai filter
    search: string; // Kata kunci pencarian
    onSearchChange: (value: string) => void; // Fungsi untuk menangani perubahan kata kunci pencarian
    onToggleColumn: (column: string) => void; // Fungsi untuk menyembunyikan/menampilkan kolom tertentu
}

// Komponen utama PaymentHistoryTable
const PaymentHistoryTable: React.FC<PaymentHistoryTableProps> = ({
    data,
    totalRecords,
    page,
    pageSize,
    sortStatus,
    hideCols,
    isRtl,
    onPageChange,
    onSortStatusChange,
    onSelectedRecordsChange,
    selectedColumn,
    filterValue,
    onColumnChange,
    onFilterChange,
    search,
    onSearchChange,
    onToggleColumn,
}) => {
    // Daftar kolom tabel yang akan ditampilkan
    const cols = [
        { accessor: 'no', title: 'No' },
        { accessor: 'order_id', title: 'Order ID' },
        { accessor: 'amount', title: 'Amount' },
        { accessor: 'status', title: 'Status' },
        { accessor: 'payment_method', title: 'Payment Method' },
        { accessor: 'transaction_id', title: 'Transaction ID' },
        { accessor: 'quota_details', title: 'Quota Details' },
        { accessor: 'transaction_time', title: 'Transaction Time' },
        { accessor: 'created_at', title: 'Created At' },
    ];

    // Fungsi untuk merender detail kuota pada kolom `quota_details`
    const renderQuotaDetails = ({ quota_details }: { quota_details: any }) => {
        // Gunakan hook dari Mantine (atau custom) untuk mengatur collapse/expand tampilan detail
        const [opened, { toggle }] = useDisclosure(false);

        // Mengecek apakah data kuota menggunakan struktur sederhana (tidak ada penambahan kuota)
        const isSimpleQuota = !('additional_transactions' in quota_details);

        // Jika data kuota sederhana, tampilkan badge langsung
        if (isSimpleQuota) {
            return (
                <div className="flex items-center gap-2">
                    <span className="badge bg-dark rounded-full">T: {quota_details.transactions}</span>
                    <span className="badge bg-dark rounded-full">P: {quota_details.products}</span>
                    <span className="badge bg-dark rounded-full">E: {quota_details.employees}</span>
                    <span className="badge bg-dark rounded-full">S: {quota_details.stores}</span>
                </div>
            );
        }

        // Jika data kuota kompleks (ada penambahan kuota), tampilkan detail dengan collapse
        return (
            <div>
                {/* Bagian yang bisa di-klik untuk toggle detail */}
                <div className="flex items-center gap-2 mb-1 cursor-pointer" onClick={toggle}>
                    {quota_details.additional_transactions > 0 && (
                        <span className="badge bg-primary rounded-full">
                            +T: {quota_details.additional_transactions}
                        </span>
                    )}
                    {quota_details.additional_products > 0 && (
                        <span className="badge bg-primary rounded-full">
                            +P: {quota_details.additional_products}
                        </span>
                    )}
                    {quota_details.additional_employees > 0 && (
                        <span className="badge bg-primary rounded-full">
                            +E: {quota_details.additional_employees}
                        </span>
                    )}
                    {quota_details.additional_stores > 0 && (
                        <span className="badge bg-primary rounded-full">
                            +S: {quota_details.additional_stores}
                        </span>
                    )}
                </div>

                {/* Detail tambahan ditampilkan jika collapse dibuka */}
                <Collapse in={opened}>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="badge bg-dark rounded-full">
                            T: {quota_details.current_transactions} → {quota_details.new_transactions}
                        </span>
                        <span className="badge bg-dark rounded-full">
                            P: {quota_details.current_products} → {quota_details.new_products}
                        </span>
                        <span className="badge bg-dark rounded-full">
                            E: {quota_details.current_employees} → {quota_details.new_employees}
                        </span>
                        <span className="badge bg-dark rounded-full">
                            S: {quota_details.current_stores} → {quota_details.new_stores}
                        </span>
                    </div>
                </Collapse>
            </div>
        );
    };


    return (
        // Panel utama yang membungkus seluruh komponen tabel invoice
        <div className="panel px-0 border-white-light dark:border-[#1b2e4b]">
            <div className="invoice-table">
                
                {/* Bagian atas tabel yang berisi filter kolom, filter data per kolom, dan pencarian */}
                <div className="mb-4.5 px-5 flex md:items-center md:flex-row flex-col gap-5">
                    <div className="flex md:items-center md:flex-row flex-col gap-5">

                        {/* Dropdown untuk toggle kolom yang ingin ditampilkan/sembunyikan */}
                        <div className="dropdown">
                            <Dropdown
                                placement={`${isRtl ? 'bottom-end' : 'bottom-start'}`} // Posisi dropdown disesuaikan dengan arah layout
                                btnClassName="!flex items-center border font-semibold border-white-light dark:border-[#253b5c] rounded-md px-4 py-2 text-sm dark:bg-[#1b2e4b] dark:text-white-dark"
                                button={
                                    <>
                                        <span className="ltr:mr-1 rtl:ml-1">Columns</span>
                                        <IconCaretDown className="w-5 h-5" /> {/* Icon panah bawah */}
                                    </>
                                }
                            >
                                {/* Isi dropdown berupa daftar kolom yang dapat disembunyikan/ditampilkan */}
                                <ul className="!min-w-[140px]">
                                    {cols
                                        .filter((col) => col.accessor !== 'photo') // Kolom foto tidak ditampilkan di dropdown
                                        .map((col, i) => (
                                            <li key={i} className="flex flex-col" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center px-4 py-1">
                                                    <label className="cursor-pointer mb-0">
                                                        {/* Checkbox untuk toggle kolom */}
                                                        <input
                                                            type="checkbox"
                                                            checked={!hideCols.includes(col.accessor)} // Jika kolom tidak disembunyikan maka dicentang
                                                            className="form-checkbox"
                                                            onChange={() => onToggleColumn(col.accessor)} // Fungsi toggle kolom
                                                        />
                                                        <span className="ltr:ml-2 rtl:mr-2">{col.title}</span>
                                                    </label>
                                                </div>
                                            </li>
                                        ))}
                                </ul>
                            </Dropdown>
                        </div>
                    </div>

                    {/* Filter data berdasarkan kolom dan nilai spesifik */}
                    <div className="flex gap-3">
                        {/* Dropdown untuk memilih kolom yang ingin difilter */}
                        <select value={selectedColumn} onChange={(e) => onColumnChange(e.target.value)} className="form-select">
                            <option value="">Column Filter</option>
                            {cols
                                .filter((col) =>
                                    col.accessor !== 'no' &&
                                    col.accessor !== 'photo' &&
                                    col.accessor !== 'role' &&
                                    col.accessor !== 'created_at'
                                )
                                .map((col) => (
                                    <option key={col.accessor} value={col.accessor}>
                                        {col.title}
                                    </option>
                                ))}
                        </select>

                        {/* Input nilai filter */}
                        <input
                            type="text"
                            value={filterValue}
                            onChange={(e) => onFilterChange(e.target.value)}
                            placeholder="Enter value filter"
                            className="form-input"
                        />
                    </div>

                    {/* Kolom pencarian global */}
                    <div className="ltr:ml-auto rtl:mr-auto">
                        <input
                            type="text"
                            className="form-input w-auto"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)} // Fungsi pencarian
                        />
                    </div>
                </div>

                {/* Komponen DataTable utama yang menampilkan data */}
                <div className="datatables pagination-padding">
                    <DataTable
                        className="whitespace-nowrap table-hover invoice-table" // Styling tabel
                        records={data} // Data yang akan ditampilkan
                        columns={[
                            {
                                accessor: 'no',
                                sortable: true, // Kolom bisa diurutkan
                                hidden: hideCols.includes('no'), // Disembunyikan jika ada di hideCols
                            },
                            {
                                accessor: 'order_id',
                                sortable: true,
                                hidden: hideCols.includes('order_id'),
                            },
                            {
                                accessor: 'status',
                                sortable: true,
                                hidden: hideCols.includes('status'),
                            },
                            {
                                accessor: 'quota_details',
                                title: 'Quota Details',
                                render: renderQuotaDetails, // Menggunakan fungsi render khusus untuk menampilkan kuota
                                hidden: hideCols.includes('quota_details'),
                            },
                            {
                                accessor: 'amount',
                                sortable: true,
                                hidden: hideCols.includes('amount'),
                                render: ({ amount }) => (
                                    <div className="text-right">{formatRupiah(amount)}</div> // Format angka jadi rupiah
                                ),
                            },
                            {
                                accessor: 'created_at',
                                sortable: true,
                                hidden: hideCols.includes('created_at'),
                            },
                        ]}
                        highlightOnHover // Baris akan disorot saat hover
                        totalRecords={totalRecords} // Total data (untuk pagination)
                        recordsPerPage={pageSize} // Jumlah data per halaman
                        page={page} // Halaman saat ini
                        onPageChange={onPageChange} // Fungsi untuk mengganti halaman
                        sortStatus={sortStatus} // Status sorting saat ini
                        onSortStatusChange={onSortStatusChange} // Fungsi ketika sorting berubah
                        onSelectedRecordsChange={onSelectedRecordsChange} // Fungsi saat pemilihan data berubah
                        paginationText={({ from, to, totalRecords }) => `Showing ${from} to ${to} of ${totalRecords} entries`} // Teks pagination
                    />
                </div>
            </div>
        </div>

    );
};

export default PaymentHistoryTable;
