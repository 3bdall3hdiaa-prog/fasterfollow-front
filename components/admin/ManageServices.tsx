import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ServicePackage, Provider, Platform } from '../../types';

interface ManageServicesProps {
    services: ServicePackage[];
    setServices: React.Dispatch<React.SetStateAction<ServicePackage[]>>;
    providers: Provider[];
    platforms: Platform[];
}

const ManageServices: React.FC<ManageServicesProps> = ({ services, setServices, providers, platforms }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<ServicePackage | null>(null);
    const [viewingService, setViewingService] = useState<ServicePackage | null>(null);
    const [formData, setFormData] = useState<Partial<ServicePackage>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    // ✅ جلب البيانات من السيرفر عند تحميل الصفحة
    useEffect(() => {
        const fetchServices = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/services-list`);
                setServices(response.data);
            } catch (error) {
                console.error('حدث خطأ أثناء جلب الخدمات:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, [setServices]);

    const handleOpenModal = (service: ServicePackage | null) => {
        setEditingService(service);
        setFormData(service || {
            platform: platforms[0]?.name || 'Instagram',
            title: '',
            providerServiceId: 0,
            providerRate: 0,
            price: 0,
            min: 100,
            max: 10000,
            status: true,
            provider: '',
            imageUrl: '',
            description: '',
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleViewService = (service: ServicePackage) => {
        setViewingService(service);
        setIsViewModalOpen(true);
    };

    const handleCloseViewModal = () => {
        setIsViewModalOpen(false);
        setViewingService(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const parsedValue = type === 'number' ? Number(value) : value;
        setFormData(prev => ({ ...prev, [name]: parsedValue }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingService) {
                // تعديل الخدمة
                const response = await axios.put(`${import.meta.env.VITE_API_URL}/services-list/${editingService._id}`, formData);
                if (response.data) {
                    setServices(prev => prev.map(s => s._id === editingService._id ? response.data : s));
                    handleCloseModal();
                }
            } else {
                // إضافة خدمة جديدة
                const response = await axios.post(`${import.meta.env.VITE_API_URL}/services-list`, formData);
                if (response.data) {
                    setServices(prev => [...prev, response.data]);
                    handleCloseModal();
                }
            }
        } catch (error) {
            console.error('حدث خطأ أثناء حفظ الخدمة:', error);
        }
    };

    const handleDeleteService = async (serviceId: string) => {
        if (window.confirm('هل أنت متأكد من حذف هذه الخدمة؟')) {
            try {
                await axios.delete(`${import.meta.env.VITE_API_URL}/services-list/${serviceId}`);
                setServices(prev => prev.filter(s => s._id !== serviceId));
            } catch (error) {
                console.error('حدث خطأ أثناء حذف الخدمة:', error);
            }
        }
    };

    // فلترة الخدمات حسب البحث
    const filteredServices = services.filter(service =>
        service.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.provider?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        <div className="p-4">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-white text-center md:text-right">
                    إدارة الخدمات
                </h1>
                <button
                    onClick={() => handleOpenModal(null)}
                    className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg w-full md:w-auto"
                >
                    إضافة خدمة جديدة
                </button>
            </div>

            {/* حقل البحث */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <input
                        type="text"
                        placeholder="ابحث باسم الخدمة، المزود، المنصة، أو رقم الخدمة..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-gray-700 border border-gray-600 rounded-md p-3 text-white w-full md:w-1/2 text-sm md:text-base"
                    />
                    <div className="text-gray-400 text-sm md:text-base">
                        إجمالي الخدمات: {services.length} | المعروض: {filteredServices.length}
                    </div>
                </div>
            </div>

            {/* ✅ جدول عرض الخدمات - للشاشات الكبيرة */}
            <div className="hidden md:block bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right text-gray-300">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
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
                            {filteredServices.map(service => (
                                <tr key={service._id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                    <td className="px-4 py-4">
                                        {service.imageUrl ? (
                                            <img
                                                src={service.imageUrl}
                                                alt={service.title}
                                                className="w-10 h-10 rounded object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded bg-gray-600 flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-4">{service.providerServiceId}</td>
                                    <td className="px-4 py-4 text-white">{service.title}</td>
                                    <td className="px-4 py-4">{service.provider}</td>
                                    <td className="px-4 py-4">${service.price}</td>
                                    <td className="px-4 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs ${service.status ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {service.status ? 'نشطة' : 'موقوفة'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleViewService(service)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded flex items-center gap-1"
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
                                                className="bg-yellow-600 hover:bg-yellow-700 text-white p-2 rounded flex items-center gap-1"
                                                title="تعديل"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                <span className="text-xs">تعديل</span>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteService(service._id!)}
                                                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded flex items-center gap-1"
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
                <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                    {filteredServices.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            {services.length === 0 ? 'لا توجد خدمات حالياً' : 'لم يتم العثور على خدمات تطابق البحث'}
                        </div>
                    ) : (
                        filteredServices.map(service => (
                            <div key={service._id} className="border-b border-gray-700 p-4 hover:bg-gray-700/50 transition-colors">
                                {/* رأس البطاقة */}
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        {service.imageUrl ? (
                                            <img
                                                src={service.imageUrl}
                                                alt={service.title}
                                                className="w-12 h-12 rounded object-cover"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded bg-gray-600 flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                        <div>
                                            <div className="font-semibold text-white text-base">{service.title}</div>
                                            <div className="text-gray-400 text-sm">ID: {service.providerServiceId}</div>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs ${service.status ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {service.status ? 'نشطة' : 'موقوفة'}
                                    </span>
                                </div>

                                {/* معلومات الخدمة */}
                                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                                    <div className="text-gray-400">
                                        <div className="text-xs mb-1">المزود</div>
                                        <div className="text-white">{service.provider}</div>
                                    </div>
                                    <div className="text-gray-400">
                                        <div className="text-xs mb-1">المنصة</div>
                                        <div className="text-white">{service.platform}</div>
                                    </div>
                                    <div className="text-gray-400">
                                        <div className="text-xs mb-1">السعر / 1000</div>
                                        <div className="text-green-400 font-semibold">${service.price}</div>
                                    </div>
                                    <div className="text-gray-400">
                                        <div className="text-xs mb-1">الحد الأدنى</div>
                                        <div className="text-white">{service.min}</div>
                                    </div>
                                </div>

                                {/* أزرار الإجراءات */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleViewService(service)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded flex items-center gap-1 flex-1 justify-center"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        <span className="text-xs">عرض</span>
                                    </button>
                                    <button
                                        onClick={() => handleOpenModal(service)}
                                        className="bg-yellow-600 hover:bg-yellow-700 text-white p-2 rounded flex items-center gap-1 flex-1 justify-center"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        <span className="text-xs">تعديل</span>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteService(service._id!)}
                                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded flex items-center gap-1 flex-1 justify-center"
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
                    className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
                    onClick={handleCloseModal}
                >
                    <div
                        className="bg-gray-800 text-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <h3 className="text-xl font-bold mb-2">
                                {editingService ? 'تعديل الخدمة' : 'إضافة خدمة جديدة'}
                            </h3>

                            {/* ✅ حقل رابط الصورة */}
                            <div>
                                <label className="block text-sm font-medium mb-1">رابط الصورة</label>
                                <input
                                    type="url"
                                    name="imageUrl"
                                    value={formData.imageUrl || ''}
                                    onChange={handleChange}
                                    placeholder="https://example.com/image.jpg"
                                    className="w-full bg-gray-700 p-2 rounded text-sm md:text-base"
                                />
                                {formData.imageUrl && (
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-400 mb-1">معاينة الصورة:</p>
                                        <img
                                            src={formData.imageUrl}
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
                                onChange={handleChange}
                                placeholder="اسم الخدمة"
                                className="w-full bg-gray-700 p-2 rounded text-sm md:text-base"
                                required
                            />

                            {/* ✅ حقل وصف الخدمة */}
                            <div>
                                <label className="block text-sm font-medium mb-1">وصف الخدمة</label>
                                <textarea
                                    name="description"
                                    value={formData.description || ''}
                                    onChange={handleChange}
                                    placeholder="أدخل وصف الخدمة هنا..."
                                    rows={3}
                                    className="w-full bg-gray-700 p-2 rounded text-sm md:text-base"
                                />
                            </div>

                            <select
                                name="platform"
                                value={formData.platform || ''}
                                onChange={handleChange}
                                className="w-full bg-gray-700 p-2 rounded text-sm md:text-base"
                            >
                                {platforms.map(p => (
                                    <option key={p.id} value={p.name}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                name="provider"
                                value={formData.provider || ''}
                                onChange={handleChange}
                                className="w-full bg-gray-700 p-2 rounded text-sm md:text-base"
                            >
                                <option value="">-- اختر المزود --</option>
                                {providers.map(p => (
                                    <option key={p.id} value={p.name}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="number"
                                    name="providerServiceId"
                                    value={formData.providerServiceId || ''}
                                    onChange={handleChange}
                                    placeholder="رقم الخدمة عند المزود"
                                    className="w-full bg-gray-700 p-2 rounded text-sm md:text-base"
                                    required
                                />

                                <input
                                    type="number"
                                    step="0.01"
                                    name="providerRate"
                                    value={formData.providerRate || ''}
                                    onChange={handleChange}
                                    placeholder="سعر المزود"
                                    className="w-full bg-gray-700 p-2 rounded text-sm md:text-base"
                                    required
                                />

                                <input
                                    type="number"
                                    step="0.01"
                                    name="price"
                                    value={formData.price || ''}
                                    onChange={handleChange}
                                    placeholder="سعرك للعميل"
                                    className="w-full bg-gray-700 p-2 rounded text-sm md:text-base"
                                    required
                                />

                                <input
                                    type="number"
                                    name="min"
                                    value={formData.min || ''}
                                    onChange={handleChange}
                                    placeholder="الحد الأدنى للطلب"
                                    className="w-full bg-gray-700 p-2 rounded text-sm md:text-base"
                                    required
                                />

                                <input
                                    type="number"
                                    name="max"
                                    value={formData.max || ''}
                                    onChange={handleChange}
                                    placeholder="الحد الأقصى للطلب"
                                    className="w-full bg-gray-700 p-2 rounded text-sm md:text-base"
                                    required
                                />
                            </div>

                            <select
                                name="status"
                                value={formData.status ? 'true' : 'false'}
                                onChange={e => setFormData(prev => ({ ...prev, status: e.target.value === 'true' }))}
                                className="w-full bg-gray-700 p-2 rounded text-sm md:text-base"
                            >
                                <option value="true">نشطة</option>
                                <option value="false">موقوفة</option>
                            </select>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                                <button type="button" onClick={handleCloseModal} className="bg-gray-600 py-2 px-4 rounded text-sm md:text-base">
                                    إلغاء
                                </button>
                                <button type="submit" className="bg-primary-600 py-2 px-4 rounded text-sm md:text-base">
                                    حفظ
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ✅ نافذة عرض التفاصيل */}
            {isViewModalOpen && viewingService && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
                    onClick={handleCloseViewModal}
                >
                    <div
                        className="bg-gray-800 text-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-4 md:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <h3 className="text-xl font-bold mb-2">تفاصيل الخدمة</h3>

                            {/* ✅ عرض الصورة في نافذة العرض */}
                            {viewingService.imageUrl && (
                                <div className="flex justify-center mb-4">
                                    <img
                                        src={viewingService.imageUrl}
                                        alt={viewingService.title}
                                        className="h-32 md:h-40 object-cover rounded-lg border border-gray-600"
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-400 text-sm">معرف الخدمة:</p>
                                    <p className="text-white text-sm break-words">{viewingService._id}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">رقم الخدمة عند المزود:</p>
                                    <p className="text-white">{viewingService.providerServiceId}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">اسم الخدمة:</p>
                                    <p className="text-white font-semibold">{viewingService.title}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">المزود:</p>
                                    <p className="text-white">{viewingService.provider}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">المنصة:</p>
                                    <p className="text-white">{viewingService.platform}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">السعر / 1000:</p>
                                    <p className="text-white text-green-400 font-semibold">${viewingService.price}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">سعر المزود:</p>
                                    <p className="text-white">${viewingService.providerRate}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">الحد الأدنى:</p>
                                    <p className="text-white">{viewingService.min}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">الحد الأقصى:</p>
                                    <p className="text-white">{viewingService.max}</p>
                                </div>
                                {viewingService.type && (
                                    <div>
                                        <p className="text-gray-400 text-sm">النوع:</p>
                                        <p className="text-white">{viewingService.type}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-gray-400 text-sm">الحالة:</p>
                                    <p className={`${viewingService.status ? 'text-green-400' : 'text-red-400'}`}>
                                        {viewingService.status ? 'نشطة' : 'موقوفة'}
                                    </p>
                                </div>
                                {viewingService.imageUrl && (
                                    <div className="col-span-1 md:col-span-2">
                                        <p className="text-gray-400 text-sm">رابط الصورة:</p>
                                        <p className="text-white break-words text-sm">{viewingService.imageUrl}</p>
                                    </div>
                                )}
                            </div>

                            {/* ✅ عرض وصف الخدمة في نافذة العرض */}
                            {viewingService.description && (
                                <div className="col-span-1 md:col-span-2">
                                    <p className="text-gray-400 text-sm">الوصف:</p>
                                    <p className="text-white bg-gray-700 p-3 rounded mt-1 text-sm">{viewingService.description}</p>
                                </div>
                            )}

                            <div className="flex justify-end pt-4 border-t border-gray-700">
                                <button
                                    onClick={handleCloseViewModal}
                                    className="bg-primary-600 py-2 px-4 rounded text-sm md:text-base"
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
