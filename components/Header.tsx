import React, { useEffect, useState } from 'react';
import { useCurrency } from '../contexts/CurrencyContext';
import { Page } from '../types';
import AuthModal from './AuthModal';
import WalletModal from './WalletModal';
import Notifications from './client/Notifications';
import ThemeButton from './ThemeButton';
import { useThemeStore } from '@/store/theme.store';
import { useAuthStore } from '@/store/auth.store';
import axios from 'axios';
import MenuImage from '../assests/images/Horizontal-Line-Transparent.png'

interface HeaderProps {
    siteName: string;
    logoUrl: any;
    pages: Page[];
    color: any
}

const Header: React.FC<HeaderProps> = ({ siteName, logoUrl, pages, color }) => {
    const { user }: any = useAuthStore();
    const { currency, setCurrency, currencies } = useCurrency();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const { isDark } = useThemeStore();
    const { formatPrice } = useCurrency();
    const [activeView, setActiveView] = useState('home');
    const siteNameParts = siteName.split(' ');
    const mainName = siteNameParts[0];
    const subName = siteNameParts.slice(1).join(' ');
    const [walletBalance, setWalletBalance] = useState(0);
    console.log("userrrrrrrrrrrrrrrrrrrrr", user)
    useEffect(() => {
        if (user) {
            fetchPaypalPayments();
        }
    }, [user]);

    const fetchPaypalPayments = async () => {
        try {
            console.log('جاري جلب بيانات PayPal للمستخدم:', user?.username);

            const res = await fetch(`${import.meta.env.VITE_API_URL}/paypal`, {
                credentials: 'include', headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!res.ok) throw new Error('خطأ أثناء جلب بيانات PayPal');
            const payments = await res.json();

            console.log('بيانات PayPal المستلمة:', payments);

            if (!Array.isArray(payments)) {
                console.log('البيانات ليست مصفوفة');
                return;
            }

            const userPayments = payments.filter(
                (p: any) => p.userName === user?.username
            );

            console.log('عمليات المستخدم المفلترة:', userPayments);

            const totalBalance = userPayments.reduce(
                (sum: number, p: any) => sum + parseFloat(p.amount || 0),
                0
            );

            console.log('إجمالي الرصيد المحسوب:', totalBalance);
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

                className={`flex items-center   text-sm font-medium rounded-lg transition-all duration-300 ${isActive
                    ? isDark
                        ? ' text-white'
                        : ' text-white shadow-md'
                    : isDark
                        ? 'text-gray-300  hover:text-primary-400'
                        : 'text-gray-600  hover:text-[#c9a84c]'
                    }`}
            >
                {children}
            </a>
        );
    };

    // دالة علشان تجيب الاسم المعروض
    const getDisplayName = () => {
        if (!user) return '';
        return user.username || 'User';
    };

    // دالة علشان تجيب الحرف الأول للصورة
    const getInitial = () => {
        const displayName = getDisplayName();
        return displayName.charAt(0).toUpperCase();
    };

    const handleLogout = async () => {
        try {
            console.log('Logging out...');
            localStorage.removeItem('token');
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

    return (
        <>
            <header className={`fixed top-0 right-0 left-0 backdrop-blur-md border-b z-30 transition-colors duration-300 ${isDark
                ? 'bg-gray-900/80 border-gray-700'
                : 'bg-white/70  '
                }`}>
                <div className="container mx-auto px-3 sm:px-6">
                    <div className="flex justify-between items-center h-16 md:h-20 gap-2">
                        {/* Logo and Site Name */}
                        <div className='flex items-center gap-2'>
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
                                    <img src={MenuImage} alt="Menu" className="w-6 h-6 mt-2 " />
                                </button>
                            </div>
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
                            {/*theme */}
                            <ThemeButton />

                            {/* Currency Selector - hidden on very small screens, moved into mobile menu instead */}
                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className={`xl:block hidden xs:block rounded-md py-1 px-1.5 sm:px-2 text-xs focus:outline-none transition-colors duration-300 ${isDark
                                    ? 'bg-gray-800 text-gray-300 border border-gray-700'
                                    : 'bg-white text-gray-700 border border-[#dfd7bb]'
                                    }`}
                            >
                                {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>

                            {user.role ? (
                                <div className="relative flex items-center gap-2 sm:gap-4">
                                    <Notifications />
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
                                                        }`}>لوحة التحكم </a>

                                                    <hr className={`transition-colors duration-300 ${isDark ? 'border-gray-700' : 'border-[#dfd7bb]'
                                                        }`} />
                                                </>
                                            )} {user.role === 'client' && (
                                                <>

                                                    <a href="#/client/dashboard" onClick={() => setIsUserMenuOpen(false)} className={`hidden lg:block px-4 py-2 text-sm transition-colors duration-300 ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                                                        }`}>لوحة التحكم </a>

                                                    <hr className={`transition-colors duration-300 ${isDark ? 'border-gray-700' : 'border-[#dfd7bb]'
                                                        }`} />
                                                </>
                                            )}
                                            <button onClick={handleLogout} className="block w-full text-right px-4 py-2 text-sm text-red-400 hover:bg-gray-700">تسجيل الخروج</button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className=" md:flex items-center space-x-2 space-x-reverse">
                                    <button
                                        onClick={() => setIsAuthModalOpen(true)}
                                        className={`font-bold py-2 px-4 rounded-lg text-sm transition-all duration-300 ${isDark
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
                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className={`flex  justify-around  md:hidden border-t py-4 transition-colors duration-300 ${isDark
                        ? 'bg-gray-800 border-gray-700'
                        : 'bg-white border-[#dfd7bb]'
                        }`}>
                        <div className={` flex flex-col gap-2`}>
                            <a href="#/" onClick={() => setIsMenuOpen(false)} className={`block transition-colors duration-300 ${isDark ? 'text-gray-300 hover:text-primary-400' : 'text-gray-600 hover:text-[#c9a84c]'
                                }`}>الرئيسية</a>
                            <a href="#/blog" onClick={() => setIsMenuOpen(false)} className={`block transition-colors duration-300 ${isDark ? 'text-gray-300 hover:text-primary-400' : 'text-gray-600 hover:text-[#c9a84c]'
                                }`}>المدونة</a>
                            {pages.filter(p => p.isPublished).map(page => (
                                <a key={page.id} href={`#/page/${page.slug}`} onClick={() => setIsMenuOpen(false)} className={`block transition-colors duration-300 ${isDark ? 'text-gray-300 hover:text-primary-400' : 'text-gray-600 hover:text-[#c9a84c]'
                                    }`}>{page.title}</a>
                            ))}
                            {/* Currency selector for very small screens, mirrored here since it's hidden in the top bar below `xs` */}
                            <div className="xs:hidden pt-1">
                                <select
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    className={`w-full rounded-md py-2 px-2 text-sm focus:outline-none transition-colors duration-300 ${isDark
                                        ? 'bg-gray-900 text-gray-300 border border-gray-700'
                                        : 'bg-gray-50 text-gray-700 border border-[#dfd7bb]'
                                        }`}
                                >
                                    {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                        {user?.role === 'client' ? <>
                            <div className='flex flex-col gap-y-3 text-black  px-4 border-gray-100 '>
                                <p className="text-sm" style={{ color: isDark ? '#60a5fa' : '#c9a84c' }}>
                                    رصيدك : {formatPrice(walletBalance) || "0.00"}
                                </p>
                                <NavLink viewName="orders-history" activeView={activeView} setActiveView={setActiveView} >
                                    <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                    سجل الطلبات
                                </NavLink>
                                <NavLink viewName="add-funds" activeView={activeView} setActiveView={setActiveView} >
                                    <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                    شحن الرصيد
                                </NavLink>

                            </div>
                            <div className=' flex flex-col gap-y-3 text-black  '>
                                <NavLink viewName="services-list" activeView={activeView} setActiveView={setActiveView} >
                                    <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                                    قائمة الخدمات
                                </NavLink>

                                <NavLink viewName="support" activeView={activeView} setActiveView={setActiveView} >
                                    <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    الدعم الفني
                                </NavLink>
                                <NavLink viewName="profile" activeView={activeView} setActiveView={setActiveView} >
                                    <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    الملف الشخصي
                                </NavLink>

                            </div>
                        </>
                            : null}


                    </div>
                )}
            </header>
            {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}
            {isWalletModalOpen && user && <WalletModal onClose={() => setIsWalletModalOpen(false)} />}
        </>
    );
};

export default Header;
