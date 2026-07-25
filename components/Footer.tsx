import React from 'react';
import { Page } from '../types';
import { useThemeStore } from '@/store/theme.store';

interface FooterProps {
    siteName: string;
    pages: Page[];
    onNavigate: (view: 'page', slug: string) => void;
}

const Footer: React.FC<FooterProps> = ({ siteName, pages, onNavigate }) => {
    const { isDark } = useThemeStore();
    const siteNameParts = siteName.split(' ');
    const mainName = siteNameParts[0];
    const subName = siteNameParts.slice(1).join(' ');

    return (
        <footer className={`border-t transition-colors duration-300 ${isDark
                ? 'bg-gray-900/50 border-gray-700'
                : 'bg-white border-[#dfd7bb] shadow-inner'
            }`}>
            <div className="container mx-auto px-6 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-right">
                    <div className="mb-4 md:mb-0">
                        <div className="text-2xl font-extrabold">
                            <span
                                className={isDark ? 'text-primary-500' : 'text-[#c9a84c]'}
                                style={{ color: isDark ? 'var(--color-primary-500)' : '#c9a84c' }}
                            >
                                {mainName}
                            </span>
                            <span className={isDark ? 'text-white' : 'text-gray-800'}>
                                {subName}
                            </span>
                        </div>
                        <p className={`mt-2 transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                            الحل الأمثل لنمو حساباتك الاجتماعية.
                        </p>
                    </div>
                    <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                        <p className="transition-colors duration-300">
                            &copy; {new Date().getFullYear()} {siteName}. جميع الحقوق محفوظة.
                        </p>
                        <div className="flex justify-center md:justify-start space-x-4 space-x-reverse mt-2 flex-wrap gap-2">
                            {pages.filter(p => p.isPublished).map(page => (
                                <a
                                    key={page.id}
                                    href={`#/page/${page.slug}`}
                                    onClick={(e) => { e.preventDefault(); onNavigate('page', page.slug); }}
                                    className={`transition-colors duration-300 hover:underline ${isDark ? 'hover:text-primary-400' : 'hover:text-[#c9a84c]'
                                        }`}
                                >
                                    {page.title}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;