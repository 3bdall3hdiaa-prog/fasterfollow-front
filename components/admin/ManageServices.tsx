import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ServiceResponse, Provider, Platform } from '../../types';
import { useThemeStore } from '@/store/theme.store';
import { useCurrency } from '@/contexts/CurrencyContext';

interface ManageServicesProps {
    services: ServiceResponse[];
    setServices: React.Dispatch<React.SetStateAction<ServiceResponse[]>>;
    providers: Provider[];
    platforms: Platform[];
}

const ManageServices: React.FC<ManageServicesProps> = ({ services, setServices, providers, platforms }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<any | null>(null);
    const [viewingService, setViewingService] = useState<any | null>(null);
    const { formatPrice } = useCurrency();

    // ✅ تعديل: إضافة _id فريد مع رقم عشوائي
    const [discounts, setDiscounts] = useState([
        {
            _id: new Date().toISOString() + Math.random(),
            from: "",
            to: "",
            discount: "",
        },
    ]);

    // ✅ تعديل: إضافة _id فريد مع رقم عشوائي
    const addDiscount = () => {
        setDiscounts([
            ...discounts,
            {
                _id: new Date().toISOString() + Math.random(),
                from: "",
                to: "",
                discount: "",
            },
        ]);
    };

    const removeDiscount = (id: string) => {
        setDiscounts(prev => prev.filter(item => item._id !== id));
    };

    const updateDiscount = (id: string, field: string, value: string) => {
        setDiscounts(prev =>
            prev.map(item =>
                item._id === id ? { ...item, [field]: value } : item
            )
        );
    };

    const [formData, setFormData] = useState<any>({
        title: '',
        description: '',
        provider: '',
        platform: '',
        price: 0,
        min: 0,
        max: 0,
        providerRate: 0,
        status: false,
        providerServiceId: 0,
        file: null as any,
        refill: false,
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const { isDark } = useThemeStore();

    // دوال مساعدة للألوان
    const getBackgroundColor = () => {
        return isDark ? '#1e2235' : '#f8f6f0';
    };

    const getCardBackground = () => {
        return isDark ? '#252a41' : '#ffffff';
    };

    const getCardHeaderBackground = () => {
        return isDark ? '#2f3450' : '#f0ede4';
    };

    const getTextColor = () => {
        return isDark ? '#ffffff' : '#1e2235';
    };

    const getMutedTextColor = () => {
        return isDark ? '#8a8fa8' : '#6c757d';
    };

    const getInputBackground = () => {
        return isDark ? '#1e2235' : '#ffffff';
    };

    const getInputTextColor = () => {
        return isDark ? '#ffffff' : '#1e2235';
    };

    const getModalBackground = () => {
        return isDark ? '#2f3450' : '#ffffff';
    };

    const getModalBodyBackground = () => {
        return isDark ? '#1e2235' : '#f8f6f0';
    };

    // ✅ جلب البيانات من السيرفر عند تحميل الصفحة
    useEffect(() => {
        const fetchServices = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/services-list`, { withCredentials: true });
                setServices(response.data);
            } catch (error) {
                console.error('حدث خطأ أثناء جلب الخدمات:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, [setServices]);

    const handleOpenModal = (service: any | null) => {
        setEditingService(service);
        setFormData(service ? {
            ...service,
            provider: service.provider?._id || '',
            file: null,
            description: service.description || '',
        } : {
            platform: '',
            title: '',
            providerServiceId: 0,
            providerRate: 0,
            price: 0,
            min: 100,
            max: 10000,
            status: true,
            provider: '',
            file: null,
            description: '',
            refill: false,
        });

        if (service?.discounts && service.discounts.length > 0) {
            setDiscounts(
                service.discounts.map((discount: any) => ({
                    _id: discount._id || new Date().toISOString() + Math.random(),
                    from: discount.from || "",
                    to: discount.to || "",
                    discount: discount.discount || ""
                }))
            );
        } else {
            setDiscounts([
                {
                    _id: new Date().toISOString() + Math.random(),
                    from: "",
                    to: "",
                    discount: "",
                }
            ]);
        }

        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleViewService = (service: ServiceResponse) => {
        setViewingService(service);
        setIsViewModalOpen(true);
    };

    const handleCloseViewModal = () => {
        setIsViewModalOpen(false);
        setViewingService(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        if (formData.file) {
            data.append('file', formData.file);
        }
        data.append('title', formData.title);
        data.append('platform', formData.platform);
        if (formData.description) data.append('description', formData.description);
        data.append('provider', formData.provider); // ✅ الآن هي ID وليس كائن        data.append('providerServiceId', formData.providerServiceId.toString());
        data.append('providerRate', formData.providerRate.toString());
        data.append('price', formData.price.toString());
        data.append('providerServiceId', formData.providerServiceId.toString());
        data.append('min', formData.min.toString());
        data.append('max', formData.max.toString());
        data.append('status', formData.status.toString());
        data.append('refill', formData.refill.toString());

        const discountsToSend = discounts.map(({ _id, ...rest }) => rest);
        data.append('discounts', JSON.stringify(discountsToSend));

        try {
            setLoading(true);
            if (editingService) {
                const response = await axios.put(`${import.meta.env.VITE_API_URL}/services-list/${editingService._id}`, data, { withCredentials: true });
                if (response.data) {
                    setServices(prev => prev.map(s => s._id === editingService._id ? response.data : s));
                    handleCloseModal();
                }
            } else {
                const response = await axios.post(`${import.meta.env.VITE_API_URL}/services-list`, data, { withCredentials: true });

                if (response.data) {
                    alert('تم حفظ الخدمة بنجاح');
                    setServices(prev => [...prev, response.data]);
                    window.location.reload();
                    handleCloseModal();
                }
            }
        } catch (error: any) {
            alert(error.response?.data?.message || 'حدث خطأ. يرجى المحاولة مرة أخرى.');
            console.error('حدث خطأ أثناء حفظ الخدمة:', error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteService = async (serviceId: string) => {
        if (window.confirm('هل أنت متأكد من حذف هذه الخدمة؟')) {
            try {
                await axios.delete(`${import.meta.env.VITE_API_URL}/services-list/${serviceId}`, { withCredentials: true });
                setServices(prev => prev.filter(s => s._id !== serviceId));
            } catch (error) {
                console.error('حدث خطأ أثناء حذف الخدمة:', error);
            }
        }
    };

    // فلترة الخدمات حسب البحث
    const filteredServices = services.filter((service: any) =>
        service.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.provider?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.platform?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.providerServiceId?.toString().includes(searchTerm)
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-white text-lg">جاري تحميل الخدمات...</div>
            </div>
        );
    }

    return (
        <div className="p-4" style={{
            backgroundColor: getBackgroundColor(),
            minHeight: "100vh",
            transition: "all 0.3s ease"
        }}>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-center md:text-right" style={{ color: getTextColor() }}>
                    إدارة الخدمات
                </h1>
                <button
                    onClick={() => handleOpenModal(null)}
                    className={`font-bold py-3 px-6 rounded-lg w-full md:w-auto transition-all duration-300 ${isDark
                        ? 'bg-primary-600 hover:bg-primary-700 text-white'
                        : 'bg-[#c9a84c] hover:bg-[#b8973a] text-white shadow-md hover:shadow-lg'
                        }`}
                >
                    إضافة خدمة جديدة
                </button>
            </div>

            {/* حقل البحث */}
            <div className={`rounded-lg p-4 mb-6 transition-all duration-300 ${isDark
                ? 'bg-gray-800 border border-gray-700'
                : 'bg-white border border-[#dfd7bb] shadow-md'
                }`}>
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <input
                        type="text"
                        placeholder="ابحث باسم الخدمة، المزود، المنصة، أو رقم الخدمة..."
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

            {/* ✅ جدول عرض الخدمات - للشاشات الكبيرة */}
            <div className={`hidden md:block rounded-lg overflow-hidden transition-all duration-300 ${isDark
                ? 'bg-gray-800 border border-gray-700'
                : 'bg-white border border-[#dfd7bb] shadow-md'
                }`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right" style={{ color: getTextColor() }}>
                        <thead className={`text-xs uppercase ${isDark ? 'text-gray-400 bg-gray-700/50' : 'text-gray-500 bg-gray-50'
                            }`}>
                            <tr>
                                <th className="px-4 py-3">الصورة</th>
                                <th className="px-4 py-3">ID</th>
                                <th className="px-4 py-3">الخدمة</th>
                                <th className="px-4 py-3">المزود</th>
                                <th className="px-4 py-3">السعر / 1000</th>
                                <th className="px-4 py-3">الحالة</th>
                                <th className="px-4 py-3">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredServices.map((service: any) => (
                                <tr key={service._id} className={`border-b transition-colors ${isDark
                                    ? 'border-gray-700 hover:bg-gray-700/50'
                                    : 'border-[#dfd7bb] hover:bg-gray-50'
                                    }`}>
                                    <td className="px-4 py-4">
                                        {service.image?.url ? (
                                            <img
                                                src={service.image.url}
                                                alt={service.title}
                                                className="w-10 h-10 rounded object-cover"
                                            />
                                        ) : (
                                            <div className={`w-10 h-10 rounded flex items-center justify-center ${isDark ? 'bg-gray-600' : 'bg-gray-200'
                                                }`}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'
                                                    }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-4">{service._id}</td>
                                    <td className="px-4 py-4" style={{ color: getTextColor() }}>{service.title}</td>
                                    <td className="px-4 py-4" style={{ color: getTextColor() }}>{service.provider.name}</td>
                                    <td className="px-4 py-4 text-green-400 font-semibold">{formatPrice(service.price || 0)}</td>
                                    <td className="px-4 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs ${service.status
                                            ? isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
                                            : isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {service.status ? 'نشطة' : 'موقوفة'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleViewService(service)}
                                                className={`p-2 rounded flex items-center gap-1 transition-colors ${isDark
                                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                                                    }`}
                                                title="عرض التفاصيل"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                <span className="text-xs">عرض</span>
                                            </button>
                                            <button
                                                onClick={() => handleOpenModal(service)}
                                                className={`p-2 rounded flex items-center gap-1 transition-colors ${isDark
                                                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                                    : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                                                    }`}
                                                title="تعديل"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                <span className="text-xs">تعديل</span>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteService(service._id!)}
                                                className={`p-2 rounded flex items-center gap-1 transition-colors ${isDark
                                                    ? 'bg-red-600 hover:bg-red-700 text-white'
                                                    : 'bg-red-500 hover:bg-red-600 text-white'
                                                    }`}
                                                title="حذف"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                <span className="text-xs">حذف</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ✅ تصميم البطاقات للهواتف */}
            <div className="block md:hidden">
                <div className={`rounded-lg overflow-hidden transition-all duration-300 ${isDark
                    ? 'bg-gray-800 border border-gray-700'
                    : 'bg-white border border-[#dfd7bb] shadow-md'
                    }`}>
                    {filteredServices.length === 0 ? (
                        <div className="text-center py-8" style={{ color: getMutedTextColor() }}>
                            {services.length === 0 ? 'لا توجد خدمات حالياً' : 'لم يتم العثور على خدمات تطابق البحث'}
                        </div>
                    ) : (
                        filteredServices.map((service: any) => (
                            <div key={service._id} className={`border-b p-4 transition-colors ${isDark
                                ? 'border-gray-700 hover:bg-gray-700/50'
                                : 'border-[#dfd7bb] hover:bg-gray-50'
                                }`}>
                                {/* رأس البطاقة */}
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        {service.image?.url ? (
                                            <img
                                                src={service.image.url}
                                                alt={service.title}
                                                className="w-12 h-12 rounded object-cover"
                                            />
                                        ) : (
                                            <div className={`w-12 h-12 rounded flex items-center justify-center ${isDark ? 'bg-gray-600' : 'bg-gray-200'
                                                }`}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isDark ? 'text-gray-400' : 'text-gray-500'
                                                    }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                        <div>
                                            <div className="font-semibold" style={{ color: getTextColor() }}>{service.title}</div>
                                            <div style={{ color: getMutedTextColor() }} className="text-sm">ID: {service.providerServiceId}</div>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs ${service.status
                                        ? isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
                                        : isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {service.status ? 'نشطة' : 'موقوفة'}
                                    </span>
                                </div>

                                {/* معلومات الخدمة */}
                                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                                    <div>
                                        <div className="text-xs mb-1" style={{ color: getMutedTextColor() }}>المزود</div>
                                        <div style={{ color: getTextColor() }}>{service.provider.name}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs mb-1" style={{ color: getMutedTextColor() }}>المنصة</div>
                                        <div style={{ color: getTextColor() }}>{service.platform}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs mb-1" style={{ color: getMutedTextColor() }}>السعر / 1000</div>
                                        <div className="text-green-400 font-semibold">{formatPrice(service.price || 0)}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs mb-1" style={{ color: getMutedTextColor() }}>الحد الأدنى</div>
                                        <div style={{ color: getTextColor() }}>{service.min}</div>
                                    </div>
                                </div>

                                {/* أزرار الإجراءات */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleViewService(service)}
                                        className={`p-2 rounded flex items-center gap-1 flex-1 justify-center transition-colors ${isDark
                                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                                            }`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        <span className="text-xs">عرض</span>
                                    </button>
                                    <button
                                        onClick={() => handleOpenModal(service)}
                                        className={`p-2 rounded flex items-center gap-1 flex-1 justify-center transition-colors ${isDark
                                            ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                            : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                                            }`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        <span className="text-xs">تعديل</span>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteService(service._id!)}
                                        className={`p-2 rounded flex items-center gap-1 flex-1 justify-center transition-colors ${isDark
                                            ? 'bg-red-600 hover:bg-red-700 text-white'
                                            : 'bg-red-500 hover:bg-red-600 text-white'
                                            }`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        <span className="text-xs">حذف</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* ✅ نافذة الإضافة / التعديل */}
            {isModalOpen && (
                <div
                    className="fixed flex-col inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
                    onClick={handleCloseModal}
                >
                    <div
                        className={`rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden transition-all duration-300 ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
                            }`}
                        onClick={e => e.stopPropagation()}
                    >
                        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <h3 className="text-xl font-bold mb-2" style={{ color: getTextColor() }}>
                                {editingService ? 'تعديل الخدمة' : 'إضافة خدمة جديدة'}
                            </h3>

                            {/* ✅ حقل رابط الصورة */}
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: getTextColor() }}>رابط الصورة</label>
                                <input
                                    type="file"
                                    name="file"
                                    onChange={(e: any) => { setFormData((prev: any) => ({ ...prev, file: e.target.files?.[0] })); }}
                                    className={`w-full p-2 rounded text-sm md:text-base transition-all duration-300 ${isDark
                                        ? 'bg-gray-700 text-white'
                                        : 'bg-gray-50 text-gray-800 border border-[#dfd7bb]'
                                        }`}
                                />
                                {formData.file && (
                                    <div className="mt-2">
                                        <p className="text-sm mb-1" style={{ color: getMutedTextColor() }}>معاينة الصورة:</p>
                                        <img
                                            src={formData.file ? URL.createObjectURL(formData.file) : ''}
                                            alt="معاينة"
                                            className="h-20 object-cover rounded border border-gray-600"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            <input
                                name="title"
                                value={formData.title || ''}
                                onChange={(e) => { setFormData((prev: any) => ({ ...prev, title: e.target.value })); }}
                                placeholder="اسم الخدمة"
                                className={`w-full p-2 rounded text-sm md:text-base transition-all duration-300 ${isDark
                                    ? 'bg-gray-700 text-white'
                                    : 'bg-gray-50 text-gray-800 border border-[#dfd7bb]'
                                    }`}
                                required
                            />

                            {/* ✅ حقل وصف الخدمة */}
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: getTextColor() }}>وصف الخدمة</label>
                                <textarea
                                    name="description"
                                    value={formData.description || ''}
                                    onChange={(e) => { setFormData((prev: any) => ({ ...prev, description: e.target.value })); }}
                                    placeholder="أدخل وصف الخدمة هنا..."
                                    rows={3}
                                    className={`w-full p-2 rounded text-sm md:text-base transition-all duration-300 ${isDark
                                        ? 'bg-gray-700 text-white'
                                        : 'bg-gray-50 text-gray-800 border border-[#dfd7bb]'
                                        }`}
                                />
                            </div>

                            <select
                                name="platform"
                                value={formData.platform || ''}
                                onChange={(e) => { setFormData((prev: any) => ({ ...prev, platform: e.target.value })); }}
                                className={`w-full p-2 rounded text-sm md:text-base transition-all duration-300 ${isDark
                                    ? 'bg-gray-700 text-white'
                                    : 'bg-gray-50 text-gray-800 border border-[#dfd7bb]'
                                    }`}
                            >
                                <option value="" disabled>اختر المنصه</option>
                                {platforms.map((p: any) => (
                                    <option key={p._id} value={p.name}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                            <select
                                name="provider"
                                value={formData.provider || ''}
                                onChange={(e) => { setFormData((prev: any) => ({ ...prev, provider: e.target.value })); }}
                            >
                                <option value="" disabled>اختر المزود</option>
                                {providers.map((p: any) => (
                                    <option key={p._id} value={p._id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>

                            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                <input
                                    type="number"
                                    name="providerServiceId"
                                    value={formData.providerServiceId || ''}
                                    onChange={(e) => { setFormData((prev: any) => ({ ...prev, providerServiceId: e.target.value })); }}
                                    placeholder="رقم الخدمة عند المزود"
                                    className={`w-full p-2 rounded text-sm md:text-base transition-all duration-300 ${isDark
                                        ? 'bg-gray-700 text-white'
                                        : 'bg-gray-50 text-gray-800 border border-[#dfd7bb]'
                                        }`}
                                    required
                                />

                                {/*  حقل refill */}
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: getTextColor() }}>
                                        Refill
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setFormData((prev: any) => ({ ...prev, refill: !prev.refill }))}
                                        className={`w-full p-2 rounded text-sm md:text-base transition-all duration-300 font-medium ${formData.refill
                                            ? isDark
                                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                                : 'bg-green-500 hover:bg-green-600 text-white'
                                            : isDark
                                                ? 'bg-gray-600 hover:bg-gray-700 text-white'
                                                : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
                                            }`}
                                    >
                                        {formData.refill ? '✅ True' : '❌ False'}
                                    </button>
                                    <p className="text-xs mt-1" style={{ color: getMutedTextColor() }}>
                                        {formData.refill ? 'مفعل' : 'غير مفعل'}
                                    </p>
                                </div>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="providerRate"
                                    value={formData.providerRate || ''}
                                    onChange={(e) => { setFormData((prev: any) => ({ ...prev, providerRate: e.target.value })); }}
                                    placeholder="سعر المزود لكل الف"
                                    className={`w-full p-2 rounded text-sm md:text-base transition-all duration-300 ${isDark
                                        ? 'bg-gray-700 text-white'
                                        : 'bg-gray-50 text-gray-800 border border-[#dfd7bb]'
                                        }`}
                                    required
                                />

                                <input
                                    type="number"
                                    step="0.01"
                                    name="price"
                                    value={formData.price || ''}
                                    onChange={(e) => { setFormData((prev: any) => ({ ...prev, price: e.target.value })); }}
                                    placeholder="سعرك للعميل لكل الف"
                                    className={`w-full p-2 rounded text-sm md:text-base transition-all duration-300 ${isDark
                                        ? 'bg-gray-700 text-white'
                                        : 'bg-gray-50 text-gray-800 border border-[#dfd7bb]'
                                        }`}
                                    required
                                />

                                <input
                                    type="number"
                                    name="min"
                                    value={formData.min || ''}
                                    onChange={(e) => { setFormData((prev: any) => ({ ...prev, min: e.target.value })); }}
                                    placeholder="الحد الأدنى للطلب"
                                    className={`w-full p-2 rounded text-sm md:text-base transition-all duration-300 ${isDark
                                        ? 'bg-gray-700 text-white'
                                        : 'bg-gray-50 text-gray-800 border border-[#dfd7bb]'
                                        }`}
                                    required
                                />

                                <input
                                    type="number"
                                    name="max"
                                    value={formData.max || ''}
                                    onChange={(e) => { setFormData((prev: any) => ({ ...prev, max: e.target.value })); }}
                                    placeholder="الحد الأقصى للطلب"
                                    className={`w-full p-2 rounded text-sm md:text-base transition-all duration-300 ${isDark
                                        ? 'bg-gray-700 text-white'
                                        : 'bg-gray-50 text-gray-800 border border-[#dfd7bb]'
                                        }`}
                                    required
                                />

                                {/* ✅ قسم الخصومات */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg">
                                        خصومات الكميات
                                    </h3>

                                    {discounts?.map((item) => (
                                        <div
                                            key={item._id}
                                            className="flex items-end gap-3"
                                        >
                                            {/* من */}
                                            <div className="flex-1">
                                                <label className="block mb-1 text-sm">من كمية</label>
                                                <input
                                                    type="number"
                                                    value={item.from}
                                                    onChange={(e) => updateDiscount(item._id, 'from', e.target.value)}
                                                    placeholder="مثال: 1000"
                                                    className="w-full border rounded-lg p-2"
                                                />
                                            </div>

                                            {/* إلى */}
                                            <div className="flex-1">
                                                <label className="block mb-1 text-sm">إلى كمية</label>
                                                <input
                                                    type="number"
                                                    value={item.to}
                                                    onChange={(e) => updateDiscount(item._id, 'to', e.target.value)}
                                                    placeholder="مثال: 1999"
                                                    className="w-full border rounded-lg p-2"
                                                />
                                            </div>

                                            {/* الخصم */}
                                            <div className="flex-1">
                                                <label className="block mb-1 text-sm">الخصم %</label>
                                                <input
                                                    type="number"
                                                    max="100"
                                                    value={item.discount}
                                                    onChange={(e) => updateDiscount(item._id, 'discount', e.target.value)}
                                                    placeholder="مثال: 10"
                                                    className="w-full border rounded-lg p-2"
                                                />
                                            </div>

                                            {/* حذف */}
                                            {discounts.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeDiscount(item._id)}
                                                    className="px-3 py-2 text-red-500"
                                                >
                                                    حذف
                                                </button>
                                            )}
                                        </div>
                                    ))}

                                    {/* إضافة */}
                                    <button
                                        type="button"
                                        onClick={addDiscount}
                                        className="text-blue-600 font-medium"
                                    >
                                        + إضافة خصم
                                    </button>
                                </div>
                            </div>

                            <select
                                name="status"
                                value={formData.status ? 'true' : 'false'}
                                onChange={e => setFormData((prev: any) => ({ ...prev, status: e.target.value === 'true' }))}
                                className={`w-full p-2 rounded text-sm md:text-base transition-all duration-300 ${isDark
                                    ? 'bg-gray-700 text-white'
                                    : 'bg-gray-50 text-gray-800 border border-[#dfd7bb]'
                                    }`}
                            >
                                <option value="true">نشطة</option>
                                <option value="false">موقوفة</option>
                            </select>

                            <div className="flex justify-end gap-3 pt-4 border-t" style={{
                                borderColor: isDark ? '#374151' : '#dfd7bb'
                            }}>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className={`py-2 px-4 rounded text-sm md:text-base transition-colors ${isDark
                                        ? 'bg-gray-600 hover:bg-gray-700 text-white'
                                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                                        }`}
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className={`py-2 px-4 rounded text-sm md:text-base transition-all duration-300 ${isDark
                                        ? 'bg-primary-600 hover:bg-primary-700 text-white'
                                        : 'bg-[#c9a84c] hover:bg-[#b8973a] text-white shadow-md hover:shadow-lg'
                                        }`}
                                >
                                    {loading ? 'جاري الحفظ...' : 'حفظ'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ✅ نافذة عرض التفاصيل */}
            {isViewModalOpen && viewingService && (
                <div
                    className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
                    onClick={handleCloseViewModal}
                >
                    <div
                        className={`rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden transition-all duration-300 ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
                            }`}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-4 md:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <h3 className="text-xl font-bold mb-2" style={{ color: getTextColor() }}>تفاصيل الخدمة</h3>

                            {/* ✅ عرض الصورة في نافذة العرض */}
                            {viewingService.image?.url && (
                                <div className="flex justify-center mb-4">
                                    <img
                                        src={viewingService.image.url}
                                        alt={viewingService.title}
                                        className="h-32 md:h-40 object-cover rounded-lg border border-gray-600"
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm" style={{ color: getMutedTextColor() }}>معرف الخدمة:</p>
                                    <p className="text-sm break-words" style={{ color: getTextColor() }}>{viewingService._id}</p>
                                </div>
                                <div>
                                    <p className="text-sm" style={{ color: getMutedTextColor() }}>رقم الخدمة عند المزود:</p>
                                    <p style={{ color: getTextColor() }}>{viewingService.providerServiceId}</p>
                                </div>
                                <div>
                                    <p className="text-sm" style={{ color: getMutedTextColor() }}>اسم الخدمة:</p>
                                    <p className="font-semibold" style={{ color: getTextColor() }}>{viewingService.title}</p>
                                </div>
                                <div>
                                    <p className="text-sm" style={{ color: getMutedTextColor() }}>المزود:</p>
                                    <p style={{ color: getTextColor() }}>{viewingService.provider.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm" style={{ color: getMutedTextColor() }}>المنصة:</p>
                                    <p style={{ color: getTextColor() }}>{viewingService.platform}</p>
                                </div>
                                <div>
                                    <p className="text-sm" style={{ color: getMutedTextColor() }}>السعر / 1000:</p>
                                    <p className="text-green-400 font-semibold">{formatPrice(viewingService.price || 0)}</p>
                                </div>
                                <div>
                                    <p className="text-sm" style={{ color: getMutedTextColor() }}>سعر المزود:</p>
                                    <p style={{ color: getTextColor() }}>{formatPrice(viewingService.providerRate || 0)}</p>
                                </div>
                                <div>
                                    <p className="text-sm" style={{ color: getMutedTextColor() }}>الحد الأدنى:</p>
                                    <p style={{ color: getTextColor() }}>{viewingService.min}</p>
                                </div>
                                <div>
                                    <p className="text-sm" style={{ color: getMutedTextColor() }}>الحد الأقصى:</p>
                                    <p style={{ color: getTextColor() }}>{viewingService.max}</p>
                                </div>

                                <div>
                                    <p className="text-sm" style={{ color: getMutedTextColor() }}>Refill:</p>
                                    <p style={{ color: getTextColor() }}>{viewingService.refill ? 'نعم' : 'لا'}</p>
                                </div>

                                {viewingService.type && (
                                    <div>
                                        <p className="text-sm" style={{ color: getMutedTextColor() }}>النوع:</p>
                                        <p style={{ color: getTextColor() }}>{viewingService.type}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm" style={{ color: getMutedTextColor() }}>الحالة:</p>
                                    <p className={viewingService.status ? 'text-green-400' : 'text-red-400'}>
                                        {viewingService.status ? 'نشطة' : 'موقوفة'}
                                    </p>
                                </div>
                                {viewingService.image?.url && (
                                    <div className="col-span-1 md:col-span-2">
                                        <p className="text-sm" style={{ color: getMutedTextColor() }}>رابط الصورة:</p>
                                        <p className="break-words text-sm" style={{ color: getTextColor() }}>{viewingService.image.url}</p>
                                    </div>
                                )}
                            </div>

                            {/* ✅ عرض وصف الخدمة في نافذة العرض */}
                            {viewingService.description && (
                                <div className="col-span-1 md:col-span-2">
                                    <p className="text-sm" style={{ color: getMutedTextColor() }}>الوصف:</p>
                                    <p className={`p-3 rounded mt-1 text-sm ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-800'
                                        }`}>{viewingService.description}</p>
                                </div>
                            )}

                            <div className="flex justify-end pt-4 border-t" style={{
                                borderColor: isDark ? '#374151' : '#dfd7bb'
                            }}>
                                <button
                                    onClick={handleCloseViewModal}
                                    className={`py-2 px-4 rounded text-sm md:text-base transition-all duration-300 ${isDark
                                        ? 'bg-primary-600 hover:bg-primary-700 text-white'
                                        : 'bg-[#c9a84c] hover:bg-[#b8973a] text-white shadow-md hover:shadow-lg'
                                        }`}
                                >
                                    إغلاق
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageServices;