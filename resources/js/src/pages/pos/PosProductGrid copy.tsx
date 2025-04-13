import { FC } from "react";
import IconCaretDown from "../../components/Icon/IconCaretDown";
import IconPlus from "../../components/Icon/IconPlus";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination, Autoplay } from 'swiper';
import { useSelector } from "react-redux";
import { IRootState } from "../../redux/store";

type Props = {
    filteredItems: any;
    handlePageChange: any;
    page: any;
    total: any;
    pageSize: any;
    addPos: any;
    isOpen: any;
};

const PosProductGrid: FC<Props> = ({
  filteredItems,
  handlePageChange,
  page,
  total,
  pageSize,
  addPos,
  isOpen,
}) => {

    console.log(filteredItems);

    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const items = [
        'carousel1.jpeg', 
        'carousel2.jpeg', 
        'carousel3.jpeg'
    ];

    return (
        <div>
            <div className={`grid lg:grid-cols-2 ${isOpen ? "xl:grid-cols-3" : "lg:grid-cols-3 xl:grid-cols-4"} grid-cols-1 gap-6 mt-5 w-full`}>
                {Array.isArray(filteredItems) && filteredItems?.map((d: any) => {
                    return (
                        <div className="bg-white dark:bg-[#1c232f] rounded-md overflow-hidden text-center shadow relative" key={d.id}>
                            <div className="bg-white dark:bg-[#1c232f] rounded-md overflow-hidden text-center shadow relative">
                                <div
                                    className="bg-white/40 rounded-t-md bg-center bg-cover pb-0 bg-"
                                >
                                    <Swiper
                                        modules={[Navigation, Pagination]}
                                        navigation={{ nextEl: '.swiper-button-next-ex1', prevEl: '.swiper-button-prev-ex1' }}
                                        pagination={{ clickable: true }}
                                        className="swiper max-w-3xl mx-auto mb-5"
                                        id="slider1"
                                        dir={themeConfig.rtlClass}
                                        key={themeConfig.rtlClass === 'rtl' ? 'true' : 'false'}
                                    >
                                        <div className="swiper-wrapper">
                                            {items.map((item, i) => {
                                                return (
                                                    <SwiperSlide key={i}>
                                                        <img src={`/assets/images/${item}`} className="w-full max-h-80 object-cover" alt="itemImage" />
                                                    </SwiperSlide>
                                                );
                                            })}
                                        </div>
                                        <button className="swiper-button-prev-ex1 grid place-content-center ltr:left-2 rtl:right-2 p-1 transition text-primary hover:text-white border border-primary  hover:border-primary hover:bg-primary rounded-full absolute z-[999] top-1/2 -translate-y-1/2">
                                            <IconCaretDown className="w-5 h-5 rtl:-rotate-90 rotate-90" />
                                        </button>
                                        <button className="swiper-button-next-ex1 grid place-content-center ltr:right-2 rtl:left-2 p-1 transition text-primary hover:text-white border border-primary  hover:border-primary hover:bg-primary rounded-full absolute z-[999] top-1/2 -translate-y-1/2">
                                            <IconCaretDown className="w-5 h-5 rtl:rotate-90 -rotate-90" />
                                        </button>
                                    </Swiper>
                                    <span className="absolute top-2 right-2 badge bg-warning rounded-full">Primary</span>
                                </div>
                                <div className="px-6 pb-6 -mt-10 relative">
                                    <div className="mt-16 grid grid-cols-1 gap-2 ltr:text-left rtl:text-right">
                                        <div className="flex items-center">
                                            <div className="flex-none ltr:mr-2 rtl:ml-2 text-base">{d.product_name}</div>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="truncate text-white-dark">Lorem Ipsum</div>
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <div>
                                                <div className="text-white-dark line-through">{d.selling_price}000</div>
                                                <div className="text-primary text-base font-bold">{d.selling_price}000</div>
                                            </div>
                                            <button type="button" className="btn btn-outline-primary w-10 h-10 p-0 rounded-full" onClick={() => addPos(d)}>
                                                <IconPlus />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Pagination */}
            <div className="flex m-4 justify-center">
                <ul className="inline-flex items-center space-x-1 rtl:space-x-reverse">
                    <li>
                        <button
                            type="button"
                            onClick={() => handlePageChange(page - 1)}
                            className="flex justify-center font-semibold p-2 rounded-full transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary"
                            disabled={page === 1}
                        >
                            <IconCaretDown className="w-5 h-5 rotate-90 rtl:-rotate-90" />
                        </button>
                    </li>
                    {Array.from({ length: Math.ceil(total / pageSize) }, (_, idx) => (
                        <li key={idx}>
                            <button
                                type="button"
                                onClick={() => handlePageChange(idx + 1)}
                                className={`flex justify-center font-semibold px-3.5 py-2 rounded-full transition ${
                                    page === idx + 1
                                        ? "bg-primary text-white"
                                        : "bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary"
                                }`}
                            >
                                {idx + 1}
                            </button>
                        </li>
                    ))}
                    <li>
                        <button
                            type="button"
                            onClick={() => handlePageChange(page + 1)}
                            className="flex justify-center font-semibold p-2 rounded-full transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary"
                            disabled={page === Math.ceil(total / pageSize)}
                        >
                            <IconCaretDown className="w-5 h-5 -rotate-90 rtl:rotate-90" />
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default PosProductGrid;