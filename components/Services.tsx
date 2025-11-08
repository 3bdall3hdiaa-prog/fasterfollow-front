import React, { useState, useMemo } from 'react';
import { ServicePackage, Platform, SiteSettings } from '../types';
import OrderModal from './OrderModal';
import { useCurrency } from '../contexts/CurrencyContext';
import AuthModal from './AuthModal'; // ✅ استيراد نافذة تسجيل الدخول

interface ServicesProps {
    services: ServicePackage[];
    platforms: Platform[];
    content: SiteSettings['homepageContent']['services'];
}

const Services: React.FC<ServicesProps> = ({ services, platforms, content }) => {
    const [selectedService, setSelectedService] = useState<ServicePackage | null>(null);
    const [activePlatform, setActivePlatform] = useState<string>(platforms[0]?.name || '');
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false); // ✅ حالة نافذة تسجيل الدخول
    const { formatPrice } = useCurrency();

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
            setIsAuthModalOpen(true); // ✅ فتح نافذة تسجيل الدخول
        }
    }

    return (
        <section id="services" className="py-20 bg-gray-900">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white">{content.title}</h2>
                    <p className="text-gray-400 mt-2">{content.subtitle}</p>
                </div>

                {/* Platform Tabs */}
                <div className="flex justify-center items-center gap-2 md:gap-4 mb-10 flex-wrap">
                    {platforms.map(platform => (
                        <button
                            key={platform.id}
                            onClick={() => setActivePlatform(platform.name)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors border-2 ${activePlatform === platform.name
                                ? 'bg-primary-600 border-primary-500 text-white'
                                : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:border-gray-600'
                                }`}
                        >
                            <span className="text-xl">{platform.iconUrl}</span>
                            <span>{platform.name}</span>
                        </button>
                    ))}
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {filteredServices.map(service => (
                        <div key={service.id} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 flex flex-col text-center transition-all duration-300 hover:border-primary-500 hover:shadow-2xl hover:shadow-primary-900/50 transform hover:-translate-y-2">
                            {service.imageUrl && <img src={service.imageUrl} alt={service.title} className="w-full h-40 object-cover" />}
                            <div className="p-6 flex flex-col flex-grow">
                                {/*<h3 className="text-xl font-bold text-white mb-2">{service.title}</h3>*/}
                                <p className="text-gray-400 mb-4 flex-grow text-sm">{service.title}</p>
                                <p className="text-3xl font-bold text-primary-400 mb-6">{formatPrice(service.price)}<span className="text-sm text-gray-400"> / 1000</span></p>
                                <button onClick={z} className="mt-auto bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg transition-colors w-full">
                                    اطلب الآن
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ✅ نافذة تسجيل الدخول */}
            {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}

            {selectedService && <OrderModal service={selectedService} onClose={() => setSelectedService(null)} />}
        </section>
    );
};

export default Services;
