import { Link, NavLink } from "react-router-dom";

import '../../assets/landing/css/tailwind.css'
import '../../assets/landing/css/materialdesignicons.min.css'

import heroImg from "../../assets/landing/images/hero.png"
import bg from '../../assets/landing/images/bg/2.png'

import CountUp from "react-countup";
import Switcher from "../../components/landing/switcher";
import Navbar from "../../components/landing/navbar";
import About from "../../components/landing/about";
import Services from "../../components/landing/services";
import AgencyTab from "../../components/landing/agencyTab";
import PricingTableLanding from "../../components/landing/PricingTableLanding";
import Footer from "../../components/Layouts/Footer";
import { useTranslation } from "react-i18next";

const IndexThree: React.FC = () => {
    const { t } = useTranslation();
    
    return (
        <div className="dark:bg-slate-900 dark:text-white">
            <Navbar/>
            <section 
                className="relative flex items-center md:h-screen py-36 bg-no-repeat bg-center bg-cover" 
                id="home" 
                style={{ backgroundImage: `url(${bg})` }}
            >
                <div className="container relative">
                    <div className="grid lg:grid-cols-12 md:grid-cols-2 grid-cols-1 items-center mt-6 gap-6 relative">
                        <div className="lg:col-span-7 md:me-6">
                            <h4 className="font-semibold lg:leading-normal leading-normal tracking-wide text-4xl lg:text-5xl mb-5">
                                {/* Revolutionizing Your <span className="text-teal-500 font-bold">Business</span> with Upcover */}
                                {/* Manage Your <span className="text-teal-500 font-bold">Store Business</span> Smarter */}
                                {t('Manage Your Store Business Smarter')}
                            </h4>
                            <p className="text-slate-400 text-lg max-w-xl">
                                {/* This is just a simple text made for this unique and awesome template, you can replace it with any text. */}
                                {t('Simplify cash management and improve business efficiency with MEGAPOS.')}
                            </p>
                            <div className="relative mt-6 space-x-1">
                                {/* <NavLink 
                                    to="/store-registration" 
                                    className="h-10 px-6 tracking-wide inline-flex items-center justify-center font-medium rounded-md bg-teal-500 text-white"
                                >
                                   {t('Register Store')}
                                </NavLink> */}
                                <a 
                                    href="/store-registration"
                                    className="h-10 px-6 tracking-wide inline-flex items-center justify-center font-medium rounded-md bg-teal-500 text-white"
                                >
                                   {t('Register Store')}
                                </a>
                            </div>
                        </div>

                        <div className="lg:col-span-5">
                            <div className="relative">
                                <img 
                                    src={heroImg} 
                                    className="mx-auto rounded-[150px] rounded-br-2xl shadow dark:shadow-gray-700 w-[90%]" 
                                    alt="Hero"
                                />
                                {/* <div className="absolute flex justify-between items-center bottom-16 md:-start-10 -start-5 p-4 rounded-lg shadow-md dark:shadow-gray-800 bg-white dark:bg-slate-900 w-60 m-3">
                                    <div className="flex items-center">
                                        <div className="flex items-center justify-center h-[65px] min-w-[65px] bg-teal-500/5 text-teal-500 text-center rounded-full me-3">
                                            <FiMonitor className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1">
                                            <span className="text-slate-400">Visitor</span>
                                            <p className="text-xl font-bold">
                                                <CountUp className="counter-value" start={0} end={4589} />
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-red-600">
                                        <i className="uil uil-chart-down"></i> 0.5%
                                    </span>
                                </div>

                                <div className="absolute top-16 md:-end-10 -end-5 p-4 rounded-lg shadow-md dark:shadow-gray-800 bg-white dark:bg-slate-900 w-48 m-3">
                                    <h5 className="text-lg font-semibold mb-3">Manage Software</h5>
                                    <div className="flex justify-between mt-3 mb-2">
                                        <span className="text-slate-400">Progress</span>
                                        <span className="text-slate-400">84%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-[6px]">
                                        <div className="bg-teal-500 h-[6px] rounded-full" style={{ width: "84%" }}></div>
                                    </div>
                                </div> */}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Switcher/>
            <About/>
            <Services/>
            <AgencyTab/>
            {/* <PricingTableLanding/> */}
            <Footer/>
        </div>
    );
};

export default IndexThree;