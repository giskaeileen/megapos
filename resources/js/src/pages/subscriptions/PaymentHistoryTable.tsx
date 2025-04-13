import React, { useState } from 'react';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useDisclosure } from '@mantine/hooks';
import { Collapse } from '@mantine/core';
import Dropdown from '../../components/Dropdown';
import IconCaretDown from '../../components/Icon/IconCaretDown';
import { formatRupiah } from '../../components/tools';

interface PaymentHistoryTableProps {
    data: any[];
    totalRecords: number;
    page: number;
    pageSize: number;
    sortStatus: DataTableSortStatus;
    hideCols: string[];
    isRtl: boolean;
    onPageChange: (page: number) => void;
    onSortStatusChange: (sortStatus: DataTableSortStatus) => void;
    onSelectedRecordsChange: (records: any[]) => void;
    selectedColumn: string;
    filterValue: string;
    onColumnChange: (column: string) => void;
    onFilterChange: (value: string) => void;
    search: string;
    onSearchChange: (value: string) => void;
    onToggleColumn: (column: string) => void;
}

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

    const renderQuotaDetails = ({ quota_details }: { quota_details: any }) => {
        const [opened, { toggle }] = useDisclosure(false);
        const isSimpleQuota = !('additional_transactions' in quota_details);

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

        return (
            <div>
                <div className="flex items-center gap-2 mb-1 cursor-pointer" onClick={toggle}>
                    {quota_details.additional_transactions > 0 && <span className="badge bg-primary rounded-full">+T: {quota_details.additional_transactions}</span>}
                    {quota_details.additional_products > 0 && <span className="badge bg-primary rounded-full">+P: {quota_details.additional_products}</span>}
                    {quota_details.additional_employees > 0 && <span className="badge bg-primary rounded-full">+E: {quota_details.additional_employees}</span>}
                    {quota_details.additional_stores > 0 && <span className="badge bg-primary rounded-full">+S: {quota_details.additional_stores}</span>}
                </div>

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
        <div className="panel px-0 border-white-light dark:border-[#1b2e4b]">
            <div className="invoice-table">
                <div className="mb-4.5 px-5 flex md:items-center md:flex-row flex-col gap-5">
                    <div className="flex md:items-center md:flex-row flex-col gap-5">
                        <div className="dropdown">
                            <Dropdown
                                placement={`${isRtl ? 'bottom-end' : 'bottom-start'}`}
                                btnClassName="!flex items-center border font-semibold border-white-light dark:border-[#253b5c] rounded-md px-4 py-2 text-sm dark:bg-[#1b2e4b] dark:text-white-dark"
                                button={
                                    <>
                                        <span className="ltr:mr-1 rtl:ml-1">Columns</span>
                                        <IconCaretDown className="w-5 h-5" />
                                    </>
                                }
                            >
                                <ul className="!min-w-[140px]">
                                    {cols
                                        .filter((col) => col.accessor !== 'photo')
                                        .map((col, i) => (
                                            <li key={i} className="flex flex-col" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center px-4 py-1">
                                                    <label className="cursor-pointer mb-0">
                                                        <input type="checkbox" checked={!hideCols.includes(col.accessor)} className="form-checkbox" onChange={() => onToggleColumn(col.accessor)} />
                                                        <span className="ltr:ml-2 rtl:mr-2">{col.title}</span>
                                                    </label>
                                                </div>
                                            </li>
                                        ))}
                                </ul>
                            </Dropdown>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <select value={selectedColumn} onChange={(e) => onColumnChange(e.target.value)} className="form-select">
                            <option value="">Column Filter</option>
                            {cols
                                .filter((col) => col.accessor !== 'no' && col.accessor !== 'photo' && col.accessor !== 'role' && col.accessor !== 'created_at')
                                .map((col) => (
                                    <option key={col.accessor} value={col.accessor}>
                                        {col.title}
                                    </option>
                                ))}
                        </select>

                        <input type="text" value={filterValue} onChange={(e) => onFilterChange(e.target.value)} placeholder="Enter value filter" className="form-input" />
                    </div>

                    <div className="ltr:ml-auto rtl:mr-auto">
                        <input type="text" className="form-input w-auto" placeholder="Search..." value={search} onChange={(e) => onSearchChange(e.target.value)} />
                    </div>
                </div>

                <div className="datatables pagination-padding">
                    <DataTable
                        className="whitespace-nowrap table-hover invoice-table"
                        records={data}
                        columns={[
                            {
                                accessor: 'no',
                                sortable: true,
                                hidden: hideCols.includes('no'),
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
                                render: renderQuotaDetails,
                                hidden: hideCols.includes('quota_details'),
                            },
                            {
                                accessor: 'amount',
                                sortable: true,
                                hidden: hideCols.includes('amount'),
                                render: ({ amount }) => <div className="text-right">{formatRupiah(amount)}</div>,
                            },
                            {
                                accessor: 'created_at',
                                sortable: true,
                                hidden: hideCols.includes('created_at'),
                            },
                        ]}
                        highlightOnHover
                        totalRecords={totalRecords}
                        recordsPerPage={pageSize}
                        page={page}
                        onPageChange={onPageChange}
                        sortStatus={sortStatus}
                        onSortStatusChange={onSortStatusChange}
                        onSelectedRecordsChange={onSelectedRecordsChange}
                        paginationText={({ from, to, totalRecords }) => `Showing ${from} to ${to} of ${totalRecords} entries`}
                    />
                </div>
            </div>
        </div>
    );
};

export default PaymentHistoryTable;
