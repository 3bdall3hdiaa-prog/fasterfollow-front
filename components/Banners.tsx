import React from 'react';
import { Banner } from '../types';
import { useThemeStore } from '@/store/theme.store';

interface BannersProps {
    banners: Banner[];
}

const Banners: React.FC<BannersProps> = ({ banners }) => {
    const { isDark } = useThemeStore();

    if (banners.length === 0) return null;

    const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (href.startsWith('#')) {
            e.preventDefault();
            const targetId = href.substring(1);
            const element = document.getElementById(targetId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };

    // For simplicity, we'll show the first active banner
    const banner = banners[0];

    return (
        <div className="py-10">
            <div className="container mx-auto px-6">
                <div
                    className={`relative rounded-lg overflow-hidden p-8 md:p-12 border transition-colors duration-300 ${isDark
                            ? 'bg-gray-800 border-gray-700'
                            : 'bg-white border-[#dfd7bb] shadow-lg'
                        }`}
                >
                    <div className="relative z-10 text-center md:text-right">
                        <h2 className={`text-2xl md:text-4xl font-bold mb-2 transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-800'
                            }`}>
                            {banner.title}
                        </h2>
                        <p className={`mb-6 transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                            {banner.subtitle}
                        </p>
                        <a
                            href={banner.ctaLink}
                            onClick={(e) => handleScroll(e, banner.ctaLink)}
                            className={`font-bold py-3 px-8 rounded-lg inline-block transition-all hover:scale-105 ${isDark
                                    ? 'bg-primary-600 hover:bg-primary-700 text-white'
                                    : 'bg-[#c9a84c] hover:bg-[#b8973a] text-white'
                                }`}
                        >
                            {banner.ctaText}
                        </a>
                    </div>
                    {banner.imageUrl && (
                        <img
                            src={banner.imageUrl}
                            alt={banner.title}
                            className={`absolute top-0 left-0 w-full h-full object-cover z-0 transition-opacity duration-300 ${isDark ? 'opacity-10 md:opacity-20' : 'opacity-5 md:opacity-10'
                                }`}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Banners;