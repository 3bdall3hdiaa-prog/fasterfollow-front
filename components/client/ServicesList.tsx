import React, { useState, useMemo, useEffect } from 'react';
import { ServiceResponse } from '../../types';
import axios from 'axios';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useThemeStore } from '@/store/theme.store';

const ServicesList: React.FC = () => {
    const { isDark } = useThemeStore();
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const { formatPrice } = useCurrency();

    // دوال مساعدة للألوان
    const getTextColor = () => {
        return isDark ? '#ffffff' : '#1e2235';
    };

    const getMutedTextColor = () => {
        return isDark ? '#8a8fa8' : '#6c757d';
    };

    const getCardBackground = () => {
        return isDark ? '#252a41' : '#ffffff';
    };

    const getInputBackground = () => {
        return isDark ? '#1e2235' : '#ffffff';
    };

    const getInputTextColor = () => {
        return isDark ? '#ffffff' : '#1e2235';
    };

    const getBorderColor = () => {
        return isDark ? '#374151' : '#dfd7bb';
    };

    // جلب البيانات من السيرفر
    useEffect(() => {
        const fetchServices = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/services-list`, { withCredentials: true });

                const servicesData = response.data.map((service: any) => ({
                    _id: service._id,
                    id: service.id,
                    providerServiceId: service.providerServiceId,
                    provider: service.provider,
                    platform: service.platform,
                    title: service.title,
                    price: service.price,
                    providerRate: service.providerRate,
                    min: service.min,
                    max: service.max,
                    description: service.description,
                    status: service.status,
                    type: service.type
                }));

                setServices(servicesData);
            } catch (err) {
                console.error('خطأ في جلب الخدمات:', err);
                setError('فشل في تحميل الخدمات. يرجى المحاولة مرة أخرى.');
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    const filteredServices = useMemo(() => {
        return services.filter(service =>
            service.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.provider.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [services, searchTerm]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div style={{ color: getTextColor() }}>جاري تحميل الخدمات...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`p-4 rounded-lg text-center ${isDark
                ? 'bg-red-900/50 border border-red-700 text-red-300'
                : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                {error}
            </div>
        );
    }

    return (
        <div className="p-4" style={{
            minHeight: "100vh",
            transition: "all 0.3s ease"
        }}>
            <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center md:text-right" style={{ color: getTextColor() }}>
                قائمة الخدمات
            </h1>

            <div className={`rounded-lg p-4 mb-6 transition-all duration-300 ${isDark
                ? 'bg-gray-800 border border-gray-700'
                : 'bg-white border border-[#dfd7bb] shadow-md'
                }`}>
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <input
                        type="text"
                        placeholder="ابحث بالمنصة، اسم الخدمة، أو المزود..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`rounded-md p-3 w-full md:w-1/2 text-sm md:text-base transition-all duration-300 ${isDark
                            ? 'bg-gray-700 border border-gray-600 text-white'
                            : 'bg-gray-50 border border-[#dfd7bb] text-gray-800'
                            }`}
                    />
                    <div className="text-sm md:text-base" style={{ color: getMutedTextColor() }}>
                        إجمالي الخدمات: {services.length} | المعروض: {filteredServices.length}
                    </div>
                </div>
            </div>

            <div className={`rounded-lg overflow-hidden transition-all duration-300 ${isDark
                ? ''
                : ''
                }`}>
                {filteredServices.length === 0 ? (
                    <div className="text-center py-8" style={{ color: getMutedTextColor() }}>
                        {services.length === 0 ? 'لا توجد خدمات حالياً' : 'لم يتم العثور على خدمات تطابق البحث'}
                    </div>
                ) : (
                    <>
                        {/* تصميم الهواتف */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredServices.map(service => (
                                <div
                                    key={service._id}
                                    className={`border-2 rounded-lg p-4 transition-colors h-full min-h-[280px] flex flex-col ${isDark ? 'bg-gray-700/30 border-gray-600' : 'bg-white border-[#dfd7bb]'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-3 gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs flex-shrink-0 ${service.status
                                            ? isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
                                            : isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {service.status ? 'نشطة' : 'موقوفة'}
                                        </span>
                                        <span className="text-green-400 font-semibold text-lg flex-shrink-0">
                                            {formatPrice(service.price)}
                                        </span>
                                    </div>

                                    <div className="mb-3 flex-1">
                                        <div className="font-semibold  mb-1 " style={{ color: getTextColor() }}>
                                            {service.title}
                                        </div>
                                        {service.description && (
                                            <div className="text-xs line-clamp-3" style={{ color: getMutedTextColor() }}>
                                                {service.description.length > 100
                                                    ? `${service.description.substring(0, 100)}...`
                                                    : service.description
                                                }
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 text-sm mb-2">
                                        <div style={{ color: getMutedTextColor() }}>
                                            <div className="text-xs mb-1">المنصة</div>
                                            <div className="truncate" style={{ color: getTextColor() }}>{service.platform}</div>
                                        </div>
                                        <div style={{ color: getMutedTextColor() }}>
                                            <div className="text-xs mb-1">الحد الأدنى</div>
                                            <div style={{ color: getTextColor() }}>{service.min?.toLocaleString()}</div>
                                        </div>
                                        <div style={{ color: getMutedTextColor() }}>
                                            <div className="text-xs mb-1">الحد الأقصى</div>
                                            <div style={{ color: getTextColor() }}>{service.max?.toLocaleString()}</div>
                                        </div>
                                    </div>

                                    <div className={`flex justify-between items-center mt-3 pt-3 border-t ${isDark ? 'border-gray-600' : 'border-[#dfd7bb]'
                                        }`}>
                                        <div className="text-xs font-mono truncate" style={{ color: getMutedTextColor() }}>
                                            رقم: {service.id}
                                        </div>
                                        <div className="text-xs flex-shrink-0" style={{ color: getMutedTextColor() }}>
                                            {service.type || '-'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>


                    </>
                )}
            </div>

            {/* معلومات إضافية للهواتف */}
            <div className="block md:hidden mt-4 text-center">
                <div className="text-sm" style={{ color: getMutedTextColor() }}>
                    اسحب لليمين لعرض المزيد من التفاصيل
                </div>
            </div>
        </div>
    );
};

export default ServicesList;