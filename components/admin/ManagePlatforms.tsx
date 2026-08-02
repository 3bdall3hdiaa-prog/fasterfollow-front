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

    // دوال مساعدة للألوان
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

    // معالجة اختيار الملف
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // التحقق من حجم الملف (حد أقصى 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('حجم الملف يجب أن يكون أقل من 5 ميجابايت');
                return;
            }

            // التحقق من نوع الملف
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
            if (!allowedTypes.includes(file.type)) {
                setError('نوع الملف غير مدعوم. يرجى رفع صورة بصيغة JPG, PNG, WEBP, أو SVG');
                return;
            }

            setSelectedFile(file);
            setError(null);

            // إنشاء رابط معاينة
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // إزالة الملف المحدد
    const handleRemoveFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // دالة للإضافة عبر API باستخدام Axios و FormData
    const addPlatformToAPI = async (formData: FormData): Promise<PlatformResponse> => {
        const token = localStorage.getItem('token');

        const response = await axios.post(`${API_URL}/manageplatforms`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
            }
        });

        return response.data;
    };

    // دالة للتعديل عبر API باستخدام Axios و FormData
    const updatePlatformInAPI = async (id: string, formData: FormData): Promise<PlatformResponse> => {
        const token = localStorage.getItem('token');

        const response = await axios.put(`${API_URL}/manageplatforms/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
            }
        });

        return response.data;
    };

    // دالة للتعديل بدون ملف (JSON)
    const updatePlatformWithoutFile = async (id: string, data: Partial<Platform>): Promise<PlatformResponse> => {
        const token = localStorage.getItem('token');

        const response = await axios.put(`${API_URL}/manageplatforms/${id}`, data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        return response.data;
    };

    // دالة للحذف عبر API باستخدام Axios
    const deletePlatformFromAPI = async (id: string): Promise<void> => {
        const token = localStorage.getItem('token');

        await axios.delete(`${API_URL}/manageplatforms/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // إنشاء FormData
            const formDataToSend = new FormData();

            // إضافة الحقول
            formDataToSend.append('name', formData.name || '');
            formDataToSend.append('slug', formData.slug || '');

            // إضافة الملف إذا تم اختياره
            if (selectedFile) {
                formDataToSend.append('file', selectedFile);
            }

            let result: PlatformResponse;

            // إذا كان في وضع التعديل
            if (editingPlatform) {
                if (selectedFile) {
                    // تعديل مع رفع ملف جديد
                    result = await updatePlatformInAPI(editingPlatform._id, formDataToSend);
                } else {
                    // تعديل بدون رفع ملف (JSON)
                    result = await updatePlatformWithoutFile(editingPlatform._id, {
                        name: formData.name,
                        slug: formData.slug
                    });
                }

                // تحديث المنصة في القائمة مع الحفاظ على هيكل البيانات
                const updatedPlatform = {
                    ...result,
                    image: result.image?.url || result.image // تأكد من أن الصورة بالشكل الصحيح
                };
                setPlatforms(platforms.map((p: any) => p._id === editingPlatform._id ? updatedPlatform : p));
            } else {
                // إضافة جديدة
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

    // دالة للحصول على رابط الصورة
    const getImageUrl = (platform: any) => {
        if (!platform.image) return null;
        // إذا كانت الصورة object فيها url
        if (typeof platform.image === 'object' && platform.image.url) {
            return platform.image.url;
        }
        // إذا كانت الصورة string
        if (typeof platform.image === 'string') {
            return platform.image;
        }
        return null;
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
                                <th className="px-4 py-3">الصورة</th>
                                <th className="px-4 py-3">الاسم</th>
                                <th className="px-4 py-3">الرابط المختصر</th>
                                <th className="px-4 py-3">الإجراءات</th>
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
                                        <td className="px-4 py-4">
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={platform.name}
                                                    className="w-12 h-12 rounded-lg object-contain"
                                                    loading="lazy"
                                                    onError={(e) => {
                                                        // في حالة فشل تحميل الصورة
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                    <ImageIcon className="w-6 h-6 text-gray-400" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 font-medium" style={{ color: getTextColor() }}>{platform.name}</td>
                                        <td className="px-4 py-4 text-sm" style={{ color: getMutedTextColor() }}>{platform.slug}</td>
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
                                );
                            })}
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

                            {/* حقل اسم المنصة */}
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

                            {/* حقل slug */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium" style={{ color: getMutedTextColor() }}>
                                    الرابط المختصر (Slug)
                                </label>
                                <input
                                    name="slug"
                                    value={formData.slug || ''}
                                    onChange={handleChange}
                                    placeholder="مثال: instagram"
                                    className={`w-full rounded-lg p-3 focus:border-primary-500 focus:outline-none transition-all duration-300 ${isDark
                                        ? 'bg-gray-700 border border-gray-600 text-white'
                                        : 'bg-gray-50 border border-[#dfd7bb] text-gray-800'
                                        }`}
                                    required
                                    disabled={loading}
                                    dir="ltr"
                                />
                                <p className="text-xs" style={{ color: getMutedTextColor() }}>
                                    سيتم استخدام هذا الرابط في URL (يجب أن يكون فريداً)
                                </p>
                            </div>

                            {/* حقل رفع الصورة */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium" style={{ color: getMutedTextColor() }}>
                                    صورة المنصة
                                </label>

                                {/* منطقة رفع الصورة */}
                                <div
                                    className={`
                                        relative border-2 border-dashed rounded-lg p-4
                                        transition-all duration-300
                                        ${isDark
                                            ? 'border-gray-600 hover:border-[#c9a84c]/50'
                                            : 'border-[#dfd7bb] hover:border-[#c9a84c]/50'
                                        }
                                        ${previewUrl ? 'p-2' : 'p-8'}
                                    `}
                                >
                                    {previewUrl ? (
                                        // عرض معاينة الصورة
                                        <div className="relative">
                                            <img
                                                src={previewUrl}
                                                alt="معاينة الصورة"
                                                className="w-full max-h-48 object-contain rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleRemoveFile}
                                                className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ) : (
                                        // زر رفع الصورة
                                        <div
                                            className="flex flex-col items-center justify-center cursor-pointer"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Upload className="w-12 h-12 mb-2" style={{ color: getMutedTextColor() }} />
                                            <p style={{ color: getMutedTextColor() }} className="text-sm">
                                                اضغط لرفع صورة
                                            </p>
                                            <p style={{ color: getMutedTextColor() }} className="text-xs mt-1">
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

                                {/* عرض اسم الملف المحدد */}
                                {selectedFile && (
                                    <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                        📎 {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                                    </div>
                                )}

                                {/* عرض الصورة الحالية في حالة التعديل */}
                                {editingPlatform && editingPlatform.image && !selectedFile && (
                                    <div className={`w-full mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        <div className="flex flex-col gap-1">
                                            <span>🖼️ الصورة الحالية:</span>
                                            {typeof editingPlatform.image === 'object' && editingPlatform.image.url && (
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs break-all" style={{
                                                        color: isDark ? '#9ca3af' : '#6b7280',
                                                        wordBreak: 'break-all'
                                                    }}>
                                                        {editingPlatform.image.url}
                                                    </span>
                                                    {editingPlatform.image.public_id && (
                                                        <span className="text-xs" style={{
                                                            color: isDark ? '#6b7280' : '#9ca3af'
                                                        }}>
                                                            ID: {editingPlatform.image.public_id}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            {typeof editingPlatform.image === 'string' && (
                                                <span className="text-xs break-all" style={{
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