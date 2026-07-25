import React, { useState } from 'react';
import { Platform } from '../../types';
import { useThemeStore } from '@/store/theme.store';

interface ManagePlatformsProps {
    platforms: Platform[];
    setPlatforms: React.Dispatch<React.SetStateAction<Platform[]>>;
}

const ManagePlatforms: React.FC<ManagePlatformsProps> = ({ platforms, setPlatforms }) => {
    const { isDark } = useThemeStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null);
    const [formData, setFormData] = useState<Partial<Platform>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
                'Authorization': `Bearer ${localStorage.getItem('token')}`
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
                'Authorization': `Bearer ${localStorage.getItem('token')}`
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
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
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
                const updatedPlatform = await updatePlatformInAPI(editingPlatform._id, formData);
                setPlatforms(platforms.map(p => p._id === editingPlatform._id ? updatedPlatform : p));
            } else {
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
        <div className="p-4" style={{
            backgroundColor: isDark ? '#1e2235' : '#f8f6f0',
            minHeight: "100vh",
            transition: "all 0.3s ease"
        }}>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-center md:text-right" style={{ color: getTextColor() }}>
                    إدارة المنصات
                </h1>
                <button
                    onClick={() => handleOpenModal(null)}
                    className={`font-bold py-2 px-4 rounded-lg transition-all duration-300 ${isDark
                        ? 'bg-primary-600 hover:bg-primary-700 text-white'
                        : 'bg-[#c9a84c] hover:bg-[#b8973a] text-white shadow-md hover:shadow-lg'
                        }`}
                    disabled={loading}
                >
                    {loading ? 'جاري التحميل...' : 'إضافة منصة جديدة'}
                </button>
            </div>

            {error && (
                <div className={`mb-4 p-3 rounded-lg ${isDark
                    ? 'bg-red-600/20 border border-red-600 text-red-300'
                    : 'bg-red-50 border border-red-200 text-red-700'
                    }`}>
                    {error}
                </div>
            )}

            <div className={`rounded-lg overflow-hidden transition-all duration-300 ${isDark
                ? 'bg-gray-800 border border-gray-700'
                : 'bg-white border border-[#dfd7bb] shadow-md'
                }`}>
                {platforms.length === 0 ? (
                    <div className="text-center py-8" style={{ color: getMutedTextColor() }}>
                        لا توجد منصات مضافة حتى الآن
                    </div>
                ) : (
                    <table className="w-full text-sm text-right" style={{ color: getTextColor() }}>
                        <thead className={`text-xs uppercase ${isDark ? 'text-gray-400 bg-gray-700/50' : 'text-gray-500 bg-gray-50'
                            }`}>
                            <tr>
                                <th className="px-4 py-3">الاسم</th>
                                <th className="px-4 py-3">الأيقونة</th>
                                <th className="px-4 py-3">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {platforms.map(platform => (
                                <tr key={platform._id} className={`border-b transition-colors ${isDark
                                    ? 'border-gray-700 hover:bg-gray-700/50'
                                    : 'border-[#dfd7bb] hover:bg-gray-50'
                                    }`}>
                                    <td className="px-4 py-4 font-medium" style={{ color: getTextColor() }}>{platform.name}</td>
                                    <td className="px-4 py-4 text-2xl">{platform.iconUrl}</td>
                                    <td className="px-4 py-4">
                                        <div className="flex gap-3 justify-end">
                                            <button
                                                onClick={() => handleOpenModal(platform)}
                                                className={`transition-colors ${isDark ? 'text-primary-400 hover:text-primary-300' : 'text-[#c9a84c] hover:text-[#b8973a]'
                                                    }`}
                                                disabled={loading}
                                            >
                                                تعديل
                                            </button>
                                            <button
                                                onClick={() => handleDelete(platform._id)}
                                                className="text-red-400 hover:text-red-300 transition-colors"
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
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={handleCloseModal}>
                    <div className={`rounded-2xl shadow-xl w-full max-w-md transition-all duration-300 ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
                        }`} onClick={e => e.stopPropagation()}>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <h3 className="text-xl font-bold" style={{ color: getTextColor() }}>
                                {editingPlatform ? 'تعديل منصة' : 'إضافة منصة'}
                            </h3>

                            {error && (
                                <div className={`p-2 rounded text-sm ${isDark
                                    ? 'bg-red-600/20 border border-red-600 text-red-300'
                                    : 'bg-red-50 border border-red-200 text-red-700'
                                    }`}>
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="block text-sm font-medium" style={{ color: getMutedTextColor() }}>
                                    اسم المنصة
                                </label>
                                <input
                                    name="name"
                                    value={formData.name || ''}
                                    onChange={handleChange}
                                    placeholder="أدخل اسم المنصة"
                                    className={`w-full rounded-lg p-3 focus:border-primary-500 focus:outline-none transition-all duration-300 ${isDark
                                        ? 'bg-gray-700 border border-gray-600 text-white'
                                        : 'bg-gray-50 border border-[#dfd7bb] text-gray-800'
                                        }`}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium" style={{ color: getMutedTextColor() }}>
                                    الأيقونة (Emoji)
                                </label>
                                <input
                                    name="iconUrl"
                                    value={formData.iconUrl || ''}
                                    onChange={handleChange}
                                    placeholder="أدخل أيقونة emoji"
                                    className={`w-full rounded-lg p-3 focus:border-primary-500 focus:outline-none transition-all duration-300 ${isDark
                                        ? 'bg-gray-700 border border-gray-600 text-white'
                                        : 'bg-gray-50 border border-[#dfd7bb] text-gray-800'
                                        }`}
                                    disabled={loading}
                                />
                                <p className="text-xs" style={{ color: getMutedTextColor() }}>
                                    يمكنك استخدام أي emoji كأيقونة للمنصة
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t" style={{
                                borderColor: isDark ? '#374151' : '#dfd7bb'
                            }}>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className={`py-2 px-6 rounded-lg transition-colors ${isDark
                                        ? 'bg-gray-600 hover:bg-gray-500 text-white'
                                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                                        }`}
                                    disabled={loading}
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className={`py-2 px-6 rounded-lg transition-all duration-300 flex items-center gap-2 ${isDark
                                        ? 'bg-primary-600 hover:bg-primary-500 text-white'
                                        : 'bg-[#c9a84c] hover:bg-[#b8973a] text-white shadow-md hover:shadow-lg'
                                        }`}
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