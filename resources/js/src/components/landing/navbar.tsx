// import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { Link as Link1 } from "react-scroll";

// const Navbar: React.FC = () => {
//     let [scroll, setScroll] = useState(false);
//     let [manu, setManu] = useState(false);

//     useEffect(() => {
//         window.addEventListener("scroll", () => {
//             setScroll(window.scrollY > 50);
//         });
//         return () => {
//             window.removeEventListener("scroll", () => {
//                 setScroll(window.scrollY > 50);
//             });
//         };
//     }, []);

//     return (
//         <nav className={`navbar ${scroll ? "is-sticky" : ""}`} id="navbar">
//             <div className="container relative flex flex-wrap items-center justify-between">
//                 <Link to="/" className="main-logo flex items-center shrink-0">
//                     <img className="w-8 ltr:-ml-1 rtl:-mr-1 inline" src="/assets/images/logo.png" alt="logo" />
//                     <span className="text-2xl ltr:ml-1.5 rtl:mr-1.5 font-semibold align-middle lg:inline dark:text-white-light">
//                         POSDIDI
//                     </span>
//                 </Link>

//                 <div className="nav-icons flex items-center lg_992:order-2 ms-auto md:ms-8">
//                     <ul className="list-none menu-social mb-0">
//                         <li className="inline">
//                             <Link
//                                 to=""
//                                 className="h-8 px-4 text-[12px] tracking-wider inline-flex items-center justify-center font-medium rounded-md bg-teal-500 text-white uppercase"
//                             >
//                                 Login
//                             </Link>
//                         </li>
//                     </ul>
//                     <button
//                         data-collapse="menu-collapse"
//                         type="button"
//                         className="collapse-btn inline-flex items-center ms-2 text-dark dark:text-white lg_992:hidden"
//                         onClick={() => setManu(!manu)}
//                     >
//                         <span className="sr-only">Navigation Menu</span>
//                         <i className="mdi mdi-menu text-[24px]"></i>
//                     </button>
//                 </div>

//                 <div className={`navigation lg_992:order-1 lg_992:flex  ms-auto ${manu ? "" : "hidden"}`} id="menu-collapse">
//                     <ul className="navbar-nav" id="navbar-navlist">
//                         <li className="nav-item ms-0">
//                             <Link1 className="nav-link" to="home" smooth={true} duration={1000} activeClass="active" spy={true}>
//                                 Home
//                             </Link1>
//                         </li>
//                         <li className="nav-item ms-0">
//                             <Link1 className="nav-link" to="about" smooth={true} duration={1000} activeClass="active" spy={true}>
//                                 About
//                             </Link1>
//                         </li>
//                         <li className="nav-item ms-0">
//                             <Link1 className="nav-link" to="services" smooth={true} duration={1000} activeClass="active" spy={true}>
//                                 Services
//                             </Link1>
//                         </li>
//                         <li className="nav-item ms-0">
//                             <Link1 className="nav-link" to="review" smooth={true} duration={1000} activeClass="active" spy={true}>
//                                 Testimonial
//                             </Link1>
//                         </li>
//                         <li className="nav-item ms-0">
//                             <Link1 className="nav-link" to="pricing" smooth={true} duration={1000} activeClass="active" spy={true}>
//                                 Pricing
//                             </Link1>
//                         </li>
//                         <li className="nav-item ms-0">
//                             <Link1 className="nav-link" to="blog" smooth={true} duration={1000} activeClass="active" spy={true}>
//                                 Blogs
//                             </Link1>
//                         </li>
//                         <li className="nav-item ms-0">
//                             <Link1 className="nav-link" to="contact" smooth={true} duration={1000} activeClass="active" spy={true}>
//                                 Contact us
//                             </Link1>
//                         </li>
//                     </ul>
//                 </div>
//             </div>
//         </nav>
//     );
// };

// export default Navbar;

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const Navbar: React.FC = () => {
    const [scroll, setScroll] = useState(false);
    const [menu, setMenu] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        const handleScroll = () => {
            setScroll(window.scrollY > 50);
        };

        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const handleNavClick = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    return (
        <nav className={`navbar ${scroll ? "is-sticky" : ""}`} id="navbar">
            <div className="container relative flex flex-wrap items-center justify-between">
                <Link to="/" className="main-logo flex items-center shrink-0">
                    <img className="w-8 ltr:-ml-1 rtl:-mr-1 inline" src="/assets/images/logo.png" alt="logo" />
                    <span className="text-2xl ltr:ml-1.5 rtl:mr-1.5 font-semibold align-middle lg:inline dark:text-white-light">
                       MEGAPOS 
                    </span>
                </Link>

                <div className="nav-icons flex items-center lg_992:order-2 ms-auto md:ms-8">
                    <ul className="list-none menu-social mb-0">
                        <li className="inline">
                            {/* <Link
                                to="/login"
                                className="h-8 px-4 text-[12px] tracking-wider inline-flex items-center justify-center font-medium rounded-md bg-teal-500 text-white uppercase"
                            >
                                {t('Login')}
                            </Link> */}
                            <a 
                                href="/login"
                                className="h-8 px-4 text-[12px] tracking-wider inline-flex items-center justify-center font-medium rounded-md bg-teal-500 text-white uppercase"
                            >
                                Login
                            </a>
                        </li>
                    </ul>
                    <button
                        data-collapse="menu-collapse"
                        type="button"
                        className="collapse-btn inline-flex items-center ms-2 text-dark dark:text-white lg_992:hidden"
                        onClick={() => setMenu(!menu)}
                    >
                        <span className="sr-only">Navigation Menu</span>
                        <i className="mdi mdi-menu text-[24px]"></i>
                    </button>
                </div>

                <div className={`navigation lg_992:order-1 lg_992:flex ms-auto ${menu ? "" : "hidden"}`} id="menu-collapse">
                    <ul className="navbar-nav" id="navbar-navlist">
                        {[
                            "home", 
                            "about", 
                            "services", 
                            // "review", 
                            // "pricing", 
                            // "blog", 
                            // "contact"
                        ].map((section) => (
                            <li className="nav-item ms-0" key={section}>
                                <button className="nav-link" onClick={() => handleNavClick(section)}>
                                    {/* {t(section.charAt(0).toUpperCase() + section.slice(1))} */}
                                    {t(section)}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
