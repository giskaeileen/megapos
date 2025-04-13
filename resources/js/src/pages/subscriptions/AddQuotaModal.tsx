import React from 'react';
import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import IconX from '../../components/Icon/IconX';

interface AddQuotaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddQuota: (quota: { additional_transactions: number; additional_products: number; additional_employees: number; additional_stores: number }) => void;
}

const AddQuotaModal: React.FC<AddQuotaModalProps> = ({ isOpen, onClose, onAddQuota }) => {
    const [additionalQuota, setAdditionalQuota] = useState({
        additional_transactions: 0,
        additional_products: 0,
        additional_employees: 0,
        additional_stores: 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddQuota(additionalQuota);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" open={isOpen} onClose={onClose} className="relative z-[51]">
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/60" />
                </Transition.Child>

                <div className="fixed inset-0 flex items-center justify-center px-4 py-8">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        {/* <Dialog.Panel className="bg-white p-6 rounded-lg w-full max-w-md"> */}
                        <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg text-black dark:text-white-dark">
                            <button
                                type="button"
                                // onClick={() => setOpen(false)}
                                onClick={onClose}
                                className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                            >
                                <IconX />
                            </button>
                            <h2 className="text-xl font-bold ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">Add Quota</h2>
                            <div className="p-5">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Quota Transactions</label>
                                            <input
                                                type="number"
                                                value={additionalQuota.additional_transactions}
                                                onChange={(e) =>
                                                    setAdditionalQuota({
                                                        ...additionalQuota,
                                                        additional_transactions: parseInt(e.target.value, 10),
                                                    })
                                                }
                                                className="w-full border border-gray-300 rounded-md p-2"
                                                min="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Quota Products</label>
                                            <input
                                                type="number"
                                                value={additionalQuota.additional_products}
                                                onChange={(e) =>
                                                    setAdditionalQuota({
                                                        ...additionalQuota,
                                                        additional_products: parseInt(e.target.value, 10),
                                                    })
                                                }
                                                className="w-full border border-gray-300 rounded-md p-2"
                                                min="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Quota Employees</label>
                                            <input
                                                type="number"
                                                value={additionalQuota.additional_employees}
                                                onChange={(e) =>
                                                    setAdditionalQuota({
                                                        ...additionalQuota,
                                                        additional_employees: parseInt(e.target.value, 10),
                                                    })
                                                }
                                                className="w-full border border-gray-300 rounded-md p-2"
                                                min="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Quota Stores</label>
                                            <input
                                                type="number"
                                                value={additionalQuota.additional_stores}
                                                onChange={(e) =>
                                                    setAdditionalQuota({
                                                        ...additionalQuota,
                                                        additional_stores: parseInt(e.target.value, 10),
                                                    })
                                                }
                                                className="w-full border border-gray-300 rounded-md p-2"
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                        {/* <button type="button" onClick={onClose} className="btn btn-warning">
                                        Cancle 
                                    </button> */}
                                        <button type="submit" className="btn btn-primary">
                                            Add Quota
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    );
};

export default AddQuotaModal;
