import React from 'react';
import IconCaretDown from './Icon/IconCaretDown';

interface PaginationProps {
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalItems,
    itemsPerPage,
    onPageChange,
    className = '',
}) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    const handlePageClick = (page: number) => {
        onPageChange(page);
    };

    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className={`flex m-4 justify-center ${className}`}>
            <ul className="inline-flex items-center space-x-1 rtl:space-x-reverse">
                {/* Previous Button */}
                <li>
                    <button
                        type="button"
                        onClick={handlePrevious}
                        className="flex justify-center font-semibold p-2 rounded-full transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary"
                        disabled={currentPage === 1}
                    >
                        <IconCaretDown className="w-5 h-5 rotate-90 rtl:-rotate-90" />
                    </button>
                </li>

                {/* Page Numbers */}
                {Array.from({ length: totalPages }, (_, idx) => (
                    <li key={idx}>
                        <button
                            type="button"
                            onClick={() => handlePageClick(idx + 1)}
                            className={`flex justify-center font-semibold px-3.5 py-2 rounded-full transition ${
                                currentPage === idx + 1
                                    ? 'bg-primary text-white'
                                    : 'bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary'
                            }`}
                        >
                            {idx + 1}
                        </button>
                    </li>
                ))}

                {/* Next Button */}
                <li>
                    <button
                        type="button"
                        onClick={handleNext}
                        className="flex justify-center font-semibold p-2 rounded-full transition bg-white-light text-dark hover:text-white hover:bg-primary dark:text-white-light dark:bg-[#191e3a] dark:hover:bg-primary"
                        disabled={currentPage === totalPages}
                    >
                        <IconCaretDown className="w-5 h-5 -rotate-90 rtl:rotate-90" />
                    </button>
                </li>
            </ul>
        </div>
    );
};

export default Pagination;