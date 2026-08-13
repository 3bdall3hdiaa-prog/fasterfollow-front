import React, { useState, useRef } from 'react';
import { Platform } from '../../types';
import { useThemeStore } from '@/store/theme.store';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';

interface PlatformResponse {
    _id: string;
    name: string;
    slug: string;
    image: {
        public_id: string;
        url: string;
    };
    createdAt?: string;
    updatedAt?: string;
}

interface ManagePlatformsProps {
    platforms: Platform[];
    setPlatforms: React.Dispatch<React.SetStateAction<Platform[]>>;
}

const ManagePlatforms: React.FC<ManagePlatformsProps> = ({ platforms, setPlatforms }: ManagePlatformsProps) => {
    const { isDark } = useThemeStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null);
    const [formData, setFormData] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const getTextColor = () => {
        return isDark ? '#ffffff' : '#1e2235';
    };

    const getMutedTextColor = () => {
        return isDark ? '#8a8fa8' : '#6c757d';
    };

    const handleOpenModal = (platform: Platform | null) => {
        setEditingPlatform(platform);
        setFormData(platform || { name: '', slug: '' });
        setSelectedFile(null);
        setPreviewUrl(null);
        setIsModalOpen(true);
        setError(null);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setError(null);
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('حجم الملف يجب أن يكون أقل من 5 ميجابايت');
                return;
            }

            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
            if (!allowedTypes.includes(file.type)) {
                setError('نوع الملف غير مدعوم. يرجى رفع صورة بصيغة JPG, PNG, WEBP, أو SVG');
                return;
            }

            setSelectedFile(file);
            setError(null);

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const addPlatformToAPI = async (formData: FormData): Promise<PlatformResponse> => {
        const response = await axios.post(`${API_URL}/manageplatforms`, formData, {
            withCredentials: true,
        });
        return response.data;
    };

    const updatePlatformInAPI = async (id: string, formData: FormData): Promise<PlatformResponse> => {
        const response = await axios.put(`${API_URL}/manageplatforms/${id}`, formData, {
            withCredentials: true
        });
        return response.data;
    };

    const updatePlatformWithoutFile = async (id: string, data: Partial<Platform>): Promise<PlatformResponse> => {
        const response = await axios.put(`${API_URL}/manageplatforms/${id}`, data, {
            withCredentials: true
        });
        return response.data;
    };

    const deletePlatformFromAPI = async (id: string): Promise<void> => {
        await axios.delete(`${API_URL}/manageplatforms/${id}`, {
            withCredentials: true
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name || '');
            formDataToSend.append('slug', formData.slug || '');

            if (selectedFile) {
                formDataToSend.append('file', selectedFile);
            }

            let result: PlatformResponse;

            if (editingPlatform) {
                if (selectedFile) {
                    result = await updatePlatformInAPI(editingPlatform._id, formDataToSend);
                } else {
                    result = await updatePlatformWithoutFile(editingPlatform._id, {
                        name: formData.name,
                        slug: formData.slug
                    });
                }

                const updatedPlatform = {
                    ...result,
                    image: result.image?.url || result.image
                };
                setPlatforms(platforms.map((p: any) => p._id === editingPlatform._id ? updatedPlatform : p));
            } else {
                result = await addPlatformToAPI(formDataToSend);
                const newPlatform = {
                    ...result,
                    image: result.image?.url || result.image
                };
                setPlatforms([...platforms, newPlatform]);
            }

            handleCloseModal();
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'حدث خطأ غير متوقع';
            setError(errorMessage);
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
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'حدث خطأ أثناء الحذف';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (platform: any) => {
        if (!platform.image) return null;
        if (typeof platform.image === 'object' && platform.image.url) {
            return platform.image.url;
        }
        if (typeof platform.image === 'string') {
            return platform.image;
        }
        return null;
    };

    return (
        <div
            className="p-3 sm:p-4 md:p-6 min-h-screen"
            style={{
                backgroundColor: isDark ? '#1e2235' : '#f8f6f0',
                transition: "all 0.3s ease"
            }}
        >
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
                <h1
                    className="text-xl sm:text-2xl md:text-3xl font-bold text-center sm:text-right w-full sm:w-auto"
                    style={{ color: getTextColor() }}
                >
                    إدارة المنصات
                </h1>
                <button
                    onClick={() => handleOpenModal(null)}
                    className={`w-full sm:w-auto font-bold py-2 px-4 sm:px-6 rounded-lg transition-all duration-300 text-sm sm:text-base ${isDark
                        ? 'bg-primary-600 hover:bg-primary-700 text-white'
                        : 'bg-[#c9a84c] hover:bg-[#b8973a] text-white shadow-md hover:shadow-lg'
                        }`}
                    disabled={loading}
                >
                    {loading ? 'جاري التحميل...' : 'إضافة منصة جديدة'}
                </button>
            </div>

            {error && (
                <div className={`mb-3 sm:mb-4 p-2 sm:p-3 rounded-lg text-sm ${isDark
                    ? 'bg-red-600/20 border border-red-600 text-red-300'
                    : 'bg-red-50 border border-red-200 text-red-700'
                    }`}>
                    {error}
                </div>
            )}

            {/* قائمة المنصات - نسخة الجوال (بطاقات) */}
            <div className="block lg:hidden space-y-3 sm:space-y-4">
                {platforms.length === 0 ? (
                    <div className={`rounded-lg p-8 text-center ${isDark
                        ? 'bg-gray-800 border border-gray-700'
                        : 'bg-white border border-[#dfd7bb] shadow-md'
                        }`}>
                        <p style={{ color: getMutedTextColor() }}>لا توجد منصات مضافة حتى الآن</p>
                    </div>
                ) : (
                    platforms.map(platform => {
                        const imageUrl = getImageUrl(platform);
                        return (
                            <div
                                key={platform._id}
                                className={`rounded-lg p-3 sm:p-4 transition-all duration-300 ${isDark
                                    ? 'bg-gray-800 border border-gray-700'
                                    : 'bg-white border border-[#dfd7bb] shadow-sm'
                                    }`}
                            >
                                <div className="flex items-center gap-3 sm:gap-4">
                                    {/* الصورة */}
                                    <div className="flex-shrink-0">
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={platform.name}
                                                className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-contain bg-gray-100 dark:bg-gray-700"
                                                loading="lazy"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                                            </div>
                                        )}
                                    </div>

                                    {/* المعلومات */}
                                    <div className="flex-1 min-w-0">
                                        <h3
                                            className="text-sm sm:text-base font-semibold truncate"
                                            style={{ color: getTextColor() }}
                                        >
                                            {platform.name}
                                        </h3>
                                        <p
                                            className="text-xs sm:text-sm truncate"
                                            style={{ color: getMutedTextColor() }}
                                        >
                                            /{platform.slug}
                                        </p>
                                    </div>

                                    {/* الأزرار */}
                                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-shrink-0">
                                        <button
                                            onClick={() => handleOpenModal(platform)}
                                            className={`text-xs sm:text-sm transition-colors ${isDark ? 'text-primary-400 hover:text-primary-300' : 'text-[#c9a84c] hover:text-[#b8973a]'
                                                }`}
                                            disabled={loading}
                                        >
                                            تعديل
                                        </button>
                                        <button
                                            onClick={() => handleDelete(platform._id)}
                                            className="text-xs sm:text-sm text-red-400 hover:text-red-300 transition-colors"
                                            disabled={loading}
                                        >
                                            حذف
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* قائمة المنصات - نسخة الكمبيوتر اللوحي والكمبيوتر (جدول) */}
            <div className="hidden lg:block">
                <div className={`rounded-lg overflow-hidden transition-all duration-300 ${isDark
                    ? 'bg-gray-800 border border-gray-700'
                    : 'bg-white border border-[#dfd7bb] shadow-md'
                    }`}>
                    {platforms.length === 0 ? (
                        <div className="text-center py-8" style={{ color: getMutedTextColor() }}>
                            لا توجد منصات مضافة حتى الآن
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm" style={{ color: getTextColor() }}>
                                <thead className={`text-xs uppercase ${isDark ? 'text-gray-400 bg-gray-700/50' : 'text-gray-500 bg-gray-50'
                                    }`}>
                                    <tr>
                                        <th className="px-4 py-3 text-right">الصورة</th>
                                        <th className="px-4 py-3 text-right">الاسم</th>
                                        <th className="px-4 py-3 text-right hidden md:table-cell">الرابط المختصر</th>
                                        <th className="px-4 py-3 text-right">الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {platforms.map(platform => {
                                        const imageUrl = getImageUrl(platform);
                                        return (
                                            <tr key={platform._id} className={`border-b transition-colors ${isDark
                                                ? 'border-gray-700 hover:bg-gray-700/50'
                                                : 'border-[#dfd7bb] hover:bg-gray-50'
                                                }`}>
                                                <td className="px-4 py-3">
                                                    {imageUrl ? (
                                                        <img
                                                            src={imageUrl}
                                                            alt={platform.name}
                                                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-contain bg-gray-100 dark:bg-gray-700"
                                                            loading="lazy"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).style.display = 'none';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                            <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                                                        </div>
                                                    )}
                                                </td>
                                                <td
                                                    className="px-4 py-3 font-medium max-w-[120px] truncate"
                                                    style={{ color: getTextColor() }}
                                                >
                                                    {platform.name}
                                                </td>
                                                <td
                                                    className="px-4 py-3 text-sm hidden md:table-cell max-w-[100px] truncate"
                                                    style={{ color: getMutedTextColor() }}
                                                >
                                                    {platform.slug}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-2 sm:gap-3 justify-end">
                                                        <button
                                                            onClick={() => handleOpenModal(platform)}
                                                            className={`text-sm transition-colors ${isDark ? 'text-primary-400 hover:text-primary-300' : 'text-[#c9a84c] hover:text-[#b8973a]'
                                                                }`}
                                                            disabled={loading}
                                                        >
                                                            تعديل
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(platform._id)}
                                                            className="text-sm text-red-400 hover:text-red-300 transition-colors"
                                                            disabled={loading}
                                                        >
                                                            حذف
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal - متجاوب */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-3 sm:p-4"
                    onClick={handleCloseModal}
                >
                    <div
                        className={`rounded-2xl shadow-xl w-full max-w-xs sm:max-w-sm md:max-w-md transition-all duration-300 max-h-[90vh] overflow-y-auto ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
                            }`}
                        onClick={e => e.stopPropagation()}
                    >
                        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                            <h3
                                className="text-lg sm:text-xl font-bold"
                                style={{ color: getTextColor() }}
                            >
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

                            {/* حقل اسم المنصة */}
                            <div className="space-y-1 sm:space-y-2">
                                <label className="block text-xs sm:text-sm font-medium" style={{ color: getMutedTextColor() }}>
                                    اسم المنصة
                                </label>
                                <input
                                    name="name"
                                    value={formData.name || ''}
                                    onChange={handleChange}
                                    placeholder="أدخل اسم المنصة"
                                    className={`w-full rounded-lg p-2 sm:p-3 text-sm sm:text-base focus:border-primary-500 focus:outline-none transition-all duration-300 ${isDark
                                        ? 'bg-gray-700 border border-gray-600 text-white'
                                        : 'bg-gray-50 border border-[#dfd7bb] text-gray-800'
                                        }`}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            {/* حقل slug */}
                            <div className="space-y-1 sm:space-y-2">
                                <label className="block text-xs sm:text-sm font-medium" style={{ color: getMutedTextColor() }}>
                                    الرابط المختصر (Slug)
                                </label>
                                <input
                                    name="slug"
                                    value={formData.slug || ''}
                                    onChange={handleChange}
                                    placeholder="مثال: instagram"
                                    className={`w-full rounded-lg p-2 sm:p-3 text-sm sm:text-base focus:border-primary-500 focus:outline-none transition-all duration-300 ${isDark
                                        ? 'bg-gray-700 border border-gray-600 text-white'
                                        : 'bg-gray-50 border border-[#dfd7bb] text-gray-800'
                                        }`}
                                    required
                                    disabled={loading}
                                    dir="ltr"
                                />
                                <p className="text-[10px] sm:text-xs" style={{ color: getMutedTextColor() }}>
                                    سيتم استخدام هذا الرابط في URL (يجب أن يكون فريداً)
                                </p>
                            </div>

                            {/* حقل رفع الصورة */}
                            <div className="space-y-1 sm:space-y-2">
                                <label className="block text-xs sm:text-sm font-medium" style={{ color: getMutedTextColor() }}>
                                    صورة المنصة
                                </label>

                                <div
                                    className={`
                                        relative border-2 border-dashed rounded-lg
                                        transition-all duration-300
                                        ${isDark
                                            ? 'border-gray-600 hover:border-[#c9a84c]/50'
                                            : 'border-[#dfd7bb] hover:border-[#c9a84c]/50'
                                        }
                                        ${previewUrl ? 'p-2' : 'p-4 sm:p-8'}
                                    `}
                                >
                                    {previewUrl ? (
                                        <div className="relative">
                                            <img
                                                src={previewUrl}
                                                alt="معاينة الصورة"
                                                className="w-full max-h-36 sm:max-h-48 object-contain rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleRemoveFile}
                                                className="absolute top-1 right-1 sm:top-2 sm:right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                                            >
                                                <X className="w-4 h-4 sm:w-5 sm:h-5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            className="flex flex-col items-center justify-center cursor-pointer"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Upload className="w-8 h-8 sm:w-12 sm:h-12 mb-1 sm:mb-2" style={{ color: getMutedTextColor() }} />
                                            <p style={{ color: getMutedTextColor() }} className="text-xs sm:text-sm">
                                                اضغط لرفع صورة
                                            </p>
                                            <p style={{ color: getMutedTextColor() }} className="text-[10px] sm:text-xs mt-1 text-center">
                                                PNG, JPG, WEBP, SVG (حد أقصى 5MB)
                                            </p>
                                        </div>
                                    )}

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        disabled={loading}
                                    />
                                </div>

                                {selectedFile && (
                                    <div className={`text-xs sm:text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                        📎 {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                                    </div>
                                )}

                                {editingPlatform && editingPlatform.image && !selectedFile && (
                                    <div className={`w-full mt-1 sm:mt-2 text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        <div className="flex flex-col gap-1">
                                            <span>🖼️ الصورة الحالية:</span>
                                            {typeof editingPlatform.image === 'object' && editingPlatform.image.url && (
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] sm:text-xs break-all" style={{
                                                        color: isDark ? '#9ca3af' : '#6b7280',
                                                        wordBreak: 'break-all'
                                                    }}>
                                                        {editingPlatform.image.url}
                                                    </span>
                                                    {editingPlatform.image.public_id && (
                                                        <span className="text-[10px] sm:text-xs" style={{
                                                            color: isDark ? '#6b7280' : '#9ca3af'
                                                        }}>
                                                            ID: {editingPlatform.image.public_id}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            {typeof editingPlatform.image === 'string' && (
                                                <span className="text-[10px] sm:text-xs break-all" style={{
                                                    color: isDark ? '#9ca3af' : '#6b7280',
                                                    wordBreak: 'break-all'
                                                }}>
                                                    {editingPlatform.image}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t" style={{
                                borderColor: isDark ? '#374151' : '#dfd7bb'
                            }}>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className={`w-full sm:w-auto py-2 px-4 sm:px-6 rounded-lg transition-colors text-sm sm:text-base ${isDark
                                        ? 'bg-gray-600 hover:bg-gray-500 text-white'
                                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                                        }`}
                                    disabled={loading}
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className={`w-full sm:w-auto py-2 px-4 sm:px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base ${isDark
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