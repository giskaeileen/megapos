import { useEffect, useState } from "react";
import IconHome from "./Icon/IconHome";
import IconUser from "./Icon/IconUser";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useRegistrationStoreMutation } from "../redux/features/stores/storesApi";
import toast from "react-hot-toast";

const schema = Yup.object().shape({
});

const WizardRegistration = () => {
    const [activeTab, setActiveTab] = useState(1); // Mengganti nama state lebih deskriptif
    const [registrationStore, { data, error, isSuccess }] = useRegistrationStoreMutation()

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: { 
            store_name: "", 
            store_address: "", 
            owner_name: "", 
            owner_email: "", 
            owner_phone: "" 
        },
        validationSchema: schema,
        onSubmit: async (values) => {
            console.log(values)
            await registrationStore(values)
        },
    });

    const { errors, touched, values, handleChange, handleSubmit } = formik

    useEffect(() => {
        if (isSuccess) {
            toast.success("Registration Successfully")
        }
        if (error) {
            const errorData = error as any;
            toast.error(errorData.data.message);
            // if ("data" in error) {
            //     const errorData = error as any
            //     toast.error(errorData.data.message)
            // }
        }
    }, [isSuccess, error])

    return (
        <div>
            <div className="absolute inset-0">
                <img src="/assets/images/auth/bg-gradient.png" alt="image" className="h-full w-full object-cover" />
            </div>
            <div className="relative flex min-h-screen items-center justify-center bg-[url(/assets/images/auth/map.png)] bg-cover bg-center bg-no-repeat px-6 py-10 dark:bg-[#060818] sm:px-16">
                <img src="/assets/images/auth/coming-soon-object1.png" alt="image" className="absolute left-0 top-1/2 h-full max-h-[893px] -translate-y-1/2" />
                <img src="/assets/images/auth/coming-soon-object2.png" alt="image" className="absolute left-24 top-0 h-40 md:left-[30%]" />
                <img src="/assets/images/auth/coming-soon-object3.png" alt="image" className="absolute right-0 top-0 h-[300px]" />
                <img src="/assets/images/auth/polygon-object.svg" alt="image" className="absolute bottom-0 end-[28%]" />
                <div className="relative w-full max-w-[870px] rounded-md bg-[linear-gradient(45deg,#fff9f9_0%,rgba(255,255,255,0)_25%,rgba(255,255,255,0)_75%,_#fff9f9_100%)] p-2 dark:bg-[linear-gradient(52.22deg,#0E1726_0%,rgba(14,23,38,0)_18.66%,rgba(14,23,38,0)_51.04%,rgba(14,23,38,0)_80.07%,#0E1726_100%)]">
                    <div className="relative flex flex-col justify-center rounded-md bg-white/60 backdrop-blur-lg dark:bg-black/50 px-6 lg:min-h-[758px] py-20">
                        <div className="mx-auto w-full max-w-[440px]">
                            {/* <div className="panel">
                                <div className="mb-5"> */}
                                    <div className="inline-block w-full">
                                        <div className="relative z-[1]">
                                            <div
                                                className={`${activeTab === 1 ? 'w-[25%]' : 'w-[75%]'} 
                                                    bg-primary h-1 absolute ltr:left-0 rtl:right-0 top-[30px] m-auto -z-[1] transition-[width]`}
                                            ></div>
                                            <ul className="mb-5 grid grid-cols-2">
                                                <li className="mx-auto">
                                                    <button
                                                        type="button"
                                                        className={`${activeTab === 1 ? '!border-primary !bg-primary text-white' : ''} 
                                                        bg-white dark:bg-[#253b5c] border-[3px] border-[#f3f2ee] dark:border-[#1b2e4b] 
                                                        flex justify-center items-center w-16 h-16 rounded-full`}
                                                        onClick={() => setActiveTab(1)}
                                                    >
                                                        <IconHome />
                                                    </button>
                                                </li>
                                                <li className="mx-auto">
                                                    <button
                                                        type="button"
                                                        className={`${activeTab === 2 ? '!border-primary !bg-primary text-white' : ''} 
                                                        bg-white dark:bg-[#253b5c] border-[3px] border-[#f3f2ee] dark:border-[#1b2e4b] 
                                                        flex justify-center items-center w-16 h-16 rounded-full`}
                                                        onClick={() => setActiveTab(2)}
                                                    >
                                                        <IconUser className="w-5 h-5" />
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
                                        <form className="space-y-5 dark:text-white" onSubmit={handleSubmit} >
                                            <div>
                                                {activeTab === 1 && (
                                                    <div className="space-y-5 dark:text-white">
                                                        <div className="mb-10">
                                                            <h1 className="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl">Store</h1>
                                                            <p className="text-base font-bold leading-normal text-white-dark">Enter your email and password to register</p>
                                                        </div>
                                                        <div>
                                                            <label htmlFor="store_name">Name</label>
                                                            <div className="relative text-white-dark">
                                                                <input 
                                                                    id="store_name" 
                                                                    type="text" 
                                                                    placeholder="Enter Name" 
                                                                    className="form-input ps-10 placeholder:text-white-dark"
                                                                    value={values.store_name}
                                                                    onChange={handleChange}
                                                                />
                                                                <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                                                    <IconUser fill={true} />
                                                                </span>
                                                            </div>
                                                            {errors.store_name&& touched.store_name&& (
                                                                <span className="text-red-500 pt-3 block">{errors.store_name}</span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <label htmlFor="store_address">Address</label>
                                                            <div className="relative text-white-dark">
                                                                <input 
                                                                    id="store_address" 
                                                                    type="text" 
                                                                    placeholder="Enter Name" 
                                                                    className="form-input ps-10 placeholder:text-white-dark"
                                                                    value={values.store_address}
                                                                    onChange={handleChange}
                                                                />
                                                                <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                                                    <IconUser fill={true} />
                                                                </span>
                                                            </div>
                                                            {errors.store_address && touched.store_address && (
                                                                <span className="text-red-500 pt-3 block">{errors.store_address}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {activeTab === 2 && (
                                                    <div className="space-y-5 dark:text-white">
                                                        <div className="mb-10">
                                                            <h1 className="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl">Owner</h1>
                                                            <p className="text-base font-bold leading-normal text-white-dark">Enter your email and password to register</p>
                                                        </div>
                                                        <div>
                                                            <label htmlFor="owner_name">Name</label>
                                                            <div className="relative text-white-dark">
                                                                <input 
                                                                    id="owner_name" 
                                                                    type="text" 
                                                                    placeholder="Enter Name" 
                                                                    className="form-input ps-10 placeholder:text-white-dark"
                                                                    value={values.owner_name}
                                                                    onChange={handleChange}
                                                                />
                                                                <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                                                    <IconUser fill={true} />
                                                                </span>
                                                            </div>
                                                            {errors.owner_name && touched.owner_name && (
                                                                <span className="text-red-500 pt-3 block">{errors.owner_name}</span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <label htmlFor="owner_email">Email</label>
                                                            <div className="relative text-white-dark">
                                                                <input 
                                                                    id="owner_email" 
                                                                    type="email" 
                                                                    placeholder="Enter Name" 
                                                                    className="form-input ps-10 placeholder:text-white-dark"
                                                                    value={values.owner_email}
                                                                    onChange={handleChange}
                                                                />
                                                                <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                                                    <IconUser fill={true} />
                                                                </span>
                                                            </div>
                                                            {errors.owner_email && touched.owner_email && (
                                                                <span className="text-red-500 pt-3 block">{errors.owner_email}</span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <label htmlFor="owner_phone">Phone</label>
                                                            <div className="relative text-white-dark">
                                                                <input 
                                                                    id="owner_phone" 
                                                                    type="text" 
                                                                    placeholder="Enter Name" 
                                                                    className="form-input ps-10 placeholder:text-white-dark"
                                                                    value={values.owner_phone}
                                                                    onChange={handleChange}
                                                                />
                                                                <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                                                    <IconUser fill={true} />
                                                                </span>
                                                            </div>
                                                            {errors.owner_phone && touched.owner_phone && (
                                                                <span className="text-red-500 pt-3 block">{errors.owner_phone}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex justify-between">
                                                <button
                                                    type="button"
                                                    className={`btn btn-primary ${activeTab === 1 ? 'hidden' : ''}`}
                                                    onClick={() => setActiveTab(1)}
                                                >
                                                    Back
                                                </button>
                                                <button
                                                    type={activeTab === 2 ? "submit" : "button"}
                                                    className="btn btn-primary ltr:ml-auto rtl:mr-auto"
                                                    onClick={(e) => {
                                                        if (activeTab === 1) {
                                                            e.preventDefault(); // Mencegah submit
                                                            setActiveTab(2); // Pindah ke tab berikutnya
                                                        } else {
                                                            console.log("Form submitted");
                                                        }
                                                    }}
                                                >
                                                    {activeTab === 2 ? 'Finish' : 'Next'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                {/* </div>
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WizardRegistration;
