import React,{useState, useEffect} from "react";
import { Link } from "react-router-dom";
import Dropdown from '../Dropdown';
// import {FiSun, FiMoon} from '../assets/icons/vander'

import i18next from "i18next";
const languageList = [
    { code: "en", name: "English" },
    { code: "id", name: "Indonesian" },
];

// export default function Switcher(){
const Switcher: React.FC = () => {
    const [scroll, setScroll] = useState(false);

    useEffect(() => {
        window.addEventListener("scroll", () => {
            setScroll(window.scrollY > 50);
        });
        return()=>{
            window.removeEventListener("scroll", () => {
                setScroll(window.scrollY > 50);
            });
        }
    }, []);

    // const themChange = () =>{
    //     const htmlTag = document.getElementsByTagName("html")[0]
            
    //         if (htmlTag.className.includes("dark")) {
    //             htmlTag.className = 'light'
    //         } else {
    //             htmlTag.className = 'dark'
    //         }
    // }

    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

    useEffect(() => {
        // Set theme pada <html> berdasarkan state
        const htmlTag = document.documentElement;
        htmlTag.className = theme;
        localStorage.setItem("theme", theme);
    }, [theme]);

    // Fungsi untuk toggle theme
    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    };

    const modeChange = (e: any) =>{
        const htmlTag = document.getElementsByTagName("html")[0]
        if(e.target.innerText === "LTR"){
            htmlTag.dir = "ltr"
        }
        else{
            htmlTag.dir = "rtl"
        }
    }

    const scrollTop = () =>{
        window.scrollTo({ 
            top: 0,  
            behavior: 'smooth'
          });
    }

    // const [locale, setLocale] = useState(i18next.language);

    const [locale, setLocale] = useState(i18next.language);
    const [isDropdownOpen, setDropdownOpen] = useState(false);

    // Toggle dropdown ketika button diklik
    const toggleDropdown = () => {
        setDropdownOpen(!isDropdownOpen);
    };

    // Fungsi untuk mengubah bahasa
    const changeLanguage = (code: any) => {
        i18next.changeLanguage(code);
        setLocale(code);
        setDropdownOpen(false); // Tutup dropdown setelah memilih bahasa
    };


    return(
        <>
            <Link to="#" onClick={()=>scrollTop()} id="back-to-top" className={`back-to-top fixed text-lg rounded-full z-10 bottom-5 right-5 size-9 text-center bg-teal-500 text-white leading-9 ${scroll ? 'block' : 'hidden' }`}><i className="mdi mdi-arrow-up"></i></Link>
            <div className="fixed top-1/4 -right-1 z-3">
                <span className="relative inline-block rotate-90">
                    <input
                        type="checkbox"
                        className="checkbox opacity-0 absolute"
                        id="chk"
                        checked={theme === "dark"}
                        onChange={toggleTheme}
                    />
                    <label
                        className="label bg-slate-900 dark:bg-white shadow dark:shadow-gray-800 cursor-pointer rounded-full flex justify-between items-center p-1 w-14 h-8"
                        htmlFor="chk"
                    >
                        <span className="ball bg-white dark:bg-slate-900 rounded-full absolute top-[2px] left-[2px] size-7"></span>
                    </label>
                </span>
            </div>

            <div className="fixed top-[40%] -right-3 z-50">
                <Link to="" id="switchRtl">
                    <span className="py-1 px-3 relative inline-block rounded-t-md -rotate-90 bg-white dark:bg-slate-900 shadow-md dark:shadow dark:shadow-gray-800 font-medium rtl:block ltr:hidden" onClick={(e)=>modeChange(e)}>LTR</span>
                    <span className="py-1 px-3 relative inline-block rounded-t-md -rotate-90 bg-white dark:bg-slate-900 shadow-md dark:shadow dark:shadow-gray-800 font-medium ltr:block rtl:hidden" onClick={(e)=>modeChange(e)}>RTL</span>
                </Link>
            </div>
{/* 
           <div className="fixed top-[50%] right-0 z-50">
                <div className="dropdown shrink-0">
                    <button className="p-2 rounded-full bg-white-light/40 dark:bg-dark/40 hover:text-primary hover:bg-white-light/90 dark:hover:bg-dark/60">
                        <img className="w-5 h-5 object-cover rounded-full" src={`/assets/images/flags/${locale.toUpperCase()}.svg`} alt="flag" />
                    </button>
                    <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-dark shadow-md rounded-md p-2">
                        {languageList.map((item) => (
                            <button
                                key={item.code}
                                type="button"
                                className={`flex w-full p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 ${i18next.language === item.code ? 'bg-primary/10 text-primary' : ''}`}
                                onClick={() => {
                                    i18next.changeLanguage(item.code);
                                    setLocale(item.code);
                                }}
                            >
                                <img src={`/assets/images/flags/${item.code.toUpperCase()}.svg`} alt="flag" className="w-5 h-5 object-cover rounded-full mr-2" />
                                <span>{item.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div> */}

            <div className="fixed top-[50%] right-0 z-50">
                <div className="relative">
                    {/* Button Bendera */}
                    <button
                        className="p-2 rounded-full bg-white-light/40 dark:bg-slate-900 hover:text-primary hover:bg-white-light/90 dark:hover:bg-dark/60"
                        onClick={toggleDropdown} // Tampilkan/Hide Dropdown
                    >
                        <img className="w-5 h-5 object-cover rounded-full" src={`/assets/images/flags/${locale.toUpperCase()}.svg`} alt="flag" />
                    </button>

                    {/* Dropdown Pilihan Bahasa */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-40 bg-white dark:!bg-dark shadow-md rounded-md p-2">
                            {languageList.map((item) => (
                                <button
                                    key={item.code}
                                    type="button"
                                    className={`flex w-full p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 ${i18next.language === item.code ? 'bg-primary/10 text-primary' : ''}`}
                                    onClick={() => changeLanguage(item.code)}
                                >
                                    <img src={`/assets/images/flags/${item.code.toUpperCase()}.svg`} alt="flag" className="w-5 h-5 object-cover rounded-full mr-2" />
                                    <span>{item.name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

        </>
    )
}

export default Switcher;