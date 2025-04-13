import { Fragment, useState } from "react";
import { useGetPlansQuery } from "../../redux/features/subscriptions/subscriptionsApi";
import IconArrowLeft from "../Icon/IconArrowLeft";
import { Dialog, Transition } from "@headlessui/react";
import IconX from "../Icon/IconX";
import PaymentModal from "../../pages/PaymentModal";

const PricingTableLanding = () => {
    const [yearlyPrice, setYearlyPrice] = useState<boolean>(false);
    const pathnames = location.pathname.split('/').filter((x) => x);
    const storeId = pathnames[0];
    const { data } = useGetPlansQuery(
        { storeId },
        { refetchOnMountOrArgChange: true }
    );

    // Filter harga berdasarkan interval yang dipilih
    const filteredPrices = (interval: string) => {
        return data?.filter((plan: any) => plan.interval === interval);
    };

    const prices = yearlyPrice ? filteredPrices("year") : filteredPrices("month");

    const [openModal, setOpenModal] = useState<any>(false);

  const [clientSecret, setClientSecret] = useState<string | null>(null);


  const handlePurchase = async () => {
    // Simulasi mengambil client_secret dari backend
    const response = await fetch(`${import.meta.env.VITE_SERVER_URI}create-payment-intent`, { method: "POST" });
    const data = await response.json();
    setClientSecret(data.client_secret);
    setOpenModal(true);
  };

    return (
        // <div className="max-w-[320px] md:max-w-[1140px] mx-auto dark:text-white-dark">
           // <div className="mt-5 md:mt-10 text-center flex justify-center space-x-4 rtl:space-x-reverse font-semibold text-base">
        <section className="relative md:py-24 py-16 bg-slate-50 dark:bg-slate-800" id="pricing">
            <div className="container relative">
                <div className="grid grid-cols-1 pb-6 text-center">
                    <h3 className="font-semibold text-2xl leading-normal mb-4">Our Subscriptions</h3>
                    <p className="text-slate-400 max-w-xl mx-auto">This is just a simple text made for this unique and awesome template, you can replace it with any text.</p>
                </div>
                <div className="max-w-[320px] md:max-w-[990px] mx-auto">
                    <div className="mt-5 md:mt-10 text-center flex justify-center space-x-4 rtl:space-x-reverse font-semibold text-base">
                        <span className={`${!yearlyPrice ? 'text-primary' : 'text-white-dark'}`}>Monthly</span>
                        <label className="w-12 h-6 relative">
                            <input
                                type="checkbox"
                                className="custom_switch absolute left-0 top-0 w-full h-full opacity-0 z-10 cursor-pointer peer"
                                onChange={() => setYearlyPrice(!yearlyPrice)}
                            />
                            <span className="outline_checkbox bg-icon border-2 border-[#ebedf2] dark:border-white-dark block h-full rounded-full before:absolute before:left-1 before:bg-[#ebedf2] dark:before:bg-white-dark before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:border-primary peer-checked:before:bg-primary before:transition-all before:duration-300"></span>
                        </label>
                        <span className={`relative ${yearlyPrice ? 'text-primary' : 'text-white-dark'}`}>
                            Yearly
                            <span className="badge bg-success rounded-full absolute left-full ml-2 hidden">20% Off</span>
                        </span>
                    </div>

                    {/* <div className="md:flex space-y-4 md:space-y-0 mt-5 md:mt-16 text-white-dark"> */}
                    <div className="md:flex justify-between mt-5 space-y-4 md:space-y-0 md:space-x-4 rtl:space-x-reverse">
                        {prices?.map((plan: any) => (
                            // <div key={plan.id} className="p-4 lg:p-9 border border-white-light dark:border-[#1b2e4b] rounded-md transition-all duration-300 hover:shadow-[0_0_15px_1px_rgba(113,106,202,0.20)]">
                            <div key={plan.id} className="p-3 lg:p-5 border border-black dark:border-[#2a3a53] text-center rounded group hover:border-primary">
                                <h3 className="text-xl mb-5 font-semibold dark:text-white-light">Package {plan.product}</h3>
                                <div className="border-t border-black dark:border-white-dark w-1/5 mx-auto my-6 group-hover:border-primary"></div>
                                <p>Best hosting package with premium features.</p>
                                <div className="my-7 p-2.5 text-center text-lg">
                                    <strong className="text-[#3b3f5c] dark:text-white-light text-xl lg:text-2xl">
                                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(plan.amount)}
                                    </strong> / {plan.interval}
                                </div>

                                <ul className="space-y-2.5 mb-5 font-semibold group-hover:text-primary">
                                    <li className="flex justify-center items-center">
                                        <IconArrowLeft className="w-3.5 h-3.5 ltr:mr-1 rtl:ml-1 rtl:rotate-180 shrink-0" />
                                        Free water saving e-book
                                    </li>
                                    <li className="flex justify-center items-center">
                                        <IconArrowLeft className="w-3.5 h-3.5 ltr:mr-1 rtl:ml-1 rtl:rotate-180 shrink-0" />
                                        Free access to forums
                                    </li>
                                    <li className="flex justify-center items-center">
                                        <IconArrowLeft className="w-3.5 h-3.5 ltr:mr-1 rtl:ml-1 rtl:rotate-180 shrink-0" />
                                        Beginners tips
                                    </li>
                                </ul>

                                <button 
                                    type="button" 
                                    // className="btn btn-dark w-full"
                                    className="btn shadow-none group-hover:text-primary group-hover:border-primary group-hover:bg-primary/10 dark:text-white-dark dark:border-white-dark/50 w-full"
                                    // onClick={() => setOpenModal(true)}
                                    onClick={handlePurchase}
                                >
                                    Buy Now
                                </button>
                            </div>
                        ))}
                    </div>

                    {clientSecret && (
                        <PaymentModal isOpen={openModal} closeModal={() => setOpenModal(false)} clientSecret={clientSecret} />
                    )} 
                </div>
            </div>
        </section>
    );
};

export default PricingTableLanding;