import React, { useState } from 'react';
import { Platform } from '../../types';

interface ManagePlatformsProps {
    platforms: Platform[];
    setPlatforms: React.Dispatch<React.SetStateAction<Platform[]>>;
}

const ManagePlatforms: React.FC<ManagePlatformsProps> = ({ platforms, setPlatforms }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null);
    const [formData, setFormData] = useState<Partial<Platform>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const handleOpenModal = (platform: Platform | null) => {
        setEditingPlatform(platform);
        setFormData(platform || { name: '', iconUrl: '' });
        setIsModalOpen(true);
        setError(null);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setError(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // دالة للإضافة عبر API
    const addPlatformToAPI = async (platformData: Partial<Platform>): Promise<Platform> => {
        const response = await fetch(`${API_URL}/manageplatforms`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(platformData)
        });

        if (!response.ok) {
            throw new Error('فشل في إضافة المنصة');
        }

        return await response.json();
    };

    // دالة للتعديل عبر API
    const updatePlatformInAPI = async (id: string, platformData: Partial<Platform>): Promise<Platform> => {
        const response = await fetch(`${API_URL}/manageplatforms/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(platformData)
        });

        if (!response.ok) {
            throw new Error('فشل في تحديث المنصة');
        }

        return await response.json();
    };

    // دالة للحذف عبر API
    const deletePlatformFromAPI = async (id: string): Promise<void> => {
        const response = await fetch(`${API_URL}/manageplatforms/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('فشل في حذف المنصة');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (editingPlatform) {
                // التعديل
                const updatedPlatform = await updatePlatformInAPI(editingPlatform._id, formData);
                setPlatforms(platforms.map(p => p._id === editingPlatform._id ? updatedPlatform : p));
            } else {
                // الإضافة
                const newPlatform = await addPlatformToAPI(formData);
                setPlatforms([...platforms, newPlatform]);
            }
            handleCloseModal();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (platformId: string) => {
        if (!window.confirm('هل أنت متأكد من حذف هذه المنصة؟')) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await deletePlatformFromAPI(platformId);
            setPlatforms(platforms.filter(p => p._id !== platformId));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'حدث خطأ أثناء الحذف');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">إدارة المنصات</h1>
                <button
                    onClick={() => handleOpenModal(null)}
                    className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                    disabled={loading}
                >
                    {loading ? 'جاري التحميل...' : 'إضافة منصة جديدة'}
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-600/20 border border-red-600 rounded-lg text-red-300">
                    {error}
                </div>
            )}

            <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                {platforms.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        لا توجد منصات مضافة حتى الآن
                    </div>
                ) : (
                    <table className="w-full text-sm text-right text-gray-300">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                            <tr>
                                <th className="px-4 py-3">الاسم</th>
                                <th className="px-4 py-3">الأيقونة</th>
                                <th className="px-4 py-3">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {platforms.map(platform => (
                                <tr key={platform._id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                    <td className="px-4 py-4 text-white font-medium">{platform.name}</td>
                                    <td className="px-4 py-4 text-2xl">{platform.iconUrl}</td>
                                    <td className="px-4 py-4">
                                        <div className="flex gap-3 justify-end">
                                            <button
                                                onClick={() => handleOpenModal(platform)}
                                                className="text-primary-400 hover:text-primary-300 transition duration-200"
                                                disabled={loading}
                                            >
                                                تعديل
                                            </button>
                                            <button
                                                onClick={() => handleDelete(platform._id)}
                                                className="text-red-400 hover:text-red-300 transition duration-200"
                                                disabled={loading}
                                            >
                                                حذف
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={handleCloseModal}>
                    <div className="bg-gray-800 text-white rounded-2xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <h3 className="text-xl font-bold">
                                {editingPlatform ? 'تعديل منصة' : 'إضافة منصة'}
                            </h3>

                            {error && (
                                <div className="p-2 bg-red-600/20 border border-red-600 rounded text-red-300 text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">
                                    اسم المنصة
                                </label>
                                <input
                                    name="name"
                                    value={formData.name || ''}
                                    onChange={handleChange}
                                    placeholder="أدخل اسم المنصة"
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-primary-500 focus:outline-none transition duration-200"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">
                                    الأيقونة (Emoji)
                                </label>
                                <input
                                    name="iconUrl"
                                    value={formData.iconUrl || ''}
                                    onChange={handleChange}
                                    placeholder="أدخل أيقونة emoji"
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-primary-500 focus:outline-none transition duration-200"
                                    disabled={loading}
                                />
                                <p className="text-xs text-gray-400">
                                    يمكنك استخدام أي emoji كأيقونة للمنصة
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="bg-gray-600 hover:bg-gray-500 text-white py-2 px-6 rounded-lg transition duration-200"
                                    disabled={loading}
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className="bg-primary-600 hover:bg-primary-500 text-white py-2 px-6 rounded-lg transition duration-200 flex items-center gap-2"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span>جاري الحفظ...</span>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        </>
                                    ) : (
                                        'حفظ'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagePlatforms;