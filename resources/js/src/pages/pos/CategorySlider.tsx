import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper';
import IconCaretDown from '../../components/Icon/IconCaretDown';

interface CategorySliderProps {
    categories: any[];
    selectedCategory: string;
    handleCategoryClick: (category: string) => void;
    themeConfig: any;
}

const CategorySlider: React.FC<CategorySliderProps> = ({ categories, selectedCategory, handleCategoryClick, themeConfig }) => {
    const totalItems = categories?.length || 0;

    const calculateEmptySlides = (totalItems: any, slidesPerView: any) => {
        const remainder = totalItems % slidesPerView;
        const kurang = totalItems - slidesPerView;
        if (kurang < 0) {
            return slidesPerView - totalItems;
        } else {
            return 0;
        }
    };

    const breakpoints: Record<string, { slidesPerView: number }> = {
        '1440': { slidesPerView: 6 },
        '1024': { slidesPerView: 4 },
        '900': { slidesPerView: 3 },
        '768': { slidesPerView: 2 },
        '320': { slidesPerView: 1 },
    };

    const currentBreakpoint =
        Object.keys(breakpoints)
            .map(Number) // Konversi key dari string ke number
            .sort((a, b) => b - a) // Urutkan dari besar ke kecil
            .find((bp) => window.innerWidth >= bp) || 320; // 320 sebagai default number

    const slidesPerView = breakpoints[currentBreakpoint.toString()].slidesPerView;
    const emptySlides = calculateEmptySlides(totalItems, slidesPerView);

    return (
        <div className="swiper mt-4" id="slider5">
            <div className="swiper-wrapper">
                <Swiper
                    modules={[Navigation, Pagination]}
                    navigation={{
                        nextEl: '.swiper-button-next-ex5',
                        prevEl: '.swiper-button-prev-ex5',
                    }}
                    pagination={{
                        clickable: true,
                    }}
                    breakpoints={{
                        1440: {
                            slidesPerView: 6,
                            spaceBetween: 10,
                        },
                        1024: {
                            slidesPerView: 4,
                            spaceBetween: 10,
                        },
                        900: {
                            slidesPerView: 3,
                            spaceBetween: 10,
                        },
                        768: {
                            slidesPerView: 2,
                            spaceBetween: 10,
                        },
                        320: {
                            slidesPerView: 1,
                            spaceBetween: 10,
                        },
                    }}
                    dir={themeConfig.rtlClass}
                    key={themeConfig.rtlClass === 'rtl' ? 'true' : 'false'}
                >
                    {categories?.map((item: any, i: number) => (
                        <SwiperSlide key={i}>
                            <button
                                type="button"
                                className={`btn btn-lg rounded-full w-full ${
                                    selectedCategory == item.id
                                        ? 'bg-secondary text-white border-none' // Gaya jika kategori dipilih
                                        : 'bg-secondary-light text-secondary btn-outline-info border-none hover:bg-secondary-light hover:text-secondary' // Gaya default
                                }`}
                                onClick={() => handleCategoryClick(item.id)}
                            >
                                {item.name || 'Primary'}
                            </button>
                        </SwiperSlide>
                    ))}

                    {/* Render elemen kosong sebagai penutup */}
                    {Array.from({ length: emptySlides }).map((_, i) => (
                        <SwiperSlide key={`empty-${i}`}>{/* Elemen kosong */}</SwiperSlide>
                    ))}
                </Swiper>
            </div>
            <button className="swiper-button-prev-ex5 grid place-content-center ltr:left-2 rtl:right-2 p-1 transition text-primary hover:text-white border border-primary  hover:border-primary hover:bg-primary rounded-full absolute z-[999] top-[25%] -translate-y-1/2">
                <IconCaretDown className="w-5 h-5 rtl:-rotate-90 rotate-90" />
            </button>
            <button className="swiper-button-next-ex5 grid place-content-center ltr:right-2 rtl:left-2 p-1 transition text-primary hover:text-white border border-primary  hover:border-primary hover:bg-primary rounded-full absolute z-[999] top-[25%] -translate-y-1/2">
                <IconCaretDown className="w-5 h-5 rtl:rotate-90 -rotate-90" />
            </button>
        </div>
    );
};

export default CategorySlider;
