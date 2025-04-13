import { useLocation, Link, useParams } from 'react-router-dom';
import { capitalizeFirstLetter } from './tools';
import { useTranslation } from 'react-i18next';

const Breadcrumb = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const params = useParams();

    // Pecah path menjadi array
    // const pathnames = location.pathname.split('/').filter((x) => x);
    const pathname = location.pathname.split('/').filter((x) => x);
    const storeId = pathname[0];
    const pathnames = location.pathname.split('/').filter((x) => x).slice(0);
    // const pathnames = location.pathname.split('/').filter((x) => x).slice(1);

    // function capitalizeFirstLetter(str: string): string {
    //     return str.charAt(0).toUpperCase() + str.slice(1);
    // }

    return (
        <ol className="flex text-gray-500 font-semibold dark:text-white-dark">
            {pathnames.length === 0 && (
                <li>
                    <button type="button" className="text-black dark:text-white-light">
                        Dashboard
                    </button>
                </li>
            )}
            {pathnames.map((value, index) => {
                const isLast = index === pathnames.length - 1;
                // const to = `/${storeId}/${pathnames.slice(0, index + 1).join('/')}`;
                const to = `/${pathnames.slice(0, index + 1).join('/')}`;

                return (
                    <li key={to} className={isLast ? '' : "after:content-['/'] after:px-1.5"}>
                        {isLast ? (
                            <span className="text-black dark:text-white-light">{params.id || t(capitalizeFirstLetter(value))}</span>
                        ) : (
                            <Link
                                to={to}
                                className="text-black dark:text-white-light hover:text-black/70 dark:hover:text-white-light/70"
                            >
                                {t(capitalizeFirstLetter(value))}
                            </Link>
                        )}
                    </li>
                );
            })}
        </ol>
    );
};

export default Breadcrumb;
