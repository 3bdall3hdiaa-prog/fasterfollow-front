import React from 'react';
import { SiteSettings } from '../types';
import { useThemeStore } from '@/store/theme.store';

interface HowItWorksProps {
    content: SiteSettings['homepageContent']['howItWorks'];
}

const HowItWorks: React.FC<HowItWorksProps> = ({ content }) => {
    const { isDark } = useThemeStore();

    return (
        <section id="how-it-works" className={`py-20 transition-colors duration-300 ${isDark ? 'bg-transparent' : 'bg-gradient-to-b from-white to-[#faf8f2]'
            }`}>
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className={`text-3xl md:text-4xl font-extrabold transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-800'
                        }`}>
                        {content.title}
                    </h2>
                    <p className={`mt-2 transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                        {content.subtitle}
                    </p>
                </div>
                <div className="relative">
                    {/* Dashed line connector */}
                    <div
                        className={`hidden md:block absolute top-1/2 left-0 w-full h-0.5 border-t-2 border-dashed transition-colors duration-300 ${isDark ? 'border-gray-600' : 'border-[#dfd7bb]'
                            }`}
                        style={{ transform: 'translateY(-50%)' }}
                    ></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        {content.steps.map((item, index) => (
                            <div
                                key={index}
                                className={`text-center p-8 rounded-xl z-10 transition-all duration-300 ${isDark
                                        ? 'bg-gray-800 border border-gray-700'
                                        : 'bg-white border border-[#dfd7bb] shadow-md hover:shadow-xl'
                                    }`}
                            >
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white transition-colors duration-300 ${isDark ? 'bg-primary-600' : 'bg-[#c9a84c]'
                                    }`}>
                                    {index + 1}
                                </div>
                                <h3 className={`text-xl font-bold mb-3 transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-800'
                                    }`}>
                                    {item.title}
                                </h3>
                                <p className={`transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'
                                    }`}>
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;