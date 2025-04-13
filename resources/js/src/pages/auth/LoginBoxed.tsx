import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { useEffect, useState } from 'react';
import { setPageTitle, toggleRTL } from '../../store/themeConfigSlice';
import { useFormik } from 'formik';
import { useLoginMutation } from '../../redux/features/auth/authApi';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { userLoggedIn } from '../../redux/features/auth/authSlice';

const schema = Yup.object().shape({
    email: Yup.string().email('Invalid email!').required('Please enter your email'),
    password: Yup.string().required('Please enter your password!').min(6),
});

interface User {
    id: number;
    name: string;
    email: string;
    store_id: string;
    roles: string[];
    permissions: string[];
    stores: { slug: string }[];
}

const LoginBoxed = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Login Boxed'));
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

    // =================
    const user: User = JSON.parse(localStorage.getItem('user') || '{}');

    const [login, { isSuccess, error }] = useLoginMutation();

    // const formik = useFormik({
    //     initialValues: { email: '', password: '' },
    //     validationSchema: schema,
    //     onSubmit: async ({ email, password }) => {
    //         await login({ email, password });
    //     },
    // });

    const formik = useFormik({
        initialValues: { email: '', password: '' },
        validationSchema: Yup.object({
            email: Yup.string().email('Invalid email').required('Required'),
            password: Yup.string().required('Required').min(6),
        }),
        onSubmit: async (values, { setSubmitting }) => {
            try {
                const response = await login(values).unwrap();
                
                // Dispatch action untuk update Redux state dan localStorage
                dispatch(userLoggedIn({
                    token: response.token,
                    user: response.user
                }));

                // Redirect berdasarkan role
                if (response.user.roles.includes('Employee')) {
                    navigate(`/${response.user.stores[0].slug}`);
                } else {
                    navigate('/');
                }
                
                toast.success('Login successful');
            } catch (error) {
                toast.error(error.data?.message || 'Login failed');
            } finally {
                setSubmitting(false);
            }
        },
    });


    // useEffect(() => {
    //     if (isSuccess) {
    //         toast.success('Login successfully');
    //         if (user.roles?.some((role) => role === 'Employee')) {
    //             navigate(`/${user.stores[0].slug}`);
    //         } else {
    //             navigate('/');
    //         }
    //     }
    //     if (error) {
    //         console.log('error');
    //         if ('data' in error) {
    //             const errorData = error as any;
    //             toast.error(errorData.data.message);
    //         }
    //     }
    // }, [isSuccess, error]);

    const { errors, touched, values, handleChange, handleSubmit } = formik;

    return (
        <div>
            <div className="absolute inset-0">
                <img src="/assets/images/auth/bg-gradient2.png" alt="image" className="h-full w-full object-cover" />
            </div>

            <div className="relative flex min-h-screen items-center justify-center bg-[url(/assets/images/auth/map.png)] bg-cover bg-center bg-no-repeat px-6 py-10 dark:bg-[#060818] sm:px-16">
                <img src="/assets/images/auth/coming-soon-object1.png" alt="image" className="absolute left-0 top-1/2 h-full max-h-[893px] -translate-y-1/2" />
                {/* <img src="/assets/images/auth/coming-soon-object2.png" alt="image" className="absolute left-24 top-0 h-40 md:left-[30%]" />
                <img src="/assets/images/auth/coming-soon-object3.png" alt="image" className="absolute right-0 top-0 h-[300px]" />
                <img src="/assets/images/auth/polygon-object.svg" alt="image" className="absolute bottom-0 end-[28%]" /> */}
                <div className="relative w-full max-w-[870px] rounded-md bg-[linear-gradient(45deg,#fff9f9_0%,rgba(255,255,255,0)_25%,rgba(255,255,255,0)_75%,_#fff9f9_100%)] p-2 dark:bg-[linear-gradient(52.22deg,#0E1726_0%,rgba(14,23,38,0)_18.66%,rgba(14,23,38,0)_51.04%,rgba(14,23,38,0)_80.07%,#0E1726_100%)]">
                    <div className="relative flex flex-col justify-center rounded-md bg-white/60 backdrop-blur-lg dark:bg-black/50 px-6 lg:min-h-[758px] py-20">
                        <div className="mx-auto w-full max-w-[440px]">
                            <div className="mb-10">
                                <h1 className="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl">{t('Login')}</h1>
                                <p className="text-base font-bold leading-normal text-white-dark">{t('Enter your email and password to login')}</p>
                            </div>
                            <form className="space-y-5 dark:text-white" onSubmit={handleSubmit}>
                                <div>
                                    <label htmlFor="email">{t('Email')}</label>
                                    <div className="relative text-white-dark">
                                        <input id="email" type="email" placeholder={t('Enter Email')} className="form-input placeholder:text-white-dark" value={values.email} onChange={handleChange} />
                                        {/* <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                            <IconMail fill={true} />
                                        </span> */}
                                    </div>
                                    {errors.email && touched.email && <span className="text-red-500 pt-2 block">{errors.email}</span>}
                                </div>
                                <div>
                                    <label htmlFor="password">{t('Password')}</label>
                                    <div className="relative text-white-dark">
                                        <input
                                            id="password"
                                            type="password"
                                            placeholder={t('Enter Password')}
                                            className="form-input placeholder:text-white-dark"
                                            value={values.password}
                                            onChange={handleChange}
                                        />
                                        {/* <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                            <IconLockDots fill={true} />
                                        </span> */}
                                    </div>
                                    {errors.password && touched.password && <span className="text-red-500 pt-2 block">{errors.password}</span>}
                                </div>
                                <button type="submit" className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]">
                                    {t('Login')}
                                </button>
                            </form>
                            {/* <div className="text-center dark:text-white mt-10">
                                Don't have an account ?&nbsp;
                                <Link to="/auth/boxed-signup" className="uppercase text-primary underline transition hover:text-black dark:hover:text-white">
                                    SIGN UP
                                </Link>
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginBoxed;
