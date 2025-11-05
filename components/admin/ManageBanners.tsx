import React, { useState } from 'react';
import { Banner } from '../../types';

interface ManageBannersProps {
    banners: Banner[];
    setBanners: React.Dispatch<React.SetStateAction<Banner[]>>;
}

const ManageBanners: React.FC<ManageBannersProps> = ({ banners, setBanners }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
    const [formData, setFormData] = useState<Partial<Banner>>({});
    const [loading, setLoading] = useState(false);

    const API_BASE = import.meta.env.VITE_API_URL;

    // دالة لجلب كل البانرات
    const fetchBanners = async () => {
        try {
            const response = await fetch(`${API_BASE}/managepanners`);
            if (!response.ok) throw new Error('فشل في جلب البيانات');
            const data = await response.json();

            // تحويل البيانات لاستخدام _id كـ id
            const formattedBanners: Banner[] = data.map((banner: any) => ({
                id: banner._id, // استخدام _id مباشرة من الداتابيز
                title: banner.title || 'No Title',
                subtitle: banner.subtitle || '',
                ctaText: banner.ctaText || 'اطلب الآن',
                ctaLink: banner.ctaLink || '#',
                imageUrl: banner.imageUrl || 'https://images.unsplash.com/photo-1611605698335-8b1569810432?auto=format&fit=crop&w=1000&q=80',
                isActive: banner.isActive !== undefined ? banner.isActive : true
            }));

            setBanners(formattedBanners);
        } catch (error) {
            console.error('Error fetching banners:', error);
            alert('فشل في جلب البانرات');
        }
    };

    // دالة لإضافة بانر جديد
    const addBanner = async (bannerData: Partial<Banner>) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/managepanners`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bannerData),
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
    const updateBanner = async (bannerId: string, bannerData: Partial<Banner>) => {
        // تحقق من أن bannerId موجود وصالح
        if (!bannerId || bannerId === 'undefined' || bannerId === 'null') {
            console.error('Invalid banner ID:', bannerId);
            alert('معرف البانر غير صالح');
            return false;
        }

        // تحقق إذا كان الـ ID هو ObjectId صالح (24 حرف hex)
        const objectIdRegex = /^[0-9a-fA-F]{24}$/;
        if (!objectIdRegex.test(bannerId)) {
            console.error('Invalid ObjectId format:', bannerId);
            alert('صيغة معرف البانر غير صالحة');
            return false;
        }

        setLoading(true);
        try {
            console.log('Sending update request for banner ID:', bannerId);
            console.log('Update data:', bannerData);

            const response = await fetch(`${API_BASE}/managepanners/${bannerId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bannerData),
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
        // تحقق من أن bannerId موجود وصالح
        if (!bannerId || bannerId === 'undefined' || bannerId === 'null') {
            console.error('Invalid banner ID:', bannerId);
            alert('معرف البانر غير صالح');
            return;
        }

        // تحقق إذا كان الـ ID هو ObjectId صالح (24 حرف hex)
        const objectIdRegex = /^[0-9a-fA-F]{24}$/;
        if (!objectIdRegex.test(bannerId)) {
            console.error('Invalid ObjectId format:', bannerId);
            alert('صيغة معرف البانر غير صالحة');
            return;
        }

        if (!window.confirm('هل أنت متأكد من حذف هذا البانر؟')) return;

        setLoading(true);
        try {
            console.log('Sending delete request for banner ID:', bannerId);

            const response = await fetch(`${API_BASE}/managepanners/${bannerId}`, {
                method: 'DELETE',
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

    const handleOpenModal = (banner: Banner | null) => {

        setEditingBanner(banner);
        setFormData(banner || {
            title: '',
            subtitle: '',
            ctaText: 'اطلب الآن',
            ctaLink: '#services',
            imageUrl: '',
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

        // إعداد البيانات للإرسال
        const bannerData = {
            title: formData.title || '',
            subtitle: formData.subtitle || '',
            ctaText: formData.ctaText || 'اطلب الآن',
            ctaLink: formData.ctaLink || '#services',
            imageUrl: formData.imageUrl || '',
            isActive: formData.isActive !== undefined ? formData.isActive : true
        };

        let success = false;

        if (editingBanner && editingBanner.id) {
            console.log('Updating banner with ID:', editingBanner.id);
            success = await updateBanner(editingBanner.id, bannerData);
        } else {
            console.log('Adding new banner');
            success = await addBanner(bannerData);
        }

        if (success) {
            handleCloseModal();
        }
    };

    const handleDelete = (bannerId: string) => {
        console.log('Deleting banner with ID:', bannerId);
        deleteBanner(bannerId);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">إدارة البانرات</h1>
                <button
                    onClick={() => handleOpenModal(null)}
                    className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg"
                    disabled={loading}
                >
                    {loading ? 'جاري التحميل...' : 'إضافة بانر جديد'}
                </button>
            </div>

            {loading && (
                <div className="text-center py-4">
                    <div className="text-white">جاري التحميل...</div>
                </div>
            )}

            <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                <table className="w-full text-sm text-right text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                        <tr>
                            <th className="px-4 py-3">العنوان</th>
                            <th className="px-4 py-3">الحالة</th>
                            <th className="px-4 py-3">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {banners.map(banner => (
                            <tr key={banner.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                <td className="px-4 py-4 text-white">{banner.title}</td>
                                <td className="px-4 py-4">
                                    <span className={`px-2 py-1 text-xs rounded-full ${banner.isActive ? 'bg-green-900 text-green-300' : 'bg-gray-600 text-gray-200'}`}>
                                        {banner.isActive ? 'نشط' : 'غير نشط'}
                                    </span>
                                </td>
                                <td className="px-4 py-4 flex space-x-2 space-x-reverse">
                                    <button
                                        onClick={() => handleOpenModal(banner)}
                                        className="text-primary-400 hover:text-primary-300"
                                        disabled={loading}
                                    >
                                        تعديل
                                    </button>
                                    <button
                                        onClick={() => handleDelete(banner.id)}
                                        className="text-red-400 hover:text-red-300"
                                        disabled={loading}
                                    >
                                        حذف
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {banners.length === 0 && !loading && (
                            <tr>
                                <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                                    لا توجد بانرات
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={handleCloseModal}>
                    <div className="bg-gray-800 text-white rounded-2xl shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <h3 className="text-xl font-bold">
                                {editingBanner ? `تعديل بانر - ID: ${editingBanner.id}` : 'إضافة بانر'}
                            </h3>

                            <input
                                name="title"
                                value={formData.title || ''}
                                onChange={handleChange}
                                placeholder="العنوان الرئيسي"
                                className="w-full bg-gray-700 p-2 rounded border border-gray-600 focus:border-primary-500 focus:outline-none"
                                required
                                disabled={loading}
                            />

                            <input
                                name="subtitle"
                                value={formData.subtitle || ''}
                                onChange={handleChange}
                                placeholder="العنوان الفرعي"
                                className="w-full bg-gray-700 p-2 rounded border border-gray-600 focus:border-primary-500 focus:outline-none"
                                disabled={loading}
                            />

                            <input
                                name="ctaText"
                                value={formData.ctaText || ''}
                                onChange={handleChange}
                                placeholder="نص زر الحث على اتخاذ إجراء"
                                className="w-full bg-gray-700 p-2 rounded border border-gray-600 focus:border-primary-500 focus:outline-none"
                                disabled={loading}
                            />

                            <input
                                name="ctaLink"
                                value={formData.ctaLink || ''}
                                onChange={handleChange}
                                placeholder="رابط الزر (e.g., #services)"
                                className="w-full bg-gray-700 p-2 rounded border border-gray-600 focus:border-primary-500 focus:outline-none"
                                disabled={loading}
                            />

                            <input
                                name="imageUrl"
                                value={formData.imageUrl || ''}
                                onChange={handleChange}
                                placeholder="رابط صورة الخلفية"
                                className="w-full bg-gray-700 p-2 rounded border border-gray-600 focus:border-primary-500 focus:outline-none"
                                required
                                disabled={loading}
                            />

                            <label className="flex items-center space-x-2 space-x-reverse pt-2">
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

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="bg-gray-600 hover:bg-gray-500 py-2 px-4 rounded transition-colors"
                                    disabled={loading}
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className="bg-primary-600 hover:bg-primary-500 py-2 px-4 rounded transition-colors"
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