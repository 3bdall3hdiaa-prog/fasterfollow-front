import React, { useState, useMemo } from 'react';
import { ServiceResponse, Platform, SiteSettings } from '../types';
import OrderModal from './OrderModal';
import { useCurrency } from '../contexts/CurrencyContext';
import AuthModal from './AuthModal';
import { useThemeStore } from '@/store/theme.store';

interface ServicesProps {
    services: any[];
    platforms: any;
    content: SiteSettings['homepageContent']['services'];
}

const Services: React.FC<ServicesProps> = ({ services, platforms, content }) => {
    const [selectedService, setSelectedService] = useState<any | null>(null);
    const [activePlatform, setActivePlatform] = useState<string>(platforms[0]?.name || '');
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const { formatPrice } = useCurrency();
    const { isDark } = useThemeStore();

    const filteredServices = useMemo(() => {
        return services.filter(s => s.platform === activePlatform);
    }, [services, activePlatform]);

    function z() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role === "client") {
            const baseurl = window.location.origin;
            window.location.href = `${baseurl}/#/client/new-order`;
        }
        else if (user.role === "admin") {
            alert("you are admin")
        }
        else {
            setIsAuthModalOpen(true);
        }
    }

    return (
        <section id="services" className={`py-20 transition-colors duration-300 ${isDark ? 'bg-transparent' : 'bg-gradient-to-b from-[#faf8f2] to-white'
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

                {/* Platform Tabs */}
                <div className="flex justify-center items-center gap-2 md:gap-4 mb-10 flex-wrap">
                    {platforms.map((platform: any) => (
                        <button
                            key={platform.id}
                            onClick={() => setActivePlatform(platform.name)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 border-2 ${activePlatform === platform.name
                                ? isDark
                                    ? 'bg-primary-600 border-primary-500 text-white'
                                    : 'bg-[#c9a84c] border-[#c9a84c] text-white shadow-md'
                                : isDark
                                    ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:border-gray-600'
                                    : 'bg-white border-[#dfd7bb] text-gray-600 hover:bg-[#faf8f2] hover:border-[#c9a84c]'
                                }`}
                        >
                            <span className="text-xl">{platform.iconUrl}</span>
                            <span>{platform.name}</span>
                        </button>
                    ))}
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {filteredServices.map(service => {
                        return (
                            <div
                                key={service.id}
                                className={`rounded-lg overflow-hidden flex flex-col text-center transition-all duration-300 transform hover:-translate-y-2 ${isDark
                                    ? 'bg-gray-800 border border-gray-700 hover:border-primary-500 hover:shadow-2xl hover:shadow-primary-900/50'
                                    : 'bg-white border border-[#dfd7bb] shadow-md hover:border-[#c9a84c] hover:shadow-xl hover:shadow-[#dfd7bb]/30'
                                    }`}
                            >
                                {service.image && <img src={service.image} alt={service.title} className="w-full h-40 object-cover" />}
                                <div className="p-6 flex flex-col flex-grow">
                                    <p className={`mb-4 flex-grow text-sm transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'
                                        }`}>
                                        {service.title}
                                    </p>
                                    <p className={`text-3xl font-bold mb-6 transition-colors duration-300 ${isDark ? 'text-primary-400' : 'text-[#c9a84c]'
                                        }`}>
                                        {formatPrice(service.price)}
                                        <span className={`text-sm transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-500'
                                            }`}> / 1000</span>
                                    </p>
                                    <button
                                        onClick={z}
                                        className={`mt-auto font-bold py-3 px-6 rounded-lg transition-all w-full ${isDark
                                            ? 'bg-primary-600 hover:bg-primary-700 text-white'
                                            : 'bg-[#c9a84c] hover:bg-[#b8973a] text-white shadow-md hover:shadow-lg'
                                            }`}
                                    >
                                        اطلب الآن
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Auth Modal */}
            {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}

            {selectedService && <OrderModal service={selectedService} onClose={() => setSelectedService(null)} />}
        </section>
    );
};

export default Services;