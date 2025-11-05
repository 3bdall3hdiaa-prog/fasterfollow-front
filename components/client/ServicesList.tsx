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
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">قائمة الخدمات</h1>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <input
                        type="text"
                        placeholder="ابحث بالمنصة، اسم الخدمة، أو المزود..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-gray-700 border border-gray-600 rounded-md p-2 text-white w-full md:w-1/2"
                    />
                    <div className="text-gray-400 text-sm">
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
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-right text-gray-300">
                            <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                                <tr>
                                    <th className="px-4 py-3">رقم الخدمة</th>
                                    <th className="px-4 py-3">المزود</th>
                                    <th className="px-4 py-3">المنصة</th>
                                    <th className="px-4 py-3">الخدمة</th>
                                    <th className="px-4 py-3">سعرنا</th>
                                    {/* <th className="px-4 py-3">سعر المزود</th> */}
                                    <th className="px-4 py-3">الحد الأدنى</th>
                                    <th className="px-4 py-3">الحد الأقصى</th>
                                    {/* <th className="px-4 py-3">النوع</th> */}
                                    <th className="px-4 py-3">الحالة</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredServices.map(service => (
                                    <tr key={service._id} className="border-b border-gray-700 hover:bg-gray-700/50">
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
                                        {/* <td className="px-4 py-4 text-yellow-400">${service.providerRate?.toFixed(2)}</td> */}
                                        <td className="px-4 py-4">{service.min?.toLocaleString()}</td>
                                        <td className="px-4 py-4">{service.max?.toLocaleString()}</td>
                                        {/* <td className="px-4 py-4">{service.type || '-'}</td> */}
                                        <td className="px-4 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs ${service.status
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
                )}
            </div>
        </div>
    );
};

export default ServicesList;