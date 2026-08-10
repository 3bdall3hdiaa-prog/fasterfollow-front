import React, { useState, useEffect } from 'react';
import { useThemeStore } from '@/store/theme.store';

export interface TestimonialsProps {
    comment: string;
    userId: {
        name: string;
        username: string;
        _id: string;
        email?: string;
    }
    serviceId: {
        title: string;
        _id: string;
    }
    rating: number;
    username: string;
}

const renderStars = (rate: number, isDark: boolean) => {
    const stars = [];
    const fullStars = Math.floor(rate);
    const hasHalfStar = rate % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            stars.push(
                <span key={i} className="text-yellow-400 text-base sm:text-lg">★</span>
            );
        } else if (hasHalfStar && i === fullStars + 1) {
            stars.push(
                <span key={i} className="text-yellow-400 text-base sm:text-lg">☆</span>
            );
        } else {
            stars.push(
                <span key={i} className={`text-base sm:text-lg ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>★</span>
            );
        }
    }
    return stars;
};

const Avatar: React.FC<{ name: string; isDark: boolean }> = ({ name, isDark }) => {
    const getInitial = (name: string) => {
        if (!name) return '?';
        const firstChar = name.trim().charAt(0);
        return firstChar.toUpperCase();
    };

    const getColorFromName = (name: string) => {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = Math.abs(hash) % 360;
        return `hsl(${hue}, 70%, 60%)`;
    };

    const initial = getInitial(name);
    const backgroundColor = getColorFromName(name);

    return (
        <div
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full ml-3 sm:ml-4 ring-2 flex items-center justify-center text-white font-bold text-base sm:text-xl transition-colors duration-300 flex-shrink-0 ${isDark ? 'ring-gray-600' : 'ring-[#dfd7bb]'
                }`}
            style={{ backgroundColor }}
        >
            {initial}
        </div>
    );
};

const ArrowButton: React.FC<{
    direction: 'left' | 'right';
    onClick: () => void;
    isDark: boolean;
    disabled?: boolean;
}> = ({ direction, onClick, isDark, disabled }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                absolute top-1/2 -translate-y-1/2 
                w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full 
                flex items-center justify-center 
                transition-all duration-300 
                ${direction === 'left' ? 'left-0 -ml-3 sm:-ml-4 md:-ml-6' : 'right-0 -mr-3 sm:-mr-4 md:-mr-6'}
                ${isDark
                    ? 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-600'
                    : 'bg-white text-gray-800 hover:bg-gray-100 border border-[#dfd7bb] shadow-md'
                }
                ${disabled ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110'}
                focus:outline-none
                z-10
            `}
        >
            {direction === 'left' ? (
                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            ) : (
                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            )}
        </button>
    );
};

const useWindowSize = () => {
    const [windowSize, setWindowSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 0,
    });

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
            });
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowSize;
};

const Testimonials: React.FC<any> = ({ content }) => {
    const { isDark } = useThemeStore();
    const [currentPage, setCurrentPage] = useState(0);
    const { width } = useWindowSize();

    // Responsive items per page
    const getItemsPerPage = () => {
        if (width < 640) return 1; // Mobile
        if (width < 768) return 1; // Tablet small
        if (width < 1024) return 2; // Tablet large
        return 2; // Desktop
    };

    const itemsPerPage = getItemsPerPage();
    const items = content || [];

    // حساب عدد الصفحات
    const totalPages = Math.ceil(items.length / itemsPerPage);

    useEffect(() => {
        if (currentPage >= totalPages) {
            setCurrentPage(0);
        }
    }, [itemsPerPage, totalPages, currentPage]);

    // الحصول على العناصر للصفحة الحالية
    const currentItems = items.slice(
        currentPage * itemsPerPage,
        (currentPage + 1) * itemsPerPage
    );

    // التنقل للصفحة التالية
    const nextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    // التنقل للصفحة السابقة
    const prevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    // دوائر التنقل (النقاط)
    const goToPage = (pageIndex: number) => {
        setCurrentPage(pageIndex);
    };

    return (
        <section className={`mt-6 sm:mt-8 md:mt-[35px] transition-colors duration-300 px-4 sm:px-0`}>
            <div className="container mx-auto px-2 sm:px-4 md:px-6">
                {/* حاوية السلايدر */}
                <div className="relative max-w-6xl mx-auto">
                    {/* عرض الكاردات */}
                    <div className="transition-all duration-500">
                        <div className={`grid ${itemsPerPage === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-4 sm:gap-6`}>
                            {currentItems.map((el: any, index: number) => {
                                const userName = el.userId?.username || el.userId?.email || el.username || 'مستخدم';

                                return (
                                    <div
                                        key={index}
                                        className={`rounded-2xl p-4 sm:p-6 md:p-8 transition-all duration-300 ${isDark
                                            ? 'bg-gray-800 border border-gray-700'
                                            : 'bg-black/5 shadow-md hover:shadow-xl'
                                            }`}
                                    >
                                        <div className="flex flex-col gap-3 sm:gap-4">
                                            {/* الصف العلوي: الصورة + الاسم + التقييم */}
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center flex-1 min-w-0">
                                                    <Avatar name={userName} isDark={isDark} />
                                                    <div className="text-right mr-2 sm:mr-3 min-w-0">
                                                        <h4 className={`font-bold text-sm sm:text-base truncate transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-800'
                                                            }`}>
                                                            {el.userId?.username || el.username || ''}
                                                        </h4>
                                                    </div>
                                                </div>
                                                <div className="flex gap-0.5 flex-shrink-0 mr-2 sm:mr-0">
                                                    {renderStars(el.rating || 0, isDark)}
                                                </div>
                                            </div>

                                            {/* التعليق */}
                                            <div className="text-right">
                                                <p className={`text-sm sm:text-base transition-colors duration-300 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'
                                                    }`}>
                                                    "{el.comment}"
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {totalPages > 1 && (
                        <>
                            <ArrowButton
                                direction="left"
                                onClick={prevPage}
                                isDark={isDark}
                                disabled={currentPage === 0}
                            />
                            <ArrowButton
                                direction="right"
                                onClick={nextPage}
                                isDark={isDark}
                                disabled={currentPage === totalPages - 1}
                            />
                        </>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="flex justify-center mt-6 sm:mt-8 gap-2">
                        {Array.from({ length: totalPages }).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToPage(index)}
                                className={`
                                    w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300
                                    ${currentPage === index
                                        ? isDark
                                            ? 'bg-white w-4 sm:w-8'
                                            : 'bg-[#dfd7bb] w-4 sm:w-8'
                                        : isDark
                                            ? 'bg-gray-600 hover:bg-gray-500'
                                            : 'bg-gray-300 hover:bg-gray-400'
                                    }
                                `}
                                aria-label={`Go to page ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default Testimonials;