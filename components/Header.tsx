import React, { useEffect, useState } from 'react';
import { useCurrency } from '../contexts/CurrencyContext';
import { Page } from '../types';
import AuthModal from './AuthModal';
import WalletModal from './WalletModal';
import ThemeButton from './ThemeButton';
import { useThemeStore } from '@/store/theme.store';
import { useAuthStore } from '@/store/auth.store';
import axios from 'axios';
import MenuImage from '../assests/images/Horizontal-Line-Transparent.png'
import { Search, X } from 'lucide-react'
import CardSearch from './CardSearch';

interface HeaderProps {
    siteName: string;
    logoUrl: any;
    pages: Page[];
    color: any;
    isHomePage: boolean;
}

const Header: React.FC<HeaderProps> = ({ siteName, logoUrl, pages, color, isHomePage }) => {
    const { user }: any = useAuthStore();
    const { currency, setCurrency, currencies } = useCurrency();
    const [filteredServices, setFilteredServices] = useState([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false); // للتحكم في ظهور السيرش على الموبايل
    const { isDark } = useThemeStore();
    const { formatPrice } = useCurrency();
    const [activeView, setActiveView] = useState('home');
    const siteNameParts = siteName.split(' ');
    const mainName = siteNameParts[0];
    const subName = siteNameParts.slice(1).join(' ');
    const [walletBalance, setWalletBalance] = useState(0);

    useEffect(() => {
        if (user) {
            fetchPaypalPayments();
        }
    }, [user]);

    useEffect(() => {
        const getServices = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/services-list/search?search=${searchTerm}`, { withCredentials: true });
                if (res.data) {
                    setFilteredServices(res.data);
                }
            } catch (error) {
                console.error('Error fetching services:', error);
            }
        }
        if (searchTerm.length > 0) {
            getServices();
        } else {
            setFilteredServices([]);
        }
    }, [searchTerm])

    const fetchPaypalPayments = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/paypal`, {
                credentials: 'include', headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!res.ok) throw new Error('خطأ أثناء جلب بيانات PayPal');
            const payments = await res.json();

            if (!Array.isArray(payments)) {
                return;
            }

            const userPayments = payments.filter(
                (p: any) => p.userName === user?.username
            );

            const totalBalance = userPayments.reduce(
                (sum: number, p: any) => sum + parseFloat(p.amount || 0),
                0
            );

            setWalletBalance(totalBalance);

        } catch (err) {
            console.error('PayPal Fetch Error:', err);
        }
    };

    const NavLink: React.FC<{ viewName: string, activeView: string, setActiveView: (view: string) => void, children: React.ReactNode }> = ({ viewName, activeView, children }) => {
        const { isDark } = useThemeStore();
        const isActive = activeView === viewName;
        return (
            <a
                onClick={() => { setIsMenuOpen(false) }}
                href={`#/client/${viewName}`}
                className={`flex items-center text-sm font-medium rounded-lg transition-all duration-300 ${isActive
                    ? isDark
                        ? ' text-white'
                        : ' text-white shadow-md'
                    : isDark
                        ? 'text-gray-300 hover:text-primary-400'
                        : 'text-gray-600 hover:text-[#c9a84c]'
                    }`}
            >
                {children}
            </a>
        );
    };

    const getDisplayName = () => {
        if (!user) return '';
        return user.username || 'User';
    };

    const getInitial = () => {
        const displayName = getDisplayName();
        return displayName.charAt(0).toUpperCase();
    };

    const handleLogout = async () => {
        try {
            console.log('Logging out...');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/auth/logout`, { withCredentials: true });
            if (res.data) {
                window.location.href = '/';
            }
            setIsUserMenuOpen(false);
        } catch (err: any) {
            console.log(err);
        }
    };

    const navigateToPanel = () => {
        setIsUserMenuOpen(false);
        window.location.hash = user?.role === 'admin' ? '/admin' : '/client';
    };

    // إغلاق السيرش عند الضغط خارجها
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const searchElement = document.getElementById('search-container');
            if (searchElement && !searchElement.contains(e.target as Node)) {
                setIsSearchOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    return (
        <>
            <header className={`fixed top-0 right-0 left-0 backdrop-blur-md border-b z-30 transition-colors duration-300 ${isDark
                ? 'bg-gray-900/80 border-gray-700'
                : 'bg-white/70'
                }`}>
                <div className="container mx-auto px-3 sm:px-6">
                    <div className="flex justify-between items-center h-16 md:h-20 gap-2">
                        {/* Logo and Site Name */}
                        <div className='flex items-center gap-y-2 gap-x-2 sm:gap-x-6 flex-1 min-w-0'>
                            <a href="#/" className="flex items-center gap-2 sm:space-x-3 sm:space-x-reverse min-w-0 flex-shrink-0">
                                {logoUrl && <img src={logoUrl} alt={siteName} className="h-8 w-8 md:h-10 md:w-10 object-contain flex-shrink-0" />}
                                <span className="text-base sm:text-lg md:text-xl font-extrabold transition-colors duration-300 truncate max-w-[110px] xs:max-w-[150px] sm:max-w-none">
                                    <span className={isDark ? `text-[${color}]` : 'text-[#c9a84c]'}>
                                        {mainName}
                                    </span>
                                    <span className={isDark ? 'text-white' : 'text-gray-800'}>
                                        {subName}
                                    </span>
                                </span>
                            </a>

                            {/* Mobile Menu Button */}
                            <div className="md:hidden">
                                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`transition-colors duration-300 ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'
                                    }`}>
                                    <img src={MenuImage} alt="Menu" className={`${isDark ? 'invert' : ''} w-6 h-6 mt-2`} />
                                </button>
                            </div>
                            {/* Search Bar - Desktop */}
                            {isHomePage && user.role && (
                                <div className=' md:flex relative flex-1 max-w-[200px] sm:max-w-[280px] md:max-w-[350px] lg:max-w-md mx-0 sm:mx-4'>
                                    <div id="search-container" className="relative w-full">
                                        <input
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className={`outline-none border rounded-lg w-full py-1.5 sm:py-2 px-3 sm:px-4 pr-8 sm:pr-10 text-xs sm:text-sm transition-colors duration-300 ${isDark
                                                ? 'bg-gray-800 border-gray-700 text-gray-300 placeholder-gray-500'
                                                : 'bg-white border-gray-300 text-gray-700 placeholder-gray-400'
                                                }`}
                                            type="text"
                                            placeholder="بحث..."
                                        />
                                        <Search className={`w-4 h-4  absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                                        {filteredServices.length > 0 && searchTerm.length > 0 && (
                                            <CardSearch setSearchTerm={setSearchTerm} services={filteredServices} />
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-6 space-x-reverse text-sm font-medium flex-shrink-0">
                            <a href="#/" className={`transition-colors duration-300 ${isDark ? 'text-gray-300 hover:text-primary-400' : 'text-gray-600 hover:text-[#c9a84c]'
                                }`}>الرئيسية</a>
                            <a href="#/blog" className={`transition-colors duration-300 ${isDark ? 'text-gray-300 hover:text-primary-400' : 'text-gray-600 hover:text-[#c9a84c]'
                                }`}>المدونة</a>
                            {pages.filter(p => p.isPublished).map(page => (
                                <a key={page.id} href={`#/page/${page.slug}`} className={`transition-colors duration-300 ${isDark ? 'text-gray-300 hover:text-primary-400' : 'text-gray-600 hover:text-[#c9a84c]'
                                    }`}>{page.title}</a>
                            ))}
                        </nav>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">

                            {/* Theme */}
                            <ThemeButton />

                            {/* Currency Selector */}
                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className={`hidden sm:block rounded-md py-1 px-1.5 sm:px-2 text-xs focus:outline-none transition-colors duration-300 ${isDark
                                    ? 'bg-gray-800 text-gray-300 border border-gray-700'
                                    : 'bg-white text-gray-700 border border-[#dfd7bb]'
                                    }`}
                            >
                                {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>

                            {user?.role ? (
                                <div className="relative flex items-center gap-2 sm:gap-4">
                                    <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-1.5 sm:space-x-2 sm:space-x-reverse">
                                        <span className={`hidden sm:inline font-semibold transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-800'
                                            }`}>
                                            {getDisplayName()}
                                        </span>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold transition-colors duration-300 flex-shrink-0 ${isDark ? 'bg-primary-600' : 'bg-[#c9a84c]'
                                            }`}>
                                            {getInitial()}
                                        </div>
                                    </button>
                                    {isUserMenuOpen && (
                                        <div className={`absolute top-full mt-2 left-0 w-48 rounded-lg shadow-lg border z-20 transition-colors duration-300 ${isDark
                                            ? 'bg-gray-800 border-gray-700'
                                            : 'bg-white border-[#dfd7bb]'
                                            }`}>
                                            {user.role === 'admin' && (
                                                <>
                                                    <a href="#/admin/dashboard" onClick={() => setIsUserMenuOpen(false)} className={`block px-4 py-2 text-sm transition-colors duration-300 ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                                                        }`}>لوحة التحكم</a>
                                                    <hr className={`transition-colors duration-300 ${isDark ? 'border-gray-700' : 'border-[#dfd7bb]'
                                                        }`} />
                                                </>
                                            )}
                                            {user.role === 'client' && (
                                                <>
                                                    <a href="#/client/dashboard" onClick={() => setIsUserMenuOpen(false)} className={`hidden lg:block px-4 py-2 text-sm transition-colors duration-300 ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                                                        }`}>لوحة التحكم</a>
                                                    <hr className={`transition-colors duration-300 ${isDark ? 'border-gray-700' : 'border-[#dfd7bb]'
                                                        }`} />
                                                </>
                                            )}
                                            <button onClick={handleLogout} className="block w-full text-right px-4 py-2 text-sm text-red-400 hover:bg-gray-700">تسجيل الخروج</button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="md:flex items-center space-x-2 space-x-reverse">
                                    <button
                                        onClick={() => setIsAuthModalOpen(true)}
                                        className={`font-bold py-2 px-2 rounded-lg text-sm transition-all duration-300 ${isDark
                                            ? 'bg-primary-600 hover:bg-primary-700 text-white'
                                            : 'bg-[#c9a84c] hover:bg-[#b8973a] text-white shadow-md hover:shadow-lg'
                                            }`}
                                    >
                                        دخول / تسجيل
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>



            </header>
            {/* Mobile Menu */}
            {/* ✅ القائمة الجانبية - موجودة دايماً في الـ DOM */}
            <div
                className={`fixed inset-0 z-50 transition-all duration-300 ease-in-out ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
            >
                {/* الـ Overlay */}
                <div
                    className={`absolute inset-0 bg-black transition-opacity duration-300 ${isMenuOpen ? 'opacity-50' : 'opacity-0'
                        }`}
                    onClick={() => setIsMenuOpen(false)}
                />

                {/* القائمة الجانبية */}
                <div
                    className={`absolute top-0 right-0 h-full w-[85%] max-w-sm transition-transform duration-300 ease-in-out transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'
                        } ${isDark ? 'bg-gray-900 border-l border-gray-700' : 'bg-white border-l border-[#dfd7bb]'
                        } shadow-2xl overflow-y-auto`}
                >
                    {/* رأس القائمة */}
                    <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-[#dfd7bb]'
                        }`}>
                        <div className="flex items-center gap-2">
                            {logoUrl && <img src={logoUrl} alt={siteName} className="h-8 w-8 object-contain" />}
                            <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                {siteName}
                            </span>
                        </div>
                        <button
                            onClick={() => setIsMenuOpen(false)}
                            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                                }`}
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* محتوى القائمة */}
                    <div className="p-4 space-y-6">
                        {/* روابط التنقل الرئيسية */}
                        <div className="space-y-2">
                            <a
                                href="#/"
                                onClick={() => setIsMenuOpen(false)}
                                className={`block px-4 py-3 rounded-lg transition-all duration-200 ${isDark ? 'hover:bg-gray-800 text-gray-300 hover:text-white' : 'hover:bg-gray-50 text-gray-600 hover:text-[#c9a84c]'
                                    }`}
                            >
                                <span className="font-medium">الرئيسية</span>
                            </a>
                            <a
                                href="#/blog"
                                onClick={() => setIsMenuOpen(false)}
                                className={`block px-4 py-3 rounded-lg transition-all duration-200 ${isDark ? 'hover:bg-gray-800 text-gray-300 hover:text-white' : 'hover:bg-gray-50 text-gray-600 hover:text-[#c9a84c]'
                                    }`}
                            >
                                <span className="font-medium">المدونة</span>
                            </a>
                            {pages.filter(p => p.isPublished).map(page => (
                                <a
                                    key={page.id}
                                    href={`#/page/${page.slug}`}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`block px-4 py-3 rounded-lg transition-all duration-200 ${isDark ? 'hover:bg-gray-800 text-gray-300 hover:text-white' : 'hover:bg-gray-50 text-gray-600 hover:text-[#c9a84c]'
                                        }`}
                                >
                                    <span className="font-medium">{page.title}</span>
                                </a>
                            ))}
                        </div>

                        {user?.role === 'client' && (
                            <>
                                <div className={` border-t ${isDark ? 'border-gray-700' : 'border-[#dfd7bb]'}`} />

                                <div className="px-4 py-3">
                                    <p className="text-sm" style={{ color: isDark ? '#60a5fa' : '#c9a84c' }}>
                                        رصيدك: <span className="font-bold">{formatPrice(walletBalance) || "0.00"}</span>
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <NavLink viewName="orders-history" activeView={activeView} setActiveView={setActiveView}>
                                        <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        سجل الطلبات
                                    </NavLink>

                                    <NavLink viewName="add-funds" activeView={activeView} setActiveView={setActiveView}>
                                        <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                        شحن الرصيد
                                    </NavLink>

                                    <NavLink viewName="services-list" activeView={activeView} setActiveView={setActiveView}>
                                        <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                        </svg>
                                        قائمة الخدمات
                                    </NavLink>

                                    <NavLink viewName="support" activeView={activeView} setActiveView={setActiveView}>
                                        <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        الدعم الفني
                                    </NavLink>

                                    <NavLink viewName="profile" activeView={activeView} setActiveView={setActiveView}>
                                        <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        الملف الشخصي
                                    </NavLink>
                                </div>

                                <div className={`pt-2 px-4 ${isDark ? 'border-gray-700' : 'border-[#dfd7bb]'}`}>
                                    <select
                                        value={currency}
                                        onChange={(e) => setCurrency(e.target.value)}
                                        className={`w-full rounded-md py-2 px-3 text-sm focus:outline-none transition-colors duration-300 ${isDark ? 'bg-gray-800 text-gray-300 border border-gray-700' : 'bg-gray-50 text-gray-700 border border-[#dfd7bb]'
                                            }`}
                                    >
                                        {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>




            {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}
            {isWalletModalOpen && user && <WalletModal onClose={() => setIsWalletModalOpen(false)} />}
        </>
    );
};

export default Header;