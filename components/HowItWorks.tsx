import React from 'react';
import { SiteSettings } from '../types';

interface HowItWorksProps {
    content: SiteSettings['homepageContent']['howItWorks'];
}

const HowItWorks: React.FC<HowItWorksProps> = ({ content }) => {
    return (
        <section id="how-it-works" className="py-20 bg-gray-900/50">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white">{content.title}</h2>
                    <p className="text-gray-400 mt-2">{content.subtitle}</p>
                </div>
                <div className="relative">
                    {/* Dashed line connector */}
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-700 border-t-2 border-dashed border-gray-600" style={{ transform: 'translateY(-50%)' }}></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        {content.steps.map((item, index) => (
                            <div key={index} className="text-center bg-gray-800 p-8 rounded-xl border border-gray-700 z-10">
                                <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">
                                    {index + 1}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                                <p className="text-gray-400">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;