import React, { useState, useMemo, useEffect } from 'react';
import { ServicePackage } from '../../types';
import axios from 'axios';
import { useCurrency } from '../../contexts/CurrencyContext';

const ServicesList: React.FC = () => {
    const [services, setServices] = useState<any>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const { formatPrice } = useCurrency();

    // جلب البيانات من السيرفر
    useEffect(() => {
        const fetchServices = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/services-list`);

                // استخدام البيانات كما هي من السيرفر
                const servicesData = response.data.map((service: any) => ({
                    _id: service._id,
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
                <div className="text-white text-lg">جاري تحميل الخدمات...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg text-center">
                {error}
            </div>
        );
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center md:text-right">
                قائمة الخدمات
            </h1>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <input
                        type="text"
                        placeholder="ابحث بالمنصة، اسم الخدمة، أو المزود..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-gray-700 border border-gray-600 rounded-md p-3 text-white w-full md:w-1/2 text-sm md:text-base"
                    />
                    <div className="text-gray-400 text-sm md:text-base">
                        إجمالي الخدمات: {services.length} | المعروض: {filteredServices.length}
                    </div>
                </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                {filteredServices.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        {services.length === 0 ? 'لا توجد خدمات حالياً' : 'لم يتم العثور على خدمات تطابق البحث'}
                    </div>
                ) : (
                    <>
                        {/* تصميم الهواتف */}
                        <div className="block md:hidden">
                            {filteredServices.map(service => (
                                <div key={service._id} className="bg-gray-700/30 border-b border-gray-600 p-4 hover:bg-gray-700/50 transition-colors">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className={`px-3 py-1 rounded-full text-xs ${service.status
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-red-500/20 text-red-400'
                                            }`}>
                                            {service.status ? 'نشطة' : 'موقوفة'}
                                        </span>
                                        <span className="text-green-400 font-semibold text-lg">
                                            {formatPrice(service.price?.toFixed(2))}
                                        </span>
                                    </div>

                                    <div className="mb-3">
                                        <div className="font-semibold text-white text-base mb-1">{service.title}</div>
                                        {service.description && (
                                            <div className="text-xs text-gray-400">
                                                {service.description.length > 100
                                                    ? `${service.description.substring(0, 100)}...`
                                                    : service.description
                                                }
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 text-sm mb-2">
                                        <div className="text-gray-400">
                                            <div className="text-xs mb-1">المزود</div>
                                            <div className="text-white">{service.provider}</div>
                                        </div>
                                        <div className="text-gray-400">
                                            <div className="text-xs mb-1">المنصة</div>
                                            <div className="text-white">{service.platform}</div>
                                        </div>
                                        <div className="text-gray-400">
                                            <div className="text-xs mb-1">الحد الأدنى</div>
                                            <div className="text-white">{service.min?.toLocaleString()}</div>
                                        </div>
                                        <div className="text-gray-400">
                                            <div className="text-xs mb-1">الحد الأقصى</div>
                                            <div className="text-white">{service.max?.toLocaleString()}</div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-600">
                                        <div className="text-xs text-gray-500 font-mono">
                                            رقم: {service.providerServiceId}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {service.type || '-'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* تصميم الشاشات الكبيرة */}
                        <div className="hidden md:block">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-right text-gray-300">
                                    <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                                        <tr>
                                            <th className="px-4 py-3">رقم الخدمة</th>
                                            <th className="px-4 py-3">المزود</th>
                                            <th className="px-4 py-3">المنصة</th>
                                            <th className="px-4 py-3">الخدمة</th>
                                            <th className="px-4 py-3">سعرنا</th>
                                            <th className="px-4 py-3">الحد الأدنى</th>
                                            <th className="px-4 py-3">الحد الأقصى</th>
                                            <th className="px-4 py-3">الحالة</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredServices.map(service => (
                                            <tr key={service._id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                                                <td className="px-4 py-4 font-mono text-xs">{service.providerServiceId}</td>
                                                <td className="px-4 py-4">{service.provider}</td>
                                                <td className="px-4 py-4">{service.platform}</td>
                                                <td className="px-4 py-4 text-white">
                                                    <div>
                                                        <div className="font-semibold">{service.title}</div>
                                                        {service.description && (
                                                            <div className="text-xs text-gray-400 mt-1">
                                                                {service.description.length > 50
                                                                    ? `${service.description.substring(0, 50)}...`
                                                                    : service.description
                                                                }
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-green-400 font-semibold">{formatPrice(service.price?.toFixed(2))}</td>
                                                <td className="px-4 py-4">{service.min?.toLocaleString()}</td>
                                                <td className="px-4 py-4">{service.max?.toLocaleString()}</td>
                                                <td className="px-4 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs ${service.status
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : 'bg-red-500/20 text-red-400'
                                                        }`}>
                                                        {service.status ? 'نشطة' : 'موقوفة'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* معلومات إضافية للهواتف */}
            <div className="block md:hidden mt-4 text-center">
                <div className="text-gray-400 text-sm">
                    اسحب لليمين لعرض المزيد من التفاصيل
                </div>
            </div>
        </div>
    );
};

export default ServicesList;