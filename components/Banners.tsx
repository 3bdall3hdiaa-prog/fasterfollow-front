import React from 'react';
import { Banner } from '../types';

interface BannersProps {
    banners: Banner[];
}

const Banners: React.FC<BannersProps> = ({ banners }) => {
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
        <div className="py-10 bg-gray-900">
            <div className="container mx-auto px-6">
                <div className="relative bg-gray-800 rounded-lg overflow-hidden p-8 md:p-12 border border-gray-700">
                    <div className="relative z-10 text-white text-center md:text-right">
                        <h2 className="text-2xl md:text-4xl font-bold mb-2">{banner.title}</h2>
                        <p className="text-gray-300 mb-6">{banner.subtitle}</p>
                        <a href={banner.ctaLink} onClick={(e) => handleScroll(e, banner.ctaLink)} className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-lg inline-block transition-transform hover:scale-105">
                            {banner.ctaText}
                        </a>
                    </div>
                    <img
                        src={banner.imageUrl}
                        alt={banner.title}
                        className="absolute top-0 left-0 w-full h-full object-cover opacity-10 md:opacity-20 z-0"
                    />
                </div>
            </div>
        </div>
    );
};

export default Banners;