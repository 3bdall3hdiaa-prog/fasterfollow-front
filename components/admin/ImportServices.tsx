import React, { useState, useEffect } from 'react';
import { useThemeStore } from '@/store/theme.store';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface Provider {
    _id: string;
    name: string;
    apiKey: string;
    apiEndpoint?: string;
    isActive?: boolean;
}

interface Service {
    service: number;
    name: string;
    type: string;
    category: string;
    rate: string;
    min: string;
    max: string;
    refill: boolean;
    cancel: boolean;
}

const ImportServices = () => {
    const { isDark } = useThemeStore();
    const [providers, setProviders] = useState<Provider[]>([]);
    const [selectedProvider, setSelectedProvider] = useState<string>('');
    const [services, setServices] = useState<Service[]>([]);
    const [selectedServices, setSelectedServices] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState({
        providers: false,
        services: false,
        import: false
    });
    const [error, setError] = useState<string | null>(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [itemsPerPage] = useState<number>(10);

    // جلب المزودين
    const fetchProviders = async () => {
        try {
            setLoading(prev => ({ ...prev, providers: true }));
            setError(null);
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/manage-providers`);

            if (response.data.success) {
                setProviders(response.data.data || response.data);
            } else {
                setProviders(response.data);
            }
        } catch (err: any) {
            console.error('Error fetching providers:', err);
            setError('فشل في تحميل قائمة المزودين');
            toast.error('فشل في تحميل المزودين');
        } finally {
            setLoading(prev => ({ ...prev, providers: false }));
        }
    };

    // جلب الخدمات من مزود معين مع pagination
    const fetchServices = async (providerId: string, page: number = 1) => {
        const provider = providers.find(p => p._id === providerId);
        console.log('جاري جلب الخدمات من المزود:', provider);

        if (!provider) {
            toast.error('المزود غير موجود');
            return;
        }

        try {
            setLoading(prev => ({ ...prev, services: true }));
            setError(null);
            setSelectedServices(new Set());

            // إرسال الطلب مع page
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/services-list/getdata`,
                {
                    params: {
                        apiEndpoint: provider.apiEndpoint,
                        key: provider.apiKey,
                        page: page,
                        limit: itemsPerPage
                    }
                }
            );

            console.log('الرد من السيرفر:', response.data);

            // معالجة الرد - التأكد من أن services دائماً مصفوفة
            let servicesData: Service[] = [];
            let total = 0;
            let totalPagesCount = 1;

            if (response.data) {
                // الحالة الأولى: data في result مع total
                if (response.data) {
                    servicesData = response.data.data;
                    totalPagesCount = response.data.length;
                }
                // الحالة الثانية: result هو المصفوفة
                else if (response.data.result && Array.isArray(response.data.result)) {
                    servicesData = response.data.result;
                    total = response.data.total || servicesData.length;
                    totalPagesCount = response.data.totalPages || Math.ceil(total / itemsPerPage);
                }
                // الحالة الثالثة: data نفسها مصفوفة
                else if (Array.isArray(response.data)) {
                    servicesData = response.data;
                    total = servicesData.length;
                    totalPagesCount = Math.ceil(total / itemsPerPage);
                }
                // الحالة الرابعة: services في data
                else if (response.data.services && Array.isArray(response.data.services)) {
                    servicesData = response.data.services;
                    total = response.data.total || servicesData.length;
                    totalPagesCount = response.data.totalPages || Math.ceil(total / itemsPerPage);
                }
                // الحالة الخامسة: محاولة البحث عن أي مصفوفة في الرد
                else {
                    for (const key in response.data) {
                        if (Array.isArray(response.data[key]) && response.data[key].length > 0) {
                            // التحقق من أن العناصر تطابق واجهة Service
                            const possibleServices = response.data[key];
                            if (possibleServices.length > 0 && possibleServices[0].service !== undefined) {
                                servicesData = possibleServices;
                                total = response.data.total || servicesData.length;
                                totalPagesCount = response.data.totalPages || Math.ceil(total / itemsPerPage);
                                break;
                            }
                        }
                    }
                }
            }

            // التأكد من أن servicesData مصفوفة
            if (!Array.isArray(servicesData)) {
                servicesData = [];
            }

            setServices(servicesData);
            setTotalItems(total);
            setTotalPages(totalPagesCount);
            setCurrentPage(page);

            if (servicesData.length > 0) {
                toast.success(`تم جلب ${servicesData.length} خدمة من أصل ${total}`);
            } else {
                toast.error('لم يتم العثور على خدمات');
                console.warn('تنسيق غير متوقع للرد:', response.data);
            }

        } catch (err: any) {
            console.error('Error fetching services:', err);
            const errorMessage = err.response?.data?.message || err.message || 'فشل في تحميل الخدمات';
            setError(`فشل في تحميل الخدمات: ${errorMessage}`);
            toast.error(errorMessage);
            setServices([]);
            setTotalItems(0);
            setTotalPages(1);
        } finally {
            setLoading(prev => ({ ...prev, services: false }));
        }
    };

    // تغيير الصفحة
    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return;
        setCurrentPage(newPage);
        fetchServices(selectedProvider, newPage);
    };

    // اختيار/إلغاء اختيار خدمة
    const toggleService = (serviceId: number) => {
        setSelectedServices(prev => {
            const newSet = new Set(prev);
            if (newSet.has(serviceId)) {
                newSet.delete(serviceId);
            } else {
                newSet.add(serviceId);
            }
            return newSet;
        });
    };

    // اختيار/إلغاء اختيار الكل في الصفحة الحالية
    const toggleAllServices = () => {
        if (!Array.isArray(services) || services.length === 0) return;

        const currentServiceIds = services.map(s => s.service);
        const allSelected = currentServiceIds.every(id => selectedServices.has(id));

        if (allSelected) {
            // إلغاء اختيار كل الخدمات في الصفحة الحالية
            setSelectedServices(prev => {
                const newSet = new Set(prev);
                currentServiceIds.forEach(id => newSet.delete(id));
                return newSet;
            });
        } else {
            // اختيار كل الخدمات في الصفحة الحالية
            setSelectedServices(prev => {
                const newSet = new Set(prev);
                currentServiceIds.forEach(id => newSet.add(id));
                return newSet;
            });
        }
    };

    // استيراد الخدمات المختارة
    const handleImport = async () => {
        if (selectedServices.size === 0) {
            toast.error('يرجى اختيار خدمة واحدة على الأقل للاستيراد');
            return;
        }

        const provider = providers.find(p => p._id === selectedProvider);
        if (!provider) {
            toast.error('المزود غير موجود');
            return;
        }

        // التأكد من أن services مصفوفة قبل التصفية
        if (!Array.isArray(services)) {
            toast.error('حدث خطأ في بيانات الخدمات');
            return;
        }

        const selectedServicesData = services.filter(s => selectedServices.has(s.service));

        try {
            setLoading(prev => ({ ...prev, import: true }));

            const response = await axios.post(`${import.meta.env.VITE_API_URL}/services-list`, {
                provider: provider._id,
                services: selectedServicesData
            });

            if (response.data.message) {
                toast.success(`تم استيراد ${selectedServicesData.length} خدمة بنجاح`);
                // إعادة تعيين الخدمات المختارة
                setSelectedServices(new Set());
                // إعادة تحميل الصفحة الحالية
                fetchServices(selectedProvider, currentPage);
            } else {
                toast.error(response.data.message || 'فشل في استيراد الخدمات');
            }
        } catch (err: any) {
            console.error('Error importing services:', err);
            toast.error(err.response?.data?.message || 'فشل في استيراد الخدمات');
        } finally {
            setLoading(prev => ({ ...prev, import: false }));
        }
    };

    // تحميل المزودين عند تحميل الصفحة
    useEffect(() => {
        fetchProviders();
    }, []);

    // عند تغيير المزود المختار
    useEffect(() => {
        if (selectedProvider) {
            setCurrentPage(1);
            fetchServices(selectedProvider, 1);
        } else {
            setServices([]);
            setSelectedServices(new Set());
            setTotalItems(0);
            setTotalPages(1);
        }
    }, [selectedProvider]);

    // دالة لعرض أرقام الصفحات
    const renderPageNumbers = () => {
        const pages = [];
        const maxVisible = 7; // عدد الأرقام المرئية في الباجنيشن

        if (totalPages <= maxVisible) {
            // إذا كان عدد الصفحات قليل، اعرض الكل
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // إذا كان عدد الصفحات كبير، اعرض جزء مع علامات حذف
            if (currentPage <= 4) {
                // في البداية
                for (let i = 1; i <= 5; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 3) {
                // في النهاية
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 4; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                // في المنتصف
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 2; i <= currentPage + 2; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="container mx-auto px-4 py-8">
                {/* العنوان */}
                <div className="mb-8">
                    <h1 className={`text-3xl font-bold transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        استيراد الخدمات
                    </h1>
                    <p className={`mt-2 transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        اختر مزوداً ثم اختر الخدمات التي تريد استيرادها
                    </p>
                </div>

                {/* اختيار المزود */}
                <div className={`rounded-lg p-6 mb-8 transition-colors duration-300 ${isDark ? 'bg-gray-800' : 'bg-white shadow-md'}`}>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        اختر المزود
                    </label>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <select
                            value={selectedProvider}
                            onChange={(e) => setSelectedProvider(e.target.value)}
                            className={`flex-1 px-4 py-2 rounded-lg border transition-colors duration-300 ${isDark
                                ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                                : 'bg-white border-gray-300 text-gray-900 focus:border-[#dfd7bb]'
                                } focus:outline-none focus:ring-2 focus:ring-[#dfd7bb]`}
                            disabled={loading.providers}
                        >
                            <option value="">-- اختر مزوداً --</option>
                            {providers.map((provider) => (
                                <option key={provider._id} value={provider._id}>
                                    {provider.name}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={fetchProviders}
                            disabled={loading.providers}
                            className={`px-4 py-2 rounded-lg transition-colors ${isDark
                                ? 'bg-gray-700 text-white hover:bg-gray-600'
                                : 'bg-[#dfd7bb] text-gray-800 hover:bg-[#d4c9a8]'
                                } ${loading.providers ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading.providers ? 'جاري التحميل...' : 'تحديث المزودين'}
                        </button>
                    </div>
                    {error && !selectedProvider && (
                        <p className="text-red-500 text-sm mt-2">{error}</p>
                    )}
                </div>

                {/* عرض الخدمات */}
                {selectedProvider && (
                    <div className={`rounded-lg p-6 transition-colors duration-300 ${isDark ? 'bg-gray-800' : 'bg-white shadow-md'}`}>
                        {/* رأس الجدول مع معلومات */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                            <div>
                                <h2 className={`text-xl font-bold transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                    الخدمات المتاحة
                                </h2>
                                {loading.services ? (
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        جاري تحميل الخدمات...
                                    </p>
                                ) : (
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        عرض {Array.isArray(services) ? services.length : 0} من أصل {totalItems} خدمة (الصفحة {currentPage} من {totalPages})
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {Array.isArray(services) && services.length > 0 && (
                                    <button
                                        onClick={toggleAllServices}
                                        className={`px-4 py-2 rounded-lg text-sm transition-colors ${isDark
                                            ? 'bg-gray-700 text-white hover:bg-gray-600'
                                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                            }`}
                                    >
                                        {services.every(s => selectedServices.has(s.service)) ? 'إلغاء الكل' : 'اختيار الكل'}
                                    </button>
                                )}
                                <button
                                    onClick={handleImport}
                                    disabled={loading.import || selectedServices.size === 0}
                                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${isDark
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-[#dfd7bb] text-gray-800 hover:bg-[#d4c9a8]'
                                        } ${(loading.import || selectedServices.size === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {loading.import ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            جاري الاستيراد...
                                        </span>
                                    ) : (
                                        `استيراد (${selectedServices.size})`
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* جدول الخدمات */}
                        {loading.services ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#dfd7bb] mx-auto"></div>
                                <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    جاري تحميل الخدمات من المزود...
                                </p>
                            </div>
                        ) : !Array.isArray(services) || services.length === 0 ? (
                            <div className={`text-center py-12 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    لا توجد خدمات متاحة من هذا المزود
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                                            <th className="py-3 px-4 text-right">
                                                <input
                                                    type="checkbox"
                                                    checked={services.every(s => selectedServices.has(s.service)) && services.length > 0}
                                                    onChange={toggleAllServices}
                                                    className="w-4 h-4 cursor-pointer"
                                                />
                                            </th>
                                            <th className={`py-3 px-4 text-right text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                اسم الخدمة
                                            </th>
                                            <th className={`py-3 px-4 text-right text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                النوع
                                            </th>
                                            <th className={`py-3 px-4 text-right text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                الفئة
                                            </th>
                                            <th className={`py-3 px-4 text-right text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                السعر
                                            </th>
                                            <th className={`py-3 px-4 text-right text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                الحد الأدنى
                                            </th>
                                            <th className={`py-3 px-4 text-right text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                الحد الأقصى
                                            </th>
                                            <th className={`py-3 px-4 text-center text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                إعادة التعبئة
                                            </th>
                                            <th className={`py-3 px-4 text-center text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                الإلغاء
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {services.map((service) => (
                                            <tr
                                                key={service.service}
                                                className={`border-b transition-colors ${isDark
                                                    ? 'border-gray-700 hover:bg-gray-700/50'
                                                    : 'border-gray-100 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <td className="py-3 px-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedServices.has(service.service)}
                                                        onChange={() => toggleService(service.service)}
                                                        className="w-4 h-4 cursor-pointer"
                                                    />
                                                </td>
                                                <td className={`py-3 px-4 text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                                    {service.name}
                                                </td>
                                                <td className={`py-3 px-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    {service.type}
                                                </td>
                                                <td className={`py-3 px-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    {service.category}
                                                </td>
                                                <td className={`py-3 px-4 text-sm font-mono ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                                                    ${service.rate}
                                                </td>
                                                <td className={`py-3 px-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    {service.min}
                                                </td>
                                                <td className={`py-3 px-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    {service.max}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    {service.refill ? (
                                                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${isDark
                                                            ? 'bg-green-900/30 text-green-400'
                                                            : 'bg-green-100 text-green-600'
                                                            }`}>
                                                            نعم
                                                        </span>
                                                    ) : (
                                                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${isDark
                                                            ? 'bg-red-900/30 text-red-400'
                                                            : 'bg-red-100 text-red-600'
                                                            }`}>
                                                            لا
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    {service.cancel ? (
                                                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${isDark
                                                            ? 'bg-green-900/30 text-green-400'
                                                            : 'bg-green-100 text-green-600'
                                                            }`}>
                                                            نعم
                                                        </span>
                                                    ) : (
                                                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${isDark
                                                            ? 'bg-red-900/30 text-red-400'
                                                            : 'bg-red-100 text-red-600'
                                                            }`}>
                                                            لا
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                                            <td colSpan={9} className="py-4 px-4">
                                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                        تم اختيار <span className="font-bold">{selectedServices.size}</span> من <span className="font-bold">{totalItems}</span> خدمة
                                                    </p>

                                                    {/* Pagination Controls - عرض جميع الصفحات */}
                                                    {totalPages > 1 && (
                                                        <div className="flex items-center gap-2 flex-wrap justify-center">
                                                            <button
                                                                onClick={() => handlePageChange(currentPage - 1)}
                                                                disabled={currentPage === 1 || loading.services}
                                                                className={`px-3 py-1 rounded-lg text-sm transition-colors ${isDark
                                                                    ? 'bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
                                                                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed'
                                                                    }`}
                                                            >
                                                                السابق
                                                            </button>

                                                            <div className="flex gap-1 flex-wrap">
                                                                {renderPageNumbers().map((page, index) => {
                                                                    if (page === '...') {
                                                                        return (
                                                                            <span
                                                                                key={`dots-${index}`}
                                                                                className={`px-2 py-1 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
                                                                            >
                                                                                ...
                                                                            </span>
                                                                        );
                                                                    }
                                                                    return (
                                                                        <button
                                                                            key={page}
                                                                            onClick={() => handlePageChange(page as number)}
                                                                            className={`w-8 h-8 rounded-lg text-sm transition-colors ${currentPage === page
                                                                                ? isDark
                                                                                    ? 'bg-blue-600 text-white'
                                                                                    : 'bg-[#dfd7bb] text-gray-800'
                                                                                : isDark
                                                                                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                                                } ${loading.services ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                        >
                                                                            {page}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>

                                                            <button
                                                                onClick={() => handlePageChange(currentPage + 1)}
                                                                disabled={currentPage === totalPages || loading.services}
                                                                className={`px-3 py-1 rounded-lg text-sm transition-colors ${isDark
                                                                    ? 'bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
                                                                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed'
                                                                    }`}
                                                            >
                                                                التالي
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImportServices;