import React from 'react';
import { SiteSettings } from '../types';
import { useThemeStore } from '@/store/theme.store';

interface FeaturesProps {
    content: SiteSettings['homepageContent']['features'];
}

const Features: React.FC<FeaturesProps> = ({ content }) => {
    const { isDark } = useThemeStore();

    return (
        <section className={`py-20 transition-colors duration-300 ${isDark ? 'bg-transparent' : 'bg-gradient-to-b from-white to-[#faf8f2]'
            }`}>
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className={`text-3xl md:text-4xl font-extrabold transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-800'
                        }`}>
                        {content.title}
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {content.items.map((feature, index) => (
                        <div
                            key={index}
                            className={`text-center p-6 rounded-lg transform hover:-translate-y-2 transition-all duration-300 ${isDark
                                    ? 'bg-gray-800/50 border border-gray-700'
                                    : 'bg-white border border-[#dfd7bb] shadow-md hover:shadow-xl'
                                }`}
                        >
                            <div className="text-5xl mb-4">{feature.icon}</div>
                            <h3 className={`text-xl font-bold mb-2 transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-800'
                                }`}>
                                {feature.title}
                            </h3>
                            <p className={`transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;