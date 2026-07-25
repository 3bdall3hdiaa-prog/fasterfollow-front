import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { Page } from '../types';
import AuthModal from './AuthModal';
import WalletModal from './WalletModal';
import Notifications from './client/Notifications';
import ThemeButton from './ThemeButton';
import { useThemeStore } from '@/store/theme.store';

interface HeaderProps {
    siteName: string;
    logoUrl: any;
    pages: Page[];
}

const Header: React.FC<HeaderProps> = ({ siteName, logoUrl, pages }) => {
    const { user, logout } = useUser();
    const { currency, setCurrency, currencies } = useCurrency();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const { isDark } = useThemeStore();
    const siteNameParts = siteName.split(' ');
    const mainName = siteNameParts[0];
    const subName = siteNameParts.slice(1).join(' ');

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

    const handleLogout = () => {
        logout();
        setIsUserMenuOpen(false);
        window.location.hash = '/';
    };

    const navigateToPanel = () => {
        setIsUserMenuOpen(false);
        window.location.hash = user?.role === 'admin' ? '/admin' : '/client';
    };
    const getuser = localStorage.getItem('user')
    const userObject = getuser ? JSON.parse(getuser) : null;

    return (
        <>
            <header className={`fixed top-0 right-0 left-0 backdrop-blur-md border-b z-30 transition-colors duration-300 ${isDark
                    ? 'bg-gray-900/80 border-gray-700'
                    : 'bg-white/90 border-[#dfd7bb] shadow-sm'
                }`}>
                <div className="container mx-auto px-6">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo and Site Name */}
                        <a href="#/" className="flex items-center space-x-3 space-x-reverse">
                            {logoUrl && <img src={logoUrl} alt={siteName} className="h-10 w-10 object-contain" />}
                            <span className="text-xl font-extrabold transition-colors duration-300">
                                <span className={isDark ? 'text-primary-500' : 'text-[#c9a84c]'}>
                                    {mainName}
                                </span>
                                <span className={isDark ? 'text-white' : 'text-gray-800'}>
                                    {subName}
                                </span>
                            </span>
                        </a>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-6 space-x-reverse text-sm font-medium">
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
                        <div className="flex items-center space-x-2 space-x-reverse">
                            {/*theme */}
                            <ThemeButton />

                            {/* Currency Selector */}
                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className={`rounded-md py-1 px-2 text-xs focus:outline-none transition-colors duration-300 ${isDark
                                        ? 'bg-gray-800 text-gray-300 border border-gray-700'
                                        : 'bg-white text-gray-700 border border-[#dfd7bb]'
                                    }`}
                            >
                                {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>

                            {user ? (
                                <div className="relative flex items-center gap-4">
                                    <Notifications />
                                    <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center space-x-2 space-x-reverse">
                                        <span className={`font-semibold transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-800'
                                            }`}>
                                            {getDisplayName()}
                                        </span>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold transition-colors duration-300 ${isDark ? 'bg-primary-600' : 'bg-[#c9a84c]'
                                            }`}>
                                            {getInitial()}
                                        </div>
                                    </button>
                                    {isUserMenuOpen && (
                                        <div className={`absolute top-full mt-2 left-0 w-48 rounded-lg shadow-lg border z-20 transition-colors duration-300 ${isDark
                                                ? 'bg-gray-800 border-gray-700'
                                                : 'bg-white border-[#dfd7bb]'
                                            }`}>
                                            <a href="#" onClick={(e) => { e.preventDefault(); navigateToPanel(); }} className={`block px-4 py-2 text-sm transition-colors duration-300 ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                                                }`}>لوحة التحكم</a>
                                            {userObject.role === 'client' ? (
                                                <>
                                                    <a href="#/client/profile" onClick={() => setIsUserMenuOpen(false)} className={`block px-4 py-2 text-sm transition-colors duration-300 ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                                                        }`}>الملف الشخصي</a>
                                                    <hr className={`transition-colors duration-300 ${isDark ? 'border-gray-700' : 'border-[#dfd7bb]'
                                                        }`} />
                                                </>
                                            ) : (
                                                ''
                                            )}
                                            <button onClick={handleLogout} className="block w-full text-right px-4 py-2 text-sm text-red-400 hover:bg-gray-700">تسجيل الخروج</button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="hidden md:flex items-center space-x-2 space-x-reverse">
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

                            {/* Mobile Menu Button */}
                            <div className="md:hidden">
                                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`transition-colors duration-300 ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'
                                    }`}>
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className={`md:hidden border-t p-4 space-y-2 transition-colors duration-300 ${isDark
                            ? 'bg-gray-800 border-gray-700'
                            : 'bg-white border-[#dfd7bb]'
                        }`}>
                        <a href="#/" onClick={() => setIsMenuOpen(false)} className={`block transition-colors duration-300 ${isDark ? 'text-gray-300 hover:text-primary-400' : 'text-gray-600 hover:text-[#c9a84c]'
                            }`}>الرئيسية</a>
                        <a href="#/blog" onClick={() => setIsMenuOpen(false)} className={`block transition-colors duration-300 ${isDark ? 'text-gray-300 hover:text-primary-400' : 'text-gray-600 hover:text-[#c9a84c]'
                            }`}>المدونة</a>
                        {pages.filter(p => p.isPublished).map(page => (
                            <a key={page.id} href={`#/page/${page.slug}`} onClick={() => setIsMenuOpen(false)} className={`block transition-colors duration-300 ${isDark ? 'text-gray-300 hover:text-primary-400' : 'text-gray-600 hover:text-[#c9a84c]'
                                }`}>{page.title}</a>
                        ))}
                        {!user && (
                            <button onClick={() => { setIsAuthModalOpen(true); setIsMenuOpen(false); }} className={`w-full text-right font-bold py-2 px-4 rounded-lg text-sm transition-all duration-300 mt-2 ${isDark
                                    ? 'bg-primary-600 hover:bg-primary-700 text-white'
                                    : 'bg-[#c9a84c] hover:bg-[#b8973a] text-white'
                                }`}>
                                دخول / تسجيل
                            </button>
                        )}
                    </div>
                )}
            </header>
            {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}
            {isWalletModalOpen && user && <WalletModal onClose={() => setIsWalletModalOpen(false)} />}
        </>
    );
};

export default Header;