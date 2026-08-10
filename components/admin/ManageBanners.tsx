import React, { useState } from 'react';
import { BannerFormData, BannerResponse } from '../../types';
import { useThemeStore } from '@/store/theme.store';

interface ManageBannersProps {
    banners: BannerResponse[];
    setBanners: React.Dispatch<React.SetStateAction<BannerResponse[]>>;
}

const ManageBanners: React.FC<ManageBannersProps> = ({ banners, setBanners }) => {
    const { isDark } = useThemeStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<BannerResponse | null>(null);
    const [formData, setFormData] = useState<Partial<BannerFormData>>({});
    const [loading, setLoading] = useState(false);

    const API_BASE = import.meta.env.VITE_API_URL;

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

    // دالة لجلب كل البانرات
    const fetchBanners = async () => {
        try {
            const response = await fetch(`${API_BASE}/managepanners`, {
                method: 'GET',
                credentials: 'include', headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) throw new Error('فشل في جلب البيانات');
            const data = await response.json();

            const formattedBanners: BannerResponse[] = data.map((banner: any) => ({
                id: banner._id,
                title: banner.title || 'No Title',
                subtitle: banner.subtitle || '',
                ctaText: banner.ctaText || 'اطلب الآن',
                ctaLink: banner.ctaLink || '#',
                imageUrl: banner.image.url || '',
                isActive: banner.isActive !== undefined ? banner.isActive : true
            }));

            setBanners(formattedBanners);
        } catch (error) {
            console.error('Error fetching banners:', error);
            alert('فشل في جلب البانرات');
        }
    };

    // دالة لإضافة بانر جديد
    const addBanner = async (bannerData: Partial<BannerFormData>) => {
        setLoading(true);
        try {
            const data = new FormData();
            if (bannerData.file) data.append('file', bannerData.file);
            data.append('title', bannerData.title || '');
            data.append('subtitle', bannerData.subtitle || '');
            data.append('ctaText', bannerData.ctaText || 'اطلب الآن');
            data.append('ctaLink', bannerData.ctaLink || '#services');
            if (bannerData.isActive) data.append('isActive', bannerData.isActive.toString());
            const response = await fetch(`${API_BASE}/managepanners`, {
                method: 'POST',
                credentials: 'include',
                body: data,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('فشل في إضافة البانر');

            await fetchBanners();
            alert('تم إضافة البانر بنجاح');
            return true;
        } catch (error) {
            console.error('Error adding banner:', error);
            alert('فشل في إضافة البانر');
            return false;
        } finally {
            setLoading(false);
        }
    };

    // دالة لتعديل بانر موجود
    const updateBanner = async (bannerId: string, bannerData: Partial<BannerFormData>) => {
        if (!bannerId || bannerId === 'undefined' || bannerId === 'null') {
            console.error('Invalid banner ID:', bannerId);
            alert('معرف البانر غير صالح');
            return false;
        }

        const objectIdRegex = /^[0-9a-fA-F]{24}$/;
        if (!objectIdRegex.test(bannerId)) {
            console.error('Invalid ObjectId format:', bannerId);
            alert('صيغة معرف البانر غير صالحة');
            return false;
        }

        setLoading(true);
        try {
            const data = new FormData();
            if (bannerData.file) data.append('file', bannerData.file);
            data.append('title', bannerData.title || '');
            data.append('subtitle', bannerData.subtitle || '');
            data.append('ctaText', bannerData.ctaText || 'اطلب الآن');
            data.append('ctaLink', bannerData.ctaLink || '#services');
            if (bannerData.isActive) data.append('isActive', bannerData.isActive.toString());
            const response = await fetch(`${API_BASE}/managepanners/${bannerId}`, {
                method: 'PUT',
                credentials: 'include',
                body: data, headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`فشل في تعديل البانر: ${errorText}`);
            }

            await fetchBanners();
            alert('تم تعديل البانر بنجاح');
            return true;
        } catch (error) {
            console.error('Error updating banner:', error);
            alert('فشل في تعديل البانر');
            return false;
        } finally {
            setLoading(false);
        }
    };

    // دالة لحذف بانر
    const deleteBanner = async (bannerId: string) => {
        if (!bannerId || bannerId === 'undefined' || bannerId === 'null') {
            console.error('Invalid banner ID:', bannerId);
            alert('معرف البانر غير صالح');
            return;
        }

        const objectIdRegex = /^[0-9a-fA-F]{24}$/;
        if (!objectIdRegex.test(bannerId)) {
            console.error('Invalid ObjectId format:', bannerId);
            alert('صيغة معرف البانر غير صالحة');
            return;
        }

        if (!window.confirm('هل أنت متأكد من حذف هذا البانر؟')) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/managepanners/${bannerId}`, {
                method: 'DELETE',
                credentials: 'include', headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('فشل في حذف البانر');

            await fetchBanners();
            alert('تم حذف البانر بنجاح');
        } catch (error) {
            console.error('Error deleting banner:', error);
            alert('فشل في حذف البانر');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (banner: BannerResponse | null) => {
        setEditingBanner(banner);
        setFormData(banner || {
            title: '',
            subtitle: '',
            ctaText: 'اطلب الآن',
            ctaLink: '#services',
            file: null as any,
            isActive: true
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingBanner(null);
        setFormData({});
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (loading) return;

        const bannerData = {
            title: formData.title || '',
            subtitle: formData.subtitle || '',
            ctaText: formData.ctaText || 'اطلب الآن',
            ctaLink: formData.ctaLink || '#services',
            file: formData.file,
            isActive: formData.isActive !== undefined ? formData.isActive : true
        };

        let success = false;

        if (editingBanner && editingBanner.id) {
            success = await updateBanner(editingBanner.id, bannerData);
        } else {
            success = await addBanner(bannerData);
        }

        if (success) {
            handleCloseModal();
        }
    };

    const handleDelete = (bannerId: any) => {
        deleteBanner(bannerId);
    };

    return (
        <div className="p-4" style={{
            backgroundColor: isDark ? '#1e2235' : '#f8f6f0',
            minHeight: "100vh",
            transition: "all 0.3s ease"
        }}>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-center md:text-right" style={{ color: getTextColor() }}>
                    إدارة البانرات
                </h1>
                <button
                    onClick={() => handleOpenModal(null)}
                    className={`font-bold py-2 px-4 rounded-lg transition-all duration-300 ${isDark
                        ? 'bg-primary-600 hover:bg-primary-700 text-white'
                        : 'bg-[#c9a84c] hover:bg-[#b8973a] text-white shadow-md hover:shadow-lg'
                        }`}
                    disabled={loading}
                >
                    {loading ? 'جاري التحميل...' : 'إضافة بانر جديد'}
                </button>
            </div>

            {loading && (
                <div className="text-center py-4">
                    <div style={{ color: getMutedTextColor() }}>جاري التحميل...</div>
                </div>
            )}

            <div className={`rounded-lg overflow-hidden transition-all duration-300 ${isDark
                ? 'bg-gray-800 border border-gray-700'
                : 'bg-white border border-[#dfd7bb] shadow-md'
                }`}>
                <table className="w-full text-sm text-right" style={{ color: getTextColor() }}>
                    <thead className={`text-xs uppercase ${isDark ? 'text-gray-400 bg-gray-700/50' : 'text-gray-500 bg-gray-50'
                        }`}>
                        <tr>
                            <th className="px-4 py-3">العنوان</th>
                            <th className="px-4 py-3">الحالة</th>
                            <th className="px-4 py-3">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {banners.map(banner => (
                            <tr key={banner.id} className={`border-b transition-colors ${isDark
                                ? 'border-gray-700 hover:bg-gray-700/50'
                                : 'border-[#dfd7bb] hover:bg-gray-50'
                                }`}>
                                <td className="px-4 py-4" style={{ color: getTextColor() }}>{banner.title}</td>
                                <td className="px-4 py-4">
                                    <span className={`px-2 py-1 text-xs rounded-full ${banner.isActive
                                        ? isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'
                                        : isDark ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-600'
                                        }`}>
                                        {banner.isActive ? 'نشط' : 'غير نشط'}
                                    </span>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex space-x-2 space-x-reverse">
                                        <button
                                            onClick={() => handleOpenModal(banner)}
                                            className={`transition-colors ${isDark ? 'text-primary-400 hover:text-primary-300' : 'text-[#c9a84c] hover:text-[#b8973a]'
                                                }`}
                                            disabled={loading}
                                        >
                                            تعديل
                                        </button>
                                        <button
                                            onClick={() => handleDelete(banner.id)}
                                            className="text-red-400 hover:text-red-300 transition-colors"
                                            disabled={loading}
                                        >
                                            حذف
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {banners.length === 0 && !loading && (
                            <tr>
                                <td colSpan={3} className="px-4 py-8 text-center" style={{ color: getMutedTextColor() }}>
                                    لا توجد بانرات
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={handleCloseModal}>
                    <div className={`rounded-2xl shadow-xl w-full max-w-lg transition-all duration-300 ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
                        }`} onClick={e => e.stopPropagation()}>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <h3 className="text-xl font-bold" style={{ color: getTextColor() }}>
                                {editingBanner ? `تعديل بانر - ID: ${editingBanner.id}` : 'إضافة بانر'}
                            </h3>

                            <input
                                name="title"
                                value={formData.title || ''}
                                onChange={handleChange}
                                placeholder="العنوان الرئيسي"
                                className={`w-full p-2 rounded border focus:border-primary-500 focus:outline-none transition-all duration-300 ${isDark
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-gray-50 border-[#dfd7bb] text-gray-800'
                                    }`}
                                required
                                disabled={loading}
                            />

                            <input
                                name="subtitle"
                                value={formData.subtitle || ''}
                                onChange={handleChange}
                                placeholder="العنوان الفرعي"
                                className={`w-full p-2 rounded border focus:border-primary-500 focus:outline-none transition-all duration-300 ${isDark
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-gray-50 border-[#dfd7bb] text-gray-800'
                                    }`}
                                disabled={loading}
                            />

                            <input
                                name="ctaText"
                                value={formData.ctaText || ''}
                                onChange={handleChange}
                                placeholder="نص زر الحث على اتخاذ إجراء"
                                className={`w-full p-2 rounded border focus:border-primary-500 focus:outline-none transition-all duration-300 ${isDark
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-gray-50 border-[#dfd7bb] text-gray-800'
                                    }`}
                                disabled={loading}
                            />

                            <input
                                name="ctaLink"
                                value={formData.ctaLink || ''}
                                onChange={handleChange}
                                placeholder="رابط الزر (e.g., #services)"
                                className={`w-full p-2 rounded border focus:border-primary-500 focus:outline-none transition-all duration-300 ${isDark
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-gray-50 border-[#dfd7bb] text-gray-800'
                                    }`}
                                disabled={loading}
                            />

                            <input
                                type="file"
                                onChange={(e: any) => { setFormData(prev => ({ ...prev, file: e.target.files?.[0] })); }}
                                placeholder="رابط صورة الخلفية"
                                className={`w-full p-2 rounded border focus:border-primary-500 focus:outline-none transition-all duration-300 ${isDark
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-gray-50 border-[#dfd7bb] text-gray-800'
                                    }`}

                                disabled={loading}
                            />

                            <label className="flex items-center space-x-2 space-x-reverse pt-2" style={{ color: getTextColor() }}>
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive || false}
                                    onChange={handleChange}
                                    className="form-checkbox rounded text-primary-600 bg-gray-700 border-gray-600 focus:ring-primary-500"
                                    disabled={loading}
                                />
                                <span>تفعيل البانر</span>
                            </label>

                            <div className="flex justify-end gap-3 pt-4 border-t" style={{
                                borderColor: isDark ? '#374151' : '#dfd7bb'
                            }}>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className={`py-2 px-4 rounded transition-colors ${isDark
                                        ? 'bg-gray-600 hover:bg-gray-500 text-white'
                                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                                        }`}
                                    disabled={loading}
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className={`py-2 px-4 rounded transition-all duration-300 ${isDark
                                        ? 'bg-primary-600 hover:bg-primary-500 text-white'
                                        : 'bg-[#c9a84c] hover:bg-[#b8973a] text-white shadow-md hover:shadow-lg'
                                        }`}
                                    disabled={loading}
                                >
                                    {loading ? 'جاري الحفظ...' : 'حفظ'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageBanners;