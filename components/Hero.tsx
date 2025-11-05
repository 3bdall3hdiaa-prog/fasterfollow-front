import React from 'react';
import { SiteSettings } from '../types';

interface HeroProps {
    siteName: string;
    content: SiteSettings['homepageContent']['hero'];
}

const Hero: React.FC<HeroProps> = ({ siteName, content }) => {
    const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
        e.preventDefault();
        const element = document.getElementById(targetId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <section className="bg-gray-900 text-white pt-32 pb-20" style={{
            backgroundImage: 'radial-gradient(circle at top right, var(--color-primary-900), transparent 40%), radial-gradient(circle at bottom left, var(--color-primary-900), transparent 40%)',
        }}>
            <div className="container mx-auto px-6 text-center">
                <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 animate-fade-in-down">
                    {content.title} <span className="text-primary-500" style={{color: 'var(--color-primary-500)'}}>{siteName}</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-8 animate-fade-in-up">
                    {content.subtitle}
                </p>
                <div className="flex justify-center gap-4 animate-fade-in-up animation-delay-300">
                    <a href="#services" onClick={(e) => handleScroll(e, 'services')} className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105">
                        {content.cta1}
                    </a>
                    <a href="#how-it-works" onClick={(e) => handleScroll(e, 'how-it-works')} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105">
                        {content.cta2}
                    </a>
                </div>
            </div>
        </section>
    );
};

export default Hero;