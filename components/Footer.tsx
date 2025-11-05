import React from 'react';
import { Page } from '../types';

interface FooterProps {
    siteName: string;
    pages: Page[];
    onNavigate: (view: 'page', slug: string) => void;
}

const Footer: React.FC<FooterProps> = ({ siteName, pages, onNavigate }) => {
    const siteNameParts = siteName.split(' ');
    const mainName = siteNameParts[0];
    const subName = siteNameParts.slice(1).join(' ');

    return (
        <footer className="bg-gray-800/50 border-t border-gray-700">
            <div className="container mx-auto px-6 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-right">
                    <div className="mb-4 md:mb-0">
                        <div className="text-2xl font-extrabold text-white">
                            <span className="text-primary-500" style={{color: 'var(--color-primary-500)'}}>{mainName}</span> {subName}
                        </div>
                        <p className="text-gray-400 mt-2">الحل الأمثل لنمو حساباتك الاجتماعية.</p>
                    </div>
                    <div className="text-gray-400">
                        <p>&copy; {new Date().getFullYear()} {siteName}. جميع الحقوق محفوظة.</p>
                        <div className="flex justify-center md:justify-start space-x-4 space-x-reverse mt-2">
                            {pages.filter(p => p.isPublished).map(page => (
                                <a key={page.id} href={`#/page/${page.slug}`} onClick={(e) => { e.preventDefault(); onNavigate('page', page.slug); }} className="hover:text-primary-400">{page.title}</a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;