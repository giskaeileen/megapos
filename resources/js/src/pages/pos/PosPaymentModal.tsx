import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FC, Fragment } from 'react';
import IconX from '../../components/Icon/IconX';
import MidtransPayment from '../MidtransPayment';

type Props = {
    addContactModal: any;
    setAddContactModal: any;
    paymentMethods: any;
    selectedPaymentMethod: any;
    handlePaymentMethodClick: any;
    totalPrice: any;
    inputValue: any;
    handlePayChange: any;
    handleButtonClick: any;
    pay: any;
    paymentStatus: any;
    handlePaymentStatusChange: any;
    saveOrder: any;
    handleTotalPriceChange: any;
    noRekening: any;
    nameRekening: any;
    handleNoRekeningChange: any;
    handleNameRekeningChange: any;
    createMidtransToken: any;
    dataMidtransToken: any;
    customer: any;
    quantity: any;
    subTotalPrice: any;
    storeId: any;
    setPaymentStatus: any;
    setPay: any;
    dataCart: any;
    additionalOptions: any;
    setAdditionalOptions: any;
    setDataCart: any;
    setTotalPrice: any;
};

const PosPaymentModal: FC<Props> = ({
    addContactModal,
    setAddContactModal,
    paymentMethods,
    selectedPaymentMethod,
    handlePaymentMethodClick,
    totalPrice,
    inputValue,
    handlePayChange,
    handleButtonClick,
    pay,
    paymentStatus,
    handlePaymentStatusChange,
    saveOrder,
    handleTotalPriceChange,
    noRekening,
    nameRekening,
    handleNoRekeningChange,
    handleNameRekeningChange,
    createMidtransToken,
    dataMidtransToken,
    customer,
    quantity,
    subTotalPrice,
    storeId,
    setPaymentStatus,
    setPay,
    dataCart,
    additionalOptions,
    setAdditionalOptions,
    setDataCart,
    setTotalPrice,
}) => {
    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = event.target;
        setAdditionalOptions((prev: any) => ({
            ...prev,
            [name]: checked,
        }));
    };

    return (
        <Transition appear show={addContactModal} as={Fragment}>
            <Dialog as="div" open={addContactModal} onClose={() => setAddContactModal(false)} className="relative z-[51]">
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-[black]/60" />
                </Transition.Child>
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center px-4 py-8">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg text-black dark:text-white-dark">
                                <button
                                    type="button"
                                    onClick={() => setAddContactModal(false)}
                                    className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                                >
                                    <IconX />
                                </button>
                                <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">Payment</div>
                                <div className="p-5">
                                    <form>
                                        <div className="mb-5 grid lg:grid-cols-2 grid-cols-1 gap-6">
                                            {paymentMethods.map((method: any) => (
                                                <button
                                                    type="button"
                                                    key={method}
                                                    className={`btn btn-lg rounded-full py-4 ${
                                                        selectedPaymentMethod === method ? 'btn-outline-info hover:bg-inherit hover:text-info' : 'btn-info'
                                                    } gap-2`}
                                                    onClick={() => handlePaymentMethodClick(method)}
                                                >
                                                    {/* <IconDownload /> */}
                                                    {method}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="mb-4 flex gap-2">
                                            <label className="w-12 h-6 relative">
                                                <input
                                                    type="checkbox"
                                                    name="printReceipt"
                                                    checked={additionalOptions.printReceipt}
                                                    onChange={handleCheckboxChange}
                                                    className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer"
                                                    id="custom_switch_checkbox1"
                                                />
                                                <span className="bg-[#ebedf2] dark:bg-dark block h-full rounded-full before:absolute before:left-1 before:bg-white dark:before:bg-white-dark dark:peer-checked:before:bg-white before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:bg-primary before:transition-all before:duration-300"></span>
                                            </label>
                                            Print Invoice
                                            {/* <label className="w-12 h-6 relative">
                                                <input 
                                                    type="checkbox" 
                                                    className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer" id="custom_switch_checkbox1" 
                                                />
                                                <span className="bg-[#ebedf2] dark:bg-dark block h-full rounded-full before:absolute before:left-1 before:bg-white dark:before:bg-white-dark dark:peer-checked:before:bg-white before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:bg-primary before:transition-all before:duration-300"></span>
                                            </label> */}
                                        </div>

                                        {selectedPaymentMethod === 'Cash' && (
                                            <div className="flex flex-col items-center">
                                                <div className="flex justify-between flex-col gap-6 w-72">
                                                    <div>
                                                        <div className="flex items-center w-full justify-between mb-2">
                                                            <div className="text-white-dark">Total Bill:</div>
                                                            <div>{totalPrice}</div>
                                                        </div>
                                                        <div className="flex items-center w-full justify-between mb-2">
                                                            <div className="text-white-dark">Payment:</div>
                                                            <div>{inputValue || totalPrice}</div>
                                                        </div>
                                                        <div className="flex items-center w-full justify-between mb-2">
                                                            <div className="text-white-dark">Change:</div>
                                                            <div>{(inputValue || totalPrice) - totalPrice}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <input
                                                    type="number"
                                                    value={inputValue || totalPrice}
                                                    onChange={handlePayChange}
                                                    className="mb-4 p-3 border rounded text-center text-lg w-full max-w-md"
                                                />
                                                <div className="grid grid-cols-3 gap-4 max-w-md">
                                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                                                        <button type="button" key={num} className="btn btn-primary text-lg py-3" onClick={() => handleButtonClick(num.toString())}>
                                                            {num}
                                                        </button>
                                                    ))}
                                                    <button type="button" className="btn btn-warning text-lg py-3" onClick={() => handleButtonClick('clear')}>
                                                        Clear
                                                    </button>
                                                    {[0].map((num) => (
                                                        <button type="button" key={num} className="btn btn-primary text-lg py-3" onClick={() => handleButtonClick(num.toString())}>
                                                            {num}
                                                        </button>
                                                    ))}
                                                    <button type="button" className="btn btn-danger text-lg py-3" onClick={() => handleButtonClick('backspace')}>
                                                        ⌫
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {selectedPaymentMethod === 'Transfer' && (
                                            <div>
                                                <div className="mb-5">
                                                    <label htmlFor="name">Ammount</label>
                                                    <input id="pay" type="number" placeholder="Enter Ammount" className="form-input" value={totalPrice} onChange={handleTotalPriceChange} />
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="name">Bank</label>
                                                    <select id="bank_name" className="form-select text-white-dark" value={paymentStatus} onChange={handlePaymentStatusChange}>
                                                        <option value="">Choose...</option>
                                                        <option value="BRI">BRI</option>
                                                        <option value="BCA">BCA</option>
                                                    </select>
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="name">No Rekening</label>
                                                    <input id="pay" type="number" placeholder="Enter Ammount" className="form-input" value={noRekening} onChange={handleNoRekeningChange} />
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="name">Nama Rekening</label>
                                                    <input id="pay" type="text" placeholder="Enter Ammount" className="form-input" value={nameRekening} onChange={handleNameRekeningChange} />
                                                </div>
                                            </div>
                                        )}

                                        {selectedPaymentMethod && (selectedPaymentMethod !== 'Uang Kembali' || inputValue >= totalPrice) && selectedPaymentMethod !== 'Wallet' && (
                                            <div className="flex justify-end items-center mt-8">
                                                <button type="button" className="btn btn-lg rounded-full py-4 btn-primary w-full" onClick={saveOrder}>
                                                    Pay
                                                </button>
                                            </div>
                                        )}

                                        {selectedPaymentMethod === 'Wallet' && (
                                            <MidtransPayment
                                                createMidtransToken={createMidtransToken}
                                                dataMidtransToken={dataMidtransToken}
                                                customer={customer}
                                                selectedPaymentMethod={selectedPaymentMethod}
                                                totalPrice={totalPrice}
                                                paymentStatus={paymentStatus}
                                                noRekening={noRekening}
                                                nameRekening={nameRekening}
                                                quantity={quantity}
                                                subTotalPrice={subTotalPrice}
                                                storeId={storeId}
                                                setPaymentStatus={setPaymentStatus}
                                                setPay={setPay}
                                                saveOrder={saveOrder}
                                                dataCart={dataCart}
                                                setDataCart={setDataCart}
                                                setTotalPrice={setTotalPrice}
                                                setAddContactModal={setAddContactModal}
                                            />
                                        )}
                                    </form>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default PosPaymentModal;
