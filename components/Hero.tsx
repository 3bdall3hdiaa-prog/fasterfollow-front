import React from 'react';
import { SiteSettings } from '../types';
import { useThemeStore } from '@/store/theme.store';

interface HeroProps {
    siteName: string;
    content: SiteSettings['homepageContent']['hero'];
}

const Hero: React.FC<HeroProps> = ({ siteName, content }) => {
    const { isDark } = useThemeStore();
    const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
        e.preventDefault();
        const element = document.getElementById(targetId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <section
            className={`pt-32 pb-20 transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-800'
                }`}
            style={{
                backgroundImage: isDark
                    ? 'radial-gradient(circle at top right, var(--color-primary-900), transparent 40%), radial-gradient(circle at bottom left, var(--color-primary-900), transparent 40%)'
                    : 'radial-gradient(circle at top right, #dfd7bb, transparent 40%), radial-gradient(circle at bottom left, #dfd7bb, transparent 40%)',
                backgroundColor: isDark ? 'transparent' : '#ffffff'
            }}
        >
            <div className="container mx-auto px-6 text-center">
                <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 animate-fade-in-down">
                    {content.title}
                    <span
                        className={isDark ? 'text-primary-500' : 'text-[#c9a84c]'}
                        style={{ color: isDark ? 'var(--color-primary-500)' : '#c9a84c' }}
                    >
                        {siteName}
                    </span>
                </h1>
                <p className={`text-lg md:text-xl max-w-3xl mx-auto mb-8 animate-fade-in-up ${isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                    {content.subtitle}
                </p>
                <div className="flex justify-center gap-4 animate-fade-in-up animation-delay-300 flex-wrap">
                    <a
                        href="#services"
                        onClick={(e) => handleScroll(e, 'services')}
                        className={`font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 ${isDark
                                ? 'bg-primary-600 hover:bg-primary-700 text-white'
                                : 'bg-[#c9a84c] hover:bg-[#b8973a] text-white'
                            }`}
                    >
                        {content.cta1}
                    </a>
                    <a
                        href="#how-it-works"
                        onClick={(e) => handleScroll(e, 'how-it-works')}
                        className={`font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 ${isDark
                                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-[#dfd7bb]'
                            }`}
                    >
                        {content.cta2}
                    </a>
                </div>
            </div>
        </section>
    );
};

export default Hero;