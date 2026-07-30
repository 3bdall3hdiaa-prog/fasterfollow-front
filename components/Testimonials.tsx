import React, { useState, useEffect } from 'react';
import { SiteSettings } from '../types';
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
                <span key={i} className="text-yellow-400 text-lg">★</span>
            );
        } else if (hasHalfStar && i === fullStars + 1) {
            stars.push(
                <span key={i} className="text-yellow-400 text-lg">☆</span>
            );
        } else {
            stars.push(
                <span key={i} className={`text-lg ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>★</span>
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
            className={`w-12 h-12 rounded-full ml-4 ring-2 flex items-center justify-center text-white font-bold text-xl transition-colors duration-300 ${isDark ? 'ring-gray-600' : 'ring-[#dfd7bb]'
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
                w-10 h-10 md:w-12 md:h-12 rounded-full 
                flex items-center justify-center 
                transition-all duration-300 
                ${direction === 'left' ? 'left-0 -ml-4 md:-ml-6' : 'right-0 -mr-4 md:-mr-6'}
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
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            ) : (
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

    // تحديد عدد العناصر في الصفحة بناءً على عرض الشاشة
    const getItemsPerPage = () => {
        if (width < 768) {
            return 1;
        } else if (width < 1024) {
            return 2;
        } else {
            return 3;
        }
    };

    const itemsPerPage = getItemsPerPage();

    const items = content;

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
        <section className={`py-20 transition-colors duration-300 ${isDark ? 'bg-transparent' : 'bg-gradient-to-b from-[#faf8f2] to-white'
            }`}>
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className={`text-3xl md:text-4xl font-extrabold transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-800'
                        }`}>
                        {content?.comment || 'آراء عملائنا'}
                    </h2>
                </div>

                {/* حاوية السلايدر */}
                <div className="relative">
                    {/* عرض العناصر في شبكة */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-500">
                        {currentItems.map((el: any, index: number) => {
                            const userName = el.userId?.name || el.userId?.email || el.userId?.username || el.username || 'مستخدم';

                            return (
                                <div
                                    key={index}
                                    className={`rounded-lg p-8 transition-all duration-300 ${isDark
                                        ? 'bg-gray-800 border border-gray-700'
                                        : 'bg-white border border-[#dfd7bb] shadow-md hover:shadow-xl'
                                        }`}
                                >
                                    <div className="flex mb-3 gap-0.5">
                                        {renderStars(el.rating || 0, isDark)}
                                    </div>

                                    <p className={`mb-6 transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                        "{el.comment}"
                                    </p>
                                    <div className="flex items-center">
                                        <Avatar name={userName} isDark={isDark} />
                                        <div>
                                            <h4 className={`font-bold transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-800'
                                                }`}>
                                                {userName}
                                            </h4>
                                            <p className={`text-sm transition-colors duration-300 ${isDark ? 'text-gray-500' : 'text-gray-400'
                                                }`}>
                                                {el.userId?.username || el.username || ''}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
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
                    <div className="flex justify-center mt-8 gap-2">
                        {Array.from({ length: totalPages }).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToPage(index)}
                                className={`
                                    w-3 h-3 rounded-full transition-all duration-300
                                    ${currentPage === index
                                        ? isDark
                                            ? 'bg-white w-8'
                                            : 'bg-[#dfd7bb] w-8'
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