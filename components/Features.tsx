import React from 'react';
import { SiteSettings } from '../types';

interface FeaturesProps {
    content: SiteSettings['homepageContent']['features'];
}

const Features: React.FC<FeaturesProps> = ({ content }) => {
    return (
        <section className="py-20 bg-gray-900">
            <div className="container mx-auto px-6">
                 <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white">{content.title}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {content.items.map((feature, index) => (
                        <div key={index} className="text-center p-6 bg-gray-800/50 rounded-lg border border-gray-700 transform hover:-translate-y-2 transition-transform duration-300">
                            <div className="text-5xl mb-4">{feature.icon}</div>
                            <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                            <p className="text-gray-400">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;