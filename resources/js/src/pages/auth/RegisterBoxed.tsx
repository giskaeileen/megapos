import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { setPageTitle, toggleRTL } from '../../store/themeConfigSlice';
import { useEffect, useState } from 'react';
import Dropdown from '../../components/Dropdown';
import i18next from 'i18next';
import IconCaretDown from '../../components/Icon/IconCaretDown';
import IconUser from '../../components/Icon/IconUser';
import IconMail from '../../components/Icon/IconMail';
import IconLockDots from '../../components/Icon/IconLockDots';
import IconInstagram from '../../components/Icon/IconInstagram';
import IconFacebookCircle from '../../components/Icon/IconFacebookCircle';
import IconTwitter from '../../components/Icon/IconTwitter';
import IconGoogle from '../../components/Icon/IconGoogle';
import toast from 'react-hot-toast';
import * as Yup from "yup";
import { useFormik } from "formik";
import { useRegisterMutation } from '../../redux/features/auth/authApi';

// const schema = Yup.object().shape({
//   email: Yup.string()
//     .email("Invalid email!")
//     .required("Please enter your email"),
//   password: Yup.string().required("Please enter your password!").min(6),
// });

const schema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email!")
    .required("Please enter your email"),
  password: Yup.string()
    .required("Please enter your password!")
    .min(6, "Password must be at least 6 characters"),
  name: Yup.string()
    .required("Please enter your name!")
    .matches(/^[a-zA-Z\s]*$/, "Name can only contain letters and spaces"),
  username: Yup.string()
    .required("Please enter your username!")
    .matches(/^[a-zA-Z0-9_]*$/, "Username can only contain letters, numbers, and underscores")
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username cannot exceed 20 characters"),
  password_confirmation: Yup.string()
    .required("Please confirm your password!")
    .oneOf([Yup.ref("password"), null], "Passwords must match"),
});

const RegisterBoxed = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Register Boxed'));
    });
    const navigate = useNavigate();
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const setLocale = (flag: string) => {
        setFlag(flag);
        if (flag.toLowerCase() === 'ae') {
            dispatch(toggleRTL('rtl'));
        } else {
            dispatch(toggleRTL('ltr'));
        }
    };
    const [flag, setFlag] = useState(themeConfig.locale);

    const submitForm = () => {
        navigate('/');
    };

    // =============

    const [register, { data, error, isSuccess }] = useRegisterMutation()

    const formik = useFormik({
        initialValues: { email: "", password: "", name: "", username: "", password_confirmation: "" },
        validationSchema: schema,
        onSubmit: async ({ email, password, name, username, password_confirmation }) => {
            const data = {
                name, username, email, password, password_confirmation
            }
            await register(data)
        },
    });

    const { errors, touched, values, handleChange, handleSubmit } = formik

    useEffect(() => {
        if (isSuccess) {
            toast.success("Registration Successfully")
            // setRoute("Verification")
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
                            <div className="mb-10">
                                <h1 className="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl">Sign Up</h1>
                                <p className="text-base font-bold leading-normal text-white-dark">Enter your email and password to register</p>
                            </div>
                            <form className="space-y-5 dark:text-white" onSubmit={handleSubmit} >
                                <div>
                                    <label htmlFor="name">Name</label>
                                    <div className="relative text-white-dark">
                                        <input 
                                            id="name" 
                                            type="text" 
                                            placeholder="Enter Name" 
                                            className="form-input ps-10 placeholder:text-white-dark"
                                            value={values.name}
                                            onChange={handleChange}
                                        />
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                            <IconUser fill={true} />
                                        </span>
                                    </div>
                                    {errors.name && touched.name && (
                                        <span className="text-red-500 pt-3 block">{errors.name}</span>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="username">Username</label>
                                    <div className="relative text-white-dark">
                                        <input 
                                            id="username" 
                                            type="text" 
                                            placeholder="Enter Username" 
                                            className="form-input ps-10 placeholder:text-white-dark"
                                            value={values.username}
                                            onChange={handleChange}
                                        />
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                            <IconUser fill={true} />
                                        </span>
                                    </div>
                                    {errors.username && touched.username && (
                                        <span className="text-red-500 pt-3 block">{errors.username}</span>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="email">Email</label>
                                    <div className="relative text-white-dark">
                                        <input
                                            id="email"
                                            type="email"
                                            placeholder="Enter Email"
                                            value={values.email}
                                            onChange={handleChange}
                                            className="form-input ps-10 placeholder:text-white-dark"
                                        />
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                            <IconMail fill={true} />
                                        </span>
                                    </div>
                                    {errors.email && touched.email && (
                                        <span className="text-red-500 pt-3 block">{errors.email}</span>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="password">Password</label>
                                    <div className="relative text-white-dark">
                                        <input
                                            id="password"
                                            type="password"
                                            placeholder="Enter Password"
                                            value={values.password}
                                            onChange={handleChange}
                                            className="form-input ps-10 placeholder:text-white-dark"
                                        />
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                            <IconLockDots fill={true} />
                                        </span>
                                    </div>
                                    {errors.password && touched.password && (
                                        <span className="text-red-500 pt-3 block">{errors.password}</span>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="password_confirmation">Confirm Password</label>
                                    <div className="relative text-white-dark">
                                        <input
                                            id="password_confirmation"
                                            type="password"
                                            placeholder="Confirm Password"
                                            value={values.password_confirmation}
                                            onChange={handleChange}
                                            className="form-input ps-10 placeholder:text-white-dark"
                                        />
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                            <IconLockDots fill={true} />
                                        </span>
                                    </div>
                                    {errors.password_confirmation && touched.password_confirmation && (
                                        <span className="text-red-500 pt-3 block">{errors.password_confirmation}</span>
                                    )}
                                </div>
                                <button type="submit" className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]">
                                    Sign Up
                                </button>
                            </form>
                            <div className="text-center dark:text-white mt-10">
                                Already have an account ?&nbsp;
                                <Link to="/auth/boxed-signin" className="uppercase text-primary underline transition hover:text-black dark:hover:text-white">
                                    SIGN IN
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterBoxed;
