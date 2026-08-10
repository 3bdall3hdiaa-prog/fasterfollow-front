import React, { useState } from 'react';
import { Page } from '../../types';
import { useThemeStore } from '@/store/theme.store';

interface ManagePagesProps {
    pages: Page[];
    setPages: React.Dispatch<React.SetStateAction<Page[]>>;
}

const ManagePages: React.FC<ManagePagesProps> = ({ pages, setPages }) => {
    const { isDark } = useThemeStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPage, setEditingPage] = useState<Page | null>(null);
    const [formData, setFormData] = useState<Partial<Page>>({});
    const [loading, setLoading] = useState(false);

    const API_BASE_URL = import.meta.env.VITE_API_URL;

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

    const getCardHeaderBackground = () => {
        return isDark ? '#2f3450' : '#f0ede4';
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

    const handleOpenModal = (page: Page | null) => {
        setEditingPage(page);
        setFormData(page || { title: '', slug: '', content: '', isPublished: true });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    // دالة لجلب جميع الصفحات من الـ API
    const fetchPages = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/managepages`, {
                method: 'GET',
                credentials: 'include', headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch pages');
            const data = await response.json();
            setPages(data);
        } catch (error) {
            console.error('Error fetching pages:', error);
            alert('فشل في تحميل الصفحات');
        }
    };

    // دالة لإضافة صفحة جديدة
    const handleAddPage = async (pageData: Partial<Page>) => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/managepages`, {
                method: 'POST',
                credentials: 'include',
                body: JSON.stringify(pageData), headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Failed to add page');

            await fetchPages();
        } catch (error) {
            console.error('Error adding page:', error);
            alert('فشل في إضافة الصفحة');
        } finally {
            setLoading(false);
        }
    };

    // دالة لتعديل صفحة موجودة
    const handleUpdatePage = async (pageId: string, pageData: Partial<Page>) => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/managepages/${pageId}`, {
                method: 'PUT',
                credentials: 'include',
                body: JSON.stringify(pageData), headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Failed to update page');

            await fetchPages();
        } catch (error) {
            console.error('Error updating page:', error);
            alert('فشل في تعديل الصفحة');
        } finally {
            setLoading(false);
        }
    };

    // دالة لحذف صفحة
    const handleDeletePage = async (pageId: string) => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/managepages/${pageId}`, {
                method: 'DELETE',
                credentials: 'include', headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete page');

            await fetchPages();
        } catch (error) {
            console.error('Error deleting page:', error);
            alert('فشل في حذف الصفحة');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const pageData = {
            title: formData.title,
            slug: formData.slug,
            content: formData.content,
            isPublished: formData.isPublished
        };

        if (editingPage) {
            await handleUpdatePage(editingPage._id || editingPage.id, pageData);
        } else {
            await handleAddPage(pageData);
        }
        handleCloseModal();
    };

    const handleDelete = async (pageId: string) => {
        if (window.confirm('هل أنت متأكد من حذف هذه الصفحة؟')) {
            await handleDeletePage(pageId);
        }
    };

    const handleTogglePublish = async (page: Page) => {
        await handleUpdatePage(page._id || page.id, { isPublished: !page.isPublished });
    };

    return (
        <div className="p-4" style={{
            backgroundColor: isDark ? '#1e2235' : '#f8f6f0',
            minHeight: "100vh",
            transition: "all 0.3s ease"
        }}>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-center md:text-right" style={{ color: getTextColor() }}>
                    إدارة الصفحات
                </h1>
                <button
                    onClick={() => handleOpenModal(null)}
                    className={`font-bold py-2 px-4 rounded-lg transition-all duration-300 ${isDark
                        ? 'bg-primary-600 hover:bg-primary-700 text-white'
                        : 'bg-[#c9a84c] hover:bg-[#b8973a] text-white shadow-md hover:shadow-lg'
                        }`}
                    disabled={loading}
                >
                    {loading ? 'جاري التحميل...' : 'إضافة صفحة جديدة'}
                </button>
            </div>

            {loading && (
                <div className={`rounded-lg p-4 mb-4 transition-all duration-300 ${isDark
                    ? 'bg-blue-900/20 border border-blue-700 text-blue-300'
                    : 'bg-blue-50 border border-blue-200 text-blue-700'
                    }`}>
                    <p>جاري تحديث البيانات...</p>
                </div>
            )}

            <div className={`rounded-lg overflow-hidden transition-all duration-300 ${isDark
                ? 'bg-gray-800 border border-gray-700'
                : 'bg-white border border-[#dfd7bb] shadow-md'
                }`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right" style={{ color: getTextColor() }}>
                        <thead className={`text-xs uppercase ${isDark ? 'text-gray-400 bg-gray-700/50' : 'text-gray-500 bg-gray-50'
                            }`}>
                            <tr>
                                <th className="px-4 py-3">العنوان</th>
                                <th className="px-4 py-3">الرابط (Slug)</th>
                                <th className="px-4 py-3">الحالة</th>
                                <th className="px-4 py-3">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pages.map(page => (
                                <tr key={page._id || page.id} className={`border-b transition-colors ${isDark
                                    ? 'border-gray-700 hover:bg-gray-700/50'
                                    : 'border-[#dfd7bb] hover:bg-gray-50'
                                    }`}>
                                    <td className="px-4 py-4" style={{ color: getTextColor() }}>{page.title}</td>
                                    <td className="px-4 py-4 font-mono" style={{ color: getMutedTextColor() }}>/{page.slug}</td>
                                    <td className="px-4 py-4">
                                        <button
                                            onClick={() => handleTogglePublish(page)}
                                            className={`px-2 py-1 text-xs rounded-full transition-colors ${page.isPublished
                                                ? isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'
                                                : isDark ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-600'
                                                }`}
                                            disabled={loading}
                                        >
                                            {page.isPublished ? 'منشورة' : 'مسودة'}
                                        </button>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex space-x-2 space-x-reverse">
                                            <button
                                                onClick={() => handleOpenModal(page)}
                                                className={`transition-colors ${isDark ? 'text-primary-400 hover:text-primary-300' : 'text-[#c9a84c] hover:text-[#b8973a]'
                                                    }`}
                                                disabled={loading}
                                            >
                                                تعديل
                                            </button>
                                            <button
                                                onClick={() => handleDelete(page._id || page.id)}
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

                    {pages.length === 0 && (
                        <div className="p-12 text-center" style={{ color: getMutedTextColor() }}>
                            لا توجد صفحات حالياً
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={handleCloseModal}>
                    <div className={`rounded-2xl shadow-xl w-full max-w-2xl transition-all duration-300 ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
                        }`} onClick={e => e.stopPropagation()}>
                        <form onSubmit={handleSubmit} className="p-6">
                            <h3 className="text-xl font-bold mb-4" style={{ color: getTextColor() }}>
                                {editingPage ? 'تعديل صفحة' : 'إضافة صفحة جديدة'}
                            </h3>
                            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                                <input
                                    name="title"
                                    value={formData.title || ''}
                                    onChange={handleChange}
                                    placeholder="عنوان الصفحة"
                                    className={`w-full p-2 rounded transition-all duration-300 ${isDark
                                        ? 'bg-gray-700 text-white'
                                        : 'bg-gray-50 text-gray-800 border border-[#dfd7bb]'
                                        }`}
                                    required
                                    disabled={loading}
                                />
                                <input
                                    name="slug"
                                    value={formData.slug || ''}
                                    onChange={handleChange}
                                    placeholder="الرابط (e.g., privacy-policy)"
                                    className={`w-full p-2 rounded transition-all duration-300 ${isDark
                                        ? 'bg-gray-700 text-white'
                                        : 'bg-gray-50 text-gray-800 border border-[#dfd7bb]'
                                        }`}
                                    required
                                    disabled={loading}
                                />
                                <textarea
                                    name="content"
                                    value={formData.content || ''}
                                    onChange={handleChange}
                                    placeholder="محتوى الصفحة (HTML مسموح)"
                                    rows={10}
                                    className={`w-full p-2 rounded font-mono transition-all duration-300 ${isDark
                                        ? 'bg-gray-700 text-white'
                                        : 'bg-gray-50 text-gray-800 border border-[#dfd7bb]'
                                        }`}
                                    disabled={loading}
                                />
                                <label className="flex items-center space-x-2 space-x-reverse" style={{ color: getTextColor() }}>
                                    <input
                                        type="checkbox"
                                        name="isPublished"
                                        checked={formData.isPublished || false}
                                        onChange={handleChange}
                                        className="form-checkbox"
                                        disabled={loading}
                                    />
                                    <span>نشر الصفحة</span>
                                </label>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 mt-4 border-t" style={{
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
                                        ? 'bg-primary-600 hover:bg-primary-700 text-white'
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

export default ManagePages;