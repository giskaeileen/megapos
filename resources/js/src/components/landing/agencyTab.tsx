import React, { useState } from "react";
import { Link } from "react-router-dom";

import blog1 from '../../assets/landing/images/blog/01.jpg'
import blog2 from '../../assets/landing/images/ag-error.jpg'
import blog3 from '../../assets/landing/images/ag-time.jpg'
import { useTranslation } from "react-i18next";

// export default function AgencyTab(){
const AgencyTab = () => {
    const [ activeIndex, setActiveIndex ] = useState(1)
    const { t } = useTranslation();

    return(
        <section className="realtive md:py-24 py-16">
            <div className="container relative">
                <div className="grid grid-cols-1 pb-6 text-center">
                    <h3 className="font-semibold text-2xl leading-normal mb-4">{t('MEGAPOS Advantages')}</h3>

                    <p className="text-slate-400 max-w-xl mx-auto">{t('What Makes MEGAPOS Different.')}</p>
                </div>

                <div className="grid md:grid-cols-12 grid-cols-1 mt-6 gap-6">
                    <div className="lg:col-span-4 md:col-span-5">
                        <div className="sticky top-20">
                            <ul className="flex-column p-6 bg-white dark:bg-slate-900 shadow dark:shadow-gray-700 rounded-md">
                                <li role="presentation">
                                    <button className={`px-4 py-2 text-start text-base font-medium rounded-md w-full hover:text-teal-500 duration-500 ${activeIndex === 1 ? 'text-white bg-teal-500 hover:text-white' : ''}`} onClick={() => setActiveIndex(1)}>
                                        {/* <span className="block">Step 1</span> */}
                                        <span className="text-lg mt-2 block">{t('Boost Business Efficiency')}</span>
                                        <span className="block mt-2">{t('MEGAPOS helps save time and costs in managing cash registers and inventory.')}</span>
                                    </button>
                                </li>
                                <li role="presentation">
                                    <button className={`px-4 py-2 text-start text-base font-medium rounded-md w-full mt-6 hover:text-teal-500 duration-500 ${activeIndex === 2 ? 'text-white bg-teal-500 hover:text-white' : ''}`} onClick={() => setActiveIndex(2)}>
                                        {/* <span className="block">Step 2</span> */}
                                        <span className="text-lg mt-2 block">{t('Reduce Errors')}</span>
                                        <span className="block mt-2">{t('Our system minimizes errors in cash register and inventory management.')}</span>
                                    </button>
                                </li>
                                <li role="presentation">
                                    <button className={`px-4 py-2 text-start text-base font-medium rounded-md w-full mt-6 hover:text-teal-500 duration-500 ${activeIndex === 3 ? 'text-white bg-teal-500 hover:text-white' : ''}`} onClick={() => setActiveIndex(3)}>
                                        {/* <span className="block">Step 3</span> */}
                                        <span className="text-lg mt-2 block">{t('Save Time')}</span>
                                        <span className="block mt-2">{t('Automate processes so you can focus on other essential aspects of your business.')}</span>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="lg:col-span-8 md:col-span-7">
                        <div id="myTabContent" className="p-6 bg-white dark:bg-slate-900 shadow dark:shadow-gray-700 rounded-md">
                            <div className={activeIndex === 1 ? '' : 'hidden' }>
                                <img src={blog1} className="shadow dark:shadow-gray-700 rounded-md" alt=""/>

                                <div className="mt-6">
                                    <h5 className="text-lg font-medium">{t('Boost Business Efficiency')}</h5>
                                    <p className="text-slate-400 mt-4">
                                        {/* Lorem ipsum dolor sit amet, consectetur adipisicing elit. Itaque, impedit vitae. Nobis, similique omnis cumque sapiente laboriosam animi quod cupiditate? */}
                                        {t('With MEGAPOS, you can save time and costs in managing your cash register and inventory. Our system helps automate these processes, allowing you to focus on more important aspects of your business. This way, you can improve overall efficiency and reduce operational costs.')}
                                    </p>
                                    {/* <div className="mt-4">
                                        <Link to="" className="text-teal-500">{t('Read More')} <i className="mdi mdi-chevron-right align-middle"></i></Link>
                                    </div> */}
                                </div>
                            </div>
                            <div className={activeIndex === 2 ? '' : 'hidden' }>
                                <img src={blog2} className="shadow dark:shadow-gray-700 rounded-md" alt=""/>

                                <div className="mt-6">
                                    <h5 className="text-lg font-medium">{t('Reduce Errors')}</h5>
                                    <p className="text-slate-400 mt-4">
                                        {/* Lorem ipsum dolor sit amet, consectetur adipisicing elit. Itaque, impedit vitae. Nobis, similique omnis cumque sapiente laboriosam animi quod cupiditate? */}
                                        {t('Our system helps minimize errors in cash register and inventory management. By using MEGAPOS, you can avoid human mistakes that may lead to business losses. It also helps detect and correct any errors, ensuring minimal impact on your business operations.')}
                                    </p>
                                    <div className="mt-4">
                                        <Link to="" className="text-teal-500">{t('Read More')} <i className="mdi mdi-chevron-right align-middle"></i></Link>
                                    </div>
                                </div>
                            </div>
                            <div className={activeIndex === 3 ? '' : 'hidden' }>
                                <img src={blog3} className="shadow dark:shadow-gray-700 rounded-md" alt=""/>

                                <div className="mt-6">
                                    <h5 className="text-lg font-medium">{t('Save Time')}</h5>
                                    <p className="text-slate-400 mt-4">
                                        {/* Lorem ipsum dolor sit amet, consectetur adipisicing elit. Itaque, impedit vitae. Nobis, similique omnis cumque sapiente laboriosam animi quod cupiditate? */}
                                        {t('Our system saves you time in managing your cash register and inventory. MEGAPOS automates these processes, allowing you to focus on more important business activities. This leads to better time management and higher productivity.')}
                                    </p>
                                    <div className="mt-4">
                                        <Link to="" className="text-teal-500">{t('Read More')} <i className="mdi mdi-chevron-right align-middle"></i></Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default AgencyTab;